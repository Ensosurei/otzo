import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function md5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex');
}

function parseWwwAuthenticate(header: string): Record<string, string> {
  const params: Record<string, string> = {};
  const regex = /(\w+)=["']?([^"',]+)["']?/g;
  let match;
  while ((match = regex.exec(header)) !== null) {
    params[match[1]] = match[2];
  }
  return params;
}

function generateDigestAuthHeader(
  method: string,
  uri: string,
  wwwAuthHeader: string,
  publicKey: string,
  privateKey: string
): string {
  const params = parseWwwAuthenticate(wwwAuthHeader);
  const realm = params.realm || '';
  const nonce = params.nonce || '';
  const qop = params.qop || '';
  const nc = '00000001';
  const cnonce = crypto.randomBytes(8).toString('hex');

  // HA1 = MD5(username:realm:password)
  const ha1 = md5(`${publicKey}:${realm}:${privateKey}`);

  // HA2 = MD5(method:digestURI)
  const ha2 = md5(`${method}:${uri}`);

  let response: string;
  if (qop) {
    // response = MD5(HA1:nonce:nc:cnonce:qop:HA2)
    response = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
  } else {
    // response = MD5(HA1:nonce:HA2)
    response = md5(`${ha1}:${nonce}:${ha2}`);
  }

  let authHeader = `Digest username="${publicKey}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"`;
  if (qop) {
    authHeader += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
  }

  return authHeader;
}

export async function POST(req: NextRequest) {
  try {
    const rawUrl = process.env.TIDB_DATA_APP_URL || '';
    const publicKey = (process.env.TIDB_PUBLIC_KEY || '').trim();
    const privateKey = (process.env.TIDB_PRIVATE_KEY || '').trim();

    if (!publicKey || !privateKey || !rawUrl) {
      return NextResponse.json(
        { error: 'Faltan credenciales en .env.local (TIDB_DATA_APP_URL, TIDB_PUBLIC_KEY o TIDB_PRIVATE_KEY)' },
        { status: 500 }
      );
    }

    const { endpoint, method = 'GET', body } = await req.json();
    const baseUrl = rawUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${baseUrl}${cleanEndpoint}`;

    const parsedUrl = new URL(fullUrl);
    const uriPath = parsedUrl.pathname + parsedUrl.search;

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Paso 1: Petición inicial para obtener el reto 401
    let response = await fetch(fullUrl, requestOptions);

    if (response.status === 401) {
      const wwwAuth = response.headers.get('www-authenticate');
      if (wwwAuth) {
        const authHeader = generateDigestAuthHeader(
          method,
          uriPath,
          wwwAuth,
          publicKey,
          privateKey
        );

        // Paso 2: Reintentar con el encabezado Authorization
        response = await fetch(fullUrl, {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            Authorization: authHeader,
          },
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Error TiDB [${response.status}]: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.data?.rows || data;
    const apiResponse = NextResponse.json(result);

    if (cleanEndpoint.split('?')[0] === '/auth/login' && method.toUpperCase() === 'POST') {
      const loginUser = Array.isArray(result) ? result[0] : undefined;
      const userId = Number(loginUser?.id);

      if (Number.isSafeInteger(userId) && userId > 0) {
        const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
        const payload = Buffer.from(JSON.stringify({ userId, expiresAt })).toString('base64url');
        const signature = crypto.createHmac('sha256', privateKey).update(payload).digest('base64url');

        apiResponse.cookies.set('otzo_session', `${payload}.${signature}`, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 8 * 60 * 60,
        });
      } else {
        apiResponse.cookies.set('otzo_session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 0,
        });
      }
    }

    return apiResponse;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

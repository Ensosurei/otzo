import DigestFetch from 'digest-fetch';

const baseUrl = process.env.NEXT_PUBLIC_TIDB_ENDPOINT_URL || '';
const publicKey = process.env.TIDB_PUBLIC_KEY || '';
const privateKey = process.env.TIDB_PRIVATE_KEY || '';

// Cliente con autenticación Digest para TiDB Data Service
const client = new DigestFetch(publicKey, privateKey);

export async function fetchTiDB<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${baseUrl}${path}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await client.fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la petición TiDB [${response.status}]: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data?.rows || data;
}

export async function fetchTiDB<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : undefined;

  const response = await fetch('/api/tidb', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: path,
      method,
      body,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al comunicarse con TiDB');
  }

  return data as T;
}

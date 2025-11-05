import { http, API_BASE_URL } from '@/services/api-client';

/**
 * Drop-in replacement for window.fetch that routes calls to the centralized http client.
 * It returns a Response-like object supporting .json().
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const rawUrl = typeof input === 'string' ? input : input.toString();
  const method = (init?.method || 'GET').toUpperCase();
  const bodyRaw: any = (init as any)?.body;
  let dataBody: any = undefined;
  if (bodyRaw) {
    try { dataBody = typeof bodyRaw === 'string' ? JSON.parse(bodyRaw) : bodyRaw; }
    catch { dataBody = bodyRaw; }
  }

  // Normalize path: strip API_BASE_URL if provided directly
  let path = rawUrl;
  if (API_BASE_URL && rawUrl.startsWith(API_BASE_URL)) {
    path = rawUrl.slice(API_BASE_URL.length);
  }
  if (!path.startsWith('/')) path = '/' + path;

  let data: any;
  if (method === 'GET') data = await http.get(path);
  else if (method === 'POST') data = await http.post(path, dataBody);
  else if (method === 'PUT' || method === 'PATCH') data = await http.put(path, dataBody);
  else if (method === 'DELETE') data = await http.delete(path);
  else data = await http.get(path);

  const jsonText = JSON.stringify(data ?? null);
  return new Response(jsonText, { status: 200, headers: { 'Content-Type': 'application/json' } });
}

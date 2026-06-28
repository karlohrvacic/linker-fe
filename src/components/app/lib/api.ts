/**
 * Ladica Sync API client.
 *
 * Thin typed wrapper over the backend REST API. Every call attaches the bearer
 * token. A 401 surfaces as `AuthError` (the caller should sign out); any other
 * transport/HTTP failure surfaces as `NetworkError` (sync stays opportunistic).
 */

import { getToken, API_BASE } from './auth';

/** Wire DTO — `clientId` is the cross-device identity (== local `Link.id`). */
export type LinkDto = {
  clientId: string;
  url: string;
  name: string;
  cat: string;
  updatedAt: number;
  deleted: boolean;
};

export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

async function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch (e) {
    throw new NetworkError((e as Error)?.message ?? 'Network request failed');
  }

  if (res.status === 401) throw new AuthError();
  if (!res.ok) throw new NetworkError(`HTTP ${res.status}`);
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function pullLinks(since: number): Promise<{ links: LinkDto[]; cursor: number }> {
  return authed(`/api/v1/links?since=${since}`, { method: 'GET' });
}

export function pushLinks(links: LinkDto[]): Promise<{ cursor: number }> {
  return authed('/api/v1/links', { method: 'POST', body: JSON.stringify({ links }) });
}

export function getAccount(): Promise<{ email: string; authProvider: string; linkCount: number }> {
  return authed('/api/v1/account', { method: 'GET' });
}

export function deleteAccount(): Promise<void> {
  return authed<void>('/api/v1/account', { method: 'DELETE' });
}

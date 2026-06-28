import { beforeEach, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { getToken, setToken, clearToken, isSignedIn } from './auth';

beforeEach(() => { localStorage.clear(); clearToken(); });

it('stores the token and keeps the reactive isSignedIn store in sync', () => {
  expect(get(isSignedIn)).toBe(false);
  setToken('jwt123');
  expect(getToken()).toBe('jwt123');
  expect(get(isSignedIn)).toBe(true);
  clearToken();
  expect(getToken()).toBeNull();
  expect(get(isSignedIn)).toBe(false);
});

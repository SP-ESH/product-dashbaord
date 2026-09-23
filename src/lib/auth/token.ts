/**
 * Token storage.
 *
 * NOTE: localStorage is readable by any script on the page, so this is NOT a
 * production-grade way to store credentials (see README > Authentication).
 * It is used here because DummyJSON hands the token to the browser and this
 * assignment has no backend of its own to set an httpOnly cookie.
 */
const TOKEN_KEY = "pd.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Private-mode / disabled storage: the session simply won't survive reload.
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore.
  }
}

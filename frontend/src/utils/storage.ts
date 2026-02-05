/**
 * Token storage utilities
 * Handles localStorage operations for access token
 */

const TOKEN_KEY = 'access_token';

/**
 * Get access token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set access token to localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove access token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData(): void {
  removeToken();
  localStorage.removeItem('userInfo');
}

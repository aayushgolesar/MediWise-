/**
 * src/api/client.ts
 * Base API client — all requests route through Vite's /api proxy → Express server.
 * Includes automated user-facing error notification via toastStore and CSRF double-submit protection.
 */

import { showErrorToast } from '../utils/toastStore';

const BASE_URL = '/api';

export interface ApiResponse<T> {
  data: T;
  count?: number;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface RequestOptions {
  silent?: boolean;
}

const getCsrfTokenFromCookie = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )mediwise_csrf=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const csrf = getCsrfTokenFromCookie();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
    return headers;
  }

  private handleRequestError(path: string, status: number, errorText: string, silent?: boolean): Error {
    let friendlyMessage = errorText;

    if (status === 401) {
      friendlyMessage = 'Your session has expired or authentication is required.';
    } else if (status === 403) {
      friendlyMessage = errorText || 'Access denied: You do not have permission to perform this action.';
    } else if (status === 404) {
      friendlyMessage = `Resource not found on endpoint: ${path}`;
    } else if (status === 429) {
      friendlyMessage = 'Rate limit reached. Please slow down and try again shortly.';
    } else if (status >= 500) {
      friendlyMessage = 'A server error occurred while processing your request. Please try again.';
    }

    if (!silent) {
      showErrorToast(friendlyMessage, `API Error (${status || 'Network'})`);
    }

    return new Error(errorText || friendlyMessage);
  }

  private handleNetworkError(path: string, error: unknown, silent?: boolean): Error {
    const message = error instanceof Error ? error.message : 'Network error or service unavailable';
    if (!silent) {
      showErrorToast(`Unable to reach the MediWise server at ${path}. Please check your connection.`, 'Network Error');
    }
    return new Error(message);
  }

  async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        headers: this.getHeaders(),
        credentials: 'include',
      });
    } catch (err) {
      throw this.handleNetworkError(path, err, options?.silent);
    }

    if (!res.ok) {
      let errText = `Request failed: ${res.status}`;
      try {
        const err = (await res.json()) as ApiError;
        errText = err.error || err.message || errText;
      } catch {
        // Response was not JSON
      }
      throw this.handleRequestError(path, res.status, errText, options?.silent);
    }

    return res.json() as Promise<ApiResponse<T>>;
  }

  async post<T>(path: string, body: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw this.handleNetworkError(path, err, options?.silent);
    }

    if (!res.ok) {
      let errText = `Request failed: ${res.status}`;
      try {
        const err = (await res.json()) as ApiError;
        errText = err.error || err.message || errText;
      } catch {
        // Response was not JSON
      }
      throw this.handleRequestError(path, res.status, errText, options?.silent);
    }

    return res.json() as Promise<ApiResponse<T>>;
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw this.handleNetworkError(path, err, options?.silent);
    }

    if (!res.ok) {
      let errText = `Request failed: ${res.status}`;
      try {
        const err = (await res.json()) as ApiError;
        errText = err.error || err.message || errText;
      } catch {
        // Response was not JSON
      }
      throw this.handleRequestError(path, res.status, errText, options?.silent);
    }

    return res.json() as Promise<ApiResponse<T>>;
  }
}

export const apiClient = new ApiClient(BASE_URL);

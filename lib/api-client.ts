// Lightweight fetch wrapper to replace axios
// Provides consistent error handling and request/response formatting

export interface FetchOptions extends RequestInit {
  timeout?: number;
  baseURL?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  response?: Response;

  constructor(message: string, status: number, statusText: string, response?: Response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

export class ApiClient {
  private baseURL: string;
  private defaultOptions: RequestInit;

  constructor(baseURL = '', defaultOptions: RequestInit = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...defaultOptions.headers,
      },
      ...defaultOptions,
    };
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = 30000, baseURL = this.baseURL, ...fetchOptions } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...this.defaultOptions,
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...this.defaultOptions.headers,
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `Request failed: ${response.status} ${response.statusText}`,
          response.status,
          response.statusText,
          response
        );
      }

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      const data = isJson ? await response.json() : await response.text();

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'Request Timeout');
      }
      
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiError(
        `Network error: ${message}`,
        0,
        'Network Error'
      );
    }
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Default client instance
export const apiClient = new ApiClient();

// Convenience functions
export const get = <T>(endpoint: string, options?: FetchOptions) => 
  apiClient.get<T>(endpoint, options);

export const post = <T>(endpoint: string, data?: any, options?: FetchOptions) => 
  apiClient.post<T>(endpoint, data, options);

export const put = <T>(endpoint: string, data?: any, options?: FetchOptions) => 
  apiClient.put<T>(endpoint, data, options);

export const del = <T>(endpoint: string, options?: FetchOptions) => 
  apiClient.delete<T>(endpoint, options);

export const patch = <T>(endpoint: string, data?: any, options?: FetchOptions) => 
  apiClient.patch<T>(endpoint, data, options);

export default apiClient;

import { API_BASE_URL } from './constants';

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;

  // Determine if this is a request that sends a JSON body
  const hasBody = !!data || typeof customConfig.body === 'string';

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    credentials: 'include', // Important for cookies
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  // (No more empty Content-Type deletion needed — we only set it if hasBody)

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);
    
    // In Phase 0, we don't have the real backend yet, so handle gracefully.
    const textDesc = await response.text();
    let result;
    try {
      result = textDesc ? JSON.parse(textDesc) : {};
    } catch (e) {
      if (response.ok) {
        return { success: true, message: 'Success', data: {} } as T;
      }
      throw new Error(`Invalid JSON response from server: ${textDesc}`);
    }

    if (!response.ok) {
      // Return shape identical to the backend's error schema
      throw new Error(result.message || 'Something went wrong');
    }

    return result as T;
  } catch (error: any) {
    // Return a structured error
    return {
      success: false,
      message: error.message || 'Network error occurred',
      errors: []
    } as T;
  }
}

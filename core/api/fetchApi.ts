import { ApiResult } from './apiResult'

export async function fetchApi<T>(fetchFn: () => Promise<Response>): Promise<ApiResult<T>> {
  try {
    const response = await fetchFn()

    if (!response.ok) {
      return { success: false, error: 'Unexpected server error' }
    }

    const json: ApiResult<T> = await response.json()

    return json
  } catch {
    return {
      success: false,
      error: 'Invalid response from server',
    }
  }
}

export async function fetchWithCredentials<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  return fetchApi(() =>
    fetch(url, {
      ...options,
      credentials: 'include',
    }),
  )
}

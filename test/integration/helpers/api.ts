import { expect } from 'vitest'

import { ApiResult } from '@core/api/apiResult'

export const TEST_BASE_URL = 'http://localhost:3001/api'

export const makeAuthenticatedRequest = async (
  path: string,
  options: RequestInit,
  cookies: string,
) => {
  return fetch(`${TEST_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      cookie: cookies,
      'Content-Type': 'application/json',
    },
  })
}

export async function expectSuccess<T>(response: Response, status = 200): Promise<T> {
  expect(response.status).toBe(status)

  const result: ApiResult<T> = await response.json()

  if (!result.success) {
    throw new Error(`API request failed: ${result.error}`)
  }

  return result.data
}

export async function expectError<T>(response: Response, status = 400): Promise<ApiResult<T>> {
  expect(response.status).toBe(status)

  const result: ApiResult<T> = await response.json()

  if (result.success) {
    throw new Error(`API request succeeded: ${result.data}`)
  }

  return result
}

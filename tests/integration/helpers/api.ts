import { ApiResult } from '@lib/api/apiResult'
import { expect } from 'vitest'

export const TEST_BASE_URL = 'http://localhost:3001'

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

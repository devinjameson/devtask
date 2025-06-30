import { ApiResult } from './apiResult'
import { fetchJson } from './fetchJson'

export async function setActiveProfile(profileId: string): Promise<ApiResult<null>> {
  return fetchJson<null>(() =>
    fetch('/api/profile/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    }),
  )
}

import { ApiResult } from './apiResult'
import { fetchApi } from './fetchApi'

export async function setActiveProfile(profileId: string): Promise<ApiResult<null>> {
  return fetchApi<null>(() =>
    fetch('/api/profile/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    }),
  )
}

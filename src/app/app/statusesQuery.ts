import { useQuery } from '@tanstack/react-query'

import { fetchApi } from '@core/api/fetchApi'

import { Status } from '@/generated/prisma'
import { GetStatusesResultData } from '@/app/api/statuses/route'

import { statusesQueryKey } from './queryKey'

export const fetchStatuses = async (profileId: string): Promise<Status[]> => {
  const result = await fetchApi<GetStatusesResultData>(() =>
    fetch(`/api/statuses?profileId=${encodeURIComponent(profileId)}`),
  )

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.statuses
}

export function useStatuses({ profileId }: { profileId: string }) {
  return useQuery({
    queryKey: statusesQueryKey(profileId),
    queryFn: () => fetchStatuses(profileId),
  })
}

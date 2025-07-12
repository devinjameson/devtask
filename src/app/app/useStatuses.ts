import { GetStatusesResultData } from '@/app/api/statuses/route'
import { Status } from '@/generated/prisma'
import { fetchApi } from '@lib/api/fetchApi'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

const fetchStatuses = async (): Promise<Status[]> => {
  const result = await fetchApi<GetStatusesResultData>(() => fetch('/api/statuses'))

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.statuses
}

export function useStatuses(
  options: Omit<UseQueryOptions<Status[], Error>, 'queryKey' | 'queryFn'> = {},
) {
  return useQuery({
    queryKey: ['statuses'],
    queryFn: fetchStatuses,
    ...options,
  })
}

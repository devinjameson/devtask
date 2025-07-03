import { StatusesResponseData } from '@/app/api/statuses/route'
import { Status } from '@/generated/prisma'
import { fetchJson } from '@/lib/api/fetchJson'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

const fetchStatuses = async (): Promise<Status[]> => {
  const result = await fetchJson<StatusesResponseData>(() => fetch('/api/statuses'))

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

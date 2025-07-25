import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Profile } from '@/generated/prisma'

import { fetchCategories } from './query/categoriesQuery'
import { fetchStatuses } from './query/statusesQuery'
import { fetchTasks } from './query/tasksQuery'
import { categoriesQueryKey, statusesQueryKey, tasksQueryKey } from './queryKey'

export function usePrefetchInactiveProfiles(
  profiles: Profile[] | undefined,
  activeProfileId: string,
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (profiles) {
      const inactiveProfiles = profiles.filter(({ id }) => id !== activeProfileId)

      inactiveProfiles.forEach((profile) => {
        queryClient.prefetchQuery({
          queryKey: tasksQueryKey(profile.id),
          queryFn: () => fetchTasks(profile.id),
        })
        queryClient.prefetchQuery({
          queryKey: statusesQueryKey(profile.id),
          queryFn: () => fetchStatuses(profile.id),
        })
        queryClient.prefetchQuery({
          queryKey: categoriesQueryKey(profile.id),
          queryFn: () => fetchCategories(profile.id),
        })
      })
    }
  }, [profiles, activeProfileId, queryClient])
}

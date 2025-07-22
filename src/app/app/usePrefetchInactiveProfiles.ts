import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Profile } from '@/generated/prisma'

import { fetchCategories } from './categoriesQuery'
import { categoriesQueryKey, statusesQueryKey, tasksQueryKey } from './queryKey'
import { fetchStatuses } from './statusesQuery'
import { fetchTasks } from './tasksQuery'

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

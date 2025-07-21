import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Profile } from '@/generated/prisma'

import { fetchCategories } from './useCategories'
import { fetchStatuses } from './useStatuses'
import { fetchTasks } from './useTasks'

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
          queryKey: ['tasks', { profileId: profile.id }],
          queryFn: fetchTasks,
        })
        queryClient.prefetchQuery({
          queryKey: ['statuses', { profileId: profile.id }],
          queryFn: fetchStatuses,
        })
        queryClient.prefetchQuery({
          queryKey: ['categories', { profileId: profile.id }],
          queryFn: fetchCategories,
        })
      })
    }
  }, [profiles, activeProfileId, queryClient])
}

import { useQuery } from '@tanstack/react-query'

import { fetchApi } from '@core/api/fetchApi'

import { Profile } from '@/generated/prisma'
import { GetProfilesResultData } from '@/app/api/profiles/route'

import { profilesQueryKey } from '../queryKey'

const fetchProfiles = async (): Promise<Profile[]> => {
  const result = await fetchApi<GetProfilesResultData>(() => fetch('/api/profiles'))

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.profiles
}

export function useProfiles() {
  return useQuery({
    queryKey: profilesQueryKey(),
    queryFn: fetchProfiles,
  })
}

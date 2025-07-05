import { ProfilesResultData } from '@/app/api/profiles/route'
import { Profile } from '@/generated/prisma'
import { fetchJson } from '@/lib/api/fetchJson'
import { useQuery } from '@tanstack/react-query'

const fetchProfiles = async (): Promise<Profile[]> => {
  const result = await fetchJson<ProfilesResultData>(() => fetch('/api/profiles'))

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.profiles
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  })
}

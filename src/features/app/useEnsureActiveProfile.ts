'use client'

import { useEffect } from 'react'
import Cookies from 'js-cookie'
import { fetchJson } from '@/lib/api/fetchJson'
import { setActiveProfile } from '@/lib/api/setActiveProfile'
import { ProfilesResponseData } from '@/app/api/profiles/route'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'

export const useEnsureActiveProfile = () => {
  useEffect(() => {
    const maybeSetProfile = async () => {
      const existing = Cookies.get(ACTIVE_PROFILE_COOKIE)

      if (!existing) {
        const result = await fetchJson<ProfilesResponseData>(() => fetch('/api/profiles'))

        if (result.success) {
          const firstProfileId = result.data.profiles[0]?.id

          if (firstProfileId) {
            await setActiveProfile(firstProfileId)
          }
        }
      }
    }

    maybeSetProfile()
  }, [])
}

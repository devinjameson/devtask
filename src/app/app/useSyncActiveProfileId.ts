import { useEffect } from 'react'
import { $activeProfileId, setActiveProfileId } from '@/stores/profileStore'
import { useStore } from '@nanostores/react'

import { fetchWithCredentials } from '@core/api/fetchApi'

export function useSyncActiveProfileId() {
  const activeProfileId = useStore($activeProfileId)

  useEffect(() => {
    const syncActiveProfileId = async () => {
      if (activeProfileId === '') {
        try {
          const result = await fetchWithCredentials<{ profileId: string }>('/api/auth/session', {
            method: 'POST',
          })
          if (result.success) {
            setActiveProfileId(result.data.profileId)
          }
        } catch {}
      }
    }

    syncActiveProfileId()
  }, [activeProfileId])
}

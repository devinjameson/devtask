import { useMutation } from '@tanstack/react-query'

import { SelectProfileBody, SelectProfileResult } from '@/app/api/profile/select/route'

export const useSwitchProfileMutation = () => {
  return useMutation({
    mutationFn: async ({ profileId }: { profileId: string }) => {
      const body: SelectProfileBody = { profileId }
      const response = await fetch('/api/profile/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to switch profile')
      }

      const result: SelectProfileResult = await response.json()

      return result
    },
  })
}

import { getCookie } from '@/lib/getCookie'
import { atom } from 'nanostores'

import { ACTIVE_PROFILE_COOKIE } from '@core/constants'

export const $activeProfileId = atom<string>(getCookie(ACTIVE_PROFILE_COOKIE) ?? '')

export const setActiveProfileId = (profileId: string) => {
  $activeProfileId.set(profileId)
}

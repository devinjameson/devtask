import { Effect } from 'effect'

import { ApiException } from './apiException'

export const getRequiredProfileId = (req: Request): Effect.Effect<string, ApiException> =>
  Effect.gen(function* () {
    const url = new URL(req.url)
    const profileId = url.searchParams.get('profileId')
    if (!profileId) {
      return yield* new ApiException({ message: 'Profile ID is required', status: 400 })
    }
    return profileId
  })

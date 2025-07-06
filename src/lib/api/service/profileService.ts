import { cookies } from 'next/headers'
import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { ServiceException } from '../serviceException'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'

export const getActiveProfileId: Effect.Effect<string, ServiceException | UnknownException> = Effect.gen(
  function* () {
    const cookieStore = yield* Effect.tryPromise(() => cookies())
    const profileId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value

    if (!profileId) {
      return yield* Effect.fail({ message: 'No active profile selected', status: 400 })
    }

    return profileId
  },
)
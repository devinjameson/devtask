import { cookies } from 'next/headers'
import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'

import { ACTIVE_PROFILE_COOKIE } from '@core/constants'
import { prisma } from '@core/prisma'

import { Profile } from '@/generated/prisma'

import { ServiceException } from '../serviceException'

export const getActiveProfileId: Effect.Effect<string, ServiceException | UnknownException> =
  Effect.gen(function* () {
    const cookieStore = yield* Effect.tryPromise(() => cookies())
    const profileId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value

    if (!profileId) {
      return yield* Effect.fail({ message: 'No active profile selected', status: 400 })
    }

    return profileId
  })

export const setActiveProfile = (
  profileId: string,
): Effect.Effect<void, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const cookieStore = yield* Effect.tryPromise(() => cookies())
    cookieStore.set(ACTIVE_PROFILE_COOKIE, profileId, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })
  })

export const listProfiles = (
  userId: string,
): Effect.Effect<Profile[], ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const profiles = yield* Effect.tryPromise(() =>
      prisma.profile.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      }),
    )

    return profiles
  })

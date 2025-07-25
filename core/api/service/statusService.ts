import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'

import { prisma } from '@core/prisma'

import { Status } from '@/generated/prisma'

import { ApiException } from '../apiException'

export const listStatuses = (
  profileId: string,
): Effect.Effect<Status[], ApiException | UnknownException> =>
  Effect.gen(function* () {
    const statuses = yield* Effect.tryPromise(() =>
      prisma.status.findMany({
        where: { profileId },
      }),
    )

    return statuses
  })

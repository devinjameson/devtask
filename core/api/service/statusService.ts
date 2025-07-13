import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'

import { prisma } from '@core/prisma'

import { Status } from '@/generated/prisma'

import { ServiceException } from '../serviceException'

export const listStatuses = (
  profileId: string,
): Effect.Effect<Status[], ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const statuses = yield* Effect.tryPromise(() =>
      prisma.status.findMany({
        where: { profileId },
      }),
    )

    return statuses
  })

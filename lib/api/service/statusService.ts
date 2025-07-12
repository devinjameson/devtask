import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { ServiceException } from '../serviceException'
import { prisma } from '@lib/prisma'
import { Status } from '@/generated/prisma'

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

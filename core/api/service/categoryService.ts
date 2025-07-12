import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { ServiceException } from '../serviceException'
import { prisma } from '@core/prisma'
import { Category } from '@/generated/prisma'

export const listCategories = (
  profileId: string,
): Effect.Effect<Category[], ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const categories = yield* Effect.tryPromise(() =>
      prisma.category.findMany({
        where: { profileId },
        orderBy: { createdAt: 'asc' },
      }),
    )

    return categories
  })

import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'

import { prisma } from '@core/prisma'

import { Category } from '@/generated/prisma'

import { ApiException } from '../apiException'

export const listCategories = (
  profileId: string,
): Effect.Effect<Category[], ApiException | UnknownException> =>
  Effect.gen(function* () {
    const categories = yield* Effect.tryPromise(() =>
      prisma.category.findMany({
        where: { profileId },
        orderBy: { createdAt: 'asc' },
      }),
    )

    return categories
  })

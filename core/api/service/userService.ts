import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { ServiceException } from '../serviceException'
import { prisma } from '@core/prisma'
import { Prisma } from '@/generated/prisma'

export type UserWithProfiles = Prisma.UserGetPayload<{
  include: {
    profiles: true
  }
}>

export type CreateUserPayload = {
  id: string
  email: string
  firstName: string
  lastName: string
}

export const createUser = (
  payload: CreateUserPayload,
): Effect.Effect<UserWithProfiles, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const { id, email, firstName, lastName } = payload

    const existing = yield* Effect.tryPromise(() =>
      prisma.user.findUnique({
        where: { id },
      }),
    )

    if (existing) {
      return yield* Effect.fail({ message: 'User already exists', status: 400 })
    }

    yield* Effect.tryPromise(() =>
      prisma.user.create({
        data: {
          id,
          email,
          firstName,
          lastName,
          profiles: {
            create: {
              name: 'Home',
            },
          },
        },
      }),
    )

    const userWithProfiles = yield* Effect.tryPromise(() =>
      prisma.user.findUnique({
        where: { id },
        include: {
          profiles: true,
        },
      }),
    )

    if (!userWithProfiles) {
      return yield* Effect.fail({ message: 'Failed to create user', status: 500 })
    }

    return userWithProfiles
  })

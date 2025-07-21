import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { generateKeyBetween } from 'fractional-indexing'

import { daysFromNow } from '@core/lib/date'
import { prisma } from '@core/prisma'

import { Prisma } from '@/generated/prisma'

import { ServiceException } from '../serviceException'

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
      prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id,
            email,
            firstName,
            lastName,
            profiles: {
              create: {
                name: 'Home',
                statuses: {
                  createMany: {
                    data: [{ name: 'Pending' }, { name: 'In Progress' }, { name: 'Completed' }],
                  },
                },
                categories: {
                  createMany: {
                    data: [{ name: 'Work' }, { name: 'Personal' }],
                  },
                },
              },
            },
          },
          include: {
            profiles: {
              include: {
                statuses: true,
              },
            },
          },
        })

        const profile = user.profiles[0]!
        const pendingStatus = profile.statuses.find(({ name }) => name === 'Pending')!
        const inProgressStatus = profile.statuses.find(({ name }) => name === 'In Progress')!
        const completedStatus = profile.statuses.find(({ name }) => name === 'Completed')!

        const profileWithCategories = await tx.profile.findUnique({
          where: { id: profile.id },
          include: { categories: true },
        })
        const workCategory = profileWithCategories!.categories.find(({ name }) => name === 'Work')!
        const personalCategory = profileWithCategories!.categories.find(
          ({ name }) => name === 'Personal',
        )!

        const order0 = generateKeyBetween(null, null)
        const order1 = generateKeyBetween(order0, null)

        await tx.task.createMany({
          data: [
            {
              title: 'Welcome to your task board! 👋',
              description:
                'Try dragging me to the "In Progress" column to see how easy it is to organize your tasks.',
              statusId: pendingStatus.id,
              profileId: profile.id,
              categoryId: personalCategory.id,
              dueDate: daysFromNow(1),
              order: order0,
            },
            {
              title: 'Create your first task',
              description:
                'Click the "+" button to add a new task. You can add descriptions, due dates, and categories, too!',
              statusId: pendingStatus.id,
              profileId: profile.id,
              categoryId: personalCategory.id,
              dueDate: daysFromNow(7),
              order: order1,
            },
            {
              title: 'Try editing me! ✏️',
              description:
                'Click on any task to edit its title, description, due date, or category. You can also delete tasks from here.',
              statusId: inProgressStatus.id,
              profileId: profile.id,
              categoryId: workCategory.id,
              dueDate: daysFromNow(0),
              order: order0,
            },
            {
              title: 'You completed your first task! 🎉',
              description:
                'Great job! When you finish tasks, drag them here or move them using the edit dialog.',
              statusId: completedStatus.id,
              profileId: profile.id,
              categoryId: workCategory.id,
              dueDate: null,
              order: order0,
            },
          ],
        })

        return user
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

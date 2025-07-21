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
              create: [
                {
                  name: 'Personal',
                  statuses: {
                    createMany: {
                      data: [{ name: 'Pending' }, { name: 'In Progress' }, { name: 'Completed' }],
                    },
                  },
                  categories: {
                    createMany: {
                      data: [{ name: 'Shopping' }, { name: 'Health' }, { name: 'Creative' }],
                    },
                  },
                },
                {
                  name: 'Work',
                  statuses: {
                    createMany: {
                      data: [{ name: 'Pending' }, { name: 'In Progress' }, { name: 'Completed' }],
                    },
                  },
                  categories: {
                    createMany: {
                      data: [{ name: 'Shopping' }, { name: 'Health' }, { name: 'Creative' }],
                    },
                  },
                },
              ],
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

        const personalProfile = user.profiles.find(({ name }) => name === 'Personal')!
        const pendingStatus = personalProfile.statuses.find(({ name }) => name === 'Pending')!
        const inProgressStatus = personalProfile.statuses.find(
          ({ name }) => name === 'In Progress',
        )!
        const completedStatus = personalProfile.statuses.find(({ name }) => name === 'Completed')!

        const profileWithCategories = await tx.profile.findUnique({
          where: { id: personalProfile.id },
          include: { categories: true },
        })
        const shoppingCategory = profileWithCategories!.categories.find(
          ({ name }) => name === 'Shopping',
        )!
        const healthCategory = profileWithCategories!.categories.find(
          ({ name }) => name === 'Health',
        )!
        const creativeCategory = profileWithCategories!.categories.find(
          ({ name }) => name === 'Creative',
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
              profileId: personalProfile.id,
              categoryId: creativeCategory.id,
              dueDate: daysFromNow(1),
              order: order0,
            },
            {
              title: 'Create your first task',
              description:
                'Click the "+" button to add a new task. You can add descriptions, due dates, and categories, too!',
              statusId: pendingStatus.id,
              profileId: personalProfile.id,
              categoryId: creativeCategory.id,
              dueDate: daysFromNow(7),
              order: order1,
            },
            {
              title: 'Try editing me! ✏️',
              description:
                'Click on any task to edit its title, description, due date, or category. You can also delete tasks from here.',
              statusId: inProgressStatus.id,
              profileId: personalProfile.id,
              categoryId: healthCategory.id,
              dueDate: daysFromNow(0),
              order: order0,
            },
            {
              title: 'You completed your first task! 🎉',
              description:
                'Great job! When you finish tasks, drag them here or move them using the edit dialog.',
              statusId: completedStatus.id,
              profileId: personalProfile.id,
              categoryId: healthCategory.id,
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

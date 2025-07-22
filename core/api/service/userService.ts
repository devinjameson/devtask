import { createServiceRoleClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { generateKeyBetween } from 'fractional-indexing'
import { v4 as uuidv4 } from 'uuid'

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
    console.log('🏗️ UserService.createUser called with:', payload.id)
    const { id, email, firstName, lastName } = payload

    console.log('🔑 Creating service role client...')
    const supabase = createServiceRoleClient()
    console.log('✅ Service role client created')

    const { data: existingUsers } = yield* Effect.tryPromise(() =>
      supabase.from('User').select('id').eq('id', id),
    )

    if (existingUsers && existingUsers.length > 0) {
      return yield* Effect.fail({ message: 'User already exists', status: 400 })
    }

    const userData: Database['public']['Tables']['User']['Insert'] = {
      id,
      email,
      firstName,
      lastName,
    }

    yield* Effect.tryPromise(() => supabase.from('User').insert(userData))

    const personalProfileId = uuidv4()
    const workProfileId = uuidv4()

    const personalProfileData: Database['public']['Tables']['Profile']['Insert'] = {
      id: personalProfileId,
      name: 'Personal',
      userId: id,
    }

    const workProfileData: Database['public']['Tables']['Profile']['Insert'] = {
      id: workProfileId,
      name: 'Work',
      userId: id,
    }

    yield* Effect.tryPromise(() => supabase.from('Profile').insert(personalProfileData))
    yield* Effect.tryPromise(() => supabase.from('Profile').insert(workProfileData))

    const statusData: Database['public']['Tables']['Status']['Insert'][] = [
      { id: uuidv4(), name: 'Pending', profileId: personalProfileId },
      { id: uuidv4(), name: 'In Progress', profileId: personalProfileId },
      { id: uuidv4(), name: 'Completed', profileId: personalProfileId },
      { id: uuidv4(), name: 'Pending', profileId: workProfileId },
      { id: uuidv4(), name: 'In Progress', profileId: workProfileId },
      { id: uuidv4(), name: 'Completed', profileId: workProfileId },
    ]

    yield* Effect.tryPromise(() => supabase.from('Status').insert(statusData))

    const categoryData: Database['public']['Tables']['Category']['Insert'][] = [
      { id: uuidv4(), name: 'Shopping', profileId: personalProfileId },
      { id: uuidv4(), name: 'Health', profileId: personalProfileId },
      { id: uuidv4(), name: 'Creative', profileId: personalProfileId },
      { id: uuidv4(), name: 'Shopping', profileId: workProfileId },
      { id: uuidv4(), name: 'Health', profileId: workProfileId },
      { id: uuidv4(), name: 'Creative', profileId: workProfileId },
    ]

    yield* Effect.tryPromise(() => supabase.from('Category').insert(categoryData))

    const statusesResponse = yield* Effect.tryPromise(() =>
      supabase.from('Status').select('*').eq('profileId', personalProfileId),
    )

    const categoriesResponse = yield* Effect.tryPromise(() =>
      supabase.from('Category').select('*').eq('profileId', personalProfileId),
    )

    if (!statusesResponse.data || !categoriesResponse.data) {
      return yield* Effect.fail({
        message: 'Failed to fetch created statuses and categories',
        status: 500,
      })
    }

    const pendingStatus = statusesResponse.data.find((s) => s.name === 'Pending')
    const inProgressStatus = statusesResponse.data.find((s) => s.name === 'In Progress')
    const completedStatus = statusesResponse.data.find((s) => s.name === 'Completed')
    const shoppingCategory = categoriesResponse.data.find((c) => c.name === 'Shopping')
    const healthCategory = categoriesResponse.data.find((c) => c.name === 'Health')
    const creativeCategory = categoriesResponse.data.find((c) => c.name === 'Creative')

    if (
      !pendingStatus ||
      !inProgressStatus ||
      !completedStatus ||
      !shoppingCategory ||
      !healthCategory ||
      !creativeCategory
    ) {
      return yield* Effect.fail({
        message: 'Failed to find required statuses and categories',
        status: 500,
      })
    }

    const order0 = generateKeyBetween(null, null)
    const order1 = generateKeyBetween(order0, null)

    const taskData: Database['public']['Tables']['Task']['Insert'][] = [
      {
        id: uuidv4(),
        title: 'Welcome to your task board! 👋',
        description:
          'Try dragging me to the "In Progress" column to see how easy it is to organize your tasks.',
        statusId: pendingStatus.id,
        profileId: personalProfileId,
        categoryId: creativeCategory.id,
        dueDate: daysFromNow(1).toISOString(),
        order: order0,
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: 'Create your first task',
        description:
          'Click the "+" button to add a new task. You can add descriptions, due dates, and categories, too!',
        statusId: pendingStatus.id,
        profileId: personalProfileId,
        categoryId: creativeCategory.id,
        dueDate: daysFromNow(7).toISOString(),
        order: order1,
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: 'Try editing me! ✏️',
        description:
          'Click on any task to edit its title, description, due date, or category. You can also delete tasks from here.',
        statusId: inProgressStatus.id,
        profileId: personalProfileId,
        categoryId: healthCategory.id,
        dueDate: daysFromNow(0).toISOString(),
        order: order0,
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: 'You completed your first task! 🎉',
        description:
          'Great job! When you finish tasks, drag them here or move them using the edit dialog.',
        statusId: completedStatus.id,
        profileId: personalProfileId,
        categoryId: shoppingCategory.id,
        dueDate: null,
        order: order0,
        updatedAt: new Date().toISOString(),
      },
    ]

    yield* Effect.tryPromise(() => supabase.from('Task').insert(taskData))

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

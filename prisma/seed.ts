import { createClient } from '@supabase/supabase-js'
import { generateKeyBetween } from 'fractional-indexing'

import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.admin.createUser({
    email: 'demo@example.com',
    password: 'password123',
    email_confirm: true,
  })

  if (error || !authUser?.id) {
    console.error('Error creating Supabase user:', error)
    throw new Error('Failed to create Supabase user')
  }

  const user = await prisma.user.create({
    data: {
      id: authUser.id,
      email: authUser.email!,
      firstName: 'Demo',
      lastName: 'User',
      profiles: {
        create: [{ name: 'Home' }, { name: 'Work' }],
      },
    },
    include: {
      profiles: true,
    },
  })

  const homeProfile = user.profiles.find(({ name }) => name === 'Home')!
  const workProfile = user.profiles.find(({ name }) => name === 'Work')!

  await prisma.status.createMany({
    data: [
      { name: 'Pending', profileId: homeProfile.id },
      { name: 'In Progress', profileId: homeProfile.id },
      { name: 'Done', profileId: homeProfile.id },
    ],
    skipDuplicates: true,
  })

  await prisma.status.createMany({
    data: [
      { name: 'Pending', profileId: workProfile.id },
      { name: 'In Progress', profileId: workProfile.id },
      { name: 'Done', profileId: workProfile.id },
    ],
    skipDuplicates: true,
  })

  const statuses = await prisma.status.findMany({ include: { profile: true } })

  await prisma.category.createMany({
    data: [
      { name: 'General', profileId: homeProfile.id },
      { name: 'Coffee', profileId: homeProfile.id },
      { name: 'Coding', profileId: homeProfile.id },
    ],
    skipDuplicates: true,
  })

  await prisma.category.createMany({
    data: [
      { name: 'Operations', profileId: workProfile.id },
      { name: 'Human Resources', profileId: workProfile.id },
      { name: 'Marketing', profileId: workProfile.id },
    ],
    skipDuplicates: true,
  })

  const categories = await prisma.category.findMany({
    where: { profileId: homeProfile.id },
  })

  const getCategoryId = (name: string) => categories.find((c) => c.name === name)?.id ?? null

  const pendingTasks = () => {
    const statusId = statuses.find(
      ({ name, profile }) => name === 'Pending' && profile.name === 'Home',
    )!.id

    const order1 = generateKeyBetween(null, null)
    const order2 = generateKeyBetween(order1, null)
    const order3 = generateKeyBetween(order2, null)

    return [
      {
        title: 'Dial in new Sey',
        description: 'Tweak grind size?',
        profileId: homeProfile.id,
        statusId,
        categoryId: getCategoryId('Coffee'),
        order: order1,
        dueDate: daysFromNow(1),
      },
      {
        title: 'Tidy up desk',
        description: 'Decide on new spots for various decorative items',
        profileId: homeProfile.id,
        statusId,
        categoryId: getCategoryId('General'),
        order: order2,
        dueDate: daysFromNow(2),
      },
      {
        title: 'Organize stickers',
        description: 'Sort by vibe, not category.',
        profileId: homeProfile.id,
        statusId,
        categoryId: getCategoryId('General'),
        order: order3,
        dueDate: daysFromNow(3),
      },
    ]
  }

  const inProgressTasks = () => {
    const statusId = statuses.find(
      ({ name, profile }) => name === 'In Progress' && profile.name === 'Home',
    )!.id

    return [
      {
        title: 'Update Neovim config',
        description: 'Reorganize plugins',
        profileId: homeProfile.id,
        statusId,
        categoryId: getCategoryId('Coding'),
        order: generateKeyBetween(null, null),
        dueDate: daysFromNow(-1),
      },
    ]
  }

  const doneTasks = () => {
    const statusId = statuses.find(
      ({ name, profile }) => name === 'Done' && profile.name === 'Home',
    )!.id

    return [
      {
        title: 'Call Mom',
        description: 'Crucial',
        profileId: homeProfile.id,
        statusId,
        categoryId: getCategoryId('General'),
        order: generateKeyBetween(null, null),
      },
    ]
  }

  await prisma.task.createMany({
    data: [...pendingTasks(), ...inProgressTasks(), ...doneTasks()],
  })

  console.log('🌱 Seed complete')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

const daysFromNow = (days: number) => new Date(Date.now() + 1000 * 60 * 60 * 24 * days)

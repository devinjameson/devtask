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
        create: {
          name: 'Home',
        },
      },
    },
    include: {
      profiles: true,
    },
  })

  const profile = user.profiles[0]

  if (!profile) {
    throw new Error('User missing profile')
  }

  await prisma.status.createMany({
    data: [
      { name: 'Pending', profileId: profile.id },
      { name: 'In Progress', profileId: profile.id },
      { name: 'Done', profileId: profile.id },
    ],
    skipDuplicates: true,
  })

  const statuses = await prisma.status.findMany()

  const [pending, inProgress, done] = [
    statuses.find((s) => s.name === 'Pending')!,
    statuses.find((s) => s.name === 'In Progress')!,
    statuses.find((s) => s.name === 'Done')!,
  ]

  await prisma.category.createMany({
    data: [
      { name: 'General', profileId: profile.id },
      { name: 'Coffee', profileId: profile.id },
      { name: 'Coding', profileId: profile.id },
    ],
    skipDuplicates: true,
  })

  const categories = await prisma.category.findMany({
    where: { profileId: profile.id },
  })

  const getCategoryId = (name: string) => categories.find((c) => c.name === name)?.id ?? null

  const pendingTasks = () => {
    const statusId = pending.id

    const order1 = generateKeyBetween(null, null)
    const order2 = generateKeyBetween(order1, null)
    const order3 = generateKeyBetween(order2, null)

    return [
      {
        title: 'Dial in new Sey',
        description: 'Tweak grind size?',
        profileId: profile.id,
        statusId,
        categoryId: getCategoryId('Coffee'),
        order: order1,
      },
      {
        title: 'Tidy up desk',
        description: 'Decide on new spots for various decorative items',
        profileId: profile.id,
        statusId,
        categoryId: getCategoryId('General'),
        order: order2,
      },
      {
        title: 'Organize stickers',
        description: 'Sort by vibe, not category.',
        profileId: profile.id,
        statusId,
        categoryId: getCategoryId('General'),
        order: order3,
      },
    ]
  }

  const inProgressTasks = () => {
    const statusId = inProgress.id

    return [
      {
        title: 'Update Neovim config',
        description: 'Reorganize plugins',
        profileId: profile.id,
        statusId,
        categoryId: getCategoryId('Coding'),
        order: generateKeyBetween(null, null),
      },
    ]
  }

  const doneTasks = () => {
    const statusId = done.id

    return [
      {
        title: 'Call Mom',
        description: 'Crucial',
        profileId: profile.id,
        statusId,
        categoryId: getCategoryId('General'),
        order: generateKeyBetween(null, null),
      },
    ]
  }

  await prisma.task.createMany({
    data: [...pendingTasks(), ...inProgressTasks(), ...doneTasks()],
  })

  console.log('🌱 Seed complete:', {
    user: user.email,
    profile: profile.name,
    statuses: statuses.map((s) => s.name),
    categories: categories.map((c) => c.name),
  })
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

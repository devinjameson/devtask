import { PrismaClient } from '@/generated/prisma'
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export const prisma = new PrismaClient()

export async function resetDb() {
  const {
    data: { users },
  } = await supabaseAdmin.auth.admin.listUsers()
  for (const user of users) {
    await supabaseAdmin.auth.admin.deleteUser(user.id)
  }

  await prisma.user.deleteMany()
}

export async function createTestUser() {
  const timestamp = Date.now()
  const email = `test-${timestamp}@example.com`
  const password = 'testpass123'

  const {
    data: { user: authUser },
    error,
  } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !authUser) {
    throw new Error(`Failed to create authUser: ${error?.message || 'Unknown error'}`)
  }

  const user = await prisma.user.create({
    data: {
      id: authUser.id,
      email,
      firstName: 'Test',
      lastName: 'User',
      profiles: {
        create: {
          name: 'Home',
          statuses: {
            create: [{ name: 'Pending' }, { name: 'In Progress' }, { name: 'Completed' }],
          },
          categories: {
            create: [{ name: 'Coffee' }, { name: 'Programming' }],
          },
        },
      },
    },
    include: {
      profiles: {
        include: {
          statuses: true,
          categories: true,
        },
      },
    },
  })

  // Create a regular client for sign-in (not admin)
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: signInData } = await supabaseClient.auth.signInWithPassword({
    email: user.email,
    password,
  })

  return {
    user,
    session: signInData.session!,
    authUser: authUser,
  }
}

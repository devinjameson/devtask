import { Prisma, PrismaClient, User } from '@/generated/prisma'
import { ACTIVE_PROFILE_COOKIE } from '@core/constants'
import { AuthUser } from '@core/api/authUser'
import { createClient, Session } from '@supabase/supabase-js'

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

export const resetDb = async () => {
  const {
    data: { users },
  } = await supabaseAdmin.auth.admin.listUsers()
  for (const user of users) {
    await supabaseAdmin.auth.admin.deleteUser(user.id)
  }

  await prisma.user.deleteMany()
}

export type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: {
    categories: true
    statuses: true
  }
}>

export const createTestUser = async (): Promise<{
  authUser: AuthUser
  user: User
  session: Session
  profile: ProfileWithRelations
  cookies: string
}> => {
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

  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: signInData } = await supabaseClient.auth.signInWithPassword({
    email: user.email,
    password,
  })

  const session = signInData.session
  if (!session) {
    throw new Error('Failed to sign in test user')
  }

  const profile = user.profiles[0]
  if (!profile) {
    throw new Error('No profile found for test user')
  }

  const sessionCookie = Buffer.from(JSON.stringify(session)).toString('base64')
  const cookies = [
    `sb-127-auth-token=base64-${sessionCookie}`,
    `${ACTIVE_PROFILE_COOKIE}=${profile.id}`,
  ].join('; ')

  return {
    authUser,
    user,
    session,
    profile,
    cookies,
  }
}

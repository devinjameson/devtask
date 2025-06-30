import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Prisma } from '@/generated/prisma'
import { ApiResult } from '@/lib/api/apiResult'

export type CreateUserBody = {
  firstName: string
  lastName: string
}

export type UserWithProfiles = Prisma.UserGetPayload<{
  include: {
    profiles: true
  }
}>
export type CreateUserResponseData = { user: UserWithProfiles }
export type CreateUserResult = ApiResult<CreateUserResponseData>

export async function POST(req: NextRequest): Promise<NextResponse<CreateUserResult>> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { firstName, lastName }: CreateUserBody = await req.json()

    const existing = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 })
    }

    const createdUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        firstName,
        lastName,
        profiles: {
          create: {
            name: 'Home',
          },
        },
      },
    })

    const userWithProfiles = await prisma.user.findUnique({
      where: { id: createdUser.id },
      include: {
        profiles: true,
      },
    })

    if (!userWithProfiles) {
      return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        data: { user: userWithProfiles },
      },
      {
        status: 201,
      },
    )
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
      },
      {
        status: 500,
      },
    )
  }
}

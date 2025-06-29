import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ApiResult } from '@/lib/api/apiResult'
import { Prisma } from '@/generated/prisma'

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    category: true
    status: true
  }
}>
export type TasksResponseData = { tasks: TaskWithRelations[] }
export type TasksResponse = ApiResult<TasksResponseData>

export async function GET(): Promise<NextResponse<TasksResponse>> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      },
      {
        status: 401,
      },
    )
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profiles: {
        include: {
          tasks: {
            include: {
              category: true,
              status: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  const tasks = dbUser?.profiles[0]?.tasks ?? []

  return NextResponse.json({
    success: true,
    data: {
      tasks: tasks satisfies TaskWithRelations[],
    },
  })
}

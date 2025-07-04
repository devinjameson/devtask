import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ApiResult } from '@/lib/api/apiResult'
import { Prisma } from '@/generated/prisma'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'

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

  const activeProfileId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value

  if (!activeProfileId) {
    return NextResponse.json({ success: false, error: 'No active profile' }, { status: 400 })
  }

  const tasks = await prisma.task.findMany({
    where: { profileId: activeProfileId },
    include: { category: true, status: true },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({
    success: true,
    data: {
      tasks: tasks satisfies TaskWithRelations[],
    },
  })
}

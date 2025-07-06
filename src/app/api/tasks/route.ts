import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ApiResult } from '@/lib/api/apiResult'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'
import { Prisma, Task } from '@/generated/prisma'

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    category: true
    status: true
  }
}>
export type GetTasksResultData = { tasks: TaskWithRelations[] }
export type GetTasksResult = ApiResult<GetTasksResultData>

export async function GET(): Promise<NextResponse<GetTasksResult>> {
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

export type CreateTaskBody = {
  title: string
  statusId: string
  description?: string
  categoryId?: string
}

export type CreateTaskResultData = { task: Task }
export type CreateTaskResult = ApiResult<CreateTaskResultData>

export async function POST(req: Request): Promise<NextResponse<CreateTaskResult>> {
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

  const { title, description, statusId, categoryId }: CreateTaskBody = await req.json()

  if (!title || !statusId) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  const newTask = await prisma.$transaction(async (tx) => {
    await tx.task.updateMany({
      where: { statusId },
      data: { order: { increment: 1 } },
    })

    return tx.task.create({
      data: {
        title,
        description,
        statusId,
        categoryId,
        profileId: activeProfileId,
        order: 0,
      },
    })
  })

  return NextResponse.json(
    {
      success: true,
      data: { task: newTask },
    },
    { status: 201 },
  )
}

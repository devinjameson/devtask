import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, TaskService } from '@core/api/service'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

import { Task } from '@/generated/prisma'

export type { TaskWithRelations } from '@core/api/service/taskService'
export type GetTasksResultData = { tasks: TaskService.TaskWithRelations[] }
export type GetTasksResult = ApiResult<GetTasksResultData>

export async function GET(req: Request): Promise<NextResponse<GetTasksResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const url = new URL(req.url)
    const profileId = url.searchParams.get('profileId')
    if (!profileId) {
      throw new Error('Profile ID is required')
    }
    const tasks = yield* TaskService.listTasks(profileId)
    return { tasks }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(), Effect.runPromise)
}

export type CreateTaskBody = {
  title: string
  statusId: string
  description?: string
  categoryId?: string
  dueDate?: string
}

export type CreateTaskResultData = { task: Task }
export type CreateTaskResult = ApiResult<CreateTaskResultData>

export async function POST(req: Request): Promise<NextResponse<CreateTaskResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const url = new URL(req.url)
    const profileId = url.searchParams.get('profileId')
    if (!profileId) {
      throw new Error('Profile ID is required')
    }
    const { title, description, statusId, categoryId, dueDate }: CreateTaskBody =
      yield* Effect.tryPromise(() => req.json())
    const task = yield* TaskService.createTask({
      title,
      description,
      statusId,
      categoryId,
      dueDate,
      profileId,
    })
    return { task }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(201), Effect.runPromise)
}

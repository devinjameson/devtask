import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { unknownExceptionToApiException } from '@core/api/apiException'
import { ApiResult } from '@core/api/apiResult'
import { getRequiredProfileId } from '@core/api/request'
import { AuthUserService, TaskService } from '@core/api/service'
import { toApiResult } from '@core/api/toApiResult'

import { Task } from '@/generated/prisma'

export type { TaskWithRelations } from '@core/api/service/taskService'
export type GetTasksResultData = { tasks: TaskService.TaskWithRelations[] }
export type GetTasksResult = ApiResult<GetTasksResultData>

export async function GET(req: Request): Promise<NextResponse<GetTasksResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const profileId = yield* getRequiredProfileId(req)
    const tasks = yield* TaskService.listTasks(profileId)
    return { tasks }
  }).pipe(unknownExceptionToApiException, toApiResult(), Effect.runPromise)
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
    const profileId = yield* getRequiredProfileId(req)
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
  }).pipe(unknownExceptionToApiException, toApiResult(201), Effect.runPromise)
}

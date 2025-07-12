import { NextResponse } from 'next/server'
import { ApiResult } from '@lib/api/apiResult'
import { Task } from '@/generated/prisma'
import { AuthUserService, ProfileService, TaskService } from '@lib/api/service'
import { Effect } from 'effect'
import { unknownExceptionToServiceException } from '@lib/api/serviceException'
import { serviceResultToNextResponse } from '@lib/api/serviceResultToNextResponse'

export type { TaskWithRelations } from '@lib/api/service/taskService'
export type GetTasksResultData = { tasks: TaskService.TaskWithRelations[] }
export type GetTasksResult = ApiResult<GetTasksResultData>

export async function GET(): Promise<NextResponse<GetTasksResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const profileId = yield* ProfileService.getActiveProfileId
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
    const profileId = yield* ProfileService.getActiveProfileId
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

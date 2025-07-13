import { NextResponse } from 'next/server'
import { ApiResult } from '@core/api/apiResult'
import { Task } from '@/generated/prisma'
import { AuthUserService, ProfileService, TaskService } from '@core/api/service'
import { Effect } from 'effect'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

// export type { TaskWithRelations } from '@core/api/service/taskService'
// export type GetTasksResultData = { tasks: TaskService.TaskWithRelations[] }
// export type GetTasksResult = ApiResult<GetTasksResultData>
//
// export async function GET(): Promise<NextResponse<GetTasksResult>> {
//   return await Effect.gen(function* () {
//     yield* AuthUserService.getAuthUser
//     const profileId = yield* ProfileService.getActiveProfileId
//     const tasks = yield* TaskService.listTasks(profileId)
//     return { tasks }
//   }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(), Effect.runPromise)
// }

export type MoveTaskBody = {
  toIndex: number
  toStatusId?: string
}

export type MoveTaskResultData = { task: Task }
export type MoveTaskResult = ApiResult<MoveTaskResultData>

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(
  req: Request,
  { params }: RouteParams,
): Promise<NextResponse<MoveTaskResult>> {
  const { id: taskId } = await params

  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const profileId = yield* ProfileService.getActiveProfileId
    const { toIndex, toStatusId }: MoveTaskBody = yield* Effect.tryPromise(() => req.json())
    const task = yield* TaskService.moveTask({
      profileId,
      taskId,
      toIndex,
      toStatusId,
    })
    return { task }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(200), Effect.runPromise)
}

import { NextResponse } from 'next/server'
import { ApiResult } from '@core/api/apiResult'
import { Task } from '@/generated/prisma'
import { AuthUserService, ProfileService, TaskService } from '@core/api/service'
import { Effect } from 'effect'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

export type MoveTaskBody = {
  destinationIndex: number
  destinationStatusId?: string
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
    const { destinationIndex, destinationStatusId }: MoveTaskBody = yield* Effect.tryPromise(() =>
      req.json(),
    )
    const task = yield* TaskService.moveTask({
      profileId,
      taskId,
      destinationIndex,
      destinationStatusId,
    })
    return { task }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(200), Effect.runPromise)
}

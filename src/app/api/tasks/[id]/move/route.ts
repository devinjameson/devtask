import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, ProfileService, TaskService } from '@core/api/service'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

import { Task } from '@/generated/prisma'

export type MoveTaskBody = {
  afterTaskId: string | null
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
    const { afterTaskId, destinationStatusId }: MoveTaskBody = yield* Effect.tryPromise(() =>
      req.json(),
    )
    const task = yield* TaskService.moveTask({
      profileId,
      taskId,
      afterTaskId,
      destinationStatusId,
    })
    return { task }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(200), Effect.runPromise)
}

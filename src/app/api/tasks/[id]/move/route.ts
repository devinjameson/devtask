import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { unknownExceptionToApiException } from '@core/api/apiException'
import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, TaskService } from '@core/api/service'
import { toApiResult } from '@core/api/toApiResult'

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
  const { id } = await params

  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const { afterTaskId, destinationStatusId }: MoveTaskBody = yield* Effect.tryPromise(() =>
      req.json(),
    )
    const task = yield* TaskService.moveTask({
      id,
      afterTaskId,
      destinationStatusId,
    })
    return { task }
  }).pipe(unknownExceptionToApiException, toApiResult(200), Effect.runPromise)
}

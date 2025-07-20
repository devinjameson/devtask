import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, TaskService } from '@core/api/service'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

import { Task } from '@/generated/prisma'

export type GetTaskResultData = { task: Task }
export type GetTaskResult = ApiResult<GetTaskResultData>

export async function GET(
  _req: Request,
  { params }: RouteParams,
): Promise<NextResponse<GetTaskResult>> {
  const { id } = await params

  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const task = yield* TaskService.getTask(id)
    return { task }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(200), Effect.runPromise)
}

export type PatchTaskBody = {
  title?: string
  statusId?: string
  description?: string | null
  categoryId?: string | null
  dueDate?: string | null
}

export type PatchTaskResultData = { task: Task }
export type PatchTaskResult = ApiResult<PatchTaskResultData>

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(
  req: Request,
  { params }: RouteParams,
): Promise<NextResponse<PatchTaskResult>> {
  const { id } = await params

  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const { title, description, statusId, categoryId, dueDate }: PatchTaskBody =
      yield* Effect.tryPromise(() => req.json())
    const task = yield* TaskService.patchTask({
      id,
      title,
      description,
      statusId,
      categoryId,
      dueDate,
    })
    return { task }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(200), Effect.runPromise)
}

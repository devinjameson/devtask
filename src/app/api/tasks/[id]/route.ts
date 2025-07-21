import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, ProfileService, TaskService } from '@core/api/service'
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
    const profileId = yield* ProfileService.getActiveProfileId
    const task = yield* TaskService.getTaskForProfile(id, profileId)
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

export type DeleteTaskResultData = { task: Task }
export type DeleteTaskResult = ApiResult<DeleteTaskResultData>

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(
  req: Request,
  { params }: RouteParams,
): Promise<NextResponse<PatchTaskResult>> {
  const { id } = await params

  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const profileId = yield* ProfileService.getActiveProfileId
    const { title, description, statusId, categoryId, dueDate }: PatchTaskBody =
      yield* Effect.tryPromise(() => req.json())
    const task = yield* TaskService.patchTaskForProfile({
      id,
      profileId,
      title,
      description,
      statusId,
      categoryId,
      dueDate,
    })
    return { task }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(200), Effect.runPromise)
}

export async function DELETE(
  _req: Request,
  { params }: RouteParams,
): Promise<NextResponse<DeleteTaskResult>> {
  const { id } = await params

  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const profileId = yield* ProfileService.getActiveProfileId
    const task = yield* TaskService.deleteTaskForProfile(id, profileId)
    return { task }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(200), Effect.runPromise)
}

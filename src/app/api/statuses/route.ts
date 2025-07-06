import { Status } from '@/generated/prisma'
import { ApiResult } from '@/lib/api/apiResult'
import { NextResponse } from 'next/server'
import { AuthUserService, ProfileService, StatusService } from '@/lib/api/service'
import { Effect } from 'effect'
import { unknownExceptionToServiceException } from '@/lib/api/serviceException'
import { serviceResultToNextResponse } from '@/lib/api/serviceResultToNextResponse'

export type GetStatusesResultData = { statuses: Status[] }
export type GetStatusesResult = ApiResult<GetStatusesResultData>

export async function GET(): Promise<NextResponse<GetStatusesResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const profileId = yield* ProfileService.getActiveProfileId
    const statuses = yield* StatusService.listStatuses(profileId)
    return { statuses }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(), Effect.runPromise)
}

import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, StatusService } from '@core/api/service'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

import { Status } from '@/generated/prisma'

export type GetStatusesResultData = { statuses: Status[] }
export type GetStatusesResult = ApiResult<GetStatusesResultData>

export async function GET(req: Request): Promise<NextResponse<GetStatusesResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const url = new URL(req.url)
    const profileId = url.searchParams.get('profileId')
    if (!profileId) {
      throw new Error('Profile ID is required')
    }
    const statuses = yield* StatusService.listStatuses(profileId)
    return { statuses }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(), Effect.runPromise)
}

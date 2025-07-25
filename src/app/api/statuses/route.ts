import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { unknownExceptionToApiException } from '@core/api/apiException'
import { ApiResult } from '@core/api/apiResult'
import { getRequiredProfileId } from '@core/api/request'
import { AuthUserService, StatusService } from '@core/api/service'
import { toApiResult } from '@core/api/toApiResult'

import { Status } from '@/generated/prisma'

export type GetStatusesResultData = { statuses: Status[] }
export type GetStatusesResult = ApiResult<GetStatusesResultData>

export async function GET(req: Request): Promise<NextResponse<GetStatusesResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const profileId = yield* getRequiredProfileId(req)
    const statuses = yield* StatusService.listStatuses(profileId)
    return { statuses }
  }).pipe(unknownExceptionToApiException, toApiResult(), Effect.runPromise)
}

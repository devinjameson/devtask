import { NextRequest, NextResponse } from 'next/server'
import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, ProfileService } from '@core/api/service'
import { Effect } from 'effect'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

export type SelectProfileBody = {
  profileId: string
}

export type SelectProfileResult = ApiResult<null>

export async function POST(req: NextRequest): Promise<NextResponse<SelectProfileResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const { profileId }: SelectProfileBody = yield* Effect.tryPromise(() => req.json())
    yield* ProfileService.setActiveProfile(profileId)
    return null
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(), Effect.runPromise)
}

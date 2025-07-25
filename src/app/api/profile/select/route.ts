import { NextRequest, NextResponse } from 'next/server'
import { Effect } from 'effect'

import { unknownExceptionToApiException } from '@core/api/apiException'
import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, ProfileService } from '@core/api/service'
import { toApiResult } from '@core/api/toApiResult'

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
  }).pipe(unknownExceptionToApiException, toApiResult(), Effect.runPromise)
}

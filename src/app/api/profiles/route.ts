import { NextResponse } from 'next/server'
import { ApiResult } from '@lib/api/apiResult'
import { Profile } from '@/generated/prisma'
import { AuthUserService, ProfileService } from '@lib/api/service'
import { Effect } from 'effect'
import { unknownExceptionToServiceException } from '@lib/api/serviceException'
import { serviceResultToNextResponse } from '@lib/api/serviceResultToNextResponse'

export type GetProfilesResultData = { profiles: Profile[] }
export type GetProfilesResult = ApiResult<GetProfilesResultData>

export async function GET(): Promise<NextResponse<GetProfilesResult>> {
  return await Effect.gen(function* () {
    const user = yield* AuthUserService.getAuthUser
    const profiles = yield* ProfileService.listProfiles(user.id)
    return { profiles }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(), Effect.runPromise)
}

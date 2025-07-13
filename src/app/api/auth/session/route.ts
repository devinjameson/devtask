import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Array, Effect } from 'effect'

import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, ProfileService } from '@core/api/service'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'
import { ACTIVE_PROFILE_COOKIE } from '@core/constants'

export type AuthCallbackResult = ApiResult<null>

export async function POST(): Promise<NextResponse<AuthCallbackResult>> {
  return await Effect.gen(function* () {
    const user = yield* AuthUserService.getAuthUser
    const profiles = yield* ProfileService.listProfiles(user.id)

    if (!Array.isNonEmptyArray(profiles)) {
      return yield* Effect.fail({ message: 'No profiles found', status: 400 })
    }

    const cookieStore = yield* Effect.tryPromise(() => cookies())
    const currentActiveProfileId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value
    const isCurrentActiveProfileIdValid =
      currentActiveProfileId && profiles.some(({ id }) => id === currentActiveProfileId)

    if (!isCurrentActiveProfileIdValid) {
      const firstProfileId = Array.headNonEmpty(profiles).id
      yield* ProfileService.setActiveProfile(firstProfileId)
    }

    return null
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(), Effect.runPromise)
}

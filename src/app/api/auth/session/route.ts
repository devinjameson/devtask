import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Array, Effect } from 'effect'

import { ApiException, unknownExceptionToApiException } from '@core/api/apiException'
import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, ProfileService } from '@core/api/service'
import { toApiResult } from '@core/api/toApiResult'
import { ACTIVE_PROFILE_COOKIE } from '@core/constants'

export type AuthCallbackResult = ApiResult<{ profileId: string }>

export async function POST(): Promise<NextResponse<AuthCallbackResult>> {
  return await Effect.gen(function* () {
    const user = yield* AuthUserService.getAuthUser
    const profiles = yield* ProfileService.listProfiles(user.id)

    if (!Array.isNonEmptyArray(profiles)) {
      return yield* new ApiException({ message: 'No profiles found', status: 400 })
    }

    const cookieStore = yield* Effect.tryPromise(() => cookies())
    const currentActiveProfileId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value
    const isCurrentActiveProfileIdValid =
      currentActiveProfileId && profiles.some(({ id }) => id === currentActiveProfileId)

    const activeProfileId = isCurrentActiveProfileIdValid
      ? currentActiveProfileId
      : Array.headNonEmpty(profiles).id

    if (!isCurrentActiveProfileIdValid) {
      yield* ProfileService.setActiveProfile(activeProfileId)
    }

    return { profileId: activeProfileId }
  }).pipe(unknownExceptionToApiException, toApiResult(), Effect.runPromise)
}

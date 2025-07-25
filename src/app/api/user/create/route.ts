import { NextRequest, NextResponse } from 'next/server'
import { Effect } from 'effect'

import { unknownExceptionToApiException } from '@core/api/apiException'
import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, UserService } from '@core/api/service'
import { toApiResult } from '@core/api/toApiResult'

export type CreateUserBody = {
  firstName: string
  lastName: string
}

export type CreateUserResultData = { user: UserService.UserWithProfiles }
export type CreateUserResult = ApiResult<CreateUserResultData>

export async function POST(req: NextRequest): Promise<NextResponse<CreateUserResult>> {
  return await Effect.gen(function* () {
    const authUser = yield* AuthUserService.getAuthUser
    const { firstName, lastName }: CreateUserBody = yield* Effect.tryPromise(() => req.json())
    const user = yield* UserService.createUser({
      id: authUser.id,
      email: authUser.email!,
      firstName,
      lastName,
    })
    return { user }
  }).pipe(unknownExceptionToApiException, toApiResult(201), Effect.runPromise)
}

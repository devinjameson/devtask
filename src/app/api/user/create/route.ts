import { NextRequest, NextResponse } from 'next/server'
import { Effect } from 'effect'

import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, UserService } from '@core/api/service'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

export type CreateUserBody = {
  firstName: string
  lastName: string
}

export type CreateUserResultData = { user: UserService.UserWithProfiles }
export type CreateUserResult = ApiResult<CreateUserResultData>

export async function POST(req: NextRequest): Promise<NextResponse<CreateUserResult>> {
  console.log('🚀 User create API called')
  
  return await Effect.gen(function* () {
    console.log('🔍 Getting auth user...')
    const authUser = yield* AuthUserService.getAuthUser
    console.log('✅ Auth user:', authUser.id)
    
    console.log('📝 Parsing request body...')
    const { firstName, lastName }: CreateUserBody = yield* Effect.tryPromise(() => req.json())
    console.log('✅ Request parsed:', { firstName, lastName })
    
    console.log('👤 Creating user...')
    const user = yield* UserService.createUser({
      id: authUser.id,
      email: authUser.email!,
      firstName,
      lastName,
    })
    console.log('✅ User created:', user.id)
    
    return { user }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(201), Effect.runPromise)
}

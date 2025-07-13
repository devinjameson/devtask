import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, CategoryService, ProfileService } from '@core/api/service'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

import { Category } from '@/generated/prisma'

export type GetCategoriesResultData = { categories: Category[] }
export type GetCategoriesResult = ApiResult<GetCategoriesResultData>

export async function GET(): Promise<NextResponse<GetCategoriesResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const profileId = yield* ProfileService.getActiveProfileId
    const categories = yield* CategoryService.listCategories(profileId)
    return { categories }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(), Effect.runPromise)
}

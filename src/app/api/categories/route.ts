import { NextResponse } from 'next/server'
import { ApiResult } from '@core/api/apiResult'
import { Category } from '@/generated/prisma'
import { ProfileService, AuthUserService, CategoryService } from '@core/api/service'
import { Effect } from 'effect'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

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

import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { ApiResult } from '@core/api/apiResult'
import { AuthUserService, CategoryService } from '@core/api/service'
import { unknownExceptionToServiceException } from '@core/api/serviceException'
import { serviceResultToNextResponse } from '@core/api/serviceResultToNextResponse'

import { Category } from '@/generated/prisma'

export type GetCategoriesResultData = { categories: Category[] }
export type GetCategoriesResult = ApiResult<GetCategoriesResultData>

export async function GET(req: Request): Promise<NextResponse<GetCategoriesResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const url = new URL(req.url)
    const profileId = url.searchParams.get('profileId')
    if (!profileId) {
      throw new Error('Profile ID is required')
    }
    const categories = yield* CategoryService.listCategories(profileId)
    return { categories }
  }).pipe(unknownExceptionToServiceException, serviceResultToNextResponse(), Effect.runPromise)
}

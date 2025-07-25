import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { unknownExceptionToApiException } from '@core/api/apiException'
import { ApiResult } from '@core/api/apiResult'
import { getRequiredProfileId } from '@core/api/request'
import { AuthUserService, CategoryService } from '@core/api/service'
import { toApiResult } from '@core/api/toApiResult'

import { Category } from '@/generated/prisma'

export type GetCategoriesResultData = { categories: Category[] }
export type GetCategoriesResult = ApiResult<GetCategoriesResultData>

export async function GET(req: Request): Promise<NextResponse<GetCategoriesResult>> {
  return await Effect.gen(function* () {
    yield* AuthUserService.getAuthUser
    const profileId = yield* getRequiredProfileId(req)
    const categories = yield* CategoryService.listCategories(profileId)
    return { categories }
  }).pipe(unknownExceptionToApiException, toApiResult(), Effect.runPromise)
}

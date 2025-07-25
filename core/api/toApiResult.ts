import { NextResponse } from 'next/server'
import { Effect } from 'effect'

import { ApiException } from './apiException'
import { ApiResult } from './apiResult'

export const toApiResult =
  (successStatus?: number) =>
  <A>(effect: Effect.Effect<A, ApiException>): Effect.Effect<NextResponse<ApiResult<A>>, never> =>
    Effect.match(effect, {
      onFailure: (error) =>
        NextResponse.json(
          { success: false as const, error: error.message },
          { status: error.status },
        ),
      onSuccess: (data) =>
        NextResponse.json({ success: true as const, data }, { status: successStatus }),
    })

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'

import { ApiException } from '../apiException'
import { AuthUser } from '../authUser'

export const getAuthUser: Effect.Effect<AuthUser, ApiException | UnknownException> = Effect.gen(
  function* () {
    const cookieStore = yield* Effect.tryPromise(() => cookies())
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error,
    } = yield* Effect.tryPromise(() => supabase.auth.getUser())

    if (error || !user) {
      return yield* new ApiException({ message: 'Unauthorized', status: 401 })
    }

    return user
  },
)

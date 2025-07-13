import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'

import { AuthUser } from '../authUser'
import { ServiceException } from '../serviceException'

export const getAuthUser: Effect.Effect<AuthUser, ServiceException | UnknownException> = Effect.gen(
  function* () {
    const cookieStore = yield* Effect.tryPromise(() => cookies())
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error,
    } = yield* Effect.tryPromise(() => supabase.auth.getUser())

    if (error || !user) {
      return yield* Effect.fail({ message: 'Unauthorized', status: 401 })
    }

    return user
  },
)

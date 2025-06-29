import { useEffect, useState } from 'react'
import { AsyncResult } from '@/lib'
import { Session } from '@supabase/supabase-js'
import { Option } from 'effect'
import { supabase } from '../supabase/client'

const fetchSession = async (): Promise<
  AsyncResult.AsyncResult<Option.Option<Session>, 'FailedToGetSession'>
> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return AsyncResult.ok(Option.fromNullable(session))
  } catch {
    return AsyncResult.err('FailedToGetSession')
  }
}

export const useSession = () => {
  const [sessionState, setSessionState] = useState<
    AsyncResult.AsyncResult<Option.Option<Session>, 'FailedToGetSession'>
  >(AsyncResult.loading())

  useEffect(() => {
    const loadSession = async () => {
      setSessionState(AsyncResult.loading())
      const session = await fetchSession()
      setSessionState(session)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSessionState(AsyncResult.ok(Option.fromNullable(session)))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return sessionState
}

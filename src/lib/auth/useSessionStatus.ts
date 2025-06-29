import { useEffect, useState } from 'react'
import { AsyncResult } from '@/lib'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { Option } from 'effect'

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
  const [isLoggedIn, setIsLoggedIn] = useState<
    AsyncResult.AsyncResult<Option.Option<Session>, 'FailedToGetSession'>
  >(AsyncResult.loading())

  useEffect(() => {
    const fetchAndSetIsLoggedIn = async () => {
      setIsLoggedIn(AsyncResult.loading())
      const loggedIn = await fetchSession()
      setIsLoggedIn(loggedIn)
    }

    fetchAndSetIsLoggedIn()
  }, [])

  return isLoggedIn
}

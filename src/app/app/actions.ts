'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { ACTIVE_PROFILE_COOKIE } from '@core/constants'
import { redirect } from 'next/navigation'

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await supabase.auth.signOut()

  cookieStore.delete(ACTIVE_PROFILE_COOKIE)

  redirect('/log-in')
}

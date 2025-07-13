'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { ACTIVE_PROFILE_COOKIE } from '@core/constants'

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await supabase.auth.signOut()

  cookieStore.delete(ACTIVE_PROFILE_COOKIE)

  redirect('/log-in')
}

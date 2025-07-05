import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResult } from '@/lib/api/apiResult'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'

export type SelectProfileBody = {
  profileId: string
}

export type SelectProfileResult = ApiResult<null>

export async function POST(req: NextRequest): Promise<NextResponse<SelectProfileResult>> {
  const { profileId }: SelectProfileBody = await req.json()

  if (!profileId) {
    return NextResponse.json({ success: false, error: 'Missing profileId' }, { status: 400 })
  }

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_PROFILE_COOKIE, profileId, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })

  return NextResponse.json({ success: true, data: null })
}

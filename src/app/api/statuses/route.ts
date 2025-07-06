import { Status } from '@/generated/prisma'
import { ApiResult } from '@/lib/api/apiResult'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export type GetStatusesResultData = { statuses: Status[] }
export type GetStatusesResult = ApiResult<GetStatusesResultData>

export async function GET(): Promise<NextResponse<GetStatusesResult>> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      },
      {
        status: 401,
      },
    )
  }

  const profileId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value

  if (!profileId) {
    return NextResponse.json(
      {
        success: false,
        error: 'No active profile selected',
      },
      { status: 400 },
    )
  }

  const statuses = await prisma.status.findMany({
    where: { profileId },
  })

  return NextResponse.json({ success: true, data: { statuses } })
}

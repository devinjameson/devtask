import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ApiResult } from '@/lib/api/apiResult'
import { Profile } from '@/generated/prisma'

export type ProfilesResponseData = { profiles: Profile[] }
export type ProfilesResponse = ApiResult<ProfilesResponseData>

export async function GET(): Promise<NextResponse<ProfilesResponse>> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    success: true,
    data: { profiles },
  })
}

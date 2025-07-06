import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ApiResult } from '@/lib/api/apiResult'
import { Category } from '@/generated/prisma'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'

export type GetCategoriesResultData = { categories: Category[] }
export type GetCategoriesResult = ApiResult<GetCategoriesResultData>

export async function GET(): Promise<NextResponse<GetCategoriesResult>> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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

  const categories = await prisma.category.findMany({
    where: { profileId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    success: true,
    data: { categories },
  })
}

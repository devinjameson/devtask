import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { TaskWithRelations } from '@/lib/types'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profiles: {
        include: {
          tasks: {
            include: {
              category: true,
              status: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  const tasks = dbUser?.profiles[0]?.tasks ?? []
  return NextResponse.json(tasks satisfies TaskWithRelations[])
}

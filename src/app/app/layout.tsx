'use client'

import { useSession } from '@/lib/auth/useSession'
import { AsyncResult } from '@/lib'
import { Option } from 'effect'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Spinner from '@/ui/Spinner'
import { Heading } from '@/ui/catalyst/heading'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const maybeSession = useSession()

  useEffect(() => {
    if (AsyncResult.isOk(maybeSession)) {
      if (Option.isNone(maybeSession.value)) {
        router.push('/log-in')
      }
    }
  }, [maybeSession, router])

  return AsyncResult.match(maybeSession, {
    onOk: (session) =>
      Option.match(session, {
        onSome: () => <div className="flex min-h-dvh flex-col">{children}</div>,
        onNone: () => (
          <FullScreenCenter>
            <Spinner />
          </FullScreenCenter>
        ),
      }),
    onErr: (error) => (
      <FullScreenCenter>
        <Heading>Error: {error}</Heading>
      </FullScreenCenter>
    ),
    onLoading: () => (
      <FullScreenCenter>
        <Spinner />
      </FullScreenCenter>
    ),
  })
}

function FullScreenCenter({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh items-center justify-center p-4">{children}</div>
}

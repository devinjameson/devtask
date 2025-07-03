'use client'

import { Heading } from '@/ui/catalyst/heading'
import Spinner from '@/ui/Spinner'
import { AsyncResult } from '@/lib'
import { useSession } from '@/lib/auth/useSession'
import { Option } from 'effect'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import App from '@/features/app/App'

export default function Page() {
  const router = useRouter()
  const maybeSession = useSession()

  useEffect(() => {
    if (AsyncResult.isOk(maybeSession)) {
      Option.match(maybeSession.value, {
        onNone: () => router.push('/log-in'),
        onSome: () => {},
      })
    }
  }, [maybeSession, router])

  return (
    <div className="flex min-h-dvh flex-col">
      {AsyncResult.match(maybeSession, {
        onOk: (session) => {
          return Option.match(session, {
            onSome: () => <App />,
            onNone: () => (
              <FullScreenCenter>
                <Spinner />
              </FullScreenCenter>
            ),
          })
        },
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
      })}
    </div>
  )
}

function FullScreenCenter({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh items-center justify-center p-4">{children}</div>
}

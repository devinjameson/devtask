'use client'

import { AuthLayout } from '@/ui/catalyst/auth-layout'
import { Button } from '@/ui/catalyst/button'
import { Checkbox, CheckboxField } from '@/ui/catalyst/checkbox'
import { Field, Label } from '@/ui/catalyst/fieldset'
import { Heading } from '@/ui/catalyst/heading'
import { Input } from '@/ui/catalyst/input'
import { Strong, Text, TextLink } from '@/ui/catalyst/text'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Spinner from '@/ui/Spinner'

type AsyncResult<T, U = unknown> = Ok<T> | Err<U> | Loading
type Ok<T> = { _tag: 'Ok'; value: T }
type Err<U> = { _tag: 'Err'; value: U }
type Loading = { _tag: 'Loading' }

const ok = <T, U>(value: T): AsyncResult<T, U> => ({ _tag: 'Ok', value })
const err = <U, T>(value: U): AsyncResult<T, U> => ({ _tag: 'Err', value })
const loading = <T, U>(): AsyncResult<T, U> => ({ _tag: 'Loading' })

const match = <T, U, V>(
  result: AsyncResult<T, U>,
  {
    onOk,
    onErr,
    onLoading,
  }: {
    onOk: (value: T) => V
    onErr: (value: U) => V
    onLoading: () => V
  },
) => {
  switch (result._tag) {
    case 'Ok':
      return onOk(result.value)
    case 'Err':
      return onErr(result.value)
    case 'Loading':
      return onLoading()
  }
}

const fetchSessionStatus = async (): Promise<AsyncResult<boolean, string>> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return ok(Boolean(session))
  } catch {
    return err('Failed to get session')
  }
}

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState<AsyncResult<boolean, string>>(loading)

  useEffect(() => {
    const fetchAndSetIsLoggedIn = async () => {
      setIsLoggedIn(loading())
      const loggedIn = await fetchSessionStatus()
      setIsLoggedIn(loggedIn)
    }

    fetchAndSetIsLoggedIn()
  }, [])

  return (
    <main className="flex min-h-dvh flex-col p-2">
      {match(isLoggedIn, {
        onOk: (loggedIn) => {
          if (loggedIn) {
            return <Heading>Welcome back!</Heading>
          } else {
            return <LogIn />
          }
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
    </main>
  )
}

function FullScreenCenter({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh items-center justify-center p-4">{children}</div>
}

function LogIn() {
  return (
    <AuthLayout>
      <form className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Heading>Sign in to your account</Heading>
        <Field>
          <Label>Email</Label>
          <Input type="email" name="email" />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input type="password" name="password" />
        </Field>
        <div className="flex items-center justify-between">
          <CheckboxField>
            <Checkbox name="remember" />
            <Label>Remember me</Label>
          </CheckboxField>
          <Text>
            <TextLink href="#">
              <Strong>Forgot password?</Strong>
            </TextLink>
          </Text>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Text>
          Don’t have an account?{' '}
          <TextLink href="#">
            <Strong>Sign up</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  )
}

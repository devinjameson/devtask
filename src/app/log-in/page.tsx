'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { setActiveProfileId } from '@/stores/profileStore'

import { fetchApi } from '@core/api/fetchApi'

import { AuthLayout } from '@/ui/catalyst/auth-layout'
import { Button } from '@/ui/catalyst/button'
import { Field, Label } from '@/ui/catalyst/fieldset'
import { Heading } from '@/ui/catalyst/heading'
import { Input } from '@/ui/catalyst/input'
import { Strong, Text, TextLink } from '@/ui/catalyst/text'
import Spinner from '@/ui/Spinner'

export default function LogIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const result = await fetchApi<{ profileId: string }>(() =>
      fetch('/api/auth/session', { method: 'POST' }),
    )

    if (!result.success) {
      setError('Failed to set up profile')
      setLoading(false)
      return
    }

    setActiveProfileId(result.data.profileId)
    router.push('/')
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-4">
        <Heading>Sign in to your account</Heading>

        <Field>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : 'Log in'}
        </Button>

        {error && <Text className="text-red-500">{error}</Text>}

        <Text>
          Don’t have an account?{' '}
          <TextLink href="/sign-up">
            <Strong>Sign up</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  )
}

'use client'

import { supabase } from '@/lib/supabase/client'
import { AuthLayout } from '@/ui/catalyst/auth-layout'
import { Button } from '@/ui/catalyst/button'
import { Field, Label } from '@/ui/catalyst/fieldset'
import { Heading } from '@/ui/catalyst/heading'
import { Input } from '@/ui/catalyst/input'
import { Strong, Text, TextLink } from '@/ui/catalyst/text'
import Spinner from '@/ui/Spinner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ProfilesResponseData } from '@/app/api/profiles/route'
import { fetchJson } from '@/lib/api/fetchJson'
import { setActiveProfile } from '@/lib/api/setActiveProfile'
import Cookies from 'js-cookie'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'

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

    const existingActiveProfileId = Cookies.get(ACTIVE_PROFILE_COOKIE)

    if (!existingActiveProfileId) {
      const result = await fetchJson<ProfilesResponseData>(() => fetch('/api/profiles'))

      if (result.success) {
        const firstProfileId = result.data.profiles[0]?.id

        if (firstProfileId) {
          await setActiveProfile(firstProfileId)
        }
      }
    }

    router.push('/')
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
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

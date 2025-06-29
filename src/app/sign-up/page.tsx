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

export default function SignUp() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Heading>Create your account</Heading>
        <Field>
          <Label>First name</Label>
          <Input
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Field>
        <Field>
          <Label>Last name</Label>
          <Input name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </Field>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : 'Create account'}
        </Button>
        {error && <Text className="text-red-500">{error}</Text>}
        <Text>
          Already have an account?{' '}
          <TextLink href="#">
            <Strong>Sign in</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  )
}

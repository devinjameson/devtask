'use client'

import { useTasks } from './useTasks'
import { Heading } from '@/ui/catalyst/heading'
import { Button } from '@/ui/catalyst/button'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function App() {
  const router = useRouter()
  const { data: tasks, isLoading, error } = useTasks()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (isLoading) return <div>Loading tasks…</div>
  if (error) return <div>Failed to load tasks</div>

  return (
    <div className="space-y-4 p-4">
      <Heading>Welcome to your task manager</Heading>
      <Button onClick={handleSignOut}>Sign out</Button>

      <ul className="space-y-2">
        {tasks?.map((task) => (
          <li key={task.id} className="border rounded p-2">
            <div className="font-medium">{task.title}</div>
            <div className="text-sm text-gray-500">
              {task.category?.name} • {task.status.name}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

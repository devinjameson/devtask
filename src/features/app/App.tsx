'use client'

import { AsyncResult } from '@/lib'
import { useTasks } from './useTasks'
import TaskBoard from './TaskBoard'
import { useStatuses } from './useStatuses'
import { useProfiles } from './useProfiles'
import Cookies from 'js-cookie'
import { useEnsureActiveProfile } from './useEnsureActiveProfile'
import { Button } from '@/ui/catalyst/button'
import { supabase } from '@/lib/supabase/client'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'
import { pipe } from 'effect'

export default function App() {
  useEnsureActiveProfile()

  const tasksQueryResult = useTasks()
  const asyncTasks = AsyncResult.fromQueryResult(tasksQueryResult)

  const activeProfileId = Cookies.get(ACTIVE_PROFILE_COOKIE)
  const isStatusesQueryEnabled = Boolean(activeProfileId)
  const statusesQueryResult = useStatuses({
    enabled: isStatusesQueryEnabled,
  })
  const asyncStatuses = AsyncResult.fromQueryResult(statusesQueryResult)

  const profilesQueryResult = useProfiles()
  const asyncProfiles = AsyncResult.fromQueryResult(profilesQueryResult)

  const combined = pipe(
    asyncTasks,
    AsyncResult.combine(asyncStatuses),
    AsyncResult.combine(asyncProfiles),
    AsyncResult.map(([profiles, [statuses, tasks]]) => [tasks, statuses, profiles] as const),
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="space-y-4 p-4">
      {AsyncResult.match(combined, {
        onOk: ([tasks]) => <TaskBoard tasks={tasks} />,
        onLoading: () => <div className="text-gray-500">Loading tasks...</div>,
        onErr: (error) => <div className="text-red-600">Error loading tasks: {error.message}</div>,
      })}
      <Button onClick={handleSignOut}>Sign out</Button>
    </div>
  )
}

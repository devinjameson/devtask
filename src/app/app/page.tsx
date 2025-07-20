'use client'

import { getCookie } from '@/lib/getCookie'
import { AsyncResult } from '@core'
import { useQueryClient } from '@tanstack/react-query'
import { pipe } from 'effect'

import { ACTIVE_PROFILE_COOKIE } from '@core/constants'

import { Button } from '@/ui/catalyst/button'

import { signOut } from './actions'
import TaskBoard from './TaskBoard'
import { useCategories } from './useCategories'
import { useProfiles } from './useProfiles'
import { useStatuses } from './useStatuses'
import { useTasks } from './useTasks'

export default function App() {
  const queryClient = useQueryClient()

  const activeProfileId = getCookie(ACTIVE_PROFILE_COOKIE) ?? ''

  const tasksQueryResult = useTasks({ profileId: activeProfileId })
  const asyncTasks = AsyncResult.fromQueryResult(tasksQueryResult)

  const statusesQueryResult = useStatuses()
  const asyncStatuses = AsyncResult.fromQueryResult(statusesQueryResult)

  const profilesQueryResult = useProfiles()
  const asyncProfiles = AsyncResult.fromQueryResult(profilesQueryResult)

  const categoriesQueryResult = useCategories()
  const asyncCategories = AsyncResult.fromQueryResult(categoriesQueryResult)

  const combined = pipe(
    asyncTasks,
    AsyncResult.combine(asyncStatuses),
    AsyncResult.combine(asyncProfiles),
    AsyncResult.combine(asyncCategories),
    AsyncResult.map(
      ([categories, [profiles, [statuses, tasks]]]) =>
        [tasks, statuses, profiles, categories] as const,
    ),
  )

  const handleSignOut = async () => {
    queryClient.clear()
    await signOut()
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between bg-gray-100 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-800">devtask</h1>
        <Button onClick={handleSignOut} color="light">
          Sign out
        </Button>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        {AsyncResult.match(combined, {
          onOk: ([tasks, statuses, _profiles, categories]) => (
            <TaskBoard tasks={tasks} statuses={statuses} categories={categories} />
          ),
          onLoading: () => <div className="text-gray-500">Loading tasks...</div>,
          onErr: (error) => (
            <div className="text-red-600">Error loading tasks: {error.message}</div>
          ),
        })}
      </main>
    </div>
  )
}

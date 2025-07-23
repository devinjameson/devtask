'use client'

import { useState } from 'react'
import { $activeProfileId } from '@/stores/profileStore'
import { AsyncResult } from '@core'
import { useStore } from '@nanostores/react'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/ui/catalyst/button'

import { signOut } from './actions'
import { useCategories } from './categoriesQuery'
import { useProfiles } from './profilesQuery'
import ProfileSwitcher from './ProfileSwitcher'
import { useStatuses } from './statusesQuery'
import TaskBoard from './TaskBoard'
import { useTasks } from './tasksQuery'
import { usePrefetchInactiveProfiles } from './usePrefetchInactiveProfiles'
import { useSyncActiveProfileId } from './useSyncActiveProfileId'

type Filters = {
  searchQuery: string
  selectedStatusId: string | null
  selectedCategoryId: string | null
}

const defaultFilters: Filters = {
  searchQuery: '',
  selectedStatusId: null,
  selectedCategoryId: null,
}

export default function App() {
  useSyncActiveProfileId()
  const queryClient = useQueryClient()

  const activeProfileId = useStore($activeProfileId)

  const [filtersByProfile, setFiltersByProfile] = useState<Record<string, Filters>>({})

  const currentFilters = filtersByProfile[activeProfileId] ?? defaultFilters

  const updateFilters = (updates: Partial<Filters>) => {
    setFiltersByProfile((prev) => ({
      ...prev,
      [activeProfileId]: {
        ...currentFilters,
        ...updates,
      },
    }))
  }

  const tasksQueryResult = useTasks({ profileId: activeProfileId })
  const asyncTasks = AsyncResult.fromQueryResult(tasksQueryResult)

  const statusesQueryResult = useStatuses({ profileId: activeProfileId })
  const asyncStatuses = AsyncResult.fromQueryResult(statusesQueryResult)

  const categoriesQueryResult = useCategories({ profileId: activeProfileId })
  const asyncCategories = AsyncResult.fromQueryResult(categoriesQueryResult)

  const profilesQueryResult = useProfiles()
  usePrefetchInactiveProfiles(profilesQueryResult.data, activeProfileId)

  const handleSignOut = async () => {
    queryClient.clear()
    await signOut()
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between bg-gray-100 px-4 py-3 gap-4">
        <h1 className="text-lg font-semibold text-gray-800">devtask</h1>

        <ProfileSwitcher />

        <Button onClick={handleSignOut} color="light">
          Sign out
        </Button>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        <TaskBoard
          asyncTasks={asyncTasks}
          asyncStatuses={asyncStatuses}
          asyncCategories={asyncCategories}
          searchQuery={currentFilters.searchQuery}
          selectedStatusId={currentFilters.selectedStatusId}
          selectedCategoryId={currentFilters.selectedCategoryId}
          onSearchChange={(searchQuery) => updateFilters({ searchQuery })}
          onStatusChange={(selectedStatusId) => updateFilters({ selectedStatusId })}
          onCategoryChange={(selectedCategoryId) => updateFilters({ selectedCategoryId })}
        />
      </main>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { $activeProfileId } from '@/stores/profileStore'
import { useStore } from '@nanostores/react'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/ui/catalyst/button'

import { signOut } from './actions'
import ProfileSwitcher from './ProfileSwitcher'
import { useCategories } from './query/categoriesQuery'
import { useProfiles } from './query/profilesQuery'
import { useStatuses } from './query/statusesQuery'
import { useTasks } from './query/tasksQuery'
import TaskBoard from './TaskBoard'
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
  const statusesQueryResult = useStatuses({ profileId: activeProfileId })
  const categoriesQueryResult = useCategories({ profileId: activeProfileId })
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
          Sign Out
        </Button>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        <TaskBoard
          tasksQueryResult={tasksQueryResult}
          statusesQueryResult={statusesQueryResult}
          categoriesQueryResult={categoriesQueryResult}
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

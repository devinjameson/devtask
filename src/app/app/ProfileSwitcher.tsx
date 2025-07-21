import { Fragment, useState } from 'react'
import { getCookie } from '@/lib/getCookie'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'

import { ACTIVE_PROFILE_COOKIE } from '@core/constants'

import { Profile } from '@/generated/prisma'

import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
} from '@/ui/catalyst/dropdown'

import { useProfiles } from './profilesQuery'
import { useSwitchProfileMutation } from './useSwitchProfileMutation'

export default function ProfileSwitcher() {
  const profilesQuery = useProfiles()
  const profiles = profilesQuery.data ?? []
  const switchProfileMutation = useSwitchProfileMutation()

  const serverActiveProfileId = getCookie(ACTIVE_PROFILE_COOKIE) ?? ''
  const [optimisticActiveProfileId, setOptimisticActiveProfileId] = useState<string | null>(null)

  const activeProfileId = optimisticActiveProfileId ?? serverActiveProfileId
  const activeProfile = profiles.find(({ id }) => id === activeProfileId)

  const sortedProfiles = [...profiles].sort((a, b) => a.name.localeCompare(b.name))

  const handleProfileSwitch = (profile: Profile) => {
    setOptimisticActiveProfileId(profile.id)

    switchProfileMutation.mutate(
      { profileId: profile.id },
      {
        onSettled: () => {
          setOptimisticActiveProfileId(null)
        },
      },
    )
  }

  if (!activeProfile) {
    return null
  }

  return (
    <Dropdown>
      <DropdownButton className="flex items-center gap-2">
        {activeProfile.name}
        <ChevronDownIcon className="size-4" />
      </DropdownButton>
      <DropdownMenu>
        {sortedProfiles.map((profile, index) => {
          const showDivider = index < sortedProfiles.length - 1
          return (
            <Fragment key={profile.id}>
              <DropdownItem onClick={() => handleProfileSwitch(profile)}>
                <CheckIcon
                  data-slot="icon"
                  className={clsx('size-4', {
                    visible: profile.id === activeProfileId,
                    invisible: profile.id !== activeProfileId,
                  })}
                />
                {profile.name}
              </DropdownItem>

              {showDivider && <DropdownDivider />}
            </Fragment>
          )
        })}
      </DropdownMenu>
    </Dropdown>
  )
}

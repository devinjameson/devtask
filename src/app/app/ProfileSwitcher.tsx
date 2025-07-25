import { Fragment } from 'react'
import { $activeProfileId, setActiveProfileId } from '@/stores/profileStore'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/16/solid'
import { useStore } from '@nanostores/react'
import clsx from 'clsx'

import { Profile } from '@/generated/prisma'

import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
} from '@/ui/catalyst/dropdown'

import { useSwitchProfileMutation } from './mutation/useSwitchProfileMutation'
import { useProfiles } from './query/profilesQuery'

export default function ProfileSwitcher() {
  const profilesQuery = useProfiles()
  const profiles = profilesQuery.data ?? []
  const switchProfileMutation = useSwitchProfileMutation()

  const activeProfileId = useStore($activeProfileId)
  const activeProfile = profiles.find(({ id }) => id === activeProfileId)

  const sortedProfiles = [...profiles].sort((a, b) => a.name.localeCompare(b.name))

  const handleProfileSwitch = (profile: Profile) => {
    const previousProfileId = activeProfileId

    setActiveProfileId(profile.id)

    switchProfileMutation.mutate(
      { profileId: profile.id },
      {
        onError: () => {
          setActiveProfileId(previousProfileId)
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

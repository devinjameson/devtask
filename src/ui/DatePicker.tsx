'use client'

import { forwardRef } from 'react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { CalendarIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'
import { DateTime } from 'effect'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'

import { Input } from '@/ui/catalyst/input'

const defaultClassNames = getDefaultClassNames()

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
  name?: string
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { value, onChange, placeholder = 'Select date', className, name },
  ref,
) {
  return (
    <div className="space-y-2">
      <Popover className="relative">
        <PopoverButton as="div" className="relative cursor-default">
          <Input
            ref={ref}
            name={name}
            value={
              value ? DateTime.format(DateTime.unsafeFromDate(value), { dateStyle: 'medium' }) : ''
            }
            placeholder={placeholder}
            readOnly
            className={clsx(className, 'pointer-events-none')}
          />
          <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
        </PopoverButton>

        <PopoverPanel
          anchor="bottom"
          transition
          className={clsx(
            'isolate mt-2 rounded-xl p-3 bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75 shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset transition data-closed:opacity-0 data-closed:translate-y-1',
          )}
        >
          {({ close }) => (
            <DayPicker
              mode="single"
              selected={value}
              today={new Date()}
              onSelect={(date) => {
                onChange(date ?? null)
                close()
              }}
              classNames={{
                day: `${defaultClassNames.day} rounded-full hover:bg-zinc-300`,
                today: `${defaultClassNames.today} font-semibold !text-blue-600 !text-blue-400`,
              }}
            />
          )}
        </PopoverPanel>
      </Popover>

      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Clear date
        </button>
      )}
    </div>
  )
})

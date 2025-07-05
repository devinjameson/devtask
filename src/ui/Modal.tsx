'use client'

import { Dialog, DialogPanel, DialogTitle, DialogBackdrop, Description } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onCloseAction?: () => void
  title: string
  description?: string
  children: ReactNode
}

export function Modal({ open, onCloseAction, title, description, children }: ModalProps) {
  return (
    <Dialog open={open} onClose={() => onCloseAction?.()} className="relative z-50">
      {/* Backdrop */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 transition-opacity duration-200 ease-out data-closed:opacity-0"
      />

      {/* Centered panel wrapper */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-all duration-200 ease-out data-closed:opacity-0 data-closed:scale-95"
        >
          {/* Close button */}
          <button
            onClick={onCloseAction}
            aria-label="Close"
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <DialogTitle className="text-lg font-bold text-gray-900">{title}</DialogTitle>

          {description && (
            <Description className="mt-1 text-sm text-gray-500">{description}</Description>
          )}

          <div className="mt-4">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

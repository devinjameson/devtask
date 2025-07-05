import { Modal } from '@/ui/Modal'

export default function AddTaskModal({
  open,
  onCloseAction,
}: {
  open: boolean
  onCloseAction: () => void
}) {
  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Add a task">
      Form content goes here
    </Modal>
  )
}

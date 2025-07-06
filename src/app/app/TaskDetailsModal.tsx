import { TaskWithRelations } from '../api/tasks/route'
import { Modal } from '@/ui/Modal'
import { Field, Label } from '@/ui/catalyst/fieldset'
import { Text } from '@/ui/catalyst/text'

export default function TaskDetailsModal({
  open,
  onCloseAction,
  taskId,
  tasks,
}: {
  open: boolean
  onCloseAction: () => void
  taskId: string | null
  tasks: TaskWithRelations[]
}) {
  const task = tasks.find((t) => t.id === taskId)

  return (
    <Modal open={open} onCloseAction={onCloseAction} title={task?.title || ''}>
      {task ? (
        <div className="grid w-full grid-cols-1 gap-4">
          <Field>
            <Label>Status</Label>
            <Text>{task.status.name}</Text>
          </Field>

          {task.description && (
            <Field>
              <Label>Description</Label>
              <Text className="whitespace-pre-wrap">{task.description}</Text>
            </Field>
          )}

          {task.category && (
            <Field>
              <Label>Category</Label>
              <Text>{task.category.name}</Text>
            </Field>
          )}
        </div>
      ) : null}
    </Modal>
  )
}

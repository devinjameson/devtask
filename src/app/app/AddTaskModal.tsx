import { ErrorMessage, Field, Label } from '@/ui/catalyst/fieldset'
import { Input } from '@/ui/catalyst/input'
import { Textarea } from '@/ui/catalyst/textarea'
import { Modal } from '@/ui/Modal'
import { useForm } from 'react-hook-form'

type Inputs = {
  title: string
  description: string
}

export default function AddTaskModal({
  open,
  onCloseAction,
  statusId,
}: {
  open: boolean
  onCloseAction: () => void
  statusId: string | null
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit = (data: Inputs) => {}

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Add a task">
      <form onSubmit={handleSubmit(onSubmit)} className="grid w-full grid-cols-1 gap-4">
        <Field>
          <Label>Title</Label>
          <Input {...(register('title'), { required: true, autoFocus: true })} />
          {errors.title && <ErrorMessage>A title is required.</ErrorMessage>}
        </Field>

        <Field>
          <Label>Description</Label>
          <Textarea {...register('description')} />
        </Field>
      </form>
    </Modal>
  )
}

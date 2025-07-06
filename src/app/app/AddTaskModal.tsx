import { Category, Status } from '@/generated/prisma'
import { ErrorMessage, Field, Label } from '@/ui/catalyst/fieldset'
import { Input } from '@/ui/catalyst/input'
import { Select } from '@/ui/catalyst/select'
import { Textarea } from '@/ui/catalyst/textarea'
import { Modal } from '@/ui/Modal'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CreateTaskBody } from '../api/tasks/route'
import { Button } from '@/ui/catalyst/button'
import { useCreateTaskMutation } from './useCreateTaskMutation'
import { DatePicker } from '@/ui/DatePicker'
import { Controller } from 'react-hook-form'

type Inputs = {
  title: string
  description: string
  statusId: string
  categoryId?: string
  dueDate?: Date
}

export default function AddTaskModal({
  open,
  onCloseAction,
  statusId,
  statuses,
  categories,
}: {
  open: boolean
  onCloseAction: () => void
  statusId: string | null
  statuses: Status[]
  categories: Category[]
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Inputs>()

  useEffect(() => {
    if (open) {
      reset({ statusId: statusId ?? '' })
    }
  }, [open, statusId, reset])

  const createTaskMutation = useCreateTaskMutation()

  const onSubmit = async (data: Inputs) => {
    const body: CreateTaskBody = {
      title: data.title,
      statusId: data.statusId,
      description: data.description || undefined,
      categoryId: data.categoryId || undefined,
      dueDate: data.dueDate?.toISOString(),
    }
    createTaskMutation.mutate(body, {
      onSuccess: () => {
        onCloseAction()
      },
    })
  }

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Add a task">
      <form onSubmit={handleSubmit(onSubmit)} className="grid w-full grid-cols-1 gap-4">
        <Field>
          <Label>Title</Label>
          <Input {...register('title', { required: true })} autoFocus />
          {errors.title && <ErrorMessage>A title is required.</ErrorMessage>}
        </Field>

        <Field>
          <Label>Description</Label>
          <Textarea {...register('description')} />
        </Field>

        <Field>
          <Label>Category</Label>
          <Select {...register('categoryId')}>
            <option value="">No category</option>
            {categories.map((category) => {
              return (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              )
            })}
          </Select>
        </Field>

        <Field>
          <Label>Status</Label>
          <Select {...register('statusId')}>
            {statuses.map((status) => {
              return (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              )
            })}
          </Select>
        </Field>

        <Field>
          <Label>Due Date</Label>
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} placeholder="Due date" />
            )}
          />
        </Field>

        <Button type="submit" className="w-full" disabled={createTaskMutation.isPending}>
          {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
        </Button>
      </form>
    </Modal>
  )
}

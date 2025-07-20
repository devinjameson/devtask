import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Category, Status } from '@/generated/prisma'

import { Button } from '@/ui/catalyst/button'
import { ErrorMessage, Field, Label } from '@/ui/catalyst/fieldset'
import { Input } from '@/ui/catalyst/input'
import { Select } from '@/ui/catalyst/select'
import { Textarea } from '@/ui/catalyst/textarea'
import { DatePicker } from '@/ui/DatePicker'
import { Modal } from '@/ui/Modal'

import { TaskWithRelations } from '../api/tasks/route'

type Inputs = {
  title: string
  description: string
  statusId: string
  categoryId?: string
  dueDate?: Date
}

export default function TaskDetailsModal({
  open,
  onCloseAction,
  task,
  statuses,
  categories,
}: {
  open: boolean
  onCloseAction: () => void
  task: TaskWithRelations | null
  statuses: Status[]
  categories: Category[]
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<Inputs>()

  useEffect(() => {
    if (open && task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        statusId: task.statusId,
        categoryId: task.categoryId ?? '',
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      })
    }
  }, [open, task, reset])

  const onSubmit = async (_data: Inputs) => {
    // TODO: Implement update logic
  }

  const isSaveDisabled = !isDirty

  return (
    <Modal open={open} onCloseAction={onCloseAction} title={task?.title || 'Task Details'}>
      {task ? (
        <form onSubmit={handleSubmit(onSubmit)} className="grid w-full grid-cols-1 gap-4">
          <Field>
            <Label>Title</Label>
            <Input {...register('title', { required: true })} />
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

          <Button type="submit" className="w-full" disabled={isSaveDisabled}>
            Save Task
          </Button>
        </form>
      ) : null}
    </Modal>
  )
}

import { useEffect } from 'react'
import { getCookie } from '@/lib/getCookie'
import { Controller, useForm } from 'react-hook-form'

import { ACTIVE_PROFILE_COOKIE } from '@core/constants'
import { mapUndefined } from '@core/lib/mapNullable'

import { Category, Status } from '@/generated/prisma'

import { Button } from '@/ui/catalyst/button'
import { ErrorMessage, Field, Label } from '@/ui/catalyst/fieldset'
import { Input } from '@/ui/catalyst/input'
import { Select } from '@/ui/catalyst/select'
import { Text } from '@/ui/catalyst/text'
import { Textarea } from '@/ui/catalyst/textarea'
import { DatePicker } from '@/ui/DatePicker'
import { Modal } from '@/ui/Modal'

import { TaskWithRelations } from '../api/tasks/route'
import { useDeleteTaskMutation } from './useDeleteTaskMutation'
import { usePatchTaskMutation } from './usePatchTaskMutation'

type Inputs = {
  title: string
  description: string
  statusId: string
  categoryId: string
  dueDate?: Date | null
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
  const profileId = getCookie(ACTIVE_PROFILE_COOKIE) ?? ''
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm<Inputs>()

  const patchTaskMutation = usePatchTaskMutation({ profileId })
  const deleteTaskMutation = useDeleteTaskMutation({ profileId })

  useEffect(() => {
    if (open && task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        statusId: task.statusId,
        categoryId: task.categoryId ?? '',
        dueDate: mapUndefined(task.dueDate ?? undefined, (date) => new Date(date)),
      })
    }
  }, [open, task, reset])

  const onSubmit = async (data: Inputs) => {
    if (!task) {
      return
    }

    const patchData = {
      id: task.id,
      title: data.title,
      description: data.description || null,
      statusId: data.statusId,
      categoryId: data.categoryId || null,
      dueDate: data.dueDate ? data.dueDate.toISOString() : null,
    }

    try {
      await patchTaskMutation.mutateAsync(patchData)
      onCloseAction()
    } catch {
      setError('root', {
        type: 'manual',
        message: 'Failed to update task. Please try again.',
      })
    }
  }

  const handleDelete = async () => {
    if (!task) return

    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTaskMutation.mutateAsync({ id: task.id })
      onCloseAction()
    } catch {
      setError('root', {
        type: 'manual',
        message: 'Failed to delete task. Please try again.',
      })
    }
  }

  const isSaveDisabled = !isDirty || patchTaskMutation.isPending
  const isDeleteDisabled = deleteTaskMutation.isPending

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
              render={({ field: { value, onChange } }) => (
                <DatePicker value={value ?? undefined} onChange={onChange} placeholder="Due date" />
              )}
            />
          </Field>

          {errors.root && <Text className="text-red-500">{errors.root.message}</Text>}

          <div className="flex gap-2">
            <Button
              type="button"
              color="red"
              onClick={handleDelete}
              disabled={isDeleteDisabled}
              className="flex-1"
            >
              Delete Task
            </Button>
            <Button type="submit" disabled={isSaveDisabled} className="flex-1">
              Save Task
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  )
}

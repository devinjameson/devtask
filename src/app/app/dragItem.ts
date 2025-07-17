import { Option, pipe, Schema } from 'effect'

import { TaskWithRelations } from '@core/api/service/taskService'

import { Status } from '@/generated/prisma'

export type DragItem =
  | { type: 'task'; task: TaskWithRelations }
  | { type: 'status'; status: Status }

const TaskItemSchema = Schema.Struct({
  type: Schema.Literal('task'),
})

type TaskItem = Extract<DragItem, { type: 'task' }>

export const isTaskItem = (item: unknown): item is TaskItem =>
  pipe(item, Schema.decodeUnknownOption(TaskItemSchema), Option.isSome)

const StatusItemSchema = Schema.Struct({
  type: Schema.Literal('status'),
})

type StatusItem = Extract<DragItem, { type: 'status' }>

export const isStatusItem = (item: unknown): item is StatusItem =>
  pipe(item, Schema.decodeUnknownOption(StatusItemSchema), Option.isSome)

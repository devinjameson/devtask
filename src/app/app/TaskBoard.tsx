import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCookie } from '@/lib/getCookie'
import {
  Active,
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  getFirstCollision,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  Over,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Array, pipe, Record } from 'effect'
import { createPortal } from 'react-dom'

import { ACTIVE_PROFILE_COOKIE } from '@core/constants'

import { Category, Status } from '@/generated/prisma'
import { TaskWithRelations } from '@/app/api/tasks/route'

import AddTaskModal from './AddTaskModal'
import { coordinateGetter } from './multipleContainersKeyboardCoordinates'
import StatusColumn from './StatusColumn'
import TaskCard from './TaskCard'
import TaskDetailsModal from './TaskDetailsModal'
import { MoveTaskMutationParams, useMoveTaskMutation } from './useMoveTaskMutation'

type DragTaskIdsByStatus = Record<UniqueIdentifier, UniqueIdentifier[]>

export default function TaskBoard({
  tasks,
  statuses,
  categories,
  searchQuery,
}: {
  tasks: TaskWithRelations[]
  statuses: Status[]
  categories: Category[]
  searchQuery: string
}) {
  const moveTaskMutation = useMoveTaskMutation()

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter }),
  )

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [addTaskStatusId, setAddTaskStatusId] = useState<string | null>(null)

  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
  const [taskDetailsTaskId, setTaskDetailsTaskId] = useState<string | null>(null)

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef(false)

  const wasFilteringRef = useRef(false)
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return tasks
    }

    const query = searchQuery.toLowerCase()

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)),
    )
  }, [tasks, searchQuery])

  const isFiltering = searchQuery.trim() !== ''
  const isDragDisabled = isFiltering

  const wasFiltering = wasFilteringRef.current
  const disableAnimations = isFiltering || wasFiltering

  useEffect(() => {
    setTimeout(() => {
      wasFilteringRef.current = isFiltering
    }, 0)
  })

  const initialDragTaskIdsByStatus: DragTaskIdsByStatus = useMemo(
    () =>
      Record.fromEntries(
        Array.map(statuses, (status) => {
          return [
            status.id,
            pipe(
              filteredTasks,
              Array.filter(({ statusId }) => statusId === status.id),
              Array.map(({ id }) => id),
            ),
          ]
        }),
      ),
    [statuses, filteredTasks],
  )

  const [dragTaskIdsByStatus, setDragTaskIdsByStatus] = useState(initialDragTaskIdsByStatus)

  useEffect(() => {
    setDragTaskIdsByStatus(initialDragTaskIdsByStatus)
  }, [initialDragTaskIdsByStatus])

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [dragTaskIdsByStatus])

  const collisionDetectionStrategy = useCallback(
    () =>
      getCollisionDetectionStrategy(
        activeId,
        dragTaskIdsByStatus,
        lastOverId,
        recentlyMovedToNewContainer,
      ),
    [activeId, dragTaskIdsByStatus],
  )

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id

    if (overId == null || active.id in dragTaskIdsByStatus) {
      return
    }

    setDragTaskIdsByStatus((prev) => {
      const overContainer = findStatus(overId, prev)
      const activeContainer = findStatus(active.id, prev)

      if (!overContainer || !activeContainer) {
        return prev
      }

      if (activeContainer === overContainer) {
        return prev
      }

      const activeItems = dragTaskIdsByStatus[activeContainer]!
      const overItems = dragTaskIdsByStatus[overContainer]!
      const overIndex = overItems.indexOf(overId)
      const activeIndex = activeItems.indexOf(active.id)

      const nextIndex = getNextIndex(
        overId,
        dragTaskIdsByStatus,
        overItems,
        over,
        active,
        overIndex,
      )

      recentlyMovedToNewContainer.current = true

      const nextActiveContainer = dragTaskIdsByStatus[activeContainer]?.filter(
        (item) => item !== active.id,
      )

      const movingTaskId = dragTaskIdsByStatus[activeContainer]![activeIndex]

      if (!nextActiveContainer || !movingTaskId) {
        return prev
      }

      const nextOverContainer = [
        ...dragTaskIdsByStatus[overContainer]!.slice(0, nextIndex),
        movingTaskId,
        ...dragTaskIdsByStatus[overContainer]!.slice(nextIndex),
      ]

      return {
        ...dragTaskIdsByStatus,
        [activeContainer]: nextActiveContainer,
        [overContainer]: nextOverContainer,
      }
    })
  }

  const preDragTaskIdToStatusId = useMemo(
    () =>
      pipe(
        tasks,
        Array.map((task) => [task.id, task.statusId] as const),
        Record.fromEntries,
      ),
    [tasks],
  )

  const handleDragEnd = async ({ active, over }: DragEndEvent): Promise<void> => {
    if (!over) {
      setActiveId(null)
      return
    }

    const fromStatus = preDragTaskIdToStatusId[active.id]
    const toStatus = findStatus(over.id, dragTaskIdsByStatus)

    if (!fromStatus || !toStatus) {
      setActiveId(null)
      return
    }

    const toStatusTaskIds = dragTaskIdsByStatus[toStatus] ?? []

    const activeIndex = toStatusTaskIds.indexOf(active.id)
    const overIndex = toStatusTaskIds.indexOf(over.id)

    const isMoveToNewStatus = fromStatus !== toStatus

    if (activeIndex !== overIndex) {
      setDragTaskIdsByStatus((prev) => ({
        ...prev,
        [toStatus]: arrayMove(toStatusTaskIds, activeIndex, overIndex),
      }))
    }

    const profileId = getCookie(ACTIVE_PROFILE_COOKIE) ?? ''

    const afterTaskId = getAfterTaskId({
      toStatusTaskIds,
      overIndex,
      draggedTaskId: active.id,
    })

    const basePayload = {
      profileId,
      taskId: String(active.id),
      afterTaskId: afterTaskId,
    }

    const payload: MoveTaskMutationParams = isMoveToNewStatus
      ? {
          ...basePayload,
          destinationStatusId: String(toStatus),
        }
      : basePayload

    try {
      await moveTaskMutation.mutateAsync(payload)
    } catch {
      setDragTaskIdsByStatus(initialDragTaskIdsByStatus)
    }

    setActiveId(null)
  }

  const taskDetailsTask = taskDetailsTaskId
    ? filteredTasks.find(({ id }) => id === taskDetailsTaskId)
    : null

  const dragOverlayTask = filteredTasks.find(({ id }) => id === activeId) ?? null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy()}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6 p-2 flex-1 overflow-hidden">
        {statuses.map((status) => {
          const taskIds = dragTaskIdsByStatus[status.id]

          if (!taskIds) {
            return <p key={status.id}>No tasks in this status</p>
          }

          return (
            <StatusColumn
              key={status.id}
              status={status}
              taskIds={taskIds}
              allTasks={filteredTasks}
              dragDisabled={isDragDisabled}
              disableAnimations={disableAnimations}
              onAddTask={(id) => {
                setAddTaskStatusId(id)
                setIsAddTaskModalOpen(true)
              }}
              onClickTask={(id) => {
                setTaskDetailsTaskId(id)
                setIsTaskDetailsModalOpen(true)
              }}
            />
          )
        })}
      </div>

      {createPortal(
        <DragOverlay dropAnimation={null}>
          {dragOverlayTask ? (
            <TaskCard
              task={dragOverlayTask}
              dragDisabled={isDragDisabled}
              disableAnimations={disableAnimations}
              onClick={() => {}}
            />
          ) : null}
        </DragOverlay>,
        document.body,
      )}

      <AddTaskModal
        open={isAddTaskModalOpen}
        onCloseAction={() => setIsAddTaskModalOpen(false)}
        statusId={addTaskStatusId}
        statuses={statuses}
        categories={categories}
      />

      <TaskDetailsModal
        open={isTaskDetailsModalOpen}
        onCloseAction={() => setIsTaskDetailsModalOpen(false)}
        task={taskDetailsTask ?? null}
        statuses={statuses}
        categories={categories}
      />
    </DndContext>
  )
}

const findStatus = (id: UniqueIdentifier, dragTaskIdsByStatus: DragTaskIdsByStatus) => {
  const isStatusId = id in dragTaskIdsByStatus

  if (isStatusId) {
    return id
  } else {
    return Object.keys(dragTaskIdsByStatus).find((key) => dragTaskIdsByStatus[key]?.includes(id))
  }
}

const isDraggingStatus = (id: UniqueIdentifier | null, dragTaskIdsByStatus: DragTaskIdsByStatus) =>
  id !== null && id in dragTaskIdsByStatus

const pointerOrRect = (args: Parameters<CollisionDetection>[0]) =>
  pointerWithin(args).length ? pointerWithin(args) : rectIntersection(args)

const closestCardInStatus = (
  statusId: UniqueIdentifier,
  taskIds: UniqueIdentifier[],
  args: Parameters<CollisionDetection>[0],
) => {
  const droppableContainers = args.droppableContainers.filter(
    ({ id }) => id !== statusId && taskIds.includes(id),
  )
  return closestCenter({
    ...args,
    droppableContainers,
  })[0]?.id
}

const getCollisionDetectionStrategy =
  (
    activeId: UniqueIdentifier | null,
    dragTaskIdsByStatus: DragTaskIdsByStatus,
    lastOverId: RefObject<UniqueIdentifier | null>,
    recentlyMovedToNewContainer: RefObject<boolean>,
  ): CollisionDetection =>
  (args) => {
    if (isDraggingStatus(activeId, dragTaskIdsByStatus)) {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((c) => c.id in dragTaskIdsByStatus),
      })
    }

    let overId = getFirstCollision(pointerOrRect(args), 'id')

    if (overId !== null) {
      if (overId in dragTaskIdsByStatus) {
        overId = closestCardInStatus(overId, dragTaskIdsByStatus[overId]!, args) ?? overId
      }
      lastOverId.current = overId
      return [{ id: overId }]
    }

    if (recentlyMovedToNewContainer.current) {
      lastOverId.current = activeId
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }

const getNextIndex = (
  overId: UniqueIdentifier,
  dragTaskIdsByStatus: DragTaskIdsByStatus,
  overItems: UniqueIdentifier[],
  over: Over | null,
  active: Active,
  overIndex: number,
) => {
  if (overId in dragTaskIdsByStatus) {
    return overItems.length + 1
  } else {
    const isBelowOverItem =
      over &&
      active.rect.current.translated &&
      active.rect.current.translated.top > over.rect.top + over.rect.height

    const modifier = isBelowOverItem ? 1 : 0

    if (overIndex >= 0) {
      return overIndex + modifier
    } else {
      return overItems.length + 1
    }
  }
}

const getAfterTaskId = ({
  toStatusTaskIds,
  overIndex,
  draggedTaskId,
}: {
  toStatusTaskIds: UniqueIdentifier[]
  overIndex: number
  draggedTaskId: UniqueIdentifier
}): string | null => {
  if (overIndex === 0) {
    return null
  }

  const otherTasks = toStatusTaskIds.filter((id) => id !== draggedTaskId)

  const afterTaskId = otherTasks[overIndex - 1]

  return afterTaskId ? String(afterTaskId) : null
}

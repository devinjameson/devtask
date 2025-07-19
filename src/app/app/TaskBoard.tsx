import { RefObject, useCallback, useRef, useState } from 'react'
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
import { Array, Option, pipe, Record } from 'effect'

import { Category, Status } from '@/generated/prisma'
import { TaskWithRelations } from '@/app/api/tasks/route'

import AddTaskModal from './AddTaskModal'
import StatusColumn from './StatusColumn'
import TaskCard from './TaskCard'
import TaskDetailsModal from './TaskDetailsModal'
import { useMoveTaskMutation } from './useMoveTaskMutation'

type ItemsByStatus = Record<UniqueIdentifier, UniqueIdentifier[]>

const findStatus = (id: UniqueIdentifier, itemsByStatus: ItemsByStatus) => {
  const isStatusId = id in itemsByStatus

  if (isStatusId) {
    return id
  } else {
    return Object.keys(itemsByStatus).find((key) => itemsByStatus[key]?.includes(id))
  }
}

export default function TaskBoard({
  tasks,
  statuses,
  categories,
}: {
  tasks: TaskWithRelations[]
  statuses: Status[]
  categories: Category[]
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [addTaskStatusId, setAddTaskStatusId] = useState<string | null>(null)

  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
  const [taskDetailsTaskId, setTaskDetailsTaskId] = useState<string | null>(null)

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef(false)

  const initialItemsByStatus: ItemsByStatus = Record.fromEntries(
    Array.map(statuses, (status) => {
      return [
        status.id,
        pipe(
          tasks,
          Array.filter((task) => task.statusId === status.id),
          Array.map(({ id }) => id),
        ),
      ]
    }),
  )

  const [itemsByStatus, setItemsByStatus] = useState(initialItemsByStatus)

  const moveTaskMutation = useMoveTaskMutation()

  const collisionDetectionStrategy = useCallback(
    () =>
      getCollisionDetectionStrategy(
        activeId,
        itemsByStatus,
        lastOverId,
        recentlyMovedToNewContainer,
      ),
    [activeId, itemsByStatus],
  )

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id)
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id

    if (overId == null || active.id in itemsByStatus) {
      return
    }

    setItemsByStatus((prev) => {
      const overContainer = findStatus(overId, prev)
      const activeContainer = findStatus(active.id, prev)

      if (!overContainer || !activeContainer) {
        return prev
      }

      if (activeContainer === overContainer) {
        return prev
      }

      const activeItems = itemsByStatus[activeContainer]!
      const overItems = itemsByStatus[overContainer]!
      const overIndex = overItems.indexOf(overId)
      const activeIndex = activeItems.indexOf(active.id)

      const nextIndex = getNextIndex(overId, itemsByStatus, overItems, over, active, overIndex)

      recentlyMovedToNewContainer.current = true

      const nextActiveContainer = itemsByStatus[activeContainer]?.filter(
        (item) => item !== active.id,
      )

      const movingTaskId = itemsByStatus[activeContainer]![activeIndex]

      if (!nextActiveContainer || !movingTaskId) {
        return prev
      }

      const nextOverContainer = [
        ...itemsByStatus[overContainer]!.slice(0, nextIndex),
        movingTaskId,
        ...itemsByStatus[overContainer]!.slice(nextIndex),
      ]

      return {
        ...itemsByStatus,
        [activeContainer]: nextActiveContainer,
        [overContainer]: nextOverContainer,
      }
    })
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeContainer = findStatus(active.id, itemsByStatus)

    if (!activeContainer) {
      setActiveId(null)
      return
    }

    const overId = over?.id

    if (overId == null) {
      setActiveId(null)
      return
    }

    const overContainer = findStatus(overId, itemsByStatus)

    if (overContainer) {
      const activeIndex = itemsByStatus[activeContainer]!.indexOf(active.id)
      const overIndex = itemsByStatus[overContainer]!.indexOf(overId)

      if (activeIndex !== overIndex) {
        setItemsByStatus((items) => ({
          ...items,
          [overContainer]: arrayMove(items[overContainer]!, activeIndex, overIndex),
        }))
      }
    }

    setActiveId(null)
  }

  const taskDetailsTask = taskDetailsTaskId
    ? tasks.find(({ id }) => id === taskDetailsTaskId)
    : null

  const dragOverlayTask = tasks.find(({ id }) => id === activeId) ?? null

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
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6 p-2 flex-1 overflow-hidden">
        {statuses.map((status) => {
          const tasksIds = Record.get(itemsByStatus, status.id)

          return Option.match(tasksIds, {
            onSome: (taskIds) => (
              <StatusColumn
                key={status.id}
                status={status}
                taskIds={taskIds}
                allTasks={tasks}
                onAddTask={(id) => {
                  setAddTaskStatusId(id)
                  setIsAddTaskModalOpen(true)
                }}
                onClickTask={(id) => {
                  setTaskDetailsTaskId(id)
                  setIsTaskDetailsModalOpen(true)
                }}
                activeId={activeId}
              />
            ),
            onNone: () => <p>No tasks in this status</p>,
          })
        })}
      </div>

      <DragOverlay>
        {dragOverlayTask ? <TaskCard task={dragOverlayTask} onClick={() => {}} /> : null}
      </DragOverlay>

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

const isDraggingStatus = (id: UniqueIdentifier | null, itemsByStatus: ItemsByStatus) =>
  id !== null && id in itemsByStatus

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
    itemsByStatus: ItemsByStatus,
    lastOverId: RefObject<UniqueIdentifier | null>,
    recentlyMovedToNewContainer: RefObject<boolean>,
  ): CollisionDetection =>
  (args) => {
    if (isDraggingStatus(activeId, itemsByStatus)) {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((c) => c.id in itemsByStatus),
      })
    }

    let overId = getFirstCollision(pointerOrRect(args), 'id')

    if (overId !== null) {
      if (overId in itemsByStatus) {
        overId = closestCardInStatus(overId, itemsByStatus[overId]!, args) ?? overId
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
  itemsByStatus: ItemsByStatus,
  overItems: UniqueIdentifier[],
  over: Over | null,
  active: Active,
  overIndex: number,
) => {
  if (overId in itemsByStatus) {
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

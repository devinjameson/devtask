import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { $activeProfileId } from '@/stores/profileStore'
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
import { useStore } from '@nanostores/react'
import { UseQueryResult } from '@tanstack/react-query'
import { Array, pipe, Record } from 'effect'
import { createPortal } from 'react-dom'

import { Category, Status } from '@/generated/prisma'
import { TaskWithRelations } from '@/app/api/tasks/route'

import AddTaskModal from './AddTaskModal'
import Filters from './Filters'
import StatusColumn from './StatusColumn'
import TaskBoardSkeleton from './TaskBoardSkeleton'
import TaskCard from './TaskCard'
import TaskDetailsModal from './TaskDetailsModal'
import { MoveTaskMutationParams, useMoveTaskMutation } from './useMoveTaskMutation'

type DragTaskIdsByStatus = Record<UniqueIdentifier, UniqueIdentifier[]>

export default function TaskBoard({
  tasksQueryResult,
  statusesQueryResult,
  categoriesQueryResult,
  searchQuery,
  selectedStatusId,
  selectedCategoryId,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: {
  tasksQueryResult: UseQueryResult<TaskWithRelations[]>
  statusesQueryResult: UseQueryResult<Status[]>
  categoriesQueryResult: UseQueryResult<Category[]>
  searchQuery: string
  selectedStatusId: string | null
  selectedCategoryId: string | null
  onSearchChange: (query: string) => void
  onStatusChange: (statusId: string | null) => void
  onCategoryChange: (categoryId: string | null) => void
}) {
  const moveTaskMutation = useMoveTaskMutation()

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

  const activeProfileId = useStore($activeProfileId)

  const tasks = useMemo(() => tasksQueryResult.data ?? [], [tasksQueryResult.data])
  const statuses = useMemo(() => statusesQueryResult.data ?? [], [statusesQueryResult.data])
  const categories = useMemo(() => categoriesQueryResult.data ?? [], [categoriesQueryResult.data])

  const wasFilteringRef = useRef(false)
  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, searchQuery, selectedStatusId, selectedCategoryId)
  }, [tasks, searchQuery, selectedStatusId, selectedCategoryId])

  const isFiltering =
    searchQuery.trim() !== '' || selectedStatusId !== null || selectedCategoryId !== null

  const wasFiltering = wasFilteringRef.current
  const disableAnimations = isFiltering || wasFiltering

  const isDragging = activeId !== null

  useEffect(() => {
    setTimeout(() => {
      wasFilteringRef.current = isFiltering
    }, 0)
  })

  const initialDragTaskIdsByStatus: DragTaskIdsByStatus = useMemo(
    () =>
      Record.fromEntries(
        Array.map(statuses, (status) => {
          const statusTasks = pipe(
            filteredTasks,
            Array.filter(({ statusId }) => statusId === status.id),
            Array.map(({ id }) => id),
          )
          return [status.id, statusTasks]
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

    const afterTaskId = getAfterTaskId({
      toStatusTaskIds,
      overIndex,
      draggedTaskId: active.id,
    })

    const basePayload = {
      profileId: activeProfileId,
      taskId: String(active.id),
      afterTaskId: afterTaskId,
    }

    const payload: MoveTaskMutationParams = isMoveToNewStatus
      ? {
          ...basePayload,
          destinationStatusId: String(toStatus),
        }
      : basePayload

    moveTaskMutation.mutate(payload, {
      onError: () => {
        setDragTaskIdsByStatus(initialDragTaskIdsByStatus)
      },
      onSettled: () => {
        setActiveId(null)
      },
    })
  }

  const taskDetailsTask = taskDetailsTaskId
    ? filteredTasks.find(({ id }) => id === taskDetailsTaskId)
    : null

  const dragOverlayTask = filteredTasks.find(({ id }) => id === activeId) ?? null

  const isReady =
    tasksQueryResult.isSuccess && statusesQueryResult.isSuccess && categoriesQueryResult.isSuccess

  if (!isReady) {
    return <TaskBoardSkeleton />
  }

  return (
    <div className="p-2 flex flex-col flex-1">
      <Filters
        statuses={statuses}
        categories={categories}
        searchQuery={searchQuery}
        selectedStatusId={selectedStatusId}
        selectedCategoryId={selectedCategoryId}
        onSearchChange={onSearchChange}
        onChangeStatus={onStatusChange}
        onChangeCategory={onCategoryChange}
      />

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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6 flex-1 overflow-hidden mt-2">
          {statuses
            .filter((status) => selectedStatusId === null || status.id === selectedStatusId)
            .map((status) => {
              const taskIds = dragTaskIdsByStatus[status.id] ?? []

              return (
                <StatusColumn
                  key={status.id}
                  status={status}
                  taskIds={taskIds}
                  allTasks={filteredTasks}
                  disableAnimations={disableAnimations}
                  onAddTask={(id) => {
                    setAddTaskStatusId(id)
                    setIsAddTaskModalOpen(true)
                  }}
                  onClickTask={(id) => {
                    setTaskDetailsTaskId(id)
                    setIsTaskDetailsModalOpen(true)
                  }}
                  isDragging={isDragging}
                />
              )
            })}
        </div>

        {createPortal(
          <DragOverlay dropAnimation={null}>
            {dragOverlayTask ? (
              <TaskCard
                task={dragOverlayTask}
                disableAnimations={disableAnimations}
                onClick={() => {}}
                className="scale-105"
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
          categories={categories}
        />
      </DndContext>
    </div>
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

const filterTasks = (
  tasks: TaskWithRelations[],
  searchQuery: string,
  selectedStatusId: string | null,
  selectedCategoryId: string | null,
): TaskWithRelations[] => {
  return tasks.filter((task) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    if (selectedStatusId && task.statusId !== selectedStatusId) {
      return false
    }

    if (selectedCategoryId && task.categoryId !== selectedCategoryId) {
      return false
    }

    return true
  })
}

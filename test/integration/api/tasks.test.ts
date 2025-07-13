import { describe, it, expect } from 'vitest'
import { createTestUser } from '../helpers/db'
import { expectSuccess, makeAuthenticatedRequest } from '../helpers/api'
import { CreateTaskBody, CreateTaskResultData, GetTasksResultData } from '@/app/api/tasks/route'
import { MoveTaskBody, MoveTaskResultData } from '@/app/api/tasks/[id]/move/route'

describe('GET /tasks', () => {
  it('returns all tasks for the profile', async () => {
    const { profile, cookies } = await createTestUser()

    const status = profile.statuses[0]!
    const category = profile.categories[0]!

    const firstBody: CreateTaskBody = {
      title: 'First Task',
      description: 'First Description',
      statusId: status.id,
      categoryId: category.id,
    }
    const firstCreateResponse = await makeAuthenticatedRequest(
      '/tasks',
      { method: 'POST', body: JSON.stringify(firstBody) },
      cookies,
    )
    expectSuccess(firstCreateResponse, 201)

    const secondBody: CreateTaskBody = {
      title: 'Second Task',
      description: 'Second Description',
      statusId: status.id,
      categoryId: category.id,
    }
    const secondCreateResponse = await makeAuthenticatedRequest(
      '/tasks',
      { method: 'POST', body: JSON.stringify(secondBody) },
      cookies,
    )
    expectSuccess(secondCreateResponse, 201)

    const getResponse = await makeAuthenticatedRequest('/tasks', { method: 'GET' }, cookies)
    const { tasks } = await expectSuccess<GetTasksResultData>(getResponse)

    expect(tasks.length).toBe(2)

    const secondTask = tasks[0]!
    const firstTask = tasks[1]!

    expect(firstTask.title).toBe(firstBody.title)
    expect(firstTask.description).toBe(firstBody.description)
    expect(firstTask.statusId).toBe(firstBody.statusId)
    expect(firstTask.categoryId).toBe(firstBody.categoryId)

    expect(secondTask.title).toBe(secondBody.title)
    expect(secondTask.description).toBe(secondBody.description)
    expect(secondTask.statusId).toBe(secondBody.statusId)
    expect(secondTask.categoryId).toBe(secondBody.categoryId)
  })

  it('returns an empty array when no tasks exist', async () => {
    const { cookies } = await createTestUser()

    const getResponse = await makeAuthenticatedRequest('/tasks', { method: 'GET' }, cookies)
    const { tasks } = await expectSuccess<GetTasksResultData>(getResponse)

    expect(tasks).toEqual([])
  })
})

describe('POST /tasks', () => {
  it('creates a new task', async () => {
    const { profile, cookies } = await createTestUser()

    const status = profile.statuses[0]!
    const category = profile.categories[0]!

    const createBody: CreateTaskBody = {
      title: 'Test Task',
      description: 'Test Description',
      statusId: status.id,
      categoryId: category.id,
    }
    const createResponse = await makeAuthenticatedRequest(
      '/tasks',
      { method: 'POST', body: JSON.stringify(createBody) },
      cookies,
    )
    expectSuccess(createResponse, 201)

    const getResponse = await makeAuthenticatedRequest('/tasks', { method: 'GET' }, cookies)
    const { tasks } = await expectSuccess<GetTasksResultData>(getResponse)

    const firstTask = tasks[0]!

    expect(firstTask.title).toBe(createBody.title)
    expect(firstTask.description).toBe(createBody.description)
    expect(firstTask.statusId).toBe(createBody.statusId)
    expect(firstTask.categoryId).toBe(createBody.categoryId)
  })
})

describe('PATCH /tasks/:id/move', () => {
  it('moves a task', async () => {
    const { profile, cookies } = await createTestUser()

    const pendingStatus = profile.statuses.find(({ name }) => name === 'Pending')!
    const inProgressStatus = profile.statuses.find(({ name }) => name === 'In Progress')!
    const completedStatus = profile.statuses.find(({ name }) => name === 'Completed')!

    const createBodies: CreateTaskBody[] = [
      { title: 'Task F', statusId: completedStatus.id },
      { title: 'Task E', statusId: completedStatus.id },
      { title: 'Task D', statusId: inProgressStatus.id },
      { title: 'Task C', statusId: pendingStatus.id },
      { title: 'Task B', statusId: pendingStatus.id },
      { title: 'Task A', statusId: pendingStatus.id },
    ]

    const tasksWithIds = []
    for (const createBody of createBodies) {
      const createResponse = await makeAuthenticatedRequest(
        '/tasks',
        { method: 'POST', body: JSON.stringify(createBody) },
        cookies,
      )
      const {
        task: { id },
      } = await expectSuccess<CreateTaskResultData>(createResponse, 201)
      tasksWithIds.push({ id, title: createBody.title })
    }

    const getResponse = await makeAuthenticatedRequest('/tasks', { method: 'GET' }, cookies)
    const { tasks: initialTasks } = await expectSuccess<GetTasksResultData>(getResponse)

    const initialPendingTasks = initialTasks.filter((task) => task.statusId === pendingStatus.id)
    const initialInProgressTasks = initialTasks.filter(
      (task) => task.statusId === inProgressStatus.id,
    )
    const initialCompletedTasks = initialTasks.filter(
      (task) => task.statusId === completedStatus.id,
    )

    expect(initialPendingTasks.map(({ title }) => title)).toEqual(['Task A', 'Task B', 'Task C'])
    expect(initialInProgressTasks.map(({ title }) => title)).toEqual(['Task D'])
    expect(initialCompletedTasks.map(({ title }) => title)).toEqual(['Task E', 'Task F'])

    const taskB = tasksWithIds.find((task) => task.title === 'Task B')!
    const moveBody: MoveTaskBody = {
      toIndex: 0,
    }
    const moveResponse = await makeAuthenticatedRequest(
      `/tasks/${taskB.id}/move`,
      { method: 'PATCH', body: JSON.stringify(moveBody) },
      cookies,
    )
    expectSuccess<MoveTaskResultData>(moveResponse)

    const afterMoveResponse = await makeAuthenticatedRequest('/tasks', { method: 'GET' }, cookies)
    const { tasks: afterMoveTasks } = await expectSuccess<GetTasksResultData>(afterMoveResponse)
    const finalPendingTasks = afterMoveTasks.filter((task) => task.statusId === pendingStatus.id)
    expect(finalPendingTasks.map(({ title }) => title)).toEqual(['Task A', 'Task C', 'Task B'])

    const movedTask = finalPendingTasks.find((t) => t.title === 'Task B')!
    expect(movedTask.order).toBe(0)
  })
})

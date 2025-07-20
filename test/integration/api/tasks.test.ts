import { describe, expect, it } from 'vitest'

import { Task } from '@/generated/prisma'
import { MoveTaskBody, MoveTaskResultData } from '@/app/api/tasks/[id]/move/route'
import { PatchTaskBody } from '@/app/api/tasks/[id]/route'
import {
  CreateTaskBody,
  CreateTaskResultData,
  GetTasksResultData,
  TaskWithRelations,
} from '@/app/api/tasks/route'

import { expectSuccess, makeAuthenticatedRequest } from '../helpers/api'
import { createTestUser } from '../helpers/db'

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

    const firstTask = tasks[0]!
    const secondTask = tasks[1]!

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

    const dueDate = new Date('2023-10-01').toISOString()

    const createBody: CreateTaskBody = {
      title: 'Test Task',
      description: 'Test Description',
      statusId: status.id,
      categoryId: category.id,
      dueDate,
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
    expect(firstTask.dueDate).toBe(dueDate)
  })
})

describe('PATCH /tasks/:id/move', () => {
  it('moves a task', async () => {
    const { profile, cookies } = await createTestUser()

    const pendingStatus = profile.statuses.find(({ name }) => name === 'Pending')!
    const inProgressStatus = profile.statuses.find(({ name }) => name === 'In Progress')!
    const completedStatus = profile.statuses.find(({ name }) => name === 'Completed')!

    const createBodies: CreateTaskBody[] = [
      { title: 'Task A', statusId: pendingStatus.id },
      { title: 'Task B', statusId: pendingStatus.id },
      { title: 'Task C', statusId: pendingStatus.id },
      { title: 'Task D', statusId: inProgressStatus.id },
      { title: 'Task E', statusId: completedStatus.id },
      { title: 'Task F', statusId: completedStatus.id },
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

    {
      // Move to beginning of status
      const taskB = findByTitle(tasksWithIds, 'Task B')
      const moveBody: MoveTaskBody = {
        afterTaskId: null,
      }
      const moveResponse = await makeAuthenticatedRequest(
        `/tasks/${taskB.id}/move`,
        { method: 'PATCH', body: JSON.stringify(moveBody) },
        cookies,
      )
      expectSuccess<MoveTaskResultData>(moveResponse)

      const getResponse = await makeAuthenticatedRequest('/tasks', { method: 'GET' }, cookies)
      const { tasks } = await expectSuccess<GetTasksResultData>(getResponse)

      const pendingTasks = tasks.filter(({ statusId }) => statusId === pendingStatus.id)
      expect(pendingTasks.map(({ title }) => title)).toEqual(['Task B', 'Task A', 'Task C'])
    }

    {
      // Move within status
      const taskA = findByTitle(tasksWithIds, 'Task A')
      const taskC = findByTitle(tasksWithIds, 'Task C')
      const moveBody: MoveTaskBody = {
        afterTaskId: taskC.id,
      }
      const moveResponse = await makeAuthenticatedRequest(
        `/tasks/${taskA.id}/move`,
        { method: 'PATCH', body: JSON.stringify(moveBody) },
        cookies,
      )
      expectSuccess<MoveTaskResultData>(moveResponse)

      const getResponse = await makeAuthenticatedRequest('/tasks', { method: 'GET' }, cookies)
      const { tasks } = await expectSuccess<GetTasksResultData>(getResponse)

      const pendingTasks = tasks.filter(({ statusId }) => statusId === pendingStatus.id)
      expect(pendingTasks.map(({ title }) => title)).toEqual(['Task B', 'Task C', 'Task A'])
    }

    {
      // Move to end of status
      const taskC = findByTitle(tasksWithIds, 'Task C')
      const taskA = findByTitle(tasksWithIds, 'Task A')
      const moveBody: MoveTaskBody = {
        afterTaskId: taskA.id,
      }
      const moveResponse = await makeAuthenticatedRequest(
        `/tasks/${taskC.id}/move`,
        { method: 'PATCH', body: JSON.stringify(moveBody) },
        cookies,
      )
      expectSuccess<MoveTaskResultData>(moveResponse)

      const getResponse = await makeAuthenticatedRequest('/tasks', { method: 'GET' }, cookies)
      const { tasks } = await expectSuccess<GetTasksResultData>(getResponse)

      const pendingTasks = tasks.filter(({ statusId }) => statusId === pendingStatus.id)
      expect(pendingTasks.map(({ title }) => title)).toEqual(['Task B', 'Task A', 'Task C'])
    }

    {
      // Move to different status
      const taskC = findByTitle(tasksWithIds, 'Task C')
      const taskE = findByTitle(tasksWithIds, 'Task E')
      const moveBody: MoveTaskBody = {
        afterTaskId: taskE.id,
        destinationStatusId: completedStatus.id,
      }
      const moveResponse = await makeAuthenticatedRequest(
        `/tasks/${taskC.id}/move`,
        { method: 'PATCH', body: JSON.stringify(moveBody) },
        cookies,
      )
      expectSuccess<MoveTaskResultData>(moveResponse)

      const getResponse = await makeAuthenticatedRequest('/tasks', { method: 'GET' }, cookies)
      const { tasks } = await expectSuccess<GetTasksResultData>(getResponse)

      const pendingTasks = tasks.filter(({ statusId }) => statusId === pendingStatus.id)
      const completedTasks = tasks.filter(({ statusId }) => statusId === completedStatus.id)

      expect(pendingTasks.map(({ title }) => title)).toEqual(['Task B', 'Task A'])
      expect(completedTasks.map(({ title }) => title)).toEqual(['Task E', 'Task C', 'Task F'])
    }
  })
})

describe('GET /tasks/:id', () => {
  it('returns a task by id', async () => {
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
    const {
      task: { id },
    } = await expectSuccess<CreateTaskResultData>(createResponse, 201)

    const getResponse = await makeAuthenticatedRequest(`/tasks/${id}`, { method: 'GET' }, cookies)
    const { task } = await expectSuccess<{ task: TaskWithRelations }>(getResponse)

    expect(task.id).toBe(id)
    expect(task.title).toBe(createBody.title)
    expect(task.description).toBe(createBody.description)
    expect(task.statusId).toBe(createBody.statusId)
    expect(task.categoryId).toBe(createBody.categoryId)
  })

  it('returns 404 for non-existent task', async () => {
    const { cookies } = await createTestUser()

    const getResponse = await makeAuthenticatedRequest(
      '/tasks/non-existent-id',
      { method: 'GET' },
      cookies,
    )
    expect(getResponse.status).toBe(404)
  })
})

describe('PATCH /tasks/:id', () => {
  it('updates a task', async () => {
    const { profile, cookies } = await createTestUser()

    const status = profile.statuses[0]!
    const category = profile.categories[0]!

    const createBody: CreateTaskBody = {
      title: 'Original Title',
      description: 'Original Description',
      statusId: status.id,
      categoryId: category.id,
    }
    const createResponse = await makeAuthenticatedRequest(
      '/tasks',
      { method: 'POST', body: JSON.stringify(createBody) },
      cookies,
    )
    const {
      task: { id },
    } = await expectSuccess<CreateTaskResultData>(createResponse, 201)

    const patchBody = {
      title: 'Updated Title',
      description: 'Updated Description',
    }
    const patchResponse = await makeAuthenticatedRequest(
      `/tasks/${id}`,
      { method: 'PATCH', body: JSON.stringify(patchBody) },
      cookies,
    )
    const { task: updatedTask } = await expectSuccess<{ task: Task }>(patchResponse)

    expect(updatedTask.title).toBe(patchBody.title)
    expect(updatedTask.description).toBe(patchBody.description)
    expect(updatedTask.statusId).toBe(status.id)
    expect(updatedTask.categoryId).toBe(category.id)
  })

  it('clears optional fields', async () => {
    const { profile, cookies } = await createTestUser()

    const status = profile.statuses[0]!
    const category = profile.categories[0]!

    const createBody: CreateTaskBody = {
      title: 'Task with category',
      statusId: status.id,
      categoryId: category.id,
      description: 'Has description',
      dueDate: new Date('2023-10-01').toISOString(),
    }
    const createResponse = await makeAuthenticatedRequest(
      '/tasks',
      { method: 'POST', body: JSON.stringify(createBody) },
      cookies,
    )
    const {
      task: { id },
    } = await expectSuccess<CreateTaskResultData>(createResponse, 201)

    const patchBody: PatchTaskBody = {
      description: '',
      categoryId: null,
      dueDate: null,
    }
    const patchResponse = await makeAuthenticatedRequest(
      `/tasks/${id}`,
      { method: 'PATCH', body: JSON.stringify(patchBody) },
      cookies,
    )
    const { task: updatedTask } = await expectSuccess<{ task: Task }>(patchResponse)

    expect(updatedTask.description).toBeNull()
    expect(updatedTask.categoryId).toBeNull()
    expect(updatedTask.dueDate).toBeNull()
  })
})

const findByTitle = (tasks: { id: string; title: string }[], title: string) =>
  tasks.find((task) => task.title === title)!

import { describe, it, expect } from 'vitest'
import { createTestUser } from '../helpers/db'
import { expectSuccess, makeAuthenticatedRequest } from '../helpers/api'
import { CreateTaskBody, GetTasksResultData } from '@/app/api/tasks/route'

describe('GET /api/tasks', () => {
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
      '/api/tasks',
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
      '/api/tasks',
      { method: 'POST', body: JSON.stringify(secondBody) },
      cookies,
    )
    expectSuccess(secondCreateResponse, 201)

    const getResponse = await makeAuthenticatedRequest('/api/tasks', { method: 'GET' }, cookies)
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

    const getResponse = await makeAuthenticatedRequest('/api/tasks', { method: 'GET' }, cookies)
    const { tasks } = await expectSuccess<GetTasksResultData>(getResponse)

    expect(tasks).toEqual([])
  })
})

describe('POST /api/tasks', () => {
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
      '/api/tasks',
      { method: 'POST', body: JSON.stringify(createBody) },
      cookies,
    )
    expectSuccess(createResponse, 201)

    const getResponse = await makeAuthenticatedRequest('/api/tasks', { method: 'GET' }, cookies)
    const { tasks } = await expectSuccess<GetTasksResultData>(getResponse)

    const firstTask = tasks[0]!

    expect(firstTask.title).toBe(createBody.title)
    expect(firstTask.description).toBe(createBody.description)
    expect(firstTask.statusId).toBe(createBody.statusId)
    expect(firstTask.categoryId).toBe(createBody.categoryId)
  })
})

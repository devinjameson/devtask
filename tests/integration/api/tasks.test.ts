import { describe, it, expect } from 'vitest'
import { createTestUser } from '../helpers/db'
import { ACTIVE_PROFILE_COOKIE } from '@/lib/constants'
import { CreateTaskBody, CreateTaskResult } from '@/app/api/tasks/route'

const baseUrl = 'http://localhost:3001'

describe('POST /api/tasks', () => {
  it('creates a new task', async () => {
    const { user, session } = await createTestUser()

    const profile = user.profiles[0]
    if (!profile) {
      throw new Error('No profile found for test user')
    }

    const status = profile.statuses[0]
    if (!status) {
      throw new Error('No status found for test profile')
    }

    const category = profile.categories[0]
    if (!category) {
      throw new Error('No category found for test profile')
    }

    const sessionCookie = Buffer.from(JSON.stringify(session)).toString('base64')
    const cookies = [
      `sb-127-auth-token=base64-${sessionCookie}`,
      `${ACTIVE_PROFILE_COOKIE}=${profile.id}`,
    ].join('; ')

    const body: CreateTaskBody = {
      title: 'Test Task',
      description: 'Test Description',
      statusId: status.id,
      categoryId: category.id,
    }

    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        cookie: cookies,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result: CreateTaskResult = await response.json()

    if (!result.success) {
      throw new Error(`Failed to create task: ${result.error}`)
    }

    expect(response.status).toBe(201)

    const {
      data: {
        task: { title, description, statusId, categoryId, profileId },
      },
    } = result

    expect(title).toBe('Test Task')
    expect(description).toBe('Test Description')
    expect(statusId).toBe(status.id)
    expect(categoryId).toBe(category.id)
    expect(profileId).toBe(profile.id)
  })
})

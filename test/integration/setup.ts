import { afterAll, beforeEach } from 'vitest'

import { prisma } from '@core/prisma'

import { resetDb } from './helpers/db'

beforeEach(async () => {
  await resetDb()
})

afterAll(async () => {
  await prisma.$disconnect()
})

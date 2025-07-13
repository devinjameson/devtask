import { beforeEach, afterAll } from 'vitest'
import { resetDb } from './helpers/db'
import { prisma } from '@core/prisma'

beforeEach(async () => {
  await resetDb()
})

afterAll(async () => {
  await prisma.$disconnect()
})

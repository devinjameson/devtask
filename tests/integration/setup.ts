import { beforeEach, afterAll } from 'vitest'
import { resetDb, prisma } from './helpers/db'

beforeEach(async () => {
  await resetDb()
})

afterAll(async () => {
  await prisma.$disconnect()
})

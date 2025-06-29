import { Category, Status, Task } from '@/generated/prisma'

export type TaskWithRelations = Task & {
  category: Category | null
  status: Status
}

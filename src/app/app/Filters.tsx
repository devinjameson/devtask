import { Category, Status } from '@/generated/prisma'

import { Input } from '@/ui/catalyst/input'
import { Select } from '@/ui/catalyst/select'

export default function Filters({
  statuses,
  categories,
  searchQuery,
  selectedStatusId,
  selectedCategoryId,
  onSearchChange,
  onChangeStatus,
  onChangeCategory,
}: {
  statuses: Status[]
  categories: Category[]
  searchQuery: string
  selectedStatusId: string | null
  selectedCategoryId: string | null
  onSearchChange: (query: string) => void
  onChangeStatus: (statusId: string | null) => void
  onChangeCategory: (categoryId: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full md:w-48">
          <Select
            value={selectedStatusId ?? ''}
            onChange={(e) => onChangeStatus(e.target.value || null)}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select
            value={selectedCategoryId ?? ''}
            onChange={(e) => onChangeCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="w-full md:w-64">
        <Input
          placeholder="Search tasks…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}

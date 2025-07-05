import { Category } from '@/generated/prisma'
import { fetchJson } from '@/lib/api/fetchJson'
import { useQuery } from '@tanstack/react-query'
import { CategoriesResponseData } from '../api/categories/route'

const fetchCategories = async (): Promise<Category[]> => {
  const result = await fetchJson<CategoriesResponseData>(() => fetch('/api/categories'))

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.categories
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}

import { useQuery } from '@tanstack/react-query'

import { fetchApi } from '@core/api/fetchApi'

import { Category } from '@/generated/prisma'

import { GetCategoriesResultData } from '../api/categories/route'

const fetchCategories = async (): Promise<Category[]> => {
  const result = await fetchApi<GetCategoriesResultData>(() => fetch('/api/categories'))

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

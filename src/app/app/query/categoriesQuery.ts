import { useQuery } from '@tanstack/react-query'

import { fetchApi } from '@core/api/fetchApi'

import { Category } from '@/generated/prisma'
import { GetCategoriesResultData } from '@/app/api/categories/route'

import { categoriesQueryKey } from '../queryKey'

export const fetchCategories = async (profileId: string): Promise<Category[]> => {
  const result = await fetchApi<GetCategoriesResultData>(() =>
    fetch(`/api/categories?profileId=${encodeURIComponent(profileId)}`),
  )

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.categories
}

export function useCategories({ profileId }: { profileId: string }) {
  return useQuery({
    queryKey: categoriesQueryKey(profileId),
    queryFn: () => fetchCategories(profileId),
    enabled: profileId !== '',
  })
}

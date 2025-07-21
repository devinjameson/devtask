import '@tanstack/react-query'

import type { QueryKey } from '@/app/app/queryKey'

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: QueryKey
    mutationKey: QueryKey
  }
}

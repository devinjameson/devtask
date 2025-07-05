import '@tanstack/react-query'

type QueryKey = ['categories' | 'profiles' | 'statuses' | 'tasks', ...ReadonlyArray<unknown>]

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: QueryKey
    mutationKey: QueryKey
  }
}

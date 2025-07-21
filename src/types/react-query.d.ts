import '@tanstack/react-query'

type QueryKey =
  | ['categories', { profileId: string }]
  | ['profiles']
  | ['statuses', { profileId: string }]
  | ['tasks', { profileId: string }]

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: QueryKey
    mutationKey: QueryKey
  }
}

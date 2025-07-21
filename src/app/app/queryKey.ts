export type TasksQueryKey = ['tasks', { profileId: string }]
export const tasksQueryKey = (profileId: string): TasksQueryKey => ['tasks', { profileId }]

export type StatusesQueryKey = ['statuses', { profileId: string }]
export const statusesQueryKey = (profileId: string): StatusesQueryKey => ['statuses', { profileId }]

export type CategoriesQueryKey = ['categories', { profileId: string }]
export const categoriesQueryKey = (profileId: string): CategoriesQueryKey => [
  'categories',
  { profileId },
]

export type ProfilesQueryKey = ['profiles']
export const profilesQueryKey = (): ProfilesQueryKey => ['profiles']

export type QueryKey = TasksQueryKey | StatusesQueryKey | CategoriesQueryKey | ProfilesQueryKey

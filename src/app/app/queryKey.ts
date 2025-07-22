export type TasksQueryKey = ['tasks', { profileId: string }]
export const tasksQueryKey = (profileId: string): TasksQueryKey => ['tasks', { profileId }]

export type AllTasksQueryKey = ['tasks']
export const allTasksQueryKey: AllTasksQueryKey = ['tasks']

export type StatusesQueryKey = ['statuses', { profileId: string }]
export const statusesQueryKey = (profileId: string): StatusesQueryKey => ['statuses', { profileId }]

export type AllStatusesQueryKey = ['statuses']
export const allStatusesQueryKey: AllStatusesQueryKey = ['statuses']

export type CategoriesQueryKey = ['categories', { profileId: string }]
export const categoriesQueryKey = (profileId: string): CategoriesQueryKey => [
  'categories',
  { profileId },
]

export type AllCategoriesQueryKey = ['categories']
export const allCategoriesQueryKey: AllCategoriesQueryKey = ['categories']

export type ProfilesQueryKey = ['profiles']
export const profilesQueryKey = (): ProfilesQueryKey => ['profiles']

export type QueryKey =
  | TasksQueryKey
  | StatusesQueryKey
  | CategoriesQueryKey
  | ProfilesQueryKey
  | AllTasksQueryKey
  | AllStatusesQueryKey
  | AllCategoriesQueryKey

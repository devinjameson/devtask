export type ApiResult<T> = ApiSuccess<T> | ApiFailure

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiFailure = {
  success: false
  error: string
}

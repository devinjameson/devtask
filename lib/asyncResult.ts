import { UseQueryResult } from '@tanstack/react-query'

export type AsyncResult<T, U = unknown> = Ok<T> | Err<U> | Loading
export type Ok<T> = { _tag: 'Ok'; value: T }
export type Err<U> = { _tag: 'Err'; value: U }
export type Loading = { _tag: 'Loading' }

export const ok = <T, U>(value: T): AsyncResult<T, U> => ({ _tag: 'Ok', value })
export const err = <U, T>(value: U): AsyncResult<T, U> => ({ _tag: 'Err', value })
export const loading = <T, U>(): AsyncResult<T, U> => ({ _tag: 'Loading' })

export const isOk = <T, U>(result: AsyncResult<T, U>): result is Ok<T> => result._tag === 'Ok'
export const isErr = <T, U>(result: AsyncResult<T, U>): result is Err<U> => result._tag === 'Err'
export const isLoading = <T, U>(result: AsyncResult<T, U>): result is Loading =>
  result._tag === 'Loading'

export const match = <T, U, V>(
  result: AsyncResult<T, U>,
  {
    onOk,
    onErr,
    onLoading,
  }: {
    onOk: (value: T) => V
    onErr: (value: U) => V
    onLoading: () => V
  },
) => {
  switch (result._tag) {
    case 'Ok':
      return onOk(result.value)
    case 'Err':
      return onErr(result.value)
    case 'Loading':
      return onLoading()
  }
}

export const map =
  <T, U, V>(f: (value: T) => V) =>
  (result: AsyncResult<T, U>): AsyncResult<V, U> => {
    if (isOk(result)) {
      return ok<V, U>(f(result.value))
    } else if (isErr(result)) {
      return err<U, V>(result.value)
    } else {
      return loading<V, U>()
    }
  }

export const fromQueryResult = <T, U>(queryResult: UseQueryResult<T, U>): AsyncResult<T, U> => {
  if (queryResult.isLoading) {
    return loading<T, U>()
  } else if (queryResult.isError) {
    return err<U, T>(queryResult.error as U)
  } else {
    return ok<T, U>(queryResult.data as T)
  }
}

export const combine =
  <T, U>(a: AsyncResult<T, U>) =>
  <V, W>(b: AsyncResult<V, W>): AsyncResult<[T, V], U | W> => {
    if (isLoading(a) || isLoading(b)) {
      return loading<[T, V], U | W>()
    }

    if (isErr(a)) {
      return err<U | W, [T, V]>(a.value)
    }

    if (isErr(b)) {
      return err<U | W, [T, V]>(b.value)
    }

    return ok<[T, V], U | W>([a.value, b.value])
  }

import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'

export type ServiceException = {
  message: string
  status: number
}

export const unknownExceptionToServiceException = <A, E>(
  effect: Effect.Effect<A, E | UnknownException>,
): Effect.Effect<A, E | ServiceException> =>
  Effect.catchTag(effect, 'UnknownException', () =>
    Effect.fail<ServiceException>({
      message: 'Unknown error occurred',
      status: 500,
    }),
  )

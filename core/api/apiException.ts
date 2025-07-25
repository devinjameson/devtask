import { Data, Effect } from 'effect'
import { UnknownException } from 'effect/Cause'

export class ApiException extends Data.TaggedError('ApiException')<{
  readonly message: string
  readonly status: number
}> {}

export const unknownExceptionToApiException = <A, E>(
  effect: Effect.Effect<A, E | UnknownException>,
): Effect.Effect<A, E | ApiException> =>
  Effect.catchTag(
    effect,
    'UnknownException',
    () =>
      new ApiException({
        message: 'Unknown error occurred',
        status: 500,
      }),
  )

import { Effect } from 'effect'
import { ServiceException } from './serviceException'
import { NextResponse } from 'next/server'

export const serviceResultToNextResponse =
  (successStatus?: number) =>
  <A>(effect: Effect.Effect<A, ServiceException>) =>
    Effect.match(effect, {
      onFailure: (error) => {
        return NextResponse.json(
          {
            success: false as const,
            error: error.message,
          },
          {
            status: error.status,
          },
        )
      },
      onSuccess: (data) => {
        return NextResponse.json(
          {
            success: true as const,
            data,
          },
          {
            status: successStatus,
          },
        )
      },
    })

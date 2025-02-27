const STATUS_MESSAGES = {
  200: 'success',
  201: 'success',
  400: 'fail',
  401: 'fail',
  403: 'fail',
  404: 'fail',
  500: 'error'
}
import type { Response } from 'express'

export function sendDataResponse(
  res: Response,
  statusCode: keyof typeof STATUS_MESSAGES,
  payload: object
) {
  res.status(statusCode).json({
    status: STATUS_MESSAGES[statusCode],
    data: payload
  })
}

export function sendMessageResponse(
  res: Response,
  statusCode: keyof typeof STATUS_MESSAGES,
  message: string
) {
  res.status(statusCode).json({
    status: STATUS_MESSAGES[statusCode],
    message
  })
}

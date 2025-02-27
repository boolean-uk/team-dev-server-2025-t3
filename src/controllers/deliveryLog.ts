import type { RequestHandler } from 'express'
import { sendDataResponse } from '../utils/responses.js'
import type { DeliveryLogLine } from '@prisma/client'

export const create: RequestHandler = async (req, res) => {
  const {
    date,
    cohort_id: cohortId,
    lines
  } = req.body as { date: Date; cohort_id: number; lines: DeliveryLogLine[] }

  return sendDataResponse(res, 201, {
    log: {
      id: 1,
      cohort_id: cohortId,
      date,
      author: {
        id: req.body.user.id,
        first_name: req.body.user.firstName,
        last_name: req.body.user.lastName
      },
      lines: lines.map((line, index: number) => {
        return {
          id: index + 1,
          content: line.content
        }
      })
    }
  })
}

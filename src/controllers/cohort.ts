import type { RequestHandler } from 'express'
import { createCohort } from '../domain/cohort.ts'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'

export const create: RequestHandler = async (_req, res) => {
  try {
    const createdCohort = await createCohort()

    return sendDataResponse(res, 201, createdCohort)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return sendMessageResponse(res, 500, 'Unable to create cohort')
  }
}

import type { RequestHandler } from 'express'
import { createCohort } from '../domain/cohort.ts'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import dbClient from '../utils/dbClient'

export const create: RequestHandler = async (req, res) => {
  try {
    const { userIds, name } = req.body // Expect an array of user IDs

    // Create the cohort
    const createdCohort = await createCohort(name);

    if (userIds && userIds.length > 0) {
      // Directly update users without filtering (Prisma ignores invalid ones)
      await dbClient.user.updateMany({
        where: {
          id: { in: userIds } // No role restriction, assigns anyone
        },
        data: { cohortId: createdCohort.id }
      })
    }

    return sendDataResponse(res, 201, {
      cohort: createdCohort,
      studentsAssigned: userIds || []
    })
  } catch (error) {
    console.error('Error creating cohort:', error)
    return sendMessageResponse(res, 500, 'Unable to create cohort')
  }
}

// Get all cohorts with their members
export const getAllCohorts: RequestHandler = async (_req, res) => {
  try {
    const cohorts = await dbClient.cohort.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    return sendDataResponse(res, 200, { cohorts })
  } catch (error) {
    console.error('Error fetching cohorts:', error)
    return sendMessageResponse(res, 500, 'Unable to fetch cohorts')
  }
}

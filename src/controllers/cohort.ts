import type { RequestHandler } from 'express'
import { createCohort } from '../domain/cohort.ts'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import dbClient from '../utils/dbClient'
import type User from '../domain/user.ts'

export const create: RequestHandler = async (req, res) => {
  try {
    const { userIds, name } = req.body // Expect an array of user IDs

    // Create the cohort
    const createdCohort = await createCohort(name)

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

export const getCohort: RequestHandler = async (req, res) => {
  const user: User = req.body.user
  let cohortId
  try {
    cohortId = parseInt(req.params['id'])
  } catch (e) {
    console.error(e)
    sendMessageResponse(res, 500, 'cohort id must be a number')
  }

  try {
    console.log(user.cohortId)
    console.log(user)
    if (user.role == 'TEACHER' || user.cohortId === cohortId) {
      const cohort = await dbClient.cohort.findUnique({
        where: { id: cohortId },
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
      sendDataResponse(res, 200, { cohort })
      return
    } else {
      sendDataResponse(res, 401, {
        authorization: 'not authorized to view cohort'
      })
    }
  } catch (e) {
    sendDataResponse(res, 500, e as object)
  }
}

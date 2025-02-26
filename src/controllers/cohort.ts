import { createCohort } from '../domain/cohort.ts'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const create = async (req, res) => {
  try {
    const { userIds } = req.body // Expect an array of user IDs

    // Create the cohort
    const createdCohort = await createCohort()

    // Validate user IDs and ensure they have role STUDENT
    if (userIds && userIds.length > 0) {
      const validStudents = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          role: 'STUDENT' // Only include users with the STUDENT role
        }
      })

      if (validStudents.length !== userIds.length) {
        return sendDataResponse(res, 400, {
          error: 'One or more user IDs are invalid or not students'
        })
      }

      // Assign students to the cohort
      await prisma.user.updateMany({
        where: { id: { in: userIds } },
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

// Get all cohorts with their students
export const getAllCohorts = async (req, res) => {
  try {
    const cohorts = await prisma.cohort.findMany({
      include: {
        users: {
          where: { role: 'STUDENT' }, // Only fetch students
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

import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create Profile
export const create = async (req: Request, res: Response) => {
  try {
    console.log('Received request body:', req.body) // Log request data

    const {
      userId,
      firstName,
      lastName,
      bio,
      githubUrl,
      githubUsername,
      mobile,
      role,
      specialism,
      cohort,
      startDate,
      endDate
    } = req.body

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      console.error('User not found for ID:', userId) // Log issue
      return sendDataResponse(res, 404, { error: 'User not found' })
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        userId,
        firstName,
        lastName,
        bio,
        githubUrl,
        githubUsername,
        mobile,
        role,
        specialism,
        cohort,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    console.log('Profile created successfully:', profile) // Log success
    return sendDataResponse(res, 201, { profile })
  } catch (error) {
    console.error('Error creating profile:', error) // Log actual error
    return sendMessageResponse(res, 500, 'Unable to create profile')
  }
}

// Get All Profiles
export const getAll = async (req: Request, res: Response) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: { user: { select: { id: true, email: true, role: true } } }
    })
    return sendDataResponse(res, 200, { profiles })
  } catch (error) {
    console.error('Error retrieving profiles', error)
    return sendMessageResponse(res, 500, 'Unable to fetch profiles')
  }
}

// Get Profile by User ID
export const getById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId)
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true, role: true } } }
    })

    return profile
      ? sendDataResponse(res, 200, { profile })
      : sendDataResponse(res, 404, { error: 'Profile not found' })
  } catch (error) {
    console.error('Error retrieving profile', error)
    return sendMessageResponse(res, 500, 'Unable to fetch profile')
  }
}

// Update Profile
export const updateById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId)
    const profile = await prisma.profile.update({
      where: { userId },
      data: req.body
    })
    return sendDataResponse(res, 200, { profile })
  } catch (error) {
    console.error('Error updating profile', error)
    return sendMessageResponse(res, 500, 'Unable to update profile')
  }
}

// Delete Profile
export const deleteById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId)
    await prisma.profile.delete({ where: { userId } })
    return sendDataResponse(res, 200, {
      message: 'Profile deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting profile', error)
    return sendMessageResponse(res, 500, 'Unable to delete profile')
  }
}

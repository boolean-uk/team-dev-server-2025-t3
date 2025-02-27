import dbClient from '../utils/dbClient.js'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import bcrypt from 'bcrypt'
import type { RequestHandler } from 'express'

// Create user (ensures unique email)
export const create: RequestHandler = async (req, res) => {
  try {
    const {
      email,
      password,
      cohortId,
      firstName,
      lastName,
      bio,
      githubUrl,
      role
    } = req.body

    // Check if the email is already in use
    const existingUser = await dbClient.user.findUnique({ where: { email } })
    if (existingUser) {
      return sendDataResponse(res, 400, { error: 'Email is already in use' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const createdUser = await dbClient.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        cohortId,
        profile: {
          create: {
            firstName,
            lastName,
            bio,
            githubUrl
          }
        }
      },
      include: {
        profile: true
      }
    })

    return sendDataResponse(res, 201, createdUser)
  } catch (error) {
    console.error('Error creating user:', error)
    return sendMessageResponse(res, 500, 'Unable to create new user')
  }
}

// Get user by ID (retrieves user with the required fields)
export const getById: RequestHandler = async (req, res) => {
  try {
    const userId = parseInt(req.params['id'])

    const foundUser = await dbClient.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!foundUser) {
      return sendDataResponse(res, 404, { error: 'User not found' })
    }

    return sendDataResponse(res, 200, {
      id: foundUser.id,
      cohortId: foundUser.cohortId,
      email: foundUser.email,
      firstName: foundUser.profile?.firstName,
      lastName: foundUser.profile?.lastName,
      bio: foundUser.profile?.bio,
      githubUrl: foundUser.profile?.githubUrl,
      password: foundUser.password,
      role: foundUser.role
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return sendMessageResponse(res, 500, 'Unable to get user')
  }
}

// Get all users (retrieves all users with required fields)
export const getAll: RequestHandler = async (_req, res) => {
  try {
    const users = await dbClient.user.findMany({
      include: { profile: true }
    })

    const formattedUsers = users.map((user) => ({
      id: user.id,
      cohortId: user.cohortId,
      email: user.email,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      bio: user.profile?.bio,
      githubUrl: user.profile?.githubUrl,
      password: user.password,
      role: user.role
    }))

    return sendDataResponse(res, 200, { users: formattedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return sendMessageResponse(res, 500, 'Unable to fetch users')
  }
}

// Update user (only the logged-in user can update their own account)
export const updateById: RequestHandler = async (req, res) => {
  try {
    const userId = parseInt(req.params['id'])

    // Ensure the logged-in user can only update their own account
    if (!req.body.user || req.body.user.id !== userId) {
      return sendDataResponse(res, 403, {
        error: 'You are not allowed to update this user'
      })
    }

    const { firstName, lastName, email, bio, githubUrl, password } = req.body

    const userUpdateData: { email?: string; password?: string } = {}

    if (email) userUpdateData.email = email
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10)
    }

    // Update User
    const updatedUser = await dbClient.user.update({
      where: { id: userId },
      data: userUpdateData
    })

    // Update Profile if fields are provided
    const updatedProfile = await dbClient.profile.update({
      where: { userId },
      data: { firstName, lastName, bio, githubUrl }
    })

    return sendDataResponse(res, 200, {
      user: updatedUser,
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return sendMessageResponse(res, 500, 'Unable to update user')
  }
}

// Delete user (only logged-in user can delete their own account)
export const deleteById: RequestHandler = async (req, res) => {
  try {
    const userId = parseInt(req.params['id'])

    // Ensure the logged-in user can only delete their own account
    if (!req.body.user || req.body.user.id !== userId) {
      return sendDataResponse(res, 403, {
        error: 'You are not allowed to delete this user'
      })
    }

    // Remove the user from the request before deletion
    req.body.user = undefined

    // Clear authentication session/token
    res.clearCookie('token') // If using cookies
    res.setHeader('Authorization', '') // If using JWT

    // Check if user exists before deletion
    const existingUser = await dbClient.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return sendDataResponse(res, 404, { error: 'User not found' })
    }

    // Delete all related posts first
    await dbClient.post.deleteMany({
      where: { userId }
    })

    // Delete the profile
    await dbClient.profile.deleteMany({
      where: { userId }
    })

    // Now, delete the user
    await dbClient.user.delete({
      where: { id: userId }
    })

    // Send success response
    return sendDataResponse(res, 200, {
      message: `User ${userId} deleted successfully.`
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return sendMessageResponse(res, 500, 'Unable to delete user')
  }
}

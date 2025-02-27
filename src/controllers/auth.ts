import User from '../domain/user.ts'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_EXPIRY, JWT_SECRET } from '../utils/config.js'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import type { RequestHandler } from 'express'
import type { Role } from '@prisma/client'

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body

  if (!email) {
    return sendDataResponse(res, 400, {
      email: 'Invalid email and/or password provided'
    })
  }

  try {
    const foundUser = await User.findByEmail(email)
    const areCredentialsValid = await validateCredentials(password, foundUser)

    if (!areCredentialsValid) {
      return sendDataResponse(res, 400, {
        email: 'Invalid email and/or password provided'
      })
    }

    const token = generateJwt(foundUser!.id!, foundUser!.role ?? 'STUDENT');

    return sendDataResponse(res, 200, { token, ...foundUser!.toJSON() })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return sendMessageResponse(res, 500, 'Unable to process request')
  }
}

function generateJwt(userId: number, role: Role) {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY
  } as jwt.SignOptions)
}

async function validateCredentials(
  password: string | undefined,
  user: User | undefined | null
) {
  if (!user) {
    return false
  }

  if (!user.passwordHash) {
    throw new Error('user without password hash passed to validateCredentials')
  }

  if (!password) {
    return false
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    return false
  }

  return true
}

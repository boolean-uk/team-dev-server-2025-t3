import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import { JWT_SECRET } from '../utils/config.js'
import jwt from 'jsonwebtoken'
import User from '../domain/user.js'
import type { NextFunction, Response, Request } from 'express'

export async function validateTeacherRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.body.user) {
    return sendMessageResponse(res, 500, 'Unable to verify user')
  }

  if (req.body.user.role !== 'TEACHER') {
    return sendDataResponse(res, 403, {
      authorization: 'You are not authorized to perform this action'
    })
  }

  next()
}

export async function validateAuthentication(
  req: Request<{ user: User }>,
  res: Response,
  next: NextFunction
) {
  const header = req.header('authorization')

  if (!header) {
    return sendDataResponse(res, 401, {
      authorization: 'Missing Authorization header'
    })
  }

  const [type, token] = header.split(' ')

  const isTypeValid = validateTokenType(type)
  if (!isTypeValid) {
    return sendDataResponse(res, 401, {
      authentication: `Invalid token type, expected Bearer but got ${type}`
    })
  }

  const isTokenValid = validateToken(token)
  if (!isTokenValid) {
    return sendDataResponse(res, 401, {
      authentication: 'Invalid or missing access token'
    })
  }

  const decodedToken = jwt.decode(token) as { userId: number }
  if (!decodedToken) {
    return sendDataResponse(res, 401, {
      authentication: 'unable to decode token'
    })
  }

  const foundUser = await User.findById(decodedToken.userId)
  foundUser!.passwordHash = null

  req.body.user = foundUser

  next()
}

function validateToken(token: string) {
  if (!token) {
    return false
  }

  if (!JWT_SECRET) {
    throw new Error('No JWT_SECRET set')
  }

  return jwt.verify(token, JWT_SECRET, (error) => {
    return !error
  })
}

function validateTokenType(type: string) {
  if (!type) {
    return false
  }

  if (type.toUpperCase() !== 'BEARER') {
    return false
  }

  return true
}

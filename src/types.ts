import type { Profile, User } from '@prisma/client'
import type { Request } from 'express'

export type DBUser = User & { profile: Profile | null }

export interface AuthenticatedUser {
  id: number
  email: string
  role: string
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    email: string
    role: string
  }
}


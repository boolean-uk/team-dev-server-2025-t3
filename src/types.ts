import type { Profile, User } from '@prisma/client'

export type DBUser = User & { profile: Profile | null }

export interface AuthenticatedUser {
  id: number
  email: string
  role: string
}

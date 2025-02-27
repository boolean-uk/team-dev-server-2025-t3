import type { Profile, User } from '@prisma/client'

export type DBUser = User & { profile: Profile | null }

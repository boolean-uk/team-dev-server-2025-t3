import { type Role, type Prisma } from '@prisma/client'
import type { DBUser } from '../types.js'
import dbClient from '../utils/dbClient.js'
import bcrypt from 'bcrypt'

export default class User {
  public id: number | null
  public cohortId: number | null
  public email: string
  public firstName: string | null
  public lastName: string | null
  public bio: string | null
  public githubUrl: string | null
  public passwordHash?: string | null
  public role: Role | null

  /**
   * This is JSDoc - a way for us to tell other developers what types functions/methods
   * take as inputs, what types they return, and other useful information that JS doesn't have built in
   * @tutorial https://www.valentinog.com/blog/jsdoc
   *
   */
  static fromDb(user: DBUser) {
    return new User(
      user.id,
      user.cohortId,
      user.profile?.firstName ?? null,
      user.profile?.lastName ?? null,
      user.email,
      user.profile?.bio ?? null,
      user.profile?.githubUrl ?? null,
      user.password,
      user.role
    )
  }

  static async fromJson(json: Record<string, unknown>) {
    const { firstName, lastName, email, biography, githubUrl, password } = json
    if (typeof password !== 'string') {
      throw new Error('password must be string')
    }
    if (firstName !== undefined && typeof firstName !== 'string') {
      throw new Error('firstName must be string')
    }
    if (lastName !== undefined && typeof lastName !== 'string') {
      throw new Error('lastName must be string')
    }
    if (typeof email !== 'string') {
      throw new Error('email must be string')
    }
    if (typeof biography !== 'string' && biography !== undefined) {
      throw new Error('biography must be string or null')
    }
    if (typeof githubUrl !== 'string' && githubUrl !== undefined) {
      throw new Error('githubUrl must be string or null')
    }
    const passwordHash = await bcrypt.hash(password, 8)

    return new User(
      null,
      null,
      firstName ?? null,
      lastName ?? null,
      email,
      biography ?? null,
      githubUrl ?? null,
      passwordHash
    )
  }

  constructor(
    id: number | null,
    cohortId: number | null,
    firstName: string | null,
    lastName: string | null,
    email: string,
    bio: string | null,
    githubUrl: string | null,
    passwordHash: string | null = null,
    role: Role = 'STUDENT'
  ) {
    this.id = id
    this.cohortId = cohortId
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.bio = bio
    this.githubUrl = githubUrl
    this.passwordHash = passwordHash
    this.role = role
  }

  toJSON() {
    return {
      user: {
        id: this.id,
        cohort_id: this.cohortId,
        role: this.role,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        biography: this.bio,
        githubUrl: this.githubUrl
      }
    }
  }

  /**
   * @returns {User}
   *  A user instance containing an ID, representing the user data created in the database
   */
  async save() {
    if (this.passwordHash === null) {
      throw new Error('tried saving user without password')
    }
    const data: Prisma.XOR<
      Prisma.UserCreateInput,
      Prisma.UserUncheckedCreateInput
    > = {
      email: this.email,
      password: this.passwordHash,
      role: this.role as Role
    }

    if (this.cohortId) {
      data.cohort = {
        connect: {
          id: this.cohortId
        }
      }
    }

    if (this.firstName && this.lastName) {
      data.profile = {
        create: {
          firstName: this.firstName,
          lastName: this.lastName,
          bio: this.bio,
          githubUrl: this.githubUrl
        }
      }
    }
    const createdUser = await dbClient.user.create({
      data,
      include: {
        profile: true
      }
    })

    return User.fromDb(createdUser)
  }

  static async findByEmail(email: string) {
    return User._findByEmail(email)
  }

  static async findById(id: number) {
    return User._findById(id)
  }

  static async findManyByFirstName(firstName: string) {
    return User._findMany('firstName', firstName)
  }

  static async findAll() {
    const users = await dbClient.user.findMany({ include: { profile: true } })
    return users.map((user) => User.fromDb(user))
  }

  static async _findByEmail(email: string) {
    const foundUser = await dbClient.user.findUnique({
      where: {
        email
      },
      include: {
        profile: true
      }
    })

    if (foundUser) {
      return User.fromDb(foundUser)
    }

    return null
  }

  static async _findById(id: number) {
    const foundUser = await dbClient.user.findUnique({
      where: {
        id
      },
      include: {
        profile: true
      }
    })

    if (foundUser) {
      return User.fromDb(foundUser)
    }

    return null
  }

  static async _findMany(key: string, value: string | number): Promise<User[]> {
    const query = {
      include: {
        profile: true
      }
    } as {
      include: { profile: boolean }
      where?: { profile: { [x: string]: string | number } }
    }

    if (key !== undefined && value !== undefined) {
      query.where = {
        profile: {
          [key]: value
        }
      }
    }

    const foundUsers = await dbClient.user.findMany(query)

    return foundUsers.map((user) => User.fromDb(user))
  }
}

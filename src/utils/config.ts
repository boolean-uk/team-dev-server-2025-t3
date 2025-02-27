import jwt from 'jsonwebtoken'

export const JWT_SECRET = process.env['JWT_SECRET'] as jwt.Secret

export const JWT_EXPIRY = process.env['JWT_EXPIRY']

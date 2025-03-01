import type { RequestHandler, Request } from 'express'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import Post from '../domain/post.ts'
import dbClient from '../utils/dbClient.ts'

interface CustomRequest extends Request {
  user?: { id: number } // Sikrer at req.user eksisterer
}

export const create: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const { content } = req.body

    if (!content) {
      return sendDataResponse(res, 400, { error: 'Content is required' })
    }

    if (!req.body.user) {
      return sendDataResponse(res, 401, { error: 'Unauthorized' })
    }

    const userId = req.body.user.id
    const newPost = await Post.createPost(content, userId)

    return sendDataResponse(res, 201, { post: newPost.toJSON() })
  } catch (error) {
    console.error('Error in create:', error)
    return sendMessageResponse(res, 500, 'Unable to create post')
  }
}

export const getAll: RequestHandler = async (_req, res) => {
  try {
    const posts = await dbClient.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            cohortId: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                bio: true,
                githubUrl: true
              }
            }
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    })
    return sendDataResponse(res, 200, { posts: posts })
  } catch (error) {
    console.error('Error in getAll:', error)
    return sendMessageResponse(res, 500, 'Unable to fetch posts')
  }
}

export const getAllSortedByDate: RequestHandler = async (_req, res) => {
  try {
    const posts = await Post.findAllSortedByDate()

    return sendDataResponse(res, 200, {
      message: posts.length ? undefined : 'No posts found',
      posts: posts.map((post) => post.toJSON())
    })
  } catch (error) {
    console.error('Error in getAllSortedByDate:', error)
    return sendMessageResponse(res, 500, 'Unable to fetch sorted posts')
  }
}

export const update: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    if (!content) {
      return sendDataResponse(res, 400, { error: 'Content is required' })
    }

    const updatedPost = await Post.updatePost(Number(id), content)
    return sendDataResponse(res, 200, { post: updatedPost.toJSON() })
  } catch (error) {
    console.error('Error in update:', error)
    return sendMessageResponse(res, 500, 'Unable to update post')
  }
}

export const remove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    await Post.deletePost(Number(id))

    return sendDataResponse(res, 200, { message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error in remove:', error)
    return sendMessageResponse(res, 500, 'Unable to delete post')
  }
}

export const getAllByUserSorted: RequestHandler = async (
  req: CustomRequest,
  res
) => {
  try {
    if (!req.body.user) {
      return sendDataResponse(res, 401, { error: 'Unauthorized' })
    }

    const userId = req.body.user.id
    const posts = await Post.findAllByUserSortedByDate(userId)

    return sendDataResponse(res, 200, {
      message: posts.length ? undefined : 'No posts found',
      posts: posts.map((post) => post.toJSON())
    })
  } catch (error) {
    console.error('Error in getAllByUserSorted:', error)
    return sendMessageResponse(res, 500, 'Unable to fetch user posts')
  }
}

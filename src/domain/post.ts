import dbClient from '../utils/dbClient';
import { Prisma } from '@prisma/client';

export default class Post {
    id: number;
    content: string;
    userId: number;
    createdAt: Date;
    updatedAt?: Date;
    user?: { 
        id: number; 
        cohortId: number | null;
        role: string;
        firstName: string | null;
        lastName: string | null;
        bio: string | null;
        githubUrl: string | null;
        profileImageUrl?: string | null;
    } | null;

    constructor(post: Prisma.PostGetPayload<{ 
        include: { 
          user: { 
            select: { 
              id: true, 
              cohortId: true, 
              role: true, 
              profile: { select: { firstName: true, lastName: true, bio: true, githubUrl: true } } 
            } 
          } 
        } 
      }>) {
        this.id = post.id;
        this.content = post.content;
        this.userId = post.userId;
        this.createdAt = post.createdAt;
        this.updatedAt = post.updatedAt;

        this.user = post.user
            ? {
                id: post.user.id,
                cohortId: post.user.cohortId,
                role: post.user.role,
                firstName: post.user.profile?.firstName ?? null,
                lastName: post.user.profile?.lastName ?? null,
                bio: post.user.profile?.bio ?? null,
                githubUrl: post.user.profile?.githubUrl ?? null,
                profileImageUrl: null // Hvis du ønsker å legge til et bilde senere
            }
            : null;
    }



    toJSON() {
        return {
            id: this.id,
            content: this.content,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            user: this.user
        };
    }

    static async findAll() {
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
                }
            }
        });

        return posts.map(post => new Post(post));
    }

    static async findAllSortedByDate() {
        const posts = await dbClient.post.findMany({
            orderBy: { createdAt: 'desc' },
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
                }
            }
        });
    
        return posts.map(post => new Post(post));
    }
    

    static async createPost(content: string, userId: number) {
        if (!content) throw new Error('Content is required');

        const createdPost = await dbClient.post.create({
            data: { content, userId },
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
                }
            }
        });

        return new Post(createdPost);
    }

    static async updatePost(id: number, content: string) {
        if (!content) throw new Error('Content is required');
    
        const updatedPost = await dbClient.post.update({
            where: { id },
            data: { content },
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
                }
            }
        });
    
        return new Post(updatedPost);
    }
    
    static async deletePost(id: number) {
        const deletedPost = await dbClient.post.delete({
            where: { id }
        });
    
        return { message: 'Post deleted successfully', id: deletedPost.id };
    }
    static async findAllByUserSortedByDate(userId: number) {
        const posts = await dbClient.post.findMany({
            where: { userId }, // Filtrer på userId
            orderBy: { createdAt: 'desc' }, // Sorter etter dato (nyest først)
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
                }
            }
        });
    
        return posts.map(post => new Post(post));
    }
    
    
}


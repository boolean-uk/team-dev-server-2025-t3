import dbClient from '../utils/dbClient';

export class Comment {
  // Opprett en ny kommentar
  static async createComment(content: string, postId: number, authorId: number) {
    return await dbClient.comment.create({
      data: {
        content,
        postId,
        authorId
      }
    });
  }

  // Hent en kommentar basert på ID
  static async getCommentById(commentId: number) {
    return await dbClient.comment.findUnique({
      where: { id: commentId },
      include: { author: true, post: true }
    });
  }

  // Hent alle kommentarer for en bestemt post
  static async getCommentsByPost(postId: number) {
    return await dbClient.comment.findMany({
      where: { postId },
      include: { author: true }
    });
  }

  // Oppdater en kommentar
  static async updateComment(commentId: number, content: string) {
    return await dbClient.comment.update({
      where: { id: commentId },
      data: { content }
    });
  }
    // Hent alle kommentarer fra en bestemt bruker
    static async getCommentsByUser(userId: number) {
        return await dbClient.comment.findMany({
          where: { authorId: userId },
          include: { post: true }
        });
      }

       // Hent alle kommentarer fra en bestemt bruker
       static async getAllComments() {
        return await dbClient.comment.findMany({
          include: { post: true }
        });
      }


  // Slett en kommentar
  static async deleteComment(commentId: number) {
    return await dbClient.comment.delete({
      where: { id: commentId }
    });
  }
}




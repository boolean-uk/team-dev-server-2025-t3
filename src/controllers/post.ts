import { sendDataResponse } from '../utils/responses.js';
import Post from '../domain/post.ts';

export const create = async (req, res) => {
  try {
    const { content } = req.body;

    // Ensure content is provided
    if (!content) {
      return sendDataResponse(res, 400, { error: 'Content is required' });
    }

    // Now, you can directly access req.user.id
    const userId = req.user.id; // Automatically get userId from authenticated user

    // Call createPost method in Post class with the userId
    const newPost = await Post.createPost(content, userId);

    return sendDataResponse(res, 201, { post: newPost.toJSON() });
  } catch (error) {
    return sendDataResponse(res, 500, { error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    // Kaller findAll-metoden i Post-klassen
    const posts = await Post.findAll();
    return sendDataResponse(res, 200, { posts: posts.map(post => post.toJSON()) });
  } catch (error) {
    return sendDataResponse(res, 500, { error: error.message });
  }
};

export const getAllSortedByDate = async (req, res) => {
  try {
    const posts = await Post.findAllSortedByDate();
    
    if (!posts.length) {
      return sendDataResponse(res, 200, { message: 'No posts found', posts: [] });
    }

    return sendDataResponse(res, 200, { posts: posts.map(post => post.toJSON()) });
  } catch (error) {
    console.error('Error in getAllSortedByDate:', error);
    return sendDataResponse(res, 500, { error: error.message });
  }

};

/**
 * Oppdaterer en post basert på ID
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return sendDataResponse(res, 400, { error: 'Content is required' });
    }

    const updatedPost = await Post.updatePost(Number(id), content);
    
    return sendDataResponse(res, 200, { post: updatedPost.toJSON() });
  } catch (error) {
    console.error('Error in update:', error);
    return sendDataResponse(res, 500, { error: error.message });
  }
};
/**
* Sletter en post basert på ID
*/
export const remove = async (req, res) => {
try {
const { id } = req.params;

await Post.deletePost(Number(id));

return sendDataResponse(res, 200, { message: 'Post deleted successfully' });
} catch (error) {
console.error('Error in remove:', error);
return sendDataResponse(res, 500, { error: error.message });
}
};
export const getAllByUserSorted = async (req, res) => {
  try {
      const userId = req.user.id; // Hent userId fra autentisert bruker

      const posts = await Post.findAllByUserSortedByDate(userId);

      if (!posts.length) {
          return sendDataResponse(res, 200, { message: 'No posts found', posts: [] });
      }

      return sendDataResponse(res, 200, { posts: posts.map(post => post.toJSON()) });
  } catch (error) {
      console.error('Error in getAllByUserSorted:', error);
      return sendDataResponse(res, 500, { error: error.message });
  }
};





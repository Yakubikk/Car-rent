import api from './index';
import type { Post, Comment } from '@/types';

export const createPost = async (data: FormData): Promise<{ message: string; post: Post }> => {
  return api.post('/posts', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getClassPosts = async (classId: string): Promise<Post[]> => {
  return api.get(`/posts/class/${classId}`);
};

export const getPostById = async (id: string): Promise<Post> => {
  return api.get(`/posts/${id}`);
};

export const updatePost = async (id: string, data: { title?: string; content: string }): Promise<{ message: string; post: Post }> => {
  return api.put(`/posts/${id}`, data);
};

export const deletePost = async (id: string): Promise<{ message: string }> => {
  return api.delete(`/posts/${id}`);
};

export const addComment = async (postId: string, content: string): Promise<{ message: string; comment: Comment }> => {
  return api.post(`/posts/${postId}/comments`, { content });
};

export const updateComment = async (id: string, content: string): Promise<{ message: string; comment: Comment }> => {
  return api.put(`/posts/comments/${id}`, { content });
};

export const deleteComment = async (id: string): Promise<{ message: string }> => {
  return api.delete(`/posts/comments/${id}`);
};

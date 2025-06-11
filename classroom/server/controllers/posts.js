import { PrismaClient } from '../../src/generated/prisma/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Create a new post
export const createPost = async (req, res, next) => {
  try {
    const { title, content, classId } = req.body;
    const authorId = req.user.id;
    
    // Check if the class exists
    const classData = await prisma.class.findUnique({
      where: { id: classId }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user is a member of the class
    const isOwner = classData.ownerId === authorId;
    const isAdmin = req.user.role === 'ADMIN';
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId: authorId,
          classId
        }
      }
    });
    
    if (!isOwner && !isAdmin && !isEnrolled) {
      return res.status(403).json({ message: 'You are not a member of this class' });
    }
    
    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        classId,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Handle file attachments if any
    const files = req.files;
    
    if (files && files.length > 0) {
      const attachmentPromises = files.map(async (file) => {
        return prisma.postAttachment.create({
          data: {
            filename: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype,
            postId: post.id
          }
        });
      });
      
      const attachments = await Promise.all(attachmentPromises);
      post.attachments = attachments;
    } else {
      post.attachments = [];
    }
    
    // Notify class members via socket.io
    req.io?.to(`class-${classId}`).emit('post-created', {
      postId: post.id,
      classId,
      author: post.author,
      title: post.title
    });
    
    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

// Get all posts for a class
export const getClassPosts = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    
    // Check if the class exists
    const classData = await prisma.class.findUnique({
      where: { id: classId }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user is a member of the class
    const isOwner = classData.ownerId === userId;
    const isAdmin = req.user.role === 'ADMIN';
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId,
          classId
        }
      }
    });
    
    if (!isOwner && !isAdmin && !isEnrolled) {
      return res.status(403).json({ message: 'You are not a member of this class' });
    }
    
    // Get posts
    const posts = await prisma.post.findMany({
      where: {
        classId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        attachments: true,
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// Get a post by ID
export const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the post
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        class: true
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is a member of the class
    const isOwner = post.class.ownerId === userId;
    const isAdmin = req.user.role === 'ADMIN';
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId,
          classId: post.classId
        }
      }
    });
    
    if (!isOwner && !isAdmin && !isEnrolled) {
      return res.status(403).json({ message: 'You are not a member of this class' });
    }
    
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// Update a post
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;
    
    // Find the post
    const post = await prisma.post.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is authorized to update
    const isAuthor = post.authorId === userId;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this post' });
    }
    
    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content
      }
    });
    
    // Notify class members via socket.io
    req.io?.to(`class-${post.classId}`).emit('post-updated', {
      postId: id,
      classId: post.classId
    });
    
    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

// Delete a post
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the post
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        attachments: true,
        class: true
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is authorized to delete
    const isAuthor = post.authorId === userId;
    const isClassOwner = post.class.ownerId === userId;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isAuthor && !isClassOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }
    
    // Delete post files from disk
    if (post.attachments.length > 0) {
      for (const attachment of post.attachments) {
        const filePath = path.join(uploadsDir, path.basename(attachment.fileUrl));
        try {
          await fs.access(filePath);
          await fs.unlink(filePath);
        } catch (err) {
          console.error(`Failed to delete file ${filePath}:`, err);
        }
      }
    }
    
    // Delete the post
    await prisma.post.delete({
      where: { id }
    });
    
    // Notify class members via socket.io
    req.io?.to(`class-${post.classId}`).emit('post-deleted', {
      postId: id,
      classId: post.classId
    });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Add a comment to a post
export const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;
    
    // Find the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        class: true
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is a member of the class
    const isOwner = post.class.ownerId === authorId;
    const isAdmin = req.user.role === 'ADMIN';
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId: authorId,
          classId: post.classId
        }
      }
    });
    
    if (!isOwner && !isAdmin && !isEnrolled) {
      return res.status(403).json({ message: 'You are not a member of this class' });
    }
    
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Notify class members via socket.io
    req.io?.to(`class-${post.classId}`).emit('comment-added', {
      commentId: comment.id,
      postId,
      author: comment.author
    });
    
    // Also notify the post author if different from comment author
    if (post.authorId !== authorId) {
      req.io?.to(`user-${post.authorId}`).emit('post-commented', {
        commentId: comment.id,
        postId,
        author: comment.author
      });
    }
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    next(error);
  }
};

// Update a comment
export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: true
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is authorized to update
    const isAuthor = comment.authorId === userId;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this comment' });
    }
    
    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content
      }
    });
    
    // Notify class members via socket.io
    req.io?.to(`class-${comment.post.classId}`).emit('comment-updated', {
      commentId: id,
      postId: comment.postId
    });
    
    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    next(error);
  }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          include: {
            class: true
          }
        }
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is authorized to delete
    const isAuthor = comment.authorId === userId;
    const isPostAuthor = comment.post.authorId === userId;
    const isClassOwner = comment.post.class.ownerId === userId;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isAuthor && !isPostAuthor && !isClassOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }
    
    // Delete the comment
    await prisma.comment.delete({
      where: { id }
    });
    
    // Notify class members via socket.io
    req.io?.to(`class-${comment.post.classId}`).emit('comment-deleted', {
      commentId: id,
      postId: comment.postId
    });
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

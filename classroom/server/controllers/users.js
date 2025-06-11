import { PrismaClient } from '../../src/generated/prisma/index.js';

const prisma = new PrismaClient();

// Get all users (for admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current user is authorized to update
    const isAdmin = req.user.role === 'ADMIN';
    const isSelf = req.user.id === id;
    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    // Only admin can change roles
    const updateData = {
      name,
      email
    };
    
    if (isAdmin && role) {
      updateData.role = role;
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {  try {
    const userId = req.user.id;

    console.log(req.body);
    
    // Get form fields from req.body (ensure req.body exists)
    const body = req.body || {};
    const bio = body.bio || '';
    const phone = body.phone || '';
    
    // Get avatar file path if uploaded
    let avatar = undefined;
    if (req.file) {
      // Use relative path for storage in database
      avatar = `/uploads/avatars/${req.file.filename}`;
    }
    
    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(avatar !== undefined && { avatar }),
        bio,
        phone
      },
      create: {
        userId,
        avatar: avatar || '',
        bio,
        phone
      }
    });
    
    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only or self)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current user is authorized to delete
    const isAdmin = req.user.role === 'ADMIN';
    const isSelf = req.user.id === id;
    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

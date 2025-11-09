import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prismaClient.js';
import { AuthRequest } from '../types/index.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import { Role } from '@prisma/client';

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role;

    // Only admins and managers can view all users
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new ForbiddenError('Access denied');
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            leads: true,
            activities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    // Only admins and managers can view user details
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new ForbiddenError('Access denied');
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        leads: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            leads: true,
            activities: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const { name, email, role, password } = req.body;

    // Only admins can update users
    if (userRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied. Only admins can update users.');
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: parseInt(id) },
        },
      });

      if (emailExists) {
        throw new ValidationError('Email already taken by another user');
      }

      updateData.email = email;
    }
    if (role) {
      if (!Object.values(Role).includes(role)) {
        throw new ValidationError('Invalid role');
      }
      updateData.role = role;
    }
    if (password) {
      if (password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters');
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only admins can delete users
    if (userRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied. Only admins can delete users.');
    }

    // Prevent self-deletion
    if (parseInt(id) === userId) {
      throw new ValidationError('You cannot delete your own account');
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const { email, name, password, role } = req.body;

    // Only admins can create users
    if (userRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied. Only admins can create users.');
    }

    if (!email || !name || !password) {
      throw new ValidationError('Email, name, and password are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || Role.SALES_EXEC,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

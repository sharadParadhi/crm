import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// All routes require admin or manager role
router.get('/', authorize(Role.ADMIN, Role.MANAGER), getUsers);
router.get('/:id', authorize(Role.ADMIN, Role.MANAGER), getUser);

// Create, update, delete require admin role
router.post('/', authorize(Role.ADMIN), createUser);
router.put('/:id', authorize(Role.ADMIN), updateUser);
router.delete('/:id', authorize(Role.ADMIN), deleteUser);

export default router;

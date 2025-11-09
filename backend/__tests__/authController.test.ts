import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { register, login } from '../controllers/authController.js';
import { prisma } from '../prismaClient.js';

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test@',
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test@',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
          role: 'SALES_EXEC',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'test@example.com',
              name: 'Test User',
            }),
            token: expect.any(String),
          }),
        })
      );
    });

    it('should reject duplicate email', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          name: 'Test User 2',
          password: 'password123',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User with this email already exists',
        })
      );
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      } as any;

      const res = {
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      await login(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'test@example.com',
            }),
            token: expect.any(String),
          }),
        })
      );
    });

    it('should reject invalid credentials', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      } as any;

      const res = {
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials',
        })
      );
    });
  });
});

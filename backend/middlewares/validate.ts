import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.js';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const messages = error.details.map((detail: any) => detail.message).join(', ');
      next(new ValidationError(messages));
      return;
    }
    
    next();
  };
};

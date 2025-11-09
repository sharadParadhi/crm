import { Router } from 'express';
import {
  getActivities,
  getActivity,
  createActivity,
} from '../controllers/activityController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getActivities);
router.get('/:id', getActivity);
router.post('/', createActivity);

export default router;

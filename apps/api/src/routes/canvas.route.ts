import express from 'express';
import { isLoggedIn } from '@/middleware/isUserLoggedIn';
import { 
  createCanvas, 
  getCanvasByIdOrCreate, 
  updateCanvasSnapshot,
  getAllCanvasesByCommunity
} from '@/controllers/canvas.controller';

const router = express.Router();

// Create a new canvas
router.post('/', isLoggedIn, createCanvas);

// Get or create a canvas by ID
router.get('/:id', isLoggedIn, getCanvasByIdOrCreate);

// Update canvas snapshot
router.put('/:id/snapshot', isLoggedIn, updateCanvasSnapshot);

// Get all canvases for a community
router.get('/community/:communityId', isLoggedIn, getAllCanvasesByCommunity);

export default router; 
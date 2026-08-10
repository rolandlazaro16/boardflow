import express, { Request, Response } from 'express';
import { BookRequest } from '../models/BookRequest';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Create a new request
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId } = req.body;
    const userId = (req as any).user.id;

    // Check if request already exists and is pending or approved
    const existingReq = await BookRequest.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingReq) {
      res.status(400).json({ message: 'Request already exists' });
      return;
    }

    const newRequest = new BookRequest({
      user: userId,
      book: bookId
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own requests
router.get('/my-requests', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const requests = await BookRequest.find({ user: userId }).populate('book');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all requests
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const requests = await BookRequest.find().populate('user', 'firstName lastName email').populate('book');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Approve or Reject a request
router.put('/:id/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const { status } = req.body;
    const bookRequest = await BookRequest.findById(req.params.id);

    if (!bookRequest) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    bookRequest.status = status;
    if (status === 'approved') {
      bookRequest.borrowDate = new Date();
    }

    await bookRequest.save();
    res.json(bookRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark as returned (can be done by admin or user, let's say user can return it)
router.put('/:id/return', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const bookRequest = await BookRequest.findById(req.params.id);

    if (!bookRequest) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    // Optional: check if the user returning it is the owner or admin
    if (bookRequest.user.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (bookRequest.status === 'approved') {
      bookRequest.returnDate = new Date();
      await bookRequest.save();
    }

    res.json(bookRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete a request
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const bookRequest = await BookRequest.findByIdAndDelete(req.params.id);

    if (!bookRequest) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

import express, { Request, Response } from 'express';
import { Book } from '../models/Book';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin only route to add a book (for testing purposes)
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const { title, author, description, pdfUrl } = req.body;
    const book = new Book({ title, author, description, pdfUrl });
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin only route to delete a book
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

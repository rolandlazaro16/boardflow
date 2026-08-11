import express, { Request, Response } from 'express';
import { Book } from '../models/Book';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const pdfParse = require('pdf-parse');

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!') as any, false);
    }
  }
});

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
    const { title, author, description, pdfUrl, coverImage, categories } = req.body;
    const book = new Book({ title, author, description, pdfUrl, coverImage, categories });
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

// Admin only route to upload a PDF book and extract details
router.post('/upload', authMiddleware, (req: Request, res: Response, next) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Error uploading file' });
    }
    next();
  });
}, async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'Please upload a PDF file.' });
      return;
    }

    const fileUrl = `/public/uploads/${req.file.filename}`;
    const filePath = req.file.path;

    // Parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    let title = '';
    let author = '';
    let description = '';
    let categoriesList: string[] = [];

    try {
      const pdfData = await pdfParse(dataBuffer);
      title = pdfData.info?.Title || '';
      author = pdfData.info?.Author || '';

      const text = pdfData.text || '';
      const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

      if (lines.length > 0) {
        if (!title) {
          title = lines[0];
        }
        if (!author && lines.length > 1) {
          const secondLine = lines[1];
          if (/^by\s+/i.test(secondLine)) {
            author = secondLine.replace(/^by\s+/i, '');
          } else {
            author = secondLine;
          }
        }
        if (lines.length > 2) {
          description = lines.slice(2, 6).join(' ');
        }
      }

      // Generate description from text if still empty
      if (!description && text) {
        const cleanText = text.replace(/\s+/g, ' ').trim();
        if (cleanText.length > 250) {
          description = cleanText.substring(0, 247) + '...';
        } else {
          description = cleanText;
        }
      }

      // Recommend categories based on keywords
      const lowerText = text.toLowerCase();
      const categoryKeywords: { [key: string]: string[] } = {
        'Fantasy': ['magic', 'wizard', 'witch', 'elf', 'dragon', 'fantasy', 'castle'],
        'Romance': ['love', 'romance', 'marriage', 'husband', 'wife', 'darling', 'lover'],
        'Adventure': ['adventure', 'sea', 'ship', 'island', 'voyage', 'captain', 'journey'],
        'Psychological': ['mind', 'heart', 'feeling', 'soul', 'psychological', 'thought'],
        'Classics': ['classic', 'novel', 'history', 'society']
      };

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          categoriesList.push(category);
        }
      }
    } catch (parseError) {
      console.error('Failed to parse PDF metadata:', parseError);
    }

    if (categoriesList.length === 0) {
      categoriesList.push('General');
    }

    // Default high-quality placeholder cover image
    const coverImage = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400';

    res.json({
      pdfUrl: fileUrl,
      title: title || path.basename(req.file.originalname, '.pdf'),
      author: author || 'Unknown Author',
      description: description || 'No description available.',
      coverImage,
      categories: categoriesList.join(', ')
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error during upload' });
  }
});

export default router;

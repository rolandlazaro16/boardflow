import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

import path from 'path';
// Serve static files from the 'public' directory
const serveStaticOptions = {
  setHeaders: (res: any, filePath: string) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
};
app.use('/public', express.static(path.join(__dirname, '../public'), serveStaticOptions));
app.use('/api/public', express.static(path.join(__dirname, '../public'), serveStaticOptions));

import authRoutes from './routes/auth';
import bookRoutes from './routes/books';
import requestRoutes from './routes/requests';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/requests', requestRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('BoardFlow API is running!');
});

// Database Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/boardflow';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

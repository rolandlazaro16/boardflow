import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  pdfUrl: { type: String }
});

export const Book = mongoose.model('Book', bookSchema);

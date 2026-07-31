import mongoose from 'mongoose';

const bookRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  borrowDate: { type: Date },
  returnDate: { type: Date }
}, { timestamps: true });

export const BookRequest = mongoose.model('BookRequest', bookRequestSchema);

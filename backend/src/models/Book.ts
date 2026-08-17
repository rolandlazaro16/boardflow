import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  pdfUrl: { type: String },
  coverImage: { type: String },
  categories: [{ type: String }],
  bookNumber: { type: String, unique: true }
});

bookSchema.pre('save', async function(next) {
  if (!this.bookNumber) {
    try {
      const BookModel = this.constructor as mongoose.Model<any>;
      const lastBook = await BookModel.findOne({}, {}, { sort: { bookNumber: -1 } });
      let nextNum = 1001;
      if (lastBook && lastBook.bookNumber) {
        const match = lastBook.bookNumber.match(/BF-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
      this.bookNumber = `BF-${nextNum}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

export const Book = mongoose.model('Book', bookSchema);

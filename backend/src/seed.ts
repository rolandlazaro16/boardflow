import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Book } from './models/Book';

dotenv.config();

const sampleBooks = [
  {
    bookNumber: 'BF-1001',
    title: 'The Little Lady of the Big House',
    author: 'Jack London',
    description: 'A novel by American writer Jack London, his last to be published during his lifetime.',
    pdfUrl: '/public/sample1.pdf',
    coverImage: 'https://covers.openlibrary.org/b/id/8282337-M.jpg',
    categories: ['Psychological', 'Romance']
  },
  {
    bookNumber: 'BF-1002',
    title: 'The Wonderful Wizard of Oz',
    author: 'Lyman Frank Baum',
    description: 'An American children\'s novel originally published in 1900.',
    pdfUrl: '/public/sample2.pdf',
    coverImage: 'https://covers.openlibrary.org/b/id/12818862-M.jpg',
    categories: ['Fantasy', 'Fantasy & Magic']
  },
  {
    bookNumber: 'BF-1003',
    title: 'Peter and Wendy',
    author: 'James Mathew Barrie',
    description: 'The story of Peter Pan, a mischievous little boy who can fly.',
    pdfUrl: '/public/sample3.pdf',
    coverImage: 'https://covers.openlibrary.org/b/id/10543291-M.jpg',
    categories: ['Fantasy', 'Fairy Tales & Folklore', 'Fantasy & Magic']
  },
  {
    bookNumber: 'BF-1004',
    title: 'Anna Karenina',
    author: 'Graf Leo Tolstoy',
    description: 'A novel by the Russian writer Leo Tolstoy, published in serial installments.',
    pdfUrl: '/public/sample1.pdf',
    coverImage: 'https://covers.openlibrary.org/b/id/12560867-M.jpg',
    categories: ['Classics', 'Literary', 'Psychological', 'Romance', 'Social Life']
  },
  {
    bookNumber: 'BF-1005',
    title: 'The Sea Wolf',
    author: 'Jack London',
    description: 'An adventure novel by Jack London about a literary critic who survives a collision.',
    pdfUrl: '/public/sample2.pdf',
    coverImage: 'https://covers.openlibrary.org/b/id/8443388-M.jpg',
    categories: ['Action & Adventure', 'Sea Stories']
  },
  {
    bookNumber: 'BF-1006',
    title: 'Jane Eyre',
    author: 'Charlotte Bronte',
    description: 'A novel by English writer Charlotte Brontë, published under the pen name Currer Bell.',
    pdfUrl: '/public/sample3.pdf',
    coverImage: 'https://covers.openlibrary.org/b/id/12562417-M.jpg',
    categories: ['Psychological', 'Gothic', 'Biographical', 'Stories For Girls']
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/boardflow';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding');

    // Nuke existing books so we get the clean new list
    await Book.deleteMany({});
    console.log('Cleared existing books');

    await Book.insertMany(sampleBooks);
    console.log('Sample books inserted successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();

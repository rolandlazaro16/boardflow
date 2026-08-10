'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../utils/api';
import styles from './page.module.css';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  pdfUrl: string;
  coverImage?: string;
  categories?: string[];
}

interface BookRequest {
  _id: string;
  book: Book;
  status: string;
  borrowDate?: string;
  returnDate?: string;
}

export default function UserDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/register');
      return;
    }
    
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'user') {
      router.push('/admin');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [booksData, requestsData] = await Promise.all([
        fetchWithAuth('/books'),
        fetchWithAuth('/requests/my-requests')
      ]);
      setBooks(booksData);
      setRequests(requestsData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestBook = async (bookId: string) => {
    try {
      await fetchWithAuth('/requests', {
        method: 'POST',
        body: JSON.stringify({ bookId })
      });
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleReturn = async (requestId: string) => {
    try {
      await fetchWithAuth(`/requests/${requestId}/return`, {
        method: 'PUT'
      });
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.categories && book.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Dashboard</h1>
        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>My Requests</h2>
        <div className={styles.requestsGrid}>
          {requests.map(req => (
            <div key={req._id} className={styles.requestCard}>
              <h3 className={styles.bookTitle}>{req.book.title}</h3>
              <p className={styles.bookAuthor}>by {req.book.author}</p>
              <p>Status: <span className={req.status === 'approved' ? styles.statusApproved : req.status === 'rejected' ? styles.statusRejected : styles.statusPending}>{req.status.toUpperCase()}</span></p>
              {req.borrowDate && <p>Borrowed: {new Date(req.borrowDate).toLocaleString()}</p>}
              {req.returnDate && <p>Returned: {new Date(req.returnDate).toLocaleString()}</p>}
              
              {req.status === 'approved' && !req.returnDate && (
                <div className={styles.actionButtons}>
                  <a href={`http://localhost:5000${req.book.pdfUrl}`} target="_blank" rel="noreferrer" className={styles.readButton}>Read PDF</a>
                  <a href={`http://localhost:5000${req.book.pdfUrl}`} download className={styles.downloadButton}>Download</a>
                  <button className={styles.button} onClick={() => handleReturn(req._id)}>Return Book</button>
                </div>
              )}
            </div>
          ))}
          {requests.length === 0 && <p>You have no book requests.</p>}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.searchBarContainer}>
          <input 
            type="text" 
            placeholder="Search" 
            className={styles.searchBar} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles.searchButton}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.colItem}>ITEM</div>
            <div className={styles.colCategory}>CATEGORY</div>
            <div className={styles.colAuthor}>AUTHOR</div>
            <div className={styles.colAction}>ACTION</div>
          </div>
          <div className={styles.tableBody}>
            {filteredBooks.map(book => {
              const hasRequested = requests.some(r => r.book._id === book._id && !r.returnDate && r.status !== 'rejected');
              return (
                <div key={book._id} className={styles.tableRow}>
                  <div className={styles.colItemVal}>
                    {book.coverImage && (
                      <img src={book.coverImage} alt={book.title} className={styles.coverImage} />
                    )}
                    <span className={styles.tableBookTitle}>{book.title}</span>
                  </div>
                  <div className={styles.colCategoryVal}>
                    {book.categories && book.categories.map((cat, idx) => (
                      <span key={idx} className={styles.categoryBadge}>{cat}</span>
                    ))}
                  </div>
                  <div className={styles.colAuthorVal}>{book.author}</div>
                  <div className={styles.colActionVal}>
                    <button 
                      className={styles.requestButton} 
                      onClick={() => handleRequestBook(book._id)}
                      disabled={hasRequested}
                    >
                      {hasRequested ? 'Requested' : 'Request'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

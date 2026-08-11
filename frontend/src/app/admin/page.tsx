'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../utils/api';
import styles from './page.module.css';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  pdfUrl?: string;
  coverImage?: string;
  categories?: string[];
}

interface BookRequest {
  _id: string;
  user: User;
  book: Book;
  status: string;
  borrowDate?: string;
  returnDate?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  
  // Add book form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categories, setCategories] = useState('');
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/register');
      return;
    }
    
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'admin') {
      router.push('/user');
      return;
    }

    loadRequests();
    loadBooks();
  }, [router]);

  const loadRequests = async () => {
    try {
      const data = await fetchWithAuth('/requests');
      setRequests(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadBooks = async () => {
    try {
      const data = await fetchWithAuth('/books');
      setBooks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchWithAuth(`/requests/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadRequests();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await fetchWithAuth(`/requests/${id}`, {
        method: 'DELETE'
      });
      loadRequests();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/books/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        let errMsg = 'Upload failed';
        try {
          const errData = await response.json();
          errMsg = errData.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setTitle(data.title || '');
      setAuthor(data.author || '');
      setDescription(data.description || '');
      setPdfUrl(data.pdfUrl || '');
    } catch (error: any) {
      alert('Error uploading PDF: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoriesArray = categories.split(',').map(c => c.trim()).filter(Boolean);
      await fetchWithAuth('/books', {
        method: 'POST',
        body: JSON.stringify({
          title,
          author,
          description,
          pdfUrl,
          coverImage,
          categories: categoriesArray
        })
      });
      setTitle('');
      setAuthor('');
      setDescription('');
      setPdfUrl('');
      setCoverImage('');
      setCategories('');
      loadBooks();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await fetchWithAuth(`/books/${id}`, {
        method: 'DELETE'
      });
      loadBooks();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>All Book Requests</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Book</th>
              <th>Status</th>
              <th>Requested On</th>
              <th>Borrowed On</th>
              <th>Returned On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>{req.user?.firstName} {req.user?.lastName} ({req.user?.email})</td>
                <td>{req.book?.title}</td>
                <td className={
                  req.status === 'approved' ? styles.statusApproved : 
                  req.status === 'rejected' ? styles.statusRejected : styles.statusPending
                }>
                  {req.status.toUpperCase()}
                </td>
                <td>{new Date(req.createdAt).toLocaleString()}</td>
                <td>{req.borrowDate ? new Date(req.borrowDate).toLocaleString() : '-'}</td>
                <td>{req.returnDate ? new Date(req.returnDate).toLocaleString() : '-'}</td>
                <td>
                  <div className={styles.actionButtonsContainer}>
                    {req.status === 'pending' && (
                      <>
                        <button className={styles.button} onClick={() => updateStatus(req._id, 'approved')}>Approve</button>
                        <button className={styles.rejectButton} onClick={() => updateStatus(req._id, 'rejected')}>Reject</button>
                      </>
                    )}
                    <button className={styles.deleteButton} onClick={() => deleteRequest(req._id)} title="Delete Request">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <p style={{ marginTop: '1rem' }}>No requests found.</p>}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Books Management</h2>
        <div className={styles.grid}>
          {/* Books List */}
          <div className={styles.card}>
            <h3 style={{ marginBottom: '1rem' }}>All Books</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>
                      <button className={styles.deleteButton} onClick={() => handleDeleteBook(book._id)} title="Delete Book">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {books.length === 0 && <p style={{ marginTop: '1rem' }}>No books found.</p>}
          </div>

          {/* Add Book Form */}
          <div className={styles.card}>
            <h3 style={{ marginBottom: '1rem' }}>Add New Book</h3>
            <form onSubmit={handleAddBook}>
              <div className={styles.formGroup} style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <label className={styles.label} style={{ fontWeight: 'bold' }}>Upload PDF File (Auto-fills form fields)</label>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileUpload} 
                  style={{ display: 'block', marginTop: '0.5rem' }} 
                />
                {uploading && <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>Uploading and analyzing PDF...</p>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input className={styles.input} type="text" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Author</label>
                <input className={styles.input} type="text" value={author} onChange={e => setAuthor(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>PDF URL (e.g. /public/sample1.pdf)</label>
                <input className={styles.input} type="text" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Cover Image URL</label>
                <input className={styles.input} type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Categories (comma separated)</label>
                <input className={styles.input} type="text" value={categories} onChange={e => setCategories(e.target.value)} placeholder="Fantasy, Romance" />
              </div>
              <button className={styles.button} type="submit" style={{ width: '100%', marginTop: '1rem' }}>Add Book</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

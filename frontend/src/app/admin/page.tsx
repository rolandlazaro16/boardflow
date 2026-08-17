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
  bookNumber?: string;
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
  const [bookNumber, setBookNumber] = useState('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
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

  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.body.appendChild(script);
    });
  };

  const renderPdfCover = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to get 2D context');

      const scale = 400 / viewport.width;
      const scaledViewport = page.getViewport({ scale });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise;

      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Error rendering PDF cover:', err);
      return 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const generatedCover = await renderPdfCover(file);

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
      setCoverImage(generatedCover || data.coverImage || '');
      setCategories(data.categories || '');
    } catch (error: any) {
      alert('Error uploading PDF: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const startEditBook = (book: Book) => {
    setEditingBookId(book._id);
    setTitle(book.title);
    setAuthor(book.author);
    setDescription(book.description || '');
    setPdfUrl(book.pdfUrl || '');
    setCoverImage(book.coverImage || '');
    setCategories(book.categories ? book.categories.join(', ') : '');
    setBookNumber(book.bookNumber || '');
  };

  const cancelEditBook = () => {
    setEditingBookId(null);
    setTitle('');
    setAuthor('');
    setDescription('');
    setPdfUrl('');
    setCoverImage('');
    setCategories('');
    setBookNumber('');
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoriesArray = categories.split(',').map(c => c.trim()).filter(Boolean);
      const payload = {
        title,
        author,
        description,
        pdfUrl,
        coverImage,
        categories: categoriesArray,
        bookNumber: bookNumber || undefined
      };

      if (editingBookId) {
        await fetchWithAuth(`/books/${editingBookId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setEditingBookId(null);
      } else {
        await fetchWithAuth('/books', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      setTitle('');
      setAuthor('');
      setDescription('');
      setPdfUrl('');
      setCoverImage('');
      setCategories('');
      setBookNumber('');
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
                <td data-label="User">{req.user?.firstName} {req.user?.lastName} ({req.user?.email})</td>
                <td data-label="Book">{req.book?.title}</td>
                <td data-label="Status" className={
                  req.status === 'approved' ? styles.statusApproved : 
                  req.status === 'rejected' ? styles.statusRejected : styles.statusPending
                }>
                  {req.status.toUpperCase()}
                </td>
                <td data-label="Requested On">{new Date(req.createdAt).toLocaleString()}</td>
                <td data-label="Borrowed On">{req.borrowDate ? new Date(req.borrowDate).toLocaleString() : '-'}</td>
                <td data-label="Returned On">{req.returnDate ? new Date(req.returnDate).toLocaleString() : '-'}</td>
                <td data-label="Actions">
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
                  <th>Number</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id}>
                    <td data-label="Number"><span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{book.bookNumber || 'N/A'}</span></td>
                    <td data-label="Title">{book.title}</td>
                    <td data-label="Author">{book.author}</td>
                    <td data-label="Actions">
                      <button 
                        className={styles.button} 
                        onClick={() => startEditBook(book)} 
                        title="Edit Book"
                        style={{ padding: '0.4rem', borderRadius: '8px', marginRight: '0.25rem', backgroundColor: '#3b82f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                      </button>
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
            <h3 style={{ marginBottom: '1rem' }}>{editingBookId ? 'Edit Book' : 'Add New Book'}</h3>
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
                <label className={styles.label}>Book Number (e.g. BF-1007, optional)</label>
                <input className={styles.input} type="text" value={bookNumber} onChange={e => setBookNumber(e.target.value)} placeholder="Auto-generated if empty" />
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
              <button className={styles.button} type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                {editingBookId ? 'Save Changes' : 'Add Book'}
              </button>
              {editingBookId && (
                <button 
                  className={styles.rejectButton} 
                  type="button" 
                  onClick={cancelEditBook} 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

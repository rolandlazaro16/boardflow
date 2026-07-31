'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../utils/api';
import styles from './page.module.css';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Book {
  _id: string;
  title: string;
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
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'admin') {
      router.push('/user');
      return;
    }

    loadRequests();
  }, [router]);

  const loadRequests = async () => {
    try {
      const data = await fetchWithAuth('/requests');
      setRequests(data);
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
                <td>{req.user?.username} ({req.user?.email})</td>
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
                  {req.status === 'pending' && (
                    <>
                      <button className={styles.button} onClick={() => updateStatus(req._id, 'approved')}>Approve</button>
                      <button className={styles.rejectButton} onClick={() => updateStatus(req._id, 'rejected')}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <p style={{ marginTop: '1rem' }}>No requests found.</p>}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, middleName, lastName, dateOfBirth, contact, email, password, role }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Register</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label className={styles.label}>First Name</label>
            <input className={styles.input} type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Middle Name</label>
            <input className={styles.input} type="text" value={middleName} onChange={e => setMiddleName(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Last Name</label>
            <input className={styles.input} type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Date of Birth</label>
            <input className={styles.input} type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Contact</label>
            <input className={styles.input} type="text" value={contact} onChange={e => setContact(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Role</label>
            <select className={styles.input} value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className={styles.button} type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

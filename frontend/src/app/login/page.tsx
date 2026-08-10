'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}. The backend might be offline.`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Expected JSON but received an invalid format from the server.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user && data.user.role === 'admin') {
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
        <div className={styles.logoContainer}>
          {/* Green Stacked Books SVG Logo */}
          <svg className={styles.logoSvg} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Book 3 (back) */}
            <path d="M7 3h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7" opacity="0.5" />
            {/* Book 2 (middle) */}
            <path d="M5 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5" opacity="0.75" />
            {/* Book 1 (front) */}
            <path d="M3 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3" />
            {/* Pages details */}
            <path d="M3 19h10" />
            <path d="M5 17h10" opacity="0.75" />
            <path d="M7 15h10" opacity="0.5" />
          </svg>
          <h1 className={styles.logoText}>ONLIB</h1>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button className={styles.button} type="submit">Login</button>
          
          <div className={styles.registerLinkContainer}>
            <p className={styles.registerText}>
              Don't have an account? <Link href="/register" className={styles.registerLink}>Register Here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

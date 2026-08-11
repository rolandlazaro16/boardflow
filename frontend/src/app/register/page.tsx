'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [contact, setContact] = useState('');
  const [contactTouched, setContactTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const isContactValid = /^\d{10}$/.test(contact);
  let contactErrorText = '';
  if (contact.length > 0 || contactTouched) {
    if (contact.length === 0) {
      contactErrorText = 'Contact is required.';
    } else if (!/^\d+$/.test(contact)) {
      contactErrorText = 'Contact must contain only numbers.';
    } else if (contact.length < 10) {
      contactErrorText = 'Contact must be exactly 10 digits.';
    } else if (contact.length > 10) {
      contactErrorText = 'Contact must be exactly 10 digits.';
    }
  }

  const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  let passwordErrorText = '';
  if (password.length > 0 || passwordTouched) {
    if (password.length === 0) {
      passwordErrorText = 'Password is required.';
    } else if (password.length < 8) {
      passwordErrorText = 'Password must be at least 8 characters long.';
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      passwordErrorText = 'Password must contain both letters and numbers.';
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!/^\d{10}$/.test(contact)) {
      setError('Contact must be exactly 10 digits and contain only numbers.');
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
      setError('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, middleName, lastName, dateOfBirth, contact, email, password, role: 'user' }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (e) {
          // Handle cases where the backend returns an HTML error page (e.g. 502 Bad Gateway or 404)
          errorMessage = `Server error: ${response.status} ${response.statusText}. The backend might be offline.`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        const urlFetched = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`;
        throw new Error(`Expected JSON but received an invalid format. Fetched URL: ${urlFetched}. Status: ${response.status}`);
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
            <input 
              className={`${styles.input} ${contactErrorText ? styles.inputError : ''}`} 
              type="text" 
              inputMode="numeric"
              value={contact} 
              onChange={e => {
                setContact(e.target.value);
              }} 
              onBlur={() => setContactTouched(true)}
              required 
            />
            {contactErrorText && (
              <span style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                {contactErrorText}
              </span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input 
              className={styles.input} 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={!isContactValid}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input 
                className={`${styles.input} ${passwordErrorText ? styles.inputError : ''}`} 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                onBlur={() => setPasswordTouched(true)}
                required 
                disabled={!isContactValid}
              />
              <button 
                type="button" 
                className={styles.togglePasswordButton} 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
            {passwordErrorText && (
              <span style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                {passwordErrorText}
              </span>
            )}
          </div>
          <button className={styles.button} type="submit" disabled={!isContactValid || !isPasswordValid}>Register</button>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#555' }}>
              Already have an account? <Link href="/login" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>Login Here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

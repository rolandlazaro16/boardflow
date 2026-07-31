'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      // User is entering for the first time, redirect to register
      router.push('/register');
    } else {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'user') {
          router.push('/user');
        } else {
          router.push('/client');
        }
      } catch (e) {
        router.push('/register');
      }
    }
  }, [router]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import styles from "../page.module.css"; // Reuse some styles or inline for now

export default function AdminDashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.background} />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>
            Welcome to the admin dashboard. Features coming soon!
          </p>
        </div>
        <Link href="/" style={{ color: 'var(--primary)', marginTop: '2rem', textDecoration: 'underline' }}>
          &larr; Back to Home
        </Link>
      </main>
    </div>
  );
}

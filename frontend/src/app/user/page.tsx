import Link from "next/link";
import styles from "../page.module.css";

export default function UserDashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.background} />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>User Workspace</h1>
          <p className={styles.subtitle}>
            Welcome to the user workspace. Tasks and workflows coming soon!
          </p>
        </div>
        <Link href="/" style={{ color: 'var(--primary)', marginTop: '2rem', textDecoration: 'underline' }}>
          &larr; Back to Home
        </Link>
      </main>
    </div>
  );
}

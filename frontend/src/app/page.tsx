import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.background} />
      
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>BoardFlow</h1>
          <p className={styles.subtitle}>
            Intelligent project management tailored for teams, clients, and administrators. 
            Experience seamless collaboration in a unified workspace.
          </p>
        </div>

        <div className={styles.dashboards}>
          {/* Admin Dashboard Card */}
          <Link href="/admin" className={styles.card}>
            <div className={styles.cardIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Admin Portal</h2>
            <p className={styles.cardDescription}>
              Complete control over your organization. Manage users, oversee all projects, and configure system settings.
            </p>
            <button className={styles.cardButton}>Enter Admin</button>
          </Link>

          {/* User Dashboard Card */}
          <Link href="/user" className={styles.card}>
            <div className={styles.cardIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className={styles.cardTitle}>User Workspace</h2>
            <p className={styles.cardDescription}>
              Your daily command center. Track tasks, collaborate with team members, and manage your assigned workflows.
            </p>
            <button className={styles.cardButton}>Enter Workspace</button>
          </Link>

          {/* Client Dashboard Card */}
          <Link href="/client" className={styles.card}>
            <div className={styles.cardIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Client Hub</h2>
            <p className={styles.cardDescription}>
              A dedicated view for clients to track project progress, review deliverables, and provide timely feedback.
            </p>
            <button className={styles.cardButton}>Enter Hub</button>
          </Link>
        </div>
      </main>
    </div>
  );
}

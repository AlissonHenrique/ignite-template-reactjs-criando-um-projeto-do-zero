import Link from 'next/link';

import styles from './header.module.scss';

export default function Header() {
  return (
    <Link href="/">
      <header className={styles.headerContainer}>
        <div className={styles.heraderContent}>
          <img src="/logo.svg" alt="logo" />
        </div>
      </header>
    </Link>
  );
}

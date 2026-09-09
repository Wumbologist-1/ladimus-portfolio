import Link from "next/link";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import styles from "./site-header.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="Ladimus home">
          <span className={styles.mark} aria-hidden="true">L.</span>
          <span>LADIMUS</span>
        </Link>
        <nav aria-label="Primary">
          <ul className={styles.navigation}>
            {site.navigation.map((item) => (
              <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

import { Container } from "@/components/ui/container";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p><span className={styles.name}>LADIMUS</span> Independent engineering.</p>
        <a href="#main-content">Back to top <span aria-hidden="true">↑</span></a>
      </Container>
    </footer>
  );
}

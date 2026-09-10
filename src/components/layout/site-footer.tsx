import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p><span className={styles.name}>LADIMUS SYSTEM</span> Portfolio Build {site.buildLabel}</p>
        <p>Status: {site.hero.status}</p>
        <a href="#main-content">Back to top <span aria-hidden="true">↑</span></a>
      </Container>
    </footer>
  );
}

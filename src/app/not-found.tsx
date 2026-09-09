import { ActionLink } from "@/components/ui/action-link";
import { Section } from "@/components/ui/section";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <Section aria-labelledby="not-found-title">
      <div className={styles.content}>
        <p className={styles.label}>404 / Page not found</p>
        <h1 id="not-found-title">This route ends here.</h1>
        <p>The page may have moved, or the address may be incorrect.</p>
        <ActionLink href="/" variant="primary">Return home</ActionLink>
      </div>
    </Section>
  );
}

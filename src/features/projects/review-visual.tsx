import styles from "./review-visual.module.css";

export function ReviewVisual() {
  return (
    <figure className={styles.visual} aria-label="Conceptual illustration of validation-oriented review">
      <figcaption className={styles.caption}>Design perspective <span>Conceptual diagram</span></figcaption>
      <div className={styles.field}>
        <div className={styles.orbit} aria-hidden="true" />
        <p className={styles.input}>AI-generated output</p>
        <div className={styles.connection} aria-hidden="true" />
        <div className={styles.core}><span className={styles.symbol} aria-hidden="true">[ / ]</span><strong>Validation</strong><span>Evidence before confidence</span></div>
        <div className={styles.connection} aria-hidden="true" />
        <p className={styles.output}>An informed engineering decision</p>
      </div>
      <p className={styles.foot}>LADIMUS REVIEW <span>Reliability by design</span></p>
    </figure>
  );
}

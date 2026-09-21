import { LivingInterface } from "./living-interface";
import styles from "./ladimus-core.module.css";

export function LadimusCore() {
  return <figure className={styles.core} data-ladimus-core data-signal-surface data-topology-clear data-field-reactive>
    <figcaption className={styles.caption}><strong>LADIMUS CORE</strong><span>Conceptual system</span></figcaption>
    <div className={styles.field} data-living-surface data-signal-surface>
      <LivingInterface identity="core" />
      <svg className={styles.geometry} viewBox="0 0 400 400" aria-hidden="true">
        <defs><linearGradient id="core-metal" x2="1" y2="1"><stop stopColor="#c6d0d5" /><stop offset="0.5" stopColor="#43535e" /><stop offset="1" stopColor="#80dbe8" /></linearGradient></defs>
        <circle cx="200" cy="200" r="156" className={styles.outer} />
        <path d="M200 26V46 M354 200H374 M200 354V374 M26 200H46" />
        <path d="M200 72 A128 128 0 0 1 328 200 M200 328 A128 128 0 0 1 72 200" className={styles.boundary} />
        <path d="M200 92 294 146 294 254 200 308 106 254 106 146Z" className={styles.hex} />
        <path d="M200 92V124 M294 146 266 162 M294 254 266 238 M200 308V276 M106 254 134 238 M106 146 134 162" />
        <path d="M158 161V239H191 M209 239 240 161 M250 161V239" className={styles.mark} />
        <path d="M40 55H68 M40 55V83 M360 317V345H332" />
      </svg>
      <span className={`${styles.gate} ${styles.input}`}>01 / Output</span>
      <span className={`${styles.gate} ${styles.validation}`}>02 / Validate</span>
      <span className={`${styles.gate} ${styles.approval}`}>03 / Approve</span>
      <span className={`${styles.gate} ${styles.authority}`}>04 / Authority</span>
      <span className={styles.center}>ENGINEERING<br />CONTROLS</span>
    </div>
    <p className={styles.foot}>Evidence before confidence.<span>Output → trusted execution</span></p>
  </figure>;
}

import Image from "next/image";
import styles from "./recall.module.css";

export function RecallVisual({hero = false}: {hero?: boolean}) {
  return <figure className={`${styles.visual} ${hero ? styles.heroVisual : ""}`} aria-label="Recall Android QA application capture">
    <div className={styles.visualLabel}><span>RECALL / ANDROID</span><span>Internal QA</span></div>
    <div className={styles.device}>
      <Image src="/images/recall/original-memory-qa.png" width={1080} height={2400}
        sizes={hero ? "(max-width: 640px) 72vw, 280px" : "220px"}
        alt="Actual Recall emulator capture: the Original memory view preserves a screenshot labelled SYNTHETIC QA, with an OCR-complete message."
        preload={hero} />
    </div>
    <figcaption>Actual QA capture · synthetic content · Android emulator<br />
      {hero && <a href="/images/recall/original-memory-qa.png" target="_blank" rel="noopener noreferrer">View full-size capture ↗</a>}
    </figcaption>
  </figure>;
}

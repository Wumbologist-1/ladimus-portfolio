import Image from "next/image";
import {recallScreens, recallScreenPath} from "./screens";
import styles from "./recall.module.css";

export function RecallVisual({hero = false}: {hero?: boolean}) {
  const screen = recallScreens[0];
  return <figure className={`${styles.visual} ${hero ? styles.heroVisual : ""}`} aria-label="Recall Android QA application capture">
    <div className={styles.visualLabel}><span>PROJECT LUMINANCE</span><span>Public QA</span></div>
    <div className={styles.device}>
      <Image src={recallScreenPath(screen.file)} width={1080} height={2400}
        sizes={hero ? "(max-width: 640px) 72vw, 280px" : "220px"}
        alt={screen.alt}
        preload={hero} />
    </div>
    <figcaption>Actual QA capture · synthetic content · Android emulator<br />
      {hero && <a href={recallScreenPath(screen.file)} target="_blank" rel="noopener noreferrer">View full-size Home capture ↗</a>}
    </figcaption>
  </figure>;
}

export function RecallGallery() {
  return <div className={styles.gallery}>
    {recallScreens.slice(1).map(screen => <figure key={screen.id} id={`screen-${screen.id}`} className={styles.screen}>
      <a href={recallScreenPath(screen.file)} target="_blank" rel="noopener noreferrer" className={styles.screenLink} aria-label={`View full-size ${screen.id} capture`}>
        <div className={styles.device}><Image src={recallScreenPath(screen.file)} width={1080} height={2400} sizes="(max-width: 767px) 280px, (max-width: 1023px) 290px, 300px" alt={screen.alt} /></div>
      </a>
      <figcaption><h3>{screen.title}</h3><p>{screen.caption}</p><a href={recallScreenPath(screen.file)} target="_blank" rel="noopener noreferrer">Full-size capture ↗</a></figcaption>
    </figure>)}
  </div>;
}

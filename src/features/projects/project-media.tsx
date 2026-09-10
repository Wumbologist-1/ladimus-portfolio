import Image from "next/image";
import type { ProjectMedia as Media } from "./types";
import styles from "./project-media.module.css";

export function ProjectMedia({ items }: { items: readonly Media[] }) {
  return (
    <div className={styles.grid}>
      {items.map(item => (
        <figure key={item.id} className={styles.card}>
          {item.kind === "image" ? (
            <div className={styles.image}><Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="(min-width: 768px) 45vw, 90vw" /></div>
          ) : item.kind === "video" ? (
            <video className={styles.video} controls preload="none" aria-label={item.title}>
              <source src={item.src} type="video/mp4" />
              <track kind="captions" src={item.captionsSrc} srcLang="en" label="English" default />
              Your browser does not support embedded video.
            </video>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.format}>{item.format}</span>
              <span className={styles.frame} aria-hidden="true">[ + ]</span>
              <p>Ready for project captures</p>
              <span className={styles.pending}>Media not yet published</span>
            </div>
          )}
          <figcaption className={styles.caption}>
            <strong>{item.title}</strong>
            <p>{item.caption}</p>
            {item.kind === "image" && (
              <a
                className={styles.fullSizeLink}
                href={item.src}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View full-size capture: ${item.title} (opens in a new tab)`}
              >
                View full-size capture <span aria-hidden="true">↗</span>
              </a>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

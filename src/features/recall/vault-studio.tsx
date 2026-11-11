"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { vaultEnvironments } from "./eidolon";
import styles from "./eidolon.module.css";

export function VaultStudio() {
  const [selected, setSelected] = useState(0);
  const theme = vaultEnvironments[selected] ?? vaultEnvironments[0];
  return <div className={styles.studio} style={{"--studio-accent": theme.tone} as CSSProperties}>
    <div className={styles.studioControls} role="group" aria-label="Explore Vault Studio environments">
      {vaultEnvironments.map((item, index) => <button type="button" key={item.id}
        aria-pressed={index === selected} aria-controls="vault-artwork"
        onClick={() => setSelected(index)}>
        <span className={styles.themeIndex}>0{index + 1}</span>{item.name}<span aria-hidden="true">↗</span>
      </button>)}
    </div>
    <figure id="vault-artwork" className={styles.studioFigure}>
      <div className={styles.studioArt}>
        <Image key={theme.id} src={`/images/recall/eidolon/${theme.id}.webp`}
          alt={theme.alt} width={1024} height={1536}
          sizes="(max-width: 767px) 92vw, 70vw" />
        <span className={styles.artLabel}>ORIGINAL APP ARTWORK · DESIGN REPRESENTATION</span>
      </div>
      <figcaption aria-live="polite" aria-atomic="true">
        <div><p className={styles.eyebrow}>{theme.name}</p><h3>{theme.mood}</h3></div>
        <p>{theme.description}</p>
      </figcaption>
    </figure>
    <p className={styles.small}>Explore the artwork, not a simulated app screen. All four themes persisted through protected Build 26 restarts; default emulator readability was reviewed. Physical foldable readability and advanced ambient effects remain unverified.</p>
  </div>;
}

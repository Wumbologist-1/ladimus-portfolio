import {recallRelease, recallDownload, recallFileSize, recallReleasePresentation} from "./release";
import styles from "./recall.module.css";

export function RecallDownload() {
  const release = recallRelease, action = recallDownload(release);
  const presentation = recallReleasePresentation(release);
  const classification = release.channel === "internal-qa" ? "Internal QA / Synthetic-data testing" : presentation.stage;
  return <div className={styles.download}>
    <div className={styles.downloadTop}><div><p className={styles.kicker}>ANDROID / {classification}</p><h3>Keep a little more.<br />Carry a little less.</h3></div><span className={styles.releaseBadge}>{release.version} / Build {release.build}</span></div>
    <dl className={styles.releaseFacts}>
      <div><dt>Version / build</dt><dd>{release.version} / {release.build}</dd></div>
      <div><dt>Platform / minimum</dt><dd>Android {release.minAndroid} or newer</dd></div>
      <div><dt>Architectures</dt><dd>{release.architectures.join(" · ")}</dd></div>
      <div><dt>Package size</dt><dd>{recallFileSize(release.bytes)}<br /><small>{release.bytes.toLocaleString("en-US")} bytes</small></dd></div>
    </dl>
    <div className={styles.downloadAction}>
      {action.href ? <a className={styles.downloadButton} href={action.href} target="_blank" rel="noopener noreferrer" aria-describedby="recall-download-status">{action.label} ↗</a> : <button type="button" className={styles.downloadButton} disabled aria-describedby="recall-download-status">{action.label}</button>}
      <p id="recall-download-status">{action.reason}</p>
    </div>
    <p className={styles.qaNotice}>{presentation.notice}</p>
    <details className={styles.details}><summary>Package identity & verification</summary>
      <p>Verified local package identity. This is not an independent security certification or approval for public distribution.</p>
      <dl className={styles.identity}><div><dt>Filename</dt><dd>{release.filename}</dd></div><div><dt>SHA-256</dt><dd><code>{release.sha256}</code></dd></div></dl>
      <p>After downloading an approved package, calculate its SHA-256 checksum with your operating system’s file-hashing tool and compare every character. A match identifies this package; it does not prove the software is safe.</p>
    </details>
  </div>;
}

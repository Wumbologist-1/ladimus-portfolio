import { platinumRelease, platinumDownload, platinumCertificate, platinumSourceCommit, platinumModelRelease, platinumModelNotices, platinumModelLicense } from "./platinum-release";
import { recallFileSize } from "./release";
import styles from "./eidolon.module.css";

export function PlatinumAccess() {
  const href = platinumDownload();
  return <div className={styles.founderPanel}>
    <p className={styles.eyebrow}>Platinum Ascension · Build 27 · Android QA Preview</p>
    <h3>Download Recall for Android.</h3>
    <p className={styles.lead}>Gate A: GREEN — Software Qualified</p>
    <p id="platinum-qa-warning"><strong>Gate B: PENDING — Founder Z Fold 7 Acceptance.</strong> Unannounced Public QA Preview. Physical device acceptance has not passed. This is not a hardware-qualified public beta.</p>
    <p>No GitHub account is required. Anyone with this public download URL may retrieve and share the APK. Use disposable synthetic information only; do not store sensitive personal information.</p>
    <div className={styles.actions}>{href ? <a className={styles.founderButton} href={href} aria-describedby="platinum-qa-warning">Download Recall for Android <span aria-hidden="true">↗</span></a> : <p role="status">Build 27 download unavailable: exact artifact verification is incomplete.</p>}<a href="#android-installation">Android installation &amp; upgrade instructions ↓</a></div>
    <p>Android 7.0+ · ARM64 / x86_64 · {recallFileSize(platinumRelease.bytes)} · {platinumRelease.bytes.toLocaleString("en-US")} bytes.</p>
    <details className={styles.details}><summary>Build 27 package identity &amp; verification</summary><dl className={styles.identity}>
      <div><dt>Exact APK</dt><dd>{platinumRelease.filename}</dd></div>
      <div><dt>Version / build</dt><dd>{platinumRelease.version} / {platinumRelease.build}</dd></div>
      <div><dt>Package</dt><dd>engineering.ladimus.recall.qa.ascension</dd></div>
      <div><dt>APK SHA-256</dt><dd><code>{platinumRelease.sha256}</code></dd></div>
      <div><dt>QA certificate SHA-256</dt><dd><code>{platinumCertificate}</code></dd></div>
      <div><dt>Android source commit</dt><dd><code>{platinumSourceCommit}</code></dd></div>
    </dl><p>Source, signer and complete anonymous hosted-download identity were checked. Identity verification and software Gate A qualification are not independent security certification or physical-device acceptance.</p></details>
  </div>;
}

export function PlatinumInstallation() {
  return <div id="android-installation" className={styles.founderGuide}>
    <h3>Android installation · compatible upgrade</h3>
    <ol>
      <li>Select <strong>Download Recall for Android</strong>, then open the APK in Android Files. No GitHub authentication or release-page navigation is needed. Keep Play Protect enabled; approve the intended install source only when Android asks.</li>
      <li>Compare the filename, size and SHA-256 above before installing. On a computer use <code>Get-FileHash -Algorithm SHA256</code>. Stop if the package does not match.</li>
      <li>Install as an in-place update only over a compatible QA installation with the same package and signer. <strong>Do not uninstall Recall or clear app data.</strong> If Android reports incompatible signing or a downgrade, stop and preserve the existing installation. No safe downgrade or vault migration to a different package is promised.</li>
      <li>Open Recall and authenticate normally if app lock is enabled. Confirm existing synthetic notes and original images. No qualified recovery/export path exists; device/key loss or uninstalling can permanently lose vault access.</li>
      <li>Install optional models inside Recall through <strong>Settings → Platinum AI</strong> (Manage Platinum AI). Choose Visual Understanding, Visual Memory Search or Install All. Review download/free-space requirements and explicit network consent; unmetered networks are the default.</li>
      <li>After installation, choose Platinum in Settings’ local AI controls. Visual Understanding analyzes photographs. Visual Memory Search indexes and retrieves photographs directly from their pixels. Approved models require the supported 6 GB memory tier, sufficient available memory/storage and acceptable thermal state; Essential/Balanced remain available for core use.</li>
    </ol>
    <p>Complete the founder hardware checks for compatible upgrade, authentication, background lock, original reopening, both model capabilities, cancellation, offline use, thermal/battery behavior, TalkBack and folded/unfolded layouts. Their results remain pending. Experimental conversation and image chat stay disabled.</p>
    <p><a href={platinumModelRelease}>Exact approved model information ↗</a> · <a href={platinumModelNotices}>Model provenance &amp; notices ↗</a> · <a href={platinumModelLicense}>Apache-2.0 licenses ↗</a> · <a href="#privacy">Download &amp; local-data privacy disclosures ↓</a></p>
  </div>;
}

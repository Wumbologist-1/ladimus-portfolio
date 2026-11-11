import { founderRelease, founderAccess } from "./founder-release";
import styles from "./eidolon.module.css";

export function FounderAccess() {
  const access = founderAccess(founderRelease), identity = founderRelease.identity;
  return <div className={styles.founderPanel}>
    <p className={styles.eyebrow}>RESTRICTED FOUNDER ACCESS · FOUNDER BETA TESTING</p>
    <h3>Recall v0.7 — Build 26</h3>
    <p className={styles.lead}>Build 26 | Software Qualified | Hardware Validation Pending</p>
    <p>Gate A is GREEN within its software-only qualification. Gate B awaits founder Galaxy Z Fold 7 acceptance. This is pre-publication founder QA, <strong>not public beta</strong>. General beta availability is forthcoming, subject to hardware acceptance and explicit approval.</p>
    <p>GitHub authentication as the authorized founder is required. The private release host enforces access; following this public link does not authorize a download. Sign in as <strong>Wumbologist-1</strong>. Another account may see a 404.</p>
    <div className={styles.actions}>{access ? <a className={styles.founderButton} href={access.href} rel="noreferrer">Founder QA Download <span aria-hidden="true">↗</span></a> : <p role="status">Founder download unavailable: artifact verification is incomplete.</p>}<a href="#founder-installation">Installation &amp; hardware checklist ↓</a></div>
    <p>The standalone application operates locally and offline. Essential and Balanced include the supported base and bundled text models. Source Review selects saved passages; experimental conversation and image chat remain disabled. Advanced images require separately imported approved packs and the supported resource tier.</p>
    <details className={styles.details}><summary>Build 26 identity &amp; compatibility</summary><dl className={styles.identity}>
      <div><dt>Version / build</dt><dd>{identity.version} / {identity.build}</dd></div>
      <div><dt>Package</dt><dd>{identity.package}</dd></div>
      <div><dt>Exact APK</dt><dd>{identity.filename}</dd></div>
      <div><dt>Bytes</dt><dd>{identity.bytes.toLocaleString("en-US")}</dd></div>
      <div><dt>APK SHA-256</dt><dd><code>{identity.sha256}</code></dd></div>
      <div><dt>QA certificate SHA-256</dt><dd><code>{identity.certificateSha256}</code></dd></div>
      <div><dt>Android</dt><dd>API24 minimum · target36 · ARM64 / x86_64</dd></div>
      <div><dt>Finalization commit</dt><dd><code>{identity.sourceCommit}</code></dd></div>
    </dl><p>Gate A is scoped engineering qualification, not independent security certification. Hardware-backed Keystore, biometrics, physical ARM64, foldable layouts and thermal/battery behavior remain Gate B work.</p></details>
  </div>;
}

export function FounderInstallation() {
  return <div id="founder-installation" className={styles.founderGuide}>
    <h3>Founder installation · Galaxy Z Fold 7</h3>
    <ol>
      <li>Open Ladimus Portfolio on your phone, navigate to Recall, and select <strong>Founder QA Download</strong>.</li>
      <li>Authenticate to GitHub as Wumbologist-1. Open the private Build 26 release and download the APK asset, <strong>INSTALL.md</strong> and <strong>SHA256SUMS.txt</strong>. A 404 can mean the browser is signed into a different account.</li>
      <li>Check the filename, version, size and SHA-256 shown above where practical. On a computer, use <code>Get-FileHash -Algorithm SHA256</code>. Do not install a substituted file.</li>
      <li>Open the downloaded APK through Android Files. Browser download and install-source permissions may require approval. Keep Play Protect and other Android security protections enabled.</li>
      <li>Install as an in-place update only over a compatible QA installation with the same package and signer. <strong>Do not uninstall Recall or clear its storage.</strong> If Android reports incompatible signing or a downgrade, stop and retain the existing app. A differently named package does not migrate your vault.</li>
      <li>Open Recall, unlock the protected vault and verify existing synthetic notes, images, OCR and reviews. Use disposable test data; recovery/export, backups and cloud sync are unavailable. Losing the device/key or uninstalling can permanently lose access.</li>
      <li>Complete the hardware checklist below and record build/hash, Android version, RAM, resource preference, synthetic steps and results. Do not share credentials, vault files or personal content.</li>
    </ol>
    <details className={styles.details}><summary>Gate B · founder hardware acceptance checklist</summary><ul>
      <li>Confirm compatible upgrade and original note/image/OCR preservation.</li>
      <li>Test cancelled/wrong/correct credential, supported strong biometrics, manual lock, cold launch, process restart and background expiry over 30 seconds.</li>
      <li>Save and reopen a note, stored-only link, Latin screenshot and photo. Test keyword Find, Balanced Source Review and opening the selected original.</li>
      <li>With approved packs, test Platinum descriptions and photo-pixel search, including a deliberately wrong caption. Review or correct unsupported descriptions.</li>
      <li>Cancel/retry, background processing and check edit/delete index consistency using disposable records.</li>
      <li>Test all four themes and persistence, folded/unfolded layouts, rotation, keyboard, large text and reduced effects.</li>
      <li>Observe available RAM, latency, battery and thermals during a bounded session. Confirm offline use, protected screens and manual lock.</li>
    </ul><p>Report unauthorized access, plaintext exposure, data loss or signer mismatch as blockers. Completing this checklist does not authorize public distribution.</p></details>
    <details className={styles.details}><summary>Approved optional image packs · private access required</summary>
      <p>Only the exact approved Qwen3-VL and EmbeddingGemma ZIPs are compatible. Their availability is confirmed separately from the APK; do not substitute model or projector files. Essential and Balanced remain usable without them.</p>
      <p><a href="https://github.com/login?return_to=%2FWumbologist-1%2Frecall-founder-qa%2Freleases" rel="noreferrer">Check approved pack releases · GitHub sign-in required ↗</a>. Look for <strong>approved-model-packs-v1</strong> and its license/provenance notices. Advanced image testing is available only after retrieving and verifying the exact ZIPs below. If they are not available to your account, retain Essential/Balanced or transfer an already-authorized local copy through Files.</p>
      <dl className={styles.identity}><div><dt>Qwen3-VL image descriptions · qwen3-vl-2b.zip</dt><dd>1,552,464,487 bytes<br /><code>0ab1843bc7ad9cefeb7464a33fc8fd56c940161e22e3b93ecf1e7913dacadce5</code></dd></div><div><dt>EmbeddingGemma pixel search · embeddinggemma-2.zip</dt><dd>864,677,572 bytes<br /><code>02b9ab374e90555472f3df1a7d58f9f9729f8e49eff20372fef645819e62a7bc</code></dd></div></dl>
      <p>Allow roughly 7 GB working storage for both packs. Import one at a time through <strong>Settings → Import approved offline model pack</strong>, verify installed status, then select Platinum. Do not unpack or edit the ZIPs. Remove transfer copies only after a successful import; repeated imports retain additional immutable generations.</p>
      <p>Optional image models require the 6 GB device tier (at least 5.5 billion total bytes), over 2,089,334,144 bytes currently available, and Android not reporting low memory. Admission is not a performance guarantee. Use Essential/Balanced on 4 GB. Standard uses two CPU threads; Conserve uses one. Image imports are bounded to 2 MiB, four million pixels and 4096 pixels per side.</p>
    </details>
  </div>;
}

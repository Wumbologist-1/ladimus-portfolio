import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { ActionLink } from "@/components/ui/action-link";
import { RecallGallery } from "@/features/recall/recall-visual";
import { RecallDownload } from "@/features/recall/recall-download";
import { VaultStudio } from "@/features/recall/vault-studio";
import { FounderAccess, FounderInstallation } from "@/features/recall/founder-access";
import { eidolonRelease, eidolonCheckpoint } from "@/features/recall/eidolon";
import { site, profile } from "@/config/site";
import styles from "@/features/recall/eidolon.module.css";

const title = "Recall v0.7 — Project EIDOLON";
const description = "Your private second memory. Explore Recall’s local image understanding and four Vault Studio environments. Build 26 is software qualified for private founder QA; hardware acceptance and public beta approval remain pending.";
export const metadata: Metadata = {
  title, description, metadataBase: new URL("https://ladimus-portfolio.vercel.app"),
  alternates: { canonical: "/projects/recall" },
  openGraph: { title: `${title} | ${site.name}`, description, type: "website", siteName: site.name, url: "/projects/recall", images: [{url: "/images/recall/eidolon/core.webp", width: 1024, height: 1536, alt: "Original Ladimus Core artwork. Project EIDOLON design representation, not an app screenshot."}] },
  twitter: {card: "summary", title, description, images: ["/images/recall/eidolon/core.webp"]},
};

const engineering = [
  {number: "01", title: "A native path from pixels to meaning.", text: "React Native and TypeScript reach a serialized Android inference worker through Kotlin, Messenger and C++ / JNI. llama.cpp runs Qwen models locally. Work crosses a lifecycle boundary, not a cloud endpoint.", detail: "Separate inference process · cancellation · native buffer ownership · restart handling. Crash isolation does not make the worker a security sandbox."},
  {number: "02", title: "Different indexes. Clear responsibilities.", text: "SQLite FTS5 handles words. BGE embeddings complement lexical text retrieval. EmbeddingGemma supplies distinct shared text/image vectors for explicit visual search. Pixel ranking does not accept captions as visual evidence.", detail: "Encrypted derived vectors · revision-aware invalidation · source-linked results. General multimodal retrieval fusion remains experimental."},
  {number: "03", title: "Originals first. Interpretations second.", text: "SQLCipher stores original images and derived records locally. Reviewed descriptions remain linked to their source. Conditional writes and migration checks protect against publishing results for stale or deleted records.", detail: "Android Keystore integration · optional authentication-bound key access · encrypted search metadata. Production security qualification is incomplete."},
  {number: "04", title: "The lifecycle is part of the product.", text: "Signed QA upgrades preserve installation identity. Cancellation, background cleanup, model release and core fallback are exercised alongside the interface. Optional model packs are pinned and verified before loading.", detail: "Both native ABIs built and inspected · 16 KiB alignment checked · repeatable emulator acceptance. Physical ARM64 execution remains a separate gate."},
];

export default function RecallPage() {
  return <div className={styles.page}>
    <Section aria-labelledby="recall-title" className={styles.hero}>
      <a className={styles.back} href="/work">← All work</a>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span className={styles.statusDot} />PROJECT EIDOLON · v0.7 QA · ACTIVE DEVELOPMENT</p>
          <h1 id="recall-title">Recall<span>.</span></h1>
          <p className={styles.byline}>YOUR PRIVATE SECOND MEMORY.</p>
          <h2 className={styles.heroStatement}>Now it can see<br />what you remember.</h2>
          <p className={styles.intro}>An offline-first Android home for notes, links and images. Encrypted originals, local text recognition and on-device AI help you find your way back.</p>
          <p className={styles.tagline}>Keep what matters. Find it when it matters.</p>
          <div className={styles.actions}><ActionLink href="#vision" variant="primary">Explore Recall Vision</ActionLink><ActionLink href="#engineering">Discover the technology</ActionLink></div>
          <a className={styles.statusLink} href="#release-status">Build 26 · Private founder QA · Hardware acceptance pending <span aria-hidden="true">↓</span></a>
        </div>
        <figure className={styles.heroScene}>
          <Image className={styles.sceneArt} src="/images/recall/eidolon/core.webp" alt="" fill sizes="(max-width: 767px) 100vw, 50vw" />
          <div className={styles.sceneHeading}><span>MEMORY, WITH ANOTHER DIMENSION.</span><span aria-hidden="true">◈</span></div>
          <div className={styles.phone}><Image src="/images/recall/eidolon/vision-build10.jpg" width={413} height={946} sizes="(max-width: 767px) 64vw, 266px" alt="Historical build 10 Android capture: synthetic child in a yellow raincoat beside a red bicycle, preserved original and reviewed version 2 description." preload /></div>
          <figcaption>Authentic Android capture · historical build 10<br />Synthetic fixture · reviewed/edited description<br /><span>Artwork framing is a portfolio composition, not Build 26 UI.</span></figcaption>
        </figure>
      </div>
      <div className={styles.heroRail}><p><strong>On-device.</strong> Models stay local.</p><p><strong>Source-linked.</strong> Originals stay close.</p><p><strong>In development.</strong> Evidence before release.</p></div>
    </Section>

    <nav className={styles.chapterNav} aria-label="Explore Recall"><a href="#vision">01 / Vision</a><a href="#pixel-search">02 / Discovery</a><a href="#vault-studio">03 / Atmosphere</a><a href="#engineering">04 / Engineering</a><a href="#release-status">05 / Release status</a></nav>

    <Section aria-labelledby="save-title" className={styles.saveSection}>
      <div className={styles.editorial}><div><p className={styles.eyebrow}>THE HABIT / SAVE WHAT MATTERS</p><h2 id="save-title">A thought. A place.<br />Something you saw.</h2></div><div><p className={styles.lead}>Good information shouldn’t disappear into a camera roll.</p><p>Keep a note, a useful link, a screenshot or a supported photograph. Preserve the encrypted original now; choose how to understand it later.</p><ul className={styles.inlineList}><li>Notes & links</li><li>PNG & JPEG originals</li><li>Offline Latin OCR</li></ul></div></div>
      <ol className={styles.memoryLine}><li><span>01</span><strong>Keep it.</strong><p>Save deliberately to your local vault.</p></li><li><span>02</span><strong>Make it discoverable.</strong><p>Words, semantic text and optional image pixels.</p></li><li><span>03</span><strong>Come back to it.</strong><p>Open what you actually preserved.</p></li></ol>
    </Section>

    <Section id="vision" aria-labelledby="vision-title" className={styles.visionSection}>
      <div className={styles.sectionHead}><p className={styles.eyebrow}>01 / RECALL VISION · OPTIONAL QWEN3-VL PACK</p><h2 id="vision-title">Beyond the words<br />inside an image.</h2><p className={styles.lead}>No text to recognize. Still something to remember.</p></div>
      <div className={styles.visionGrid}>
        <div className={styles.visionStory}>
          <p>In the earlier build 10 acceptance, a text-free synthetic photograph showed a child in a yellow raincoat beside a red bicycle. Qwen3-VL generated a local description; the reviewed and edited version remained linked to the original after an app restart.</p>
          <blockquote><p>“A red road bicycle is parked against a stone wall. The bike has black tires, handlebars, and a black seat.”</p><footer>Separate RC23 synthetic bicycle fixture · actual generated description</footer></blockquote>
          <p>The build 23 check repeated the complete journey with that separate bicycle image: save the encrypted original, analyze pixels locally, accept the description, restart, reopen.</p>
          <p className={styles.small}>These are integrated acceptance examples, not broad recognition-accuracy measurements. User review and correction are part of the workflow.</p>
        </div>
        <div className={styles.visionFlow} role="group" aria-label="Verified local image workflow">
          <p className={styles.eyebrow}>THE IMAGE STAYS THE SOURCE</p>
          <ol><li><span>01 / ORIGINAL</span><strong>Pixels, not just a caption.</strong><p>Bounded native decoding and local preprocessing.</p></li><li><span>02 / INTERPRETATION</span><strong>Local Qwen3-VL inference.</strong><p>A proposed description you can inspect and correct.</p></li><li><span>03 / REVIEWED MEMORY</span><strong>Reopen both after restart.</strong><p>Original and versioned description remain distinct.</p></li></ol>
          <a href="/images/recall/eidolon/vision-build10.jpg" target="_blank" rel="noopener noreferrer">Inspect the historical build 10 capture ↗</a>
        </div>
      </div>
    </Section>

    <Section id="pixel-search" aria-labelledby="pixel-title" className={styles.discoverySection}>
      <div className={styles.editorial}><div><p className={styles.eyebrow}>02 / VISUAL DISCOVERY · OPTIONAL EMBEDDINGGEMMA PACK</p><h2 id="pixel-title">Describe what<br />you remember.<br /><em>Find what you saved.</em></h2></div><div><p className={styles.lead}>Even when the caption gets it wrong.</p><p>A bicycle photograph was deliberately labelled as a black dog. In RC23’s explicit <strong>Find photos by pixels</strong> path, the visual query still returned the bicycle original.</p><p>The newly imported duplicate ranked first; the earlier, incorrectly captioned original ranked second. Titles, OCR and descriptions did not contribute to this pixel ranking.</p><p className={styles.small}>This is explicit visual search with shared image/text embeddings. General retrieval fusion is experimental; a possible visual match is not a verified fact.</p></div></div>
      <div className={styles.queryStudy} role="group" aria-label="Documented RC23 pixel-search example, not an application screenshot"><div><span className={styles.eyebrow}>THE QUERY / DOCUMENTED ACCEPTANCE</span><p>red road bicycle<br />against a stone wall</p></div><div className={styles.ranking}><p><span>01</span>New synthetic bicycle original <small>duplicate image</small></p><p><span>02</span>“black dog on a cream rug” <small>incorrect caption · bicycle pixels</small></p><a href="/images/recall/eidolon/pixels-build14.jpg" target="_blank" rel="noopener noreferrer">View earlier build 14 pixel-retrieval capture ↗</a></div></div>
    </Section>

    <Section id="vault-studio" aria-labelledby="studio-title" className={styles.studioSection}>
      <div className={styles.sectionHead}><p className={styles.eyebrow}>03 / VAULT STUDIO</p><h2 id="studio-title">Your memories.<br /><em>Your atmosphere.</em></h2><p>Four original environments. One place that feels like yours.</p></div>
      <VaultStudio />
    </Section>

    <Section aria-labelledby="source-title" className={styles.reviewSection}>
      <div className={styles.editorial}><div><p className={styles.eyebrow}>ASK RECALL / CURRENTLY SOURCE REVIEW</p><h2 id="source-title">A little help finding.<br />A source worth opening.</h2></div><div><p className={styles.lead}>The original record is the point.</p><p>Source Review uses the bundled lightweight Qwen model to select relevant saved passages. Read their context, then open the original. Leaving Ask or backgrounding Recall clears private review context.</p><p>A selected passage establishes source origin, not factual certainty. Advanced natural conversational synthesis and image chat remain disabled in Build 26. More natural conversation remains under research; its development evaluations are unqualified.</p></div></div>
      <div className={styles.sourceTrace}><span>Your question</span><span>Local text retrieval</span><span>Saved source context</span><strong>Open original ↗</strong></div>
    </Section>

    <Section id="engineering" aria-labelledby="engineering-title" className={styles.engineeringSection}>
      <div className={styles.sectionHead}><p className={styles.eyebrow}>04 / LADIMUS ENGINEERING</p><h2 id="engineering-title">A real Android app.<br />An entire native pipeline.</h2><p>Independent engineering across the interface, models, encrypted data and the boundaries between them.</p></div>
      <div className={styles.engineeringRows}>{engineering.map(item => <article key={item.number}><span className={styles.eyebrow}>{item.number}</span><h3>{item.title}</h3><div><p>{item.text}</p><p className={styles.small}>{item.detail}</p></div></article>)}</div>
      <div className={styles.validation}><div><strong>167<span> / 167</span></strong><p>Reported Build 26 host tests passed</p></div><p>The Android handoff records software Gate A GREEN: protected synthetic upgrades, authentication, core modes, approved packs and bounded fault recovery. The portfolio task does not rerun Android qualification. Physical Gate B remains pending.</p></div>
      <details className={styles.details}><summary>Measured acceptance, with its limits</summary><p>Build 26 optional image inference refused the 4 GB emulator tier while Essential and Balanced remained usable. At the 6 GB tier, one Qwen image generation took 80.2 seconds of native inference; sampled worker-only PSS reached approximately 1.84 GiB. These are individual emulator observations, not universal minimums, absolute peaks or physical-device performance claims.</p><p>Protected synthetic upgrades 24→25→26 preserved the original QA signing identity and existing memories. Both ARM64 and x86_64 were compiled and inspected; physical ARM64 execution remains a Gate B requirement.</p></details>
    </Section>

    <Section aria-labelledby="privacy-title" className={styles.privacySection}>
      <p className={styles.eyebrow}>LOCAL BY DESIGN / HONEST ABOUT THE BOUNDARIES</p><h2 id="privacy-title">Your memories stay close.</h2>
      <p className={styles.lead}>No required in-app account. Device-resident models.<br />No INTERNET permission in Build 26.</p>
      <p className={styles.privacyCopy}>SQLCipher encrypted local storage, Android Keystore integration and optional supported vault authentication are implemented controls. They are not a guarantee of absolute security. Originals remain under your control; AI interpretations remain open to review.</p>
      <div className={styles.securityNotice}><strong>Software qualified. Hardware acceptance pending.</strong><p>Build 26 uses maintained SQLCipher 4.20.0 / LibTomCrypt; the old OpenSSL 3.3.2 payload is absent from the qualified native inventory. Physical-device security and hardware-backed biometric qualification remain open. App lock requires Android 11+ and a secure device credential. Local SDK diagnostics exist; not every diagnostic file is encrypted. No export or recovery exists; device or key loss can permanently lose access. Use disposable synthetic information only.</p></div>
    </Section>

    <Section id="release-status" aria-labelledby="release-title" className={styles.releaseSection}>
      <div className={styles.sectionHead}><p className={styles.eyebrow}>05 / PROGRESS IS NOT PUBLIC AVAILABILITY</p><h2 id="release-title">EIDOLON is taking shape.<br /><em>Release comes after review.</em></h2></div>
      <FounderAccess />
      <div className={styles.availability}><article><h3>In the base APK</h3><p>Encrypted notes, links and originals. Offline Latin OCR. Keyword Find. Bundled BGE semantic retrieval and lightweight Qwen Source Review. Essential mode keeps saving, OCR and keyword search; Source Review needs Balanced or Platinum.</p></article><article><h3>With approved optional packs</h3><p>Qwen3-VL image descriptions and EmbeddingGemma photo-pixel search. Separate gigabyte-scale packs, Platinum mode and adequate current resources are required. No automatic model download or public pack host is available.</p></article><article><h3>Still unavailable</h3><p>Advanced conversational synthesis, image chat, encrypted export/recovery, incoming shares and cloud sync. Google Play availability is a future goal.</p></article></div>
      <FounderInstallation />
      <details className={styles.details}><summary>Historical RC23 package identity · no public download</summary><p>Superseded internal milestone. Unsupported OpenSSL 3.3.2 applied to this older RC23 candidate; Build 26 uses the maintained provider described above. RC23 remains INTERNAL / CONTROLLED QA ONLY and has no download.</p><dl className={styles.identity}><div><dt>Version / build</dt><dd>{eidolonRelease.version} / {eidolonRelease.build}</dd></div><div><dt>Android / ABIs</dt><dd>7.0 / API24 minimum · target API36 · ARM64 / x86_64</dd></div><div><dt>Package</dt><dd>engineering.ladimus.recall.qa.ascension</dd></div><div><dt>APK filename</dt><dd>{eidolonRelease.filename}</dd></div><div><dt>Size</dt><dd>{eidolonRelease.bytes.toLocaleString("en-US")} bytes</dd></div><div><dt>APK SHA-256</dt><dd><code>{eidolonRelease.sha256}</code></dd></div><div><dt>QA certificate SHA-256</dt><dd><code>{eidolonRelease.signatureVerification?.certificateSha256}</code></dd></div><div><dt>Android checkpoint</dt><dd><code>{eidolonCheckpoint}</code></dd></div></dl></details>
      <details className={styles.details}><summary>Legacy v0.6 experimental QA · separate from EIDOLON</summary><p>The earlier Luminance package has its own authorization and identity. It does not contain the EIDOLON image features above. Do not downgrade an existing vault to an older package or uninstall to troubleshoot. No safe downgrade or production migration is guaranteed.</p><RecallDownload /></details>
      <details id="screens" className={styles.details}><summary>Historical Luminance gallery · authentic v0.6 captures</summary><p>Preserved synthetic-data emulator captures from v0.6. These show the historical application, not build 23. Protected-screen policy remained enabled. Current RC23 capture tooling was unavailable; artwork previews are explicitly labelled separately.</p><RecallGallery /></details>
    </Section>

    <Section aria-labelledby="recall-close" className={styles.closing}>
      <Image src={site.logo.src} width={site.logo.width} height={site.logo.height} sizes="190px" className={styles.wordmark} alt="Ladimus" />
      <p className={styles.eyebrow}>RECALL, BY LADIMUS</p><h2 id="recall-close">Keep what matters.<br /><em>Find it when it matters.</em></h2><p>Memory. Intelligence. Atmosphere.<br />Built locally. Developed deliberately.</p><div className={styles.actions}><ActionLink href="/work" variant="primary">Explore all work</ActionLink><ActionLink href={`mailto:${profile.email}?subject=Recall%20development%20enquiry`}>Talk about the engineering</ActionLink></div>
    </Section>
  </div>;
}

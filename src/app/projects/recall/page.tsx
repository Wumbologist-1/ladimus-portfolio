import type {Metadata} from "next";
import Image from "next/image";
import {Section} from "@/components/ui/section";
import {ActionLink} from "@/components/ui/action-link";
import {RecallVisual, RecallGallery} from "@/features/recall/recall-visual";
import {recallScreens, recallScreenPath} from "@/features/recall/screens";
import {RecallDownload} from "@/features/recall/recall-download";
import {recallRelease, recallReleasePresentation} from "@/features/recall/release";
import {site, profile} from "@/config/site";
import shared from "../../projects.module.css";
import styles from "@/features/recall/recall.module.css";

const title = "Recall v0.6 — Project Luminance";
const description = "Meet the redesigned Recall, by Ladimus. Offline memories, screenshot OCR, local AI, source-linked search and optional compatible-device vault locking. Experimental Android QA for synthetic data only.";
export const metadata: Metadata = {
  title, description, metadataBase: new URL("https://ladimus-portfolio.vercel.app"),
  alternates: {canonical: "/projects/recall"},
  openGraph: {title: `${title} | ${site.name}`, description, type: "website", siteName: site.name, url: "/projects/recall", images: [{url: recallScreenPath(recallScreens[0].file), width: 1080, height: 2400, alt: recallScreens[0].alt}]},
  twitter: {card: "summary", title, description, images: [recallScreenPath(recallScreens[0].file)]},
};
const journey = [
  {title: "Save", copy: "Give notes, links and supported PNG screenshots a dedicated home."},
  {title: "Understand", copy: "Offline OCR extracts screenshot text. Local semantic processing helps make saved information discoverable."},
  {title: "Recall", copy: "Search your vault or use Ask Recall to identify relevant saved passages."},
  {title: "Verify", copy: "Open the original saved memory and inspect what was actually preserved."},
];
const engineering = [
  {title: "Mobile engineering", copy: "React Native, Expo and TypeScript with native Android modules. A packaged Android application, not a web-only demonstration."},
  {title: "Local intelligence", copy: "Bundled Qwen3 0.6B through llama.cpp, BGE neural text embeddings, lexical search with SQLite FTS5 and hybrid retrieval."},
  {title: "Private storage", copy: "SQLCipher encrypted storage and search metadata, Android Keystore integration, and encrypted binary and derived vector storage. Implemented controls remain under security validation."},
  {title: "Vault access", copy: "Optional authentication-bound wrapping of the existing vault key through Android platform authentication. Android 11+ and a secure screen lock are required; physical biometric and hardware-backed key qualification remain outstanding."},
  {title: "Data lifecycle", copy: "Transactional migrations, integrity checks, deletion consistency, lifecycle interruption recovery and inference-process restart handling are part of the documented validation work."},
  {title: "Release engineering", copy: "A standalone signed Android APK with bundled models, preserved QA signing continuity, measured package identity and versioned binary distribution. No Metro or developer client is required."},
];
const improvements = [
  {title: "Premium interface", copy: "A complete redesign in metallic silver-green, electric lime and deep emerald. Clear typography and considered memory cards."},
  {title: "Effortless capture", copy: "A calmer Save experience for notes, links and supported PNG screenshots, with offline text recognition."},
  {title: "Find what matters", copy: "A clearer Find library and a retrieval system that combines lexical matching with neural text embeddings."},
  {title: "Ask Recall", copy: "A refined conversational workspace using genuine local Qwen inference to select saved evidence, with bounded session follow-ups."},
  {title: "Secure your vault", copy: "Optional authentication-gated access to your vault key on compatible secured Android devices. Read the access and recovery limits below."},
  {title: "Completely offline", copy: "Bundled language model, embeddings, OCR and encrypted storage. No required account, subscription or cloud connection."},
];
export default function RecallPage() {
  const releasePresentation = recallReleasePresentation(recallRelease);
  return <>
    <Section aria-labelledby="recall-title" className={styles.hero}>
      <a className={shared.back} href="/work">← All work</a>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>LADIMUS ENGINEERING / PROJECT LUMINANCE</p>
          <h1 id="recall-title">Recall<span>.</span></h1><p className={styles.byline}>BY LADIMUS</p>
          <p className={styles.tagline}>Keep what matters.<br />Find it when it matters.</p>
          <p className={styles.intro}>Your private second memory. Save the information that matters, find it with intelligent local search, and return to the original evidence whenever you need it.</p>
          <p className={styles.promise}>Beautifully redesigned.<br />Intelligent by default.<br />Private by design.</p>
          <p className={styles.local}>Your memories stay on your device in the current local-only QA implementation. Recall works offline, with no account or subscription required.</p>
          <div className={shared.actions}><ActionLink href="#android" variant="primary">Get Recall for Android</ActionLink><ActionLink href="#luminance">Meet the new Recall</ActionLink></div>
          <p className={styles.stage}>Actively developed · {releasePresentation.stage} · Android</p>
        </div>
        <RecallVisual hero />
      </div>
    </Section>

    <Section id="luminance" aria-labelledby="recall-new" className={styles.band}>
      <div className={shared.sectionHead}><p className={styles.kicker}>NEW / PROJECT LUMINANCE</p><h2 id="recall-new">Meet the new Recall.</h2><p>A more beautiful place for what matters. A clearer way to capture, find and revisit it.</p></div>
      <div className={styles.improvements}>{improvements.map((item, index) => <article key={item.title}><span className={styles.step}>0{index+1}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
    </Section>

    <Section id="screens" aria-labelledby="recall-screens">
      <div className={shared.sectionHead}><p className={styles.kicker}>THE APPLICATION / REAL ANDROID CAPTURES</p><h2 id="recall-screens">Made to keep.<br />Designed to rediscover.</h2><p>Explore the actual Luminance QA application. Every saved memory shown here is synthetic test information.</p></div>
      <nav className={styles.screenNav} aria-label="Recall screenshot gallery">{recallScreens.slice(1).map(screen => <a key={screen.id} href={`#screen-${screen.id}`}>{({home:"Home",save:"Save",find:"Find",ask:"Ask",original:"Originals",security:"Settings",locked:"Vault lock"})[screen.id]} ↓</a>)}</nav>
      <RecallGallery />
      <p className={styles.boundary}>Unedited standalone Android emulator captures from the v0.6 engineering deliverable. Protected-screen policy remained enabled; captures used the emulator’s privileged console. Physical-device screen-capture and security behavior remain unqualified.</p>
    </Section>

    <Section aria-labelledby="recall-why">
      <div className={shared.editorial}><div><p className={styles.kicker}>01 / A place for what matters</p><h2 id="recall-why">The things worth remembering deserve a place to live.</h2></div><div className={shared.prose}><p>A recipe from your spouse. A restaurant screenshot. A recommendation you meant to come back to.</p><p className={styles.paragraph}>Messages get buried. Screenshots accumulate. Links disappear into browser tabs. Recall gives you one place to save the information you care about, and a better way to find it again.</p></div></div>
    </Section>

    <Section aria-labelledby="recall-workflow" className={styles.band}>
      <div className={shared.sectionHead}><p className={styles.kicker}>02 / From saved to found</p><h2 id="recall-workflow">Save. Understand. Recall. Verify.</h2><p>A simple habit, with a source you can return to.</p></div>
      <ol className={styles.journey}>{journey.map((step,index)=><li key={step.title}><span className={styles.step}>0{index+1}</span><h3>{step.title}</h3><p>{step.copy}</p></li>)}</ol>
      <p className={styles.boundary}>Screenshot understanding currently uses OCR and text-derived representations. Full pixel-level visual understanding is not implemented.</p>
    </Section>

    <Section aria-labelledby="recall-intelligence">
      <div className={shared.editorial}><div><p className={styles.kicker}>03 / Recall intelligence</p><h2 id="recall-intelligence">Intelligence that lives with your memories.</h2></div><div className={shared.prose}><p>Local AI and semantic search help you rediscover saved information, even when you don’t remember the exact words. Ask Recall uses genuine Qwen3 0.6B inference to select saved evidence, then presents source-linked passages you can open and inspect. Up to six completed turns stay within a bounded session.</p><p className={styles.paragraph}>The bundled model runs offline through llama.cpp. BGE neural text embeddings combine with lexical retrieval, while SQLCipher encrypts search metadata. Leaving Ask, backgrounding or locking clears the conversation; there is no permanent chat transcript.</p></div></div>
      <div className={styles.pipeline} aria-label="Local retrieval architecture"><span>Saved memory</span><span>Offline OCR / text</span><span>Hybrid retrieval</span><span>Source-linked quotation</span></div>
      <details className={styles.details}><summary>How the local retrieval works</summary><p>Qwen3 0.6B runs through llama.cpp. BGE neural text embeddings complement SQLite FTS5 lexical search. Derived vector indexes are encrypted, and retrieved passages stay linked to saved originals. Free-form factual output remains disabled: model factual reasoning and independent abstention are limited. An exact quotation establishes source origin, not factual certainty or correct interpretation.</p></details>
    </Section>

    <Section aria-labelledby="recall-privacy" className={styles.band}>
      <div className={shared.editorial}><div><p className={styles.kicker}>04 / Privacy & trust</p><h2 id="recall-privacy">Your memories belong to you.</h2></div><div className={shared.prose}><p>Save deliberately. Search locally. Return to the source. The current QA architecture uses SQLCipher encrypted local storage, offline OCR and on-device inference without cloud AI. Saving and deletion stay under your control.</p><p className={styles.paragraph}>No account. No subscription. No claim of absolute security.</p></div></div>
      <div className={styles.trust}><p>{releasePresentation.notice}</p><details className={styles.details}><summary>Current security and product limits</summary><p>Optional app lock gates access to the existing vault key using Android platform authentication. It requires Android 11 / API 30 or later and a secure device screen lock; older or unsecured devices retain the encrypted vault without this option. Device-credential behavior was verified on an emulator. Physical fingerprint, hardware-backed Keystore, ARM64, OEM and performance qualification remain outstanding. Native OpenSSL maintenance is unresolved. Credential recovery/export is not implemented: losing access to protected keys may permanently make the vault inaccessible. There is no completed independent production-security certification.</p></details></div>
    </Section>

    <Section id="android" aria-labelledby="recall-android">
      <div className={shared.sectionHead}><p className={styles.kicker}>05 / Android testing</p><h2 id="recall-android">Recall for Android.</h2><p>{releasePresentation.access}</p></div>
      <RecallDownload />
      <details className={styles.details}><summary>Tester quick start & installation</summary><ol className={styles.install}><li>Download the QA APK. Compare its filename, size and SHA-256 with the package identity above.</li><li>Open the downloaded APK on a compatible Android phone and follow Android’s normal installation prompts.</li><li>Allow installation from that browser or file manager only if you understand and choose to proceed. Revoke that source permission after installation.</li><li>Launch Recall. Local models are bundled; no first-launch model download or account is required.</li><li>Create a fictional note: “Willow Creek Bistro has excellent chicken alfredo. We should try it next Saturday.”</li><li>Import a disposable PNG screenshot containing synthetic information.</li><li>Try semantic search: “Where were we thinking about eating?”</li><li>Try Ask Recall and inspect its original supporting evidence. Answers may be incomplete or conservative.</li><li>Reopen the application and confirm your saved test memory persists.</li><li>Delete the synthetic memories.</li></ol><p>Keep Play Protect and other protections enabled. If Android blocks the package, stop and ask the distributor for guidance. Google Play availability is a future goal; this release is not available there. Migration to a future production application is not guaranteed. For an existing QA installation, preserve its data and signer; do not uninstall or reset keys to troubleshoot. Safely disable app lock and verify reopening before changing device security or considering an older binary. A historical release does not guarantee safe vault downgrade.</p><p>Optional app lock requires Android 11+ with a secure screen lock. Read the permanent key-loss risk before enabling it; no credential recovery or export is available.</p></details>
      <details className={styles.details}><summary>Share useful QA feedback</summary><p>Include phone manufacturer/model, Android version, installation success or failure, feature tested, steps to reproduce, expected and actual behavior, crashes or unresponsiveness, and general performance. Use synthetic examples and redacted reports only. Never send personal memories, private screenshots, encryption keys or unnecessary device identifiers. This is a testing release, not a guaranteed support service.</p><ActionLink href={`mailto:${profile.email}?subject=${encodeURIComponent("Recall QA feedback")}&body=${encodeURIComponent("Phone manufacturer/model:\nAndroid version:\nInstallation result:\nFeature tested:\nSteps to reproduce (synthetic data only):\nExpected behavior:\nActual behavior:\nCrash or unresponsive?:\nGeneral performance:\n")}`}>Report a QA issue</ActionLink></details>
    </Section>

    <Section id="engineering" aria-labelledby="recall-engineering" className={styles.band}>
      <div className={shared.sectionHead}><p className={styles.kicker}>06 / Under the hood</p><h2 id="recall-engineering">Built to remember.<br />Engineered to hold up.</h2><p>Independent delivery across a consumer interface, native Android integration, local intelligence and a verifiable data lifecycle.</p></div>
      <div className={styles.engineering}>{engineering.map(item=><article key={item.title}><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
      <div className={styles.validation}><span className={styles.validationNumber}>82<span> / 82</span></span><div><h3>Reported host tests passed</h3><p>The Directive 009 Android engineering report records 82 passing host tests alongside native SQLCipher, encrypted image/vector lifecycle, interruption recovery, standalone offline UI and device-credential checks on an emulator. The website release did not rerun the Android suite. ARM64 was compiled and inspected, but not physically executed. These are development-report results, not a production-security guarantee.</p></div></div>
    </Section>

    <Section aria-labelledby="recall-roadmap">
      <div className={shared.sectionHead}><p className={styles.kicker}>07 / An honest roadmap</p><h2 id="recall-roadmap">A useful beginning.<br />A deliberate path forward.</h2></div>
      <div className={styles.roadmap}><article><p className={styles.kicker}>Available in QA</p><h3>The local foundation</h3><ul><li>Notes and links</li><li>PNG screenshot OCR</li><li>Encrypted local vault and neural search</li><li>On-device model and source-linked Ask Recall</li><li>Redesigned Luminance interface</li><li>Compatible-device vault locking</li></ul></article><article><p className={styles.kicker}>In development</p><h3>Confidence before reach</h3><ul><li>Answer quality and usability</li><li>Supported native cryptography maintenance</li><li>Physical-device qualification</li><li>Recovery and usability validation</li></ul></article><article><p className={styles.kicker}>Future vision / not implemented</p><h3>More ways to remember</h3><ul><li>More capable visual understanding</li><li>Shared family memories</li><li>Optional encrypted sync</li><li>Opt-in enhanced cloud reasoning</li><li>Google Play availability</li></ul></article></div>
    </Section>

    <Section aria-labelledby="recall-close" className={styles.closing}>
      <Image src={site.logo.src} width={site.logo.width} height={site.logo.height} sizes="190px" className={styles.ladimusLogo} alt="Ladimus" />
      <p className={styles.kicker}>Recall, by Ladimus</p><h2 id="recall-close">The same engineering values.<br />Something personal to carry.</h2><p>Reliability, evidence, boundaries and user control—brought into Ladimus Engineering’s first consumer-facing Android product.</p><div className={shared.actions}><ActionLink href="/work" variant="primary">Explore all work</ActionLink><ActionLink href="/projects/ladimus-review">Ladimus Review</ActionLink><ActionLink href="/ask">Ask Ladimus</ActionLink></div>
    </Section>
  </>;
}

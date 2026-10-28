import type {Metadata} from "next";
import Image from "next/image";
import {Section} from "@/components/ui/section";
import {ActionLink} from "@/components/ui/action-link";
import {RecallVisual} from "@/features/recall/recall-visual";
import {RecallDownload} from "@/features/recall/recall-download";
import {recallRelease, recallReleasePresentation} from "@/features/recall/release";
import {site, profile} from "@/config/site";
import shared from "../../projects.module.css";
import styles from "@/features/recall/recall.module.css";

const title = "Recall — Private Offline AI Memory App";
const description = "Meet Recall, by Ladimus: an Android memory application with local AI, encrypted storage, offline screenshot OCR, and evidence-linked search. Experimental public QA for synthetic data only.";
export const metadata: Metadata = {
  title, description, metadataBase: new URL("https://ladimus-portfolio.vercel.app"),
  alternates: {canonical: "/projects/recall"},
  openGraph: {title: `${title} | ${site.name}`, description, type: "website", siteName: site.name, url: "/projects/recall", images: [{url: "/images/recall/original-memory-qa.png", width: 1080, height: 2400, alt: "Recall internal QA: original-memory view with synthetic test content"}]},
  twitter: {card: "summary", title, description, images: ["/images/recall/original-memory-qa.png"]},
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
  {title: "Private storage", copy: "SQLCipher local storage, Android Keystore-backed key handling, and encrypted binary and derived vector storage. Implemented controls remain under security validation."},
  {title: "Data lifecycle", copy: "Transactional migrations, integrity checks, deletion consistency and interrupted-startup recovery are part of the current validation work."},
];
export default function RecallPage() {
  const releasePresentation = recallReleasePresentation(recallRelease);
  return <>
    <Section aria-labelledby="recall-title" className={styles.hero}>
      <a className={shared.back} href="/work">← All work</a>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>LADIMUS ENGINEERING / CONSUMER SOFTWARE</p>
          <h1 id="recall-title">Recall<span>.</span></h1><p className={styles.byline}>BY LADIMUS</p>
          <p className={styles.tagline}>Keep what matters.<br />Find it when it matters.</p>
          <p className={styles.intro}>Your own private second memory. Save notes, links and screenshots, then rediscover what matters through intelligent search and on-device AI.</p>
          <p className={styles.local}>Your memories stay on your device in the current local-only QA implementation. Recall works offline, with no account or subscription required.</p>
          <div className={shared.actions}><ActionLink href="#android" variant="primary">Android release & access</ActionLink><ActionLink href="#engineering">Explore the engineering</ActionLink></div>
          <p className={styles.stage}>Actively developed · {releasePresentation.stage} · Android</p>
        </div>
        <RecallVisual hero />
      </div>
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
      <div className={shared.editorial}><div><p className={styles.kicker}>03 / Recall intelligence</p><h2 id="recall-intelligence">Intelligence that lives with your memories.</h2></div><div className={shared.prose}><p>Local AI and semantic search help you rediscover saved information, even when you don’t remember the exact words. Ask Recall emphasizes verified source quotations and conservative evidence guards, so you can inspect the original passages.</p><p className={styles.paragraph}>The current QA build runs its bundled language model offline. It is not an unrestricted conversational assistant, and source context verifies origin—not truth or perfect understanding.</p></div></div>
      <div className={styles.pipeline} aria-label="Local retrieval architecture"><span>Saved memory</span><span>Offline OCR / text</span><span>Hybrid retrieval</span><span>Source-linked quotation</span></div>
      <details className={styles.details}><summary>How the local retrieval works</summary><p>Qwen3 0.6B runs through llama.cpp. BGE neural text embeddings complement SQLite FTS5 lexical search. Derived vector indexes are encrypted, and retrieved passages stay linked to saved originals. Free-form factual output remains disabled while answer quality and abstention reliability are improved.</p></details>
    </Section>

    <Section aria-labelledby="recall-privacy" className={styles.band}>
      <div className={shared.editorial}><div><p className={styles.kicker}>04 / Privacy & trust</p><h2 id="recall-privacy">Your memories belong to you.</h2></div><div className={shared.prose}><p>Save deliberately. Search locally. Return to the source. The current QA architecture uses SQLCipher encrypted local storage, offline OCR and on-device inference without cloud AI. Saving and deletion stay under your control.</p><p className={styles.paragraph}>No account. No subscription. No claim of absolute security.</p></div></div>
      <div className={styles.trust}><p>{releasePresentation.notice}</p><details className={styles.details}><summary>Current security and product limits</summary><p>Native cryptography maintenance and physical-device qualification are unresolved release gates in the documented QA implementation. Emulator checks do not establish real-device Keystore, OEM, thermal, battery or interruption behavior. Recovery/export and a biometric app lock are not available in that QA release. There is no completed independent production-security certification.</p></details></div>
    </Section>

    <Section id="android" aria-labelledby="recall-android">
      <div className={shared.sectionHead}><p className={styles.kicker}>05 / Android testing</p><h2 id="recall-android">Recall for Android.</h2><p>{releasePresentation.access}</p></div>
      <RecallDownload />
      <details className={styles.details}><summary>Tester quick start & installation</summary><ol className={styles.install}><li>Download the QA APK. Compare its filename, size and SHA-256 with the package identity above.</li><li>Open the downloaded APK on a compatible Android phone and follow Android’s normal installation prompts.</li><li>Allow installation from that browser or file manager only if you understand and choose to proceed. Revoke that source permission after installation.</li><li>Launch Recall. Local models are bundled; no first-launch model download or account is required.</li><li>Create a fictional note: “Willow Creek Bistro has excellent chicken alfredo. We should try it next Saturday.”</li><li>Import a disposable PNG screenshot containing synthetic information.</li><li>Try semantic search: “Where were we thinking about eating?”</li><li>Try Ask Recall and inspect its original supporting evidence. Answers may be incomplete or conservative.</li><li>Reopen the application and confirm your saved test memory persists.</li><li>Delete the synthetic memories.</li></ol><p>Keep Play Protect and other protections enabled. If Android blocks the package, stop and ask the distributor for guidance. Google Play availability is a future goal; this release is not available there. Migration to a future production application is not guaranteed.</p></details>
      <details className={styles.details}><summary>Share useful QA feedback</summary><p>Include phone manufacturer/model, Android version, installation success or failure, feature tested, steps to reproduce, expected and actual behavior, crashes or unresponsiveness, and general performance. Use synthetic examples and redacted reports only. Never send personal memories, private screenshots, encryption keys or unnecessary device identifiers. This is a testing release, not a guaranteed support service.</p><ActionLink href={`mailto:${profile.email}?subject=${encodeURIComponent("Recall QA feedback")}&body=${encodeURIComponent("Phone manufacturer/model:\nAndroid version:\nInstallation result:\nFeature tested:\nSteps to reproduce (synthetic data only):\nExpected behavior:\nActual behavior:\nCrash or unresponsive?:\nGeneral performance:\n")}`}>Report a QA issue</ActionLink></details>
    </Section>

    <Section id="engineering" aria-labelledby="recall-engineering" className={styles.band}>
      <div className={shared.sectionHead}><p className={styles.kicker}>06 / Under the hood</p><h2 id="recall-engineering">Built to remember.<br />Engineered to hold up.</h2><p>Independent delivery across a consumer interface, native Android integration, local intelligence and a verifiable data lifecycle.</p></div>
      <div className={styles.engineering}>{engineering.map(item=><article key={item.title}><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
      <div className={styles.validation}><span className={styles.validationNumber}>65<span> / 65</span></span><div><h3>Reported host tests passed</h3><p>The supplied development report records 65 passing host tests alongside native instrumentation, emulator lifecycle checks and reproducible signed APK packaging. ARM64 was compiled and inspected, but not physically executed. These are development-report results, not a production-security guarantee.</p></div></div>
    </Section>

    <Section aria-labelledby="recall-roadmap">
      <div className={shared.sectionHead}><p className={styles.kicker}>07 / An honest roadmap</p><h2 id="recall-roadmap">A useful beginning.<br />A deliberate path forward.</h2></div>
      <div className={styles.roadmap}><article><p className={styles.kicker}>Available in QA</p><h3>The local foundation</h3><ul><li>Notes and links</li><li>PNG screenshot OCR</li><li>Encrypted local vault and neural search</li><li>On-device model and source-linked quotations</li></ul></article><article><p className={styles.kicker}>In development</p><h3>Confidence before reach</h3><ul><li>Answer quality and usability</li><li>Supported native cryptography maintenance</li><li>Physical-device qualification</li></ul></article><article><p className={styles.kicker}>Future vision / not implemented</p><h3>More ways to remember</h3><ul><li>More capable visual understanding</li><li>Shared family memories</li><li>Optional encrypted sync and cloud intelligence</li><li>Google Play availability</li></ul></article></div>
    </Section>

    <Section aria-labelledby="recall-close" className={styles.closing}>
      <Image src={site.logo.src} width={site.logo.width} height={site.logo.height} sizes="190px" className={styles.ladimusLogo} alt="Ladimus" />
      <p className={styles.kicker}>Recall, by Ladimus</p><h2 id="recall-close">The same engineering values.<br />Something personal to carry.</h2><p>Reliability, evidence, boundaries and user control—brought into Ladimus Engineering’s first consumer-facing Android product.</p><div className={shared.actions}><ActionLink href="/work" variant="primary">Explore all work</ActionLink><ActionLink href="/projects/ladimus-review">Ladimus Review</ActionLink><ActionLink href="/ask">Ask Ladimus</ActionLink></div>
    </Section>
  </>;
}

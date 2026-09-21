import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ActionLink } from "@/components/ui/action-link";
import { ReviewVisual } from "@/features/projects/review-visual";
import { ProjectMedia } from "@/features/projects/project-media";
import { reviewStory, reviewMedia } from "@/content/ladimus-review";
import { ladimusReview } from "@/content/projects";
import { profile, site } from "@/config/site";
import styles from "../../projects.module.css";

export const metadata: Metadata = {
  title: "Ladimus Review", description: ladimusReview.summary,
  openGraph: { title: `Ladimus Review | ${site.name}`, description: ladimusReview.summary, type: "website", siteName: site.name },
  twitter: { card: "summary", title: "Ladimus Review", description: ladimusReview.summary },
};

export default function LadimusReview() {
  return (
    <>
      <Section aria-labelledby="review-title" className={styles.hero} visual="review">
        <a className={styles.back} href="/work" data-topology-clear>← All work</a>
        <div className={styles.split}>
          <div data-topology-clear>
            <p className={styles.eyebrow}>Flagship / {ladimusReview.category}</p>
            <h1 id="review-title">Ladimus<br /><span>Review.</span></h1>
            <p className={styles.lead}>{ladimusReview.summary}</p>
            <div className={styles.actions}><ActionLink href="#overview" variant="primary">Explore the approach</ActionLink><ActionLink href="#proof">Project captures</ActionLink><ActionLink href={ladimusReview.repositoryUrl}>View source on GitHub</ActionLink></div>
          </div>
          <div data-topology-clear><ReviewVisual /></div>
        </div>
        <dl className={styles.facts} data-topology-clear><div><dt>Engineer</dt><dd>{profile.name}</dd></div><div><dt>Context</dt><dd>Independent Ladimus work</dd></div><div><dt>Focus</dt><dd>Validation-oriented AI engineering</dd></div></dl>
        <ol className={styles.checkpoints} aria-label="Conceptual engineering authority boundaries" data-topology-clear>
          <li><span aria-hidden="true">01</span>AI output</li>
          <li><span aria-hidden="true">02</span>Validation</li>
          <li><span aria-hidden="true">03</span>Approval</li>
          <li><span aria-hidden="true">04</span>Execution authority</li>
        </ol>
      </Section>
      <Section id="overview" aria-labelledby="overview-title">
        <div className={styles.editorial}><div><p className={styles.eyebrow}>01 / Overview</p><h2 id="overview-title">Trust needs<br />a foundation.</h2></div><p className={styles.lead}>{reviewStory.overview}</p></div>
      </Section>
      <Section aria-labelledby="problem-title" className={styles.band}>
        <div className={styles.editorial}><div><p className={styles.eyebrow}>02 / The problem</p><h2 id="problem-title">Plausible isn’t<br />the same as proven.</h2></div><div className={styles.prose}><p>{reviewStory.problem}</p><blockquote>What would make this output safe to trust?</blockquote></div></div>
      </Section>
      <Section aria-labelledby="principles-title">
        <div className={styles.sectionHead}><p className={styles.eyebrow}>03 / Engineering perspective</p><h2 id="principles-title">What the project sets out to demonstrate.</h2><p>Design principles behind the work, illustrated by the project captures below. Measured outcomes are not yet published here.</p></div>
        <div className={styles.principles}>{reviewStory.principles.map((item, index) => <article key={item.title}><span className={styles.eyebrow}>0{index + 1}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
      </Section>
      <Section aria-labelledby="workflow-title" className={styles.band} visual="review">
        <div className={styles.sectionHead} data-topology-clear><p className={styles.eyebrow}>04 / Workflow perspective</p><h2 id="workflow-title">From output to an informed decision.</h2><p>A conceptual review process—not a claim about a shipped implementation.</p></div>
        <ol className={styles.workflow} data-topology-clear>{reviewStory.workflow.map((step, index) => <li key={step.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></li>)}</ol>
      </Section>
      <Section aria-labelledby="stack-title">
        <div className={styles.editorial}><div><p className={styles.eyebrow}>05 / Technology stack</p><h2 id="stack-title">Implementation details.</h2></div><div className={styles.prose}><p>{reviewStory.stackNote}</p><ul className={styles.tags}>{ladimusReview.themes.map(theme => <li key={theme}>{theme}</li>)}</ul></div></div>
      </Section>
      <Section id="proof" aria-labelledby="proof-title" className={styles.band}>
        <div className={styles.sectionHead}><p className={styles.eyebrow}>06 / Proof & media</p><h2 id="proof-title">A place for the evidence.</h2><p>Real project captures of structured review, human approval, and fail-closed execution authority. A video walkthrough is planned and remains unpublished.</p></div>
        <ProjectMedia items={reviewMedia} />
      </Section>
      <Section aria-labelledby="next-title" className={styles.closing}>
        <p className={styles.eyebrow}>Continue exploring</p><h2 id="next-title">Good engineering invites closer inspection.</h2>
        <div className={styles.actions}><ActionLink href="/work" variant="primary">Back to work</ActionLink><ActionLink href="/">Home</ActionLink><ActionLink href={profile.githubUrl}>Luis on GitHub</ActionLink></div>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ActionLink } from "@/components/ui/action-link";
import { ProjectCard } from "@/features/projects/project-card";
import { projects } from "@/content/projects";
import { profile, site } from "@/config/site";
import styles from "../projects.module.css";

const title = "Selected Work";
const description = "Explore Luis Tomassini’s independent engineering work, led by Ladimus Review: validation-oriented AI engineering and developer tooling.";
export const metadata: Metadata = {
  title, description,
  openGraph: { title: `${title} | ${site.name}`, description, type: "website", siteName: site.name },
  twitter: { card: "summary", title, description },
};

export default function Work() {
  return (
    <>
      <Section aria-labelledby="work-title" className={styles.hero} visual="systems">
        <div className={styles.workIntro} data-topology-clear>
        <p className={styles.eyebrow}>Work / {profile.name}</p>
        <h1 id="work-title">Engineering beyond<br /><span>the generated answer.</span></h1>
        <p className={styles.lead}>Independent systems, tooling, and the decisions behind them. Built around one recurring question: what makes engineering output trustworthy?</p>
        <div className={styles.actions}><ActionLink href="#featured" variant="primary">Inspect featured work</ActionLink><ActionLink href={profile.githubUrl}>GitHub profile</ActionLink></div>
        </div>
      </Section>
      <Section id="featured" aria-labelledby="featured-title" visual="systems">
        <div className={styles.sectionHead} data-topology-clear><p className={styles.eyebrow}>01 / Selected project</p><h2 id="featured-title">A focus on reliability.</h2><p>AI engineering, developer tooling, and explicit engineering boundaries.</p></div>
        <div className={styles.projectList} data-topology-clear>{projects.map(project => <ProjectCard key={project.slug} project={project} />)}</div>
      </Section>
      <Section aria-labelledby="connect-title" className={styles.closing}>
        <p className={styles.eyebrow}>Open to opportunities</p>
        <h2 id="connect-title">Interested in the engineer behind the work?</h2>
        <div className={styles.actions}><ActionLink href="/#about">Meet Luis</ActionLink><ActionLink href={`mailto:${profile.email}`} variant="primary">Get in touch</ActionLink></div>
      </Section>
    </>
  );
}

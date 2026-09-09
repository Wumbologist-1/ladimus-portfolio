import { ActionLink } from "@/components/ui/action-link";
import { Section } from "@/components/ui/section";
import { site } from "@/config/site";
import { projects } from "@/content/projects";
import type { Project } from "@/features/projects/types";
import styles from "./page.module.css";

const statusLabels: Record<Project["status"], string> = {
  planned: "Planned",
  "in-progress": "In development",
  released: "Released",
};

export default function Home() {
  return (
    <>
      <Section aria-labelledby="hero-title" className={styles.hero}>
        <div className={styles.heroTop}>
          <p className={styles.eyebrow}>{site.hero.eyebrow}</p>
          <p className={styles.status}><span aria-hidden="true" />{site.hero.status}</p>
        </div>
        <h1 id="hero-title" className={styles.wordmark}>LADIMUS</h1>
        <p className={styles.headline}>{site.hero.headline}</p>
        <p className={styles.introduction}>{site.description}</p>
        <div className={styles.actions}>
          <ActionLink href="#work" variant="primary">Explore Work</ActionLink>
          <ActionLink href={site.githubUrl ?? "#github"}>GitHub</ActionLink>
          <a className={styles.profileLink} href="#profile">Resume / professional profile <span aria-hidden="true">↓</span></a>
        </div>
        <ul className={styles.disciplines} aria-label="Engineering focus">
          {site.hero.disciplines.map((discipline) => <li key={discipline}>{discipline}</li>)}
        </ul>
      </Section>

      <Section id="work" aria-labelledby="work-title" className={styles.work}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>01 / Work</p>
          <h2 id="work-title">A foundation in progress.</h2>
          <p>Systems, tools, and the engineering decisions behind them.</p>
        </div>
        <ul className={styles.projects} aria-label="Projects">
          {projects.map((project) => (
            <li key={project.slug}>
              <article className={styles.project} aria-labelledby={`project-${project.slug}`}>
                <div className={styles.projectMeta}>
                  <p className={styles.category}>{project.category}</p>
                  <span className={styles.badge}>{statusLabels[project.status]}</span>
                </div>
                <h3 id={`project-${project.slug}`}>{project.title}</h3>
                <p className={styles.projectSummary}>{project.summary}</p>
                <ul className={styles.technologies} aria-label={`${project.title} technologies`}>
                  {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="profile" aria-labelledby="profile-title">
        <div className={styles.profile}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>02 / Perspective</p>
            <h2 id="profile-title">{site.profile.title}</h2>
          </div>
          <div className={styles.profileCopy}>
            <p>{site.profile.description}</p>
            <p className={styles.placeholder}>{site.profile.resumeNote}</p>
            {!site.githubUrl && <p id="github" className={styles.placeholder}>GitHub profile link coming soon.</p>}
          </div>
        </div>
      </Section>
    </>
  );
}

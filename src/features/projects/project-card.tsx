import { ActionLink } from "@/components/ui/action-link";
import type { Project } from "./types";
import { ReviewVisual } from "./review-visual";
import styles from "./project-card.module.css";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article data-field-reactive className={styles.card} aria-labelledby={`project-${project.slug}`}>
      <div className={styles.copy}>
        <p className={styles.label}>Flagship / Independent engineering</p>
        <p className={styles.category}>{project.category}</p>
        <h3 id={`project-${project.slug}`}>{project.title}</h3>
        <p className={styles.summary}>{project.summary}</p>
        <ul className={styles.tags} aria-label={`${project.title} themes`}>
          {project.themes?.map(theme => <li key={theme}>{theme}</li>)}
        </ul>
        {project.detailUrl && <ActionLink href={project.detailUrl} variant="primary">Explore {project.title}</ActionLink>}
      </div>
      <ReviewVisual />
    </article>
  );
}

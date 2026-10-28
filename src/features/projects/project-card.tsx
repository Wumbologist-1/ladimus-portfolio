import { ActionLink } from "@/components/ui/action-link";
import type { Project } from "./types";
import { RecallVisual } from "@/features/recall/recall-visual";
import { ReviewVisual } from "./review-visual";
import styles from "./project-card.module.css";

export function ProjectCard({ project }: { project: Project }) {
  const visual = {
    review: <ReviewVisual />,
    recall: <RecallVisual />,
    intelligence: <div className={styles.intelligenceVisual} aria-label="Ask Ladimus retrieval architecture"><span>CAREER INTELLIGENCE</span><strong>Question.<br/>Evidence.<br/>Authority.</strong><ol><li>Public corpus</li><li>Bounded retrieval</li><li>Grounded response</li></ol><p>Every claim has a boundary.</p></div>,
  }[project.visual];
  return (
    <article data-field-reactive className={styles.card} aria-labelledby={`project-${project.slug}`}>
      <div className={styles.copy}>
        <p className={styles.label}>Flagship / Independent engineering</p>
        <p className={styles.category}>{project.category}</p>
        <h3 id={`project-${project.slug}`}>{project.title}</h3>
        <p className={styles.summary}>{project.summary}</p>
        {project.status && <p className={styles.maturity}>{({"planned":"Planned", "in-progress":"In development", "released":"Released", "internal-qa":"Internal QA · Synthetic-data testing"})[project.status]}</p>}
        <ul className={styles.tags} aria-label={`${project.title} themes`}>
          {project.themes?.map(theme => <li key={theme}>{theme}</li>)}
        </ul>
        {project.detailUrl && <ActionLink href={project.detailUrl} variant="primary">Explore {project.title}</ActionLink>}
      </div>
      {visual}
    </article>
  );
}

import Image from "next/image";
import { ProjectCard } from "@/features/projects/project-card";
import { ReviewVisual } from "@/features/projects/review-visual";
import { ActionLink } from "@/components/ui/action-link";
import { Section } from "@/components/ui/section";
import { contactLinks, profile, site } from "@/config/site";
import { projects } from "@/content/projects";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Section aria-labelledby="hero-title" className={styles.hero} visual="possibility">
        <div className={styles.heroTop} data-topology-clear>
          <p className={styles.eyebrow}>{site.hero.eyebrow}</p>
          <p className={styles.status}><span aria-hidden="true" />{site.hero.status}</p>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-topology-clear>
            <Image className={styles.logo} src={site.logo.src} width={site.logo.width} height={site.logo.height} sizes="(max-width: 420px) 90vw, 368px" alt="Ladimus" preload />
            <h1 id="hero-title" className={styles.wordmark}>{site.name}</h1>
            <p className={styles.engineer}>{profile.name}</p>
            <p className={styles.headline}>{site.hero.headline}</p>
            <p className={styles.introduction}>{site.hero.introduction}</p>
            <p className={styles.identity}>{site.hero.identity}</p>
            <div className={styles.actions}>
              <ActionLink href="/work" variant="primary">Explore My Work</ActionLink>
              <ActionLink href={profile.githubUrl}>GitHub</ActionLink>
              <a className={styles.profileLink} href={profile.linkedinUrl}>LinkedIn <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <aside className={styles.heroFeature} aria-label="Featured engineering work" data-topology-clear>
            <p className={styles.eyebrow}>Inside the work / Ladimus Review</p>
            <ReviewVisual />
            <a className={styles.profileLink} href="/projects/ladimus-review">Explore validation-oriented AI engineering <span aria-hidden="true">↗</span></a>
          </aside>
        </div>
        <ul className={styles.disciplines} aria-label="Engineering disciplines" data-topology-clear>
          {site.hero.disciplines.map((discipline) => <li key={discipline}>{discipline}</li>)}
        </ul>
      </Section>

      <Section aria-labelledby="focus-title" className={styles.focus} visual="structure">
        <div className={styles.sectionHeading} data-topology-clear>
          <p className={styles.eyebrow}>01 / Engineering focus</p>
          <h2 id="focus-title">From infrastructure to intelligence.</h2>
        </div>
        <div className={styles.focusGrid} data-topology-clear>
          {site.focus.map((area, index) => (
            <article key={area.title} className={styles.focusCard}>
              <span className={styles.index} aria-hidden="true">0{index + 1}</span>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
              <ul>{area.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </Section>

      <Section id="work" aria-labelledby="work-title" className={styles.work} visual="evidence">
        <div className={styles.sectionHeading} data-topology-clear>
          <p className={styles.eyebrow}>02 / Featured work</p>
          <h2 id="work-title">Trust is an engineering problem.</h2>
          <p>Independent work at the intersection of AI, tooling, and reliability.</p>
        </div>
        <div className={styles.actions} data-topology-clear><ActionLink href="/work">View all work</ActionLink></div>
        <ul className={styles.projects} aria-label="Featured projects" data-topology-clear>
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="about" aria-labelledby="about-title" visual="authority">
        <div className={styles.profile} data-topology-clear>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>03 / About the engineer</p>
            <h2 id="about-title">{site.about.title}</h2>
          </div>
          <div className={styles.profileCopy}>
            <p>{site.about.description}</p>
            <p>{site.about.detail}</p>
          </div>
        </div>
        <ol className={styles.journey} aria-label="Engineering progression" data-topology-clear>
          {site.about.progression.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </Section>

      <Section id="contact" aria-labelledby="contact-title" className={styles.contact} visual="authority">
        <div className={styles.sectionHeading} data-topology-clear>
          <p className={styles.status}><span aria-hidden="true" />{site.hero.status}</p>
          <h2 id="contact-title">{site.contact.title}</h2>
          <p>{site.contact.description}</p>
        </div>
        <ul className={styles.contactGrid} aria-label="Contact and professional profiles" data-topology-clear>
          {contactLinks.map((link) => link.href ? (
            <li id={link.id} key={link.id} className={styles.contactItem}>
              <ActionLink href={link.href}>{link.label}</ActionLink>
            </li>
          ) : null)}
        </ul>
      </Section>
    </>
  );
}

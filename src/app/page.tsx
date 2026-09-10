import Image from "next/image";
import { ActionLink } from "@/components/ui/action-link";
import { Section } from "@/components/ui/section";
import { contactLinks, profile, site } from "@/config/site";
import { projects } from "@/content/projects";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Section aria-labelledby="hero-title" className={styles.hero}>
        <div className={styles.heroTop}>
          <p className={styles.eyebrow}>{site.hero.eyebrow}</p>
          <p className={styles.status}><span aria-hidden="true" />{site.hero.status}</p>
        </div>
        <Image className={styles.logo} src={site.logo.src} width={site.logo.width} height={site.logo.height} sizes="(max-width: 560px) 90vw, 480px" alt="Ladimus" preload />
        <h1 id="hero-title" className={styles.wordmark}>{site.name}</h1>
        <p className={styles.engineer}>{profile.name}</p>
        <p className={styles.headline}>{site.hero.headline}</p>
        <p className={styles.introduction}>{site.hero.introduction}</p>
        <p className={styles.identity}>{site.hero.identity}</p>
        <div className={styles.actions}>
          <ActionLink href="#work" variant="primary">Explore My Work</ActionLink>
          <ActionLink href={profile.githubUrl}>GitHub</ActionLink>
          <a className={styles.profileLink} href={profile.linkedinUrl}>LinkedIn <span aria-hidden="true">↗</span></a>
        </div>
        <ul className={styles.disciplines} aria-label="Engineering disciplines">
          {site.hero.disciplines.map((discipline) => <li key={discipline}>{discipline}</li>)}
        </ul>
      </Section>

      <Section aria-labelledby="focus-title" className={styles.focus}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>01 / Engineering focus</p>
          <h2 id="focus-title">From infrastructure to intelligence.</h2>
        </div>
        <div className={styles.focusGrid}>
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

      <Section id="work" aria-labelledby="work-title" className={styles.work}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>02 / Featured work</p>
          <h2 id="work-title">Trust is an engineering problem.</h2>
          <p>Independent work at the intersection of AI, tooling, and reliability.</p>
        </div>
        <ul className={styles.projects} aria-label="Featured projects">
          {projects.map((project) => (
            <li key={project.slug}>
              <article className={styles.project} aria-labelledby={`project-${project.slug}`}>
                <div>
                  <div className={styles.projectMeta}>
                    <p className={styles.category}>{project.category}</p>
                    <span className={styles.badge}>Flagship project</span>
                  </div>
                  <h3 id={`project-${project.slug}`}>{project.title}</h3>
                  <p className={styles.projectSummary}>{project.summary}</p>
                  <ul className={styles.technologies} aria-label={`${project.title} themes`}>
                    {project.themes.map((theme) => <li key={theme}>{theme}</li>)}
                  </ul>
                </div>
                <aside className={styles.projectAside} aria-label="Project perspective">
                  <p className={styles.eyebrow}>The central question</p>
                  <p className={styles.projectQuestion}>The code is generated.<br />What makes it trustworthy?</p>
                  <div className={styles.rule} aria-hidden="true" />
                  <p>Reliability starts with how we evaluate engineering output.</p>
                  <a className={styles.profileLink} href="#about">My engineering perspective <span aria-hidden="true">↓</span></a>
                </aside>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="about" aria-labelledby="about-title">
        <div className={styles.profile}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>03 / About the engineer</p>
            <h2 id="about-title">{site.about.title}</h2>
          </div>
          <div className={styles.profileCopy}>
            <p>{site.about.description}</p>
            <p>{site.about.detail}</p>
          </div>
        </div>
        <ol className={styles.journey} aria-label="Engineering progression">
          {site.about.progression.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </Section>

      <Section id="contact" aria-labelledby="contact-title" className={styles.contact}>
        <div className={styles.sectionHeading}>
          <p className={styles.status}><span aria-hidden="true" />{site.hero.status}</p>
          <h2 id="contact-title">{site.contact.title}</h2>
          <p>{site.contact.description}</p>
        </div>
        <ul className={styles.contactGrid} aria-label="Contact and professional profiles">
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

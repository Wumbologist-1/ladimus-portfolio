import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { AskConsole } from "@/features/ask-ladimus/ask-console";
import { LadimusCore } from "@/features/living-interface/ladimus-core";
import styles from "./page.module.css";
export const metadata:Metadata={title:"Ask Ladimus — Career Intelligence",description:"Explore Luis Tomassini’s engineering experience through retrieved public evidence, precise system maturity, and grounded responses."};
export default function AskPage(){return <>
  <Section aria-labelledby="ask-title" visual="intelligence" className={styles.hero}>
    <div className={styles.intro}><div data-topology-clear><p className={styles.eyebrow}>Ladimus Intelligence / Career evidence</p><h1 id="ask-title">Ask <span>Ladimus.</span></h1><p className={styles.lead}>Experience you can inspect.<br/>Answers that hold up.</p><p className={styles.description}>Explore the systems Luis built, the decisions behind them, and the evidence that supports each claim.</p><ol className={styles.flow} aria-label="Answer pipeline"><li>Query</li><li>Retrieval</li><li>Evidence</li><li>Response</li></ol></div><div className={styles.core}><LadimusCore /></div></div>
    <AskConsole />
  </Section>
  <Section aria-labelledby="how-title" visual="evidence"><div data-topology-clear className={styles.architecture}><p className={styles.eyebrow}>Inside the interface</p><h2 id="how-title">Trust is built at the boundaries.</h2><p>Ask Ladimus separates approved career evidence from generated output. Production systems, prototypes, and architecture work retain their own maturity labels.</p>
    <ol className={styles.steps}><li><span>01 / Private source</span><h3>Review before publication</h3><p>Career sources are reviewed offline. Raw documents and excluded personal data stay outside the application.</p></li><li><span>02 / Public corpus</span><h3>Evidence with provenance</h3><p>Sanitized records retain architecture, implementation, outcomes, and explicit claim limits. Conflicting titles and dates follow canonical rules.</p></li><li><span>03 / Retrieval</span><h3>A bounded evidence set</h3><p>Lexical matches, intent hints, and skill-to-system references select up to five evidence chunks. Only those chunks enter generation.</p></li><li><span>04 / Grounded answer</span><h3>Every statement traceable</h3><p>The model selects relevant approved statements. Server validation rejects unknown evidence IDs and unsupported text before rendering.</p></li></ol>
    <ul className={styles.boundaries}><li>Evidence-bound responses</li><li>Sanitized public corpus</li><li>Server-side model access</li><li>Explicit uncertainty</li></ul><p className={styles.note}>If generation is unavailable, retrieved evidence remains inspectable. This interface does not calculate years of expertise or infer deployment from framework familiarity.</p>
  </div></Section>
</>;}

import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import homepageImage from '@site/static/img/just-the-devops-docs.png';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <span className={styles.statusDot} aria-hidden="true" />
            Knowledge base / in italiano
          </span>
          <Heading as="h1" className={styles.heroTitle}>
            La conoscenza tecnica,<br />
            <span>messa nero su bianco.</span>
          </Heading>
          <p className={styles.heroSubtitle}>
            Fonti diverse, un punto di partenza. Appunti e approfondimenti su DevOps,
            Kubernetes e sistemi, per capire come funzionano e ritrovare ciò che serve.
          </p>
          <div className={styles.buttons}>
            <Link className={styles.primaryButton} to="/docs/">
              Esplora la documentazione
            </Link>
            <Link className={styles.textLink} to="/docs/k8s/installation/prerequirements">
              Parti da Kubernetes <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className={styles.heroIllustration}>
          <div className={styles.figureHeader}>
            <span>just-the-devops-docs /</span>
            <span aria-hidden="true">[ open knowledge ]</span>
          </div>
          <div className={styles.imageCanvas}>
            <img src={homepageImage} alt="Just the DevOps Docs" fetchPriority="high" />
          </div>
          <div className={styles.figureFooter}>
            <span>Leggere. Capire. Condividere.</span>
            <span aria-hidden="true">↗</span>
          </div>
        </div>
      </div>
      <div className={styles.heroFootnote}>
        <span>Costruita per imparare, aperta a chi vuole contribuire.</span>
        <Link to="https://github.com/devops-playground-as/just-the-devops-docs">
          Il progetto su GitHub <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}

function KnowledgePrinciples() {
  return (
    <section className={styles.principles} aria-labelledby="approach-title">
      <div>
        <span className={styles.sectionLabel}>02 / Il metodo</span>
        <Heading as="h2" id="approach-title">Capire prima.<br />Scrivere poi.</Heading>
        <p className={styles.principlesIntro}>
          Il valore è anche nel percorso: studiare le fonti, mettere a fuoco i concetti
          e renderli utili a chi verrà dopo.
        </p>
      </div>
      <ol className={styles.methodList}>
        <li>
          <Heading as="h3">Partire dalle fonti</Heading>
          <p>Libri, documentazione e articoli: prospettive diverse per approfondire lo stesso argomento.</p>
        </li>
        <li>
          <Heading as="h3">Rielaborare per comprendere</Heading>
          <p>Contenuti studiati e scritti dai contributor, in italiano e con riferimenti alle fonti.</p>
        </li>
        <li>
          <Heading as="h3">Condividere per crescere</Heading>
          <p>Una base di conoscenza aperta, da consultare, correggere e arricchire insieme.</p>
        </li>
      </ol>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Appunti e guide su DevOps, Kubernetes e sistemi"
      description="Una knowledge base in italiano su DevOps, container, Kubernetes e sistemi.">
      <div className={styles.homepage}>
        <HomepageHeader />
        <main>
          <HomepageFeatures />
          <div className={styles.contentWidth}>
            <KnowledgePrinciples />
          </div>
        </main>
      </div>
    </Layout>
  );
}

import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import ServerStatusIllustration from '@site/static/img/server-status.svg';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Knowledge base: DevOps &amp; Beyond</span>
          <Heading as="h1" className={styles.heroTitle}>
            La conoscenza tecnica,<br />
            messa nero su bianco.
          </Heading>
          <p className={styles.heroSubtitle}>
            {siteConfig.title} raccoglie ed approfondisce concetti, casi limite e riferimenti per
            comprendere meglio principalmente gli strumenti DevOps e non solo.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/">
              Esplora gli argomenti
            </Link>
            <Link className={styles.textLink} to="/docs/k8s/prerequirements">
              Inizia da Kubernetes <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className={styles.heroIllustration}>
          <ServerStatusIllustration role="img" aria-label="Illustrazione di un server monitorato" />
        </div>
      </div>
    </header>
  );
}

function KnowledgePrinciples() {
  return (
    <section className={styles.principles}>
      <div>
        <span className={styles.sectionLabel}>L&apos;approccio</span>
        <Heading as="h2">Note pensate per essere ritrovate e riutilizzate.</Heading>
      </div>
      <p>
        <b>Non una raccolta di appunti sparsi</b>: una documentazione in evoluzione,
        scritta per <b>fissare i concetti</b> e <b>tornare rapidamente alle informazioni </b>
        che servono nel lavoro quotidiano.
      </p>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Appunti e guide su DevOps, Kubernetes e sistemi"
      description="Una knowledge base in italiano su DevOps, container, Kubernetes e sistemi.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <div className="container">
          <KnowledgePrinciples />
        </div>
      </main>
    </Layout>
  );
}

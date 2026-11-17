import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Docker',
    label: 'Container',
    path: 'docs/docker/',
    description: 'Dalle immagini ai processi: capire cosa succede dentro un container e come costruirlo meglio.',
    to: '/docs/docker/docker-instructions',
  },
  {
    title: 'Kubernetes',
    label: 'Orchestrazione',
    path: 'docs/k8s/',
    description: 'Installazione, risorse, networking e casi pratici. Un percorso per orientarsi nel cluster.',
    to: '/docs/k8s/installation/prerequirements',
  },
  {
    title: 'Site Reliability',
    label: 'Affidabilità',
    path: 'docs/site-reliability/',
    description: 'SLI e SLO: misurare il comportamento dei servizi e definire cosa significa essere affidabili.',
    to: '/docs/site-reliability/sli-slo',
  },
];

export default function HomepageFeatures() {
  return (
    <section className={styles.features} aria-labelledby="topics-title">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionLabel}>01 / Esplora gli argomenti</span>
            <Heading as="h2" id="topics-title">Da dove vuoi partire?</Heading>
          </div>
          <p>Concetti, esempi e casi limite.<br />Un argomento alla volta.</p>
        </div>
        <div className={styles.featureGrid}>
          {FeatureList.map(({title, label, path, description, to}, idx) => (
            <Link className={styles.featureCard} to={to} key={title}>
              <div className={styles.cardHeader}>
                <span>{label}</span>
                <span className={styles.cardNumber} aria-hidden="true">0{idx + 1}</span>
              </div>
              <Heading as="h3">{title}</Heading>
              <p>{description}</p>
              <span className={styles.featureLink}>
                <span>{path}</span><span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

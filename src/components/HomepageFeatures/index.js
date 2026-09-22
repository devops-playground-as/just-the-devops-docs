import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Docker',
    label: 'Container',
    description: 'Immagini, cache di build, processi e concetti fondamentali per lavorare con i container.',
    to: '/docs/docker/docker-instructions',
  },
  {
    title: 'Kubernetes',
    label: 'Orchestrazione',
    description: 'Risorse, networking, scheduling e casi pratici per orientarsi nel cluster.',
    to: '/docs/k8s/prerequirements',
  },
  {
    title: 'In espansione',
    label: 'Prossimamente',
    description: 'Linux, sistemi distribuiti e altri fondamenti dell’infrastruttura moderna.',
  },
];

function Feature({title, label, description, to}) {
  const content = <>
    <span className={styles.featureLabel}>{label}</span>
    <Heading as="h3">{title}</Heading>
    <p>{description}</p>
    {to && <span className={styles.featureLink}>Esplora <span aria-hidden="true">→</span></span>}
  </>;

  return (
    <div className={clsx('col col--4')}>
      {to ? <Link className={styles.featureCard} to={to}>{content}</Link> : <div className={styles.featureCard}>{content}</div>}
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

// @ts-check

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Just the DevOps Docs',
  tagline: '...and more!',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://devops-playground-as.github.io',
  baseUrl: '/just-the-devops-docs/',
  organizationName: 'devops-playground-as',
  projectName: 'just-the-devops-docs',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'it',
    locales: ['it'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Just-The-DevOps-Docs',
        logo: {
          alt: 'Just-The-DevOps-Docs',
          src: 'img/logo.png',
        },
        items: [
          {
            to: '/docs/',
            position: 'left',
            label: 'DevOps',
          },
          {
            href: 'https://github.com/devops-playground-as/just-the-devops-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          // {
          //   title: 'Documentazione',
          //   items: [{label: 'DevOps', to: '/docs/'}],
          // },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Just-The-DevOps-Docs. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;

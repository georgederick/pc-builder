export const SITE = {
  name: 'PC Builder',
  slogan: 'Build your dream machine.',
  creator: 'Georgederick',
  year: 2026,
  description:
    'Plataforma de montagem de computadores com verificação de compatibilidade, comparador de componentes e builds prontas.',
  links: {
    github: 'https://github.com/Georgederick',
    repository: 'https://github.com/Georgederick/pc-builder',
    linkedin: 'https://www.linkedin.com/in/georgederick',
    instagram: 'https://www.instagram.com/georgederick',
    x: 'https://x.com/georgederick',
  },
} as const;

export type SocialKey = keyof typeof SITE.links;

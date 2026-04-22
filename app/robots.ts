import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/manage/', '/api/', '/_next/'],
    },
    sitemap: 'https://www.xn--42cf2bdb5dorp5fubrbrf74a0b.com/sitemap.xml',
  };
}

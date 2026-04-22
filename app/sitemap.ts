import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.xn--42cf2bdb5dorp5fubrbrf74a0b.com';

  // Fetch dynamic collections
  const [catalogResponse, portfolioResponse, blogResponse] = await Promise.all([
    supabase.from('service_catalog').select('slug, updated_at'),
    supabase.from('portfolios').select('slug, updated_at'),
    supabase.from('blog_posts').select('slug, updated_at').eq('is_published', true),
  ]);

  const catalogUrls = (catalogResponse.data || []).map((item) => ({
    url: `${baseUrl}/catalog/${item.slug}`,
    lastModified: item.updated_at || new Date().toISOString(),
  }));

  const portfolioUrls = (portfolioResponse.data || []).map((item) => ({
    url: `${baseUrl}/portfolio/${item.slug}`,
    lastModified: item.updated_at || new Date().toISOString(),
  }));

  const blogUrls = (blogResponse.data || []).map((item) => ({
    url: `${baseUrl}/blog/${item.slug}`,
    lastModified: item.updated_at || new Date().toISOString(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString(),
    },
    ...catalogUrls,
    ...portfolioUrls,
    ...blogUrls,
  ];
}

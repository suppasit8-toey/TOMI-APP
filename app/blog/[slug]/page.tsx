import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CalendarBlank, Tag, ArrowLeft, Clock } from '@phosphor-icons/react/dist/ssr';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await supabase.from('blog_posts').select('title,excerpt,meta_title,meta_description,cover_image_url').eq('slug', slug).single();
    if (!data) return { title: 'ไม่พบบทความ — TOMI FILM' };
    return {
      title: data.meta_title || `${data.title} — TOMI FILM`,
      description: data.meta_description || data.excerpt,
      openGraph: {
        title: data.meta_title || data.title,
        description: data.meta_description || data.excerpt,
        images: data.cover_image_url ? [data.cover_image_url] : [],
        type: 'article',
      },
    };
  } catch {
    return { title: 'บทความ — TOMI FILM' };
  }
}

import { blogPosts as fallbackPosts } from '@/lib/data/blog';

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post: any = null;

  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    if (data) {
      post = data;
    } else {
      post = fallbackPosts.find(p => p.slug === slug);
    }
  } catch {
    post = fallbackPosts.find(p => p.slug === slug);
  }

  if (!post) notFound();

  const wordsPerMin = 200;
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / wordsPerMin));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: 'TOMI FILM' },
    publisher: { '@type': 'Organization', name: 'TOMI FILM', logo: { '@type': 'ImageObject', url: 'https://tomifilm.co.th/logo.png' } },
    image: post.cover_image_url || undefined,
    keywords: post.tags?.join(', '),
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cover */}
      {post.cover_image_url && (
        <div className="relative h-[50vh] sm:h-[60vh] bg-black overflow-hidden">
          <img src={post.cover_image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header className={`${post.cover_image_url ? 'bg-[#111318] text-white' : 'bg-[#111318] text-white pt-24'} px-6 sm:px-10 py-12`}>
        <div className="max-w-[800px] mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-light transition-colors mb-6">
            <ArrowLeft weight="bold" /> กลับไปบทความทั้งหมด
          </Link>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-bold bg-white/10 px-3 py-1">{post.category}</span>
            <span className="text-[11px] text-white/30 font-light flex items-center gap-1">
              <CalendarBlank weight="regular" className="text-xs" />
              {new Date(post.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="text-[11px] text-white/30 font-light flex items-center gap-1">
              <Clock weight="regular" className="text-xs" />
              อ่าน {readTime} นาที
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-white/45 text-base font-light leading-relaxed max-w-2xl">{post.excerpt}</p>}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-[11px] text-white/30 border border-white/10 px-2.5 py-1 font-light flex items-center gap-1">
                  <Tag weight="regular" className="text-xs" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Article Body */}
      <article className="max-w-[800px] mx-auto px-6 sm:px-10 py-16">
        <div className="prose prose-lg max-w-none
          prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:uppercase prose-headings:text-black
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-black/55 prose-p:text-base prose-p:leading-relaxed prose-p:font-light
          prose-strong:text-black prose-strong:font-bold
          prose-a:text-black prose-a:underline hover:prose-a:text-black/60
          prose-li:text-black/55 prose-li:font-light
          prose-blockquote:border-l-4 prose-blockquote:border-black/20 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-black/40
          prose-img:rounded-sm prose-img:shadow-md
          prose-hr:border-black/10"
          dangerouslySetInnerHTML={{ __html: post.content
            .split('\n')
            .map((line: string) => {
              if (line.startsWith('### ')) return `<h3>${line.replace('### ', '')}</h3>`;
              if (line.startsWith('**') && line.endsWith('**')) return `<strong>${line.replace(/\*\*/g, '')}</strong>`;
              if (line.trim() === '') return '<br />';
              return `<p>${line}</p>`;
            })
            .join('')
          }}
        />
      </article>

      {/* Footer CTA */}
      <section className="bg-[#f7f8fa] border-t border-black/5 py-16 px-6 sm:px-10">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">สนใจติดฟิล์มกับเรา?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-black mb-4">รับคำปรึกษาฟรี ไม่มีค่าใช้จ่าย</h2>
          <p className="text-black/40 text-sm font-light mb-8">ทีมผู้เชี่ยวชาญของเราพร้อมแนะนำฟิล์มที่เหมาะสมและประเมินราคาให้ฟรี</p>
          <Link href="/#contact" className="inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-bold tracking-[0.2em] uppercase bg-black text-white hover:bg-black/80 hover:scale-105 transition-all">
            ติดต่อเราเลย <ArrowLeft weight="bold" className="rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

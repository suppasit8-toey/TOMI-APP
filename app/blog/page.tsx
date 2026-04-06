import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Article, Tag, CalendarBlank } from '@phosphor-icons/react/dist/ssr';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'บทความ & ความรู้เรื่องฟิล์ม — TOMI FILM',
  description: 'รวมบทความ เคล็ดลับ และความรู้เกี่ยวกับฟิล์มกันความร้อน ฟิล์มกรองแสง จากผู้เชี่ยวชาญ TOMI FILM',
  keywords: 'บทความฟิล์ม,ฟิล์มกันความร้อน,เคล็ดลับฟิล์ม,ฟิล์มอาคาร',
  openGraph: { title: 'บทความ & ความรู้ — TOMI FILM', type: 'website' },
};

import { blogPosts as fallbackPosts } from '@/lib/data/blog';

export default async function BlogPage() {
  let posts: any[] = [];

  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('id,title,slug,excerpt,cover_image_url,category,created_at,tags')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      posts = data;
    } else {
      posts = fallbackPosts;
    }
  } catch {
    posts = fallbackPosts;
  }

  const categories = ['ทั้งหมด', ...Array.from(new Set(posts.map((p: any) => p.category)))];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'TOMI FILM Blog',
        description: 'บทความและความรู้เรื่องฟิล์มกันความร้อน',
        url: 'https://tomifilm.co.th/blog',
      })}} />

      {/* Header */}
      <header className="bg-[#111318] text-white pt-24 pb-16 px-6 sm:px-10">
        <div className="max-w-[1200px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/70 text-sm font-light transition-colors mb-8">
            ← กลับหน้าหลัก
          </Link>
          <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/30 mb-4">KNOWLEDGE CENTER</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight uppercase leading-[1.05]">
            บทความ &amp;<br />เคล็ดลับ
          </h1>
          <p className="mt-4 text-white/35 text-base font-light max-w-lg">
            รวมความรู้เรื่องฟิล์มกันความร้อน ฟิล์มกรองแสง เคล็ดลับการดูแลรักษา และข่าวสารจาก TOMI FILM
          </p>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 sm:px-10 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-32">
            <Article className="text-6xl text-black/10 mx-auto mb-4" weight="thin" />
            <p className="text-black/30 font-light">ยังไม่มีบทความที่เผยแพร่</p>
            <p className="text-black/20 text-sm mt-2">กลับมาใหม่เร็วๆ นี้</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article key={post.id}>
                <Link href={`/blog/${post.slug}`} className="group block border border-black/[0.07] hover:border-black/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                  <div className="h-52 bg-black/5 overflow-hidden">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <Article className="text-5xl text-slate-300" weight="thin" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-black/30 font-bold bg-black/[0.04] px-2 py-1">{post.category}</span>
                      <span className="text-[11px] text-black/25 font-light flex items-center gap-1">
                        <CalendarBlank weight="regular" className="text-xs" />
                        {new Date(post.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="font-bold text-black text-base leading-snug group-hover:text-black/70 transition-colors mb-2">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-black/35 font-light line-clamp-2 leading-relaxed">{post.excerpt}</p>}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.slice(0,3).map((tag: string) => (
                          <span key={tag} className="text-[10px] text-black/30 border border-black/10 px-2 py-0.5 font-light flex items-center gap-1">
                            <Tag weight="regular" className="text-xs" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-1 text-[11px] font-bold tracking-[0.1em] uppercase text-black/30 group-hover:text-black/60 transition-colors">
                      อ่านต่อ <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

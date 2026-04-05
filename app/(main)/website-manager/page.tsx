'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import {
  FloppyDisk, Globe, Camera, UploadSimple, Trash, Image as ImageIcon,
  SpinnerGap, Article, Plus, PencilSimple, Eye, X, CheckCircle,
  TextT, Phone, Link as LinkIcon, Info, Hash, BookOpen
} from '@phosphor-icons/react';

// ─── Types ───────────────────────────────────────────────────
interface SiteContent {
  id: string;
  hero_title: string; hero_subtitle: string;
  about_text: string;
  contact_phone: string; contact_line_id: string; contact_facebook: string;
  hero_image_url: string; about_image_url: string;
  service1_image_url: string; service2_image_url: string; service3_image_url: string;
  services_tag: string; services_title: string;
  service1_title: string; service1_desc: string;
  service2_title: string; service2_desc: string;
  service3_title: string; service3_desc: string;
  trust_stat1_value: string; trust_stat1_label: string; trust_stat1_title: string;
  trust_stat2_value: string; trust_stat2_label: string; trust_stat2_title: string;
  trust_stat3_value: string; trust_stat3_label: string; trust_stat3_title: string;
  trust_stat4_value: string; trust_stat4_label: string; trust_stat4_title: string;
  cta_title: string; cta_subtitle: string;
  footer_description: string;
  seo_title: string; seo_description: string;
}

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; content: string;
  cover_image_url: string; category: string; tags: string[];
  meta_title: string; meta_description: string; published: boolean;
  created_at: string;
}

const DEFAULT_ID = '00000000-0000-0000-0000-000000000001';
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const DEFAULT_CONTENT: SiteContent = {
  id: DEFAULT_ID,
  hero_title: 'TOMI FILM บริการติดตั้งฟิล์มอาคารพรีเมียม',
  hero_subtitle: 'ลดความร้อน ประหยัดพลังงาน ปกป้องสิ่งที่คุณรักด้วยฟิล์มคุณภาพสูง',
  about_text: 'TOMI FILM ก่อตั้งด้วยความมุ่งมั่นที่จะนำเสนอนวัตกรรมฟิล์มกรองแสงที่ดีที่สุด',
  contact_phone: '099-999-9999', contact_line_id: '@tomifilm.th', contact_facebook: 'https://facebook.com/tomifilm',
  hero_image_url: '', about_image_url: '',
  service1_image_url: '', service2_image_url: '', service3_image_url: '',
  services_tag: 'WHY CHOOSE US?', services_title: 'OUR SERVICES',
  service1_title: 'กันความร้อน 99%', service1_desc: 'ป้องกันรังสี IR และ UV อย่างมีประสิทธิภาพ',
  service2_title: 'ลดแสงจ้า ถนอมสายตา', service2_desc: 'กรองแสงแดดสะท้อน ชมวิวสบายตา',
  service3_title: 'รับประกันยาวนาน', service3_desc: 'ติดตั้งโดยช่างผู้เชี่ยวชาญ รับประกันคุณภาพ',
  trust_stat1_value: '10', trust_stat1_label: 'ปี+', trust_stat1_title: 'ประสบการณ์',
  trust_stat2_value: '1,000', trust_stat2_label: '+', trust_stat2_title: 'โครงการ',
  trust_stat3_value: '99', trust_stat3_label: '%', trust_stat3_title: 'กันความร้อน',
  trust_stat4_value: '24/7', trust_stat4_label: '', trust_stat4_title: 'บริการ',
  cta_title: 'พร้อมเปลี่ยนอาคารของคุณให้เย็นสบายขึ้น?',
  cta_subtitle: 'เราพร้อมให้คำปรึกษาและแนะนำฟิล์มที่เหมาะสมที่สุด ปรึกษาฟรี ไม่มีค่าใช้จ่าย',
  footer_description: 'ผู้เชี่ยวชาญด้านฟิล์มกรองแสงอาคาร บ้าน สำนักงาน และรถยนต์ ด้วยประสบการณ์กว่า 10 ปี',
  seo_title: 'TOMI FILM — บริการติดตั้งฟิล์มอาคารพรีเมียม กรุงเทพฯ',
  seo_description: 'TOMI FILM ผู้เชี่ยวชาญติดตั้งฟิล์มกันความร้อน ฟิล์มกรองแสง รับประกันยาวนาน',
};

const EMPTY_POST: Omit<BlogPost,'id'|'created_at'> = {
  title: '', slug: '', excerpt: '', content: '', cover_image_url: '',
  category: 'ทั่วไป', tags: [], meta_title: '', meta_description: '', published: false,
};

// ─── Image Uploader ──────────────────────────────────────────
function ImageUploader({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (url: string) => void; hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      Swal.fire('ตั้งค่า Cloudinary ไม่ครบ', 'กรุณาตรวจสอบ .env.local', 'error'); return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange(data.secure_url);
      Swal.fire({ title: 'อัพโหลดสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire('อัพโหลดไม่สำเร็จ', err.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
        <Camera weight="bold" className="text-blue-500" /> {label}
      </label>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200">
          <img src={value} alt={label} className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-white text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-100">
              <UploadSimple weight="bold" /> เปลี่ยนรูป
            </button>
            <button type="button" onClick={() => onChange('')} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-600">
              <Trash weight="bold" /> ลบ
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full h-36 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
          {uploading ? (
            <><SpinnerGap weight="bold" className="text-3xl text-blue-500 animate-spin" /><span className="text-sm text-blue-600 font-semibold">กำลังอัพโหลด...</span></>
          ) : (
            <><ImageIcon weight="duotone" className="text-3xl text-slate-400" /><span className="text-sm text-slate-500 font-medium">คลิกเพื่ออัพโหลดรูปภาพ</span><span className="text-xs text-slate-400">JPG, PNG, WebP</span></>
          )}
        </button>
      )}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm";
const textareaCls = `${inputCls} resize-none`;

// ─── Section Header ───────────────────────────────────────────
function SectionHead({ n, label }: { n: number; label: string }) {
  return (
    <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2 mb-4">
      <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black">{n}</span>
      {label}
    </h3>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function WebsiteManager() {
  const [tab, setTab] = useState<'landing'|'blog'>('landing');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  // Blog state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editPost, setEditPost] = useState<(Omit<BlogPost,'id'|'created_at'> & { id?: string }) | null>(null);
  const [postSaving, setPostSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { fetchContent(); }, []);
  useEffect(() => { if (tab === 'blog') fetchPosts(); }, [tab]);

  const set = (k: keyof SiteContent, v: string) => setContent(prev => ({ ...prev, [k]: v }));

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('landing_page_content').select('*').eq('id', DEFAULT_ID).single();
      if (data) setContent(c => ({ ...c, ...data }));
    } catch {} finally { setLoading(false); }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (data) setPosts(data);
    } catch {} finally { setPostsLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase.from('landing_page_content').upsert({ ...content, updated_at: new Date().toISOString() });
      if (error) throw error;
      Swal.fire({ title: 'บันทึกสำเร็จ', text: 'อัปเดตหน้าเว็บไซต์แล้ว', icon: 'success', confirmButtonColor: '#2563eb' });
    } catch (err: any) {
      Swal.fire({ title: 'ไม่สามารถบันทึกได้', text: err?.message || 'โปรดตรวจสอบการเชื่อมต่อ', icon: 'error' });
    } finally { setSaving(false); }
  };

  // Blog helpers
  const slugify = (t: string) => t.toLowerCase().replace(/\s+/g,'-').replace(/[^\u0E00-\u0E7Fa-z0-9-]/g,'').slice(0,80);

  const openNew = () => { setEditPost({ ...EMPTY_POST }); setTagInput(''); };
  const openEdit = (p: BlogPost) => { setEditPost({ ...p }); setTagInput(''); };
  const closeEdit = () => { setEditPost(null); setTagInput(''); };

  const addTag = () => {
    if (!tagInput.trim() || !editPost) return;
    setEditPost(p => p ? { ...p, tags: [...(p.tags||[]), tagInput.trim()] } : p);
    setTagInput('');
  };
  const removeTag = (i: number) => setEditPost(p => p ? { ...p, tags: p.tags.filter((_,j)=>j!==i) } : p);

  const savePost = async () => {
    if (!editPost?.title || !editPost?.slug) {
      Swal.fire('กรุณากรอกข้อมูล', 'ต้องการชื่อบทความและ Slug', 'warning'); return;
    }
    try {
      setPostSaving(true);
      const payload = { ...editPost, updated_at: new Date().toISOString() };
      if (editPost.id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      Swal.fire({ title: 'บันทึกบทความสำเร็จ', icon: 'success', timer: 1500, showConfirmButton: false });
      closeEdit(); fetchPosts();
    } catch (err: any) {
      Swal.fire({ title: 'บันทึกไม่สำเร็จ', text: err?.message, icon: 'error' });
    } finally { setPostSaving(false); }
  };

  const deletePost = async (id: string, title: string) => {
    const res = await Swal.fire({ title: `ลบ "${title}"?`, text: 'ไม่สามารถกู้คืนได้', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก' });
    if (!res.isConfirmed) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  };

  const togglePublish = async (p: BlogPost) => {
    await supabase.from('blog_posts').update({ published: !p.published }).eq('id', p.id);
    fetchPosts();
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
            <Globe weight="fill" className="text-blue-500 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">จัดการเว็บไซต์ (CMS)</h1>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">ปรับแต่งข้อความ รูปภาพ และบทความสำหรับเว็บไซต์</p>
          </div>
        </div>
        <a href="/" target="_blank" className="bg-slate-100 text-slate-600 border border-slate-200 py-2.5 px-5 rounded-xl font-bold shadow-sm inline-flex items-center gap-2 hover:-translate-y-0.5 transition hover:bg-slate-200 w-full sm:w-auto justify-center">
          <Eye weight="bold" className="text-lg" /> ดูเว็บไซต์
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {([['landing','🏠 หน้าแรก'],['blog','📝 บทความ / Blog']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab===id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════════ TAB: LANDING PAGE ══════════ */}
      {tab === 'landing' && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-800 text-sm flex gap-2 mb-6">
          <Info className="text-xl shrink-0 mt-0.5" weight="fill" />
          <p>ถ้ายังไม่ได้รันไฟล์ SQL กรุณารัน <code className="bg-amber-100 px-1 rounded font-mono text-xs">add_cms_blog.sql</code> ใน Supabase SQL Editor ก่อน</p>
        </div>
      )}

      {tab === 'landing' && (
        <form onSubmit={handleSave} className="space-y-1">

          {/* ─ Card: SEO ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={1} label="SEO — ชื่อและคำอธิบายสำหรับ Google & AI" />
            <div className="space-y-4">
              <Field label="SEO Title (ชื่อที่แสดงใน Google)">
                <input value={content.seo_title} onChange={e=>set('seo_title',e.target.value)} className={inputCls} />
              </Field>
              <Field label="SEO Description (คำอธิบายในผลการค้นหา)">
                <textarea value={content.seo_description} onChange={e=>set('seo_description',e.target.value)} rows={3} className={textareaCls} />
              </Field>
            </div>
          </div>

          {/* ─ Card: Hero ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={2} label="ส่วนต้อนรับ (Hero Section)" />
            <div className="space-y-4">
              <Field label="หัวข้อหลัก"><input value={content.hero_title} onChange={e=>set('hero_title',e.target.value)} className={inputCls} required /></Field>
              <Field label="ข้อความรอง"><textarea value={content.hero_subtitle} onChange={e=>set('hero_subtitle',e.target.value)} rows={2} className={textareaCls} required /></Field>
              <ImageUploader label="รูปพื้นหลัง Hero" value={content.hero_image_url} onChange={u=>set('hero_image_url',u)} hint="แนะนำ 1920×1080 — ถ้าปล่อยว่างจะใช้ Gradient แทน" />
            </div>
          </div>

          {/* ─ Card: Trust Bar ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={3} label="แถบสถิติ (Trust Bar)" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([1,2,3,4] as const).map(n => (
                <div key={n} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">สถิติ {n}</p>
                  <Field label="หัวข้อ"><input value={(content as any)[`trust_stat${n}_title`]} onChange={e=>set(`trust_stat${n}_title` as any,e.target.value)} className={inputCls} /></Field>
                  <Field label="ตัวเลข"><input value={(content as any)[`trust_stat${n}_value`]} onChange={e=>set(`trust_stat${n}_value` as any,e.target.value)} className={inputCls} /></Field>
                  <Field label="หน่วย"><input value={(content as any)[`trust_stat${n}_label`]} onChange={e=>set(`trust_stat${n}_label` as any,e.target.value)} className={inputCls} /></Field>
                </div>
              ))}
            </div>
          </div>

          {/* ─ Card: Services ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={4} label="บริการของเรา (Services)" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tag เล็ก"><input value={content.services_tag} onChange={e=>set('services_tag',e.target.value)} className={inputCls} /></Field>
                <Field label="หัวข้อ Section"><input value={content.services_title} onChange={e=>set('services_title',e.target.value)} className={inputCls} /></Field>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {([1,2,3] as const).map(n => (
                  <div key={n} className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">การ์ดที่ {n}</p>
                    <Field label="ชื่อบริการ"><input value={(content as any)[`service${n}_title`]} onChange={e=>set(`service${n}_title` as any,e.target.value)} className={inputCls} /></Field>
                    <Field label="คำอธิบาย"><textarea value={(content as any)[`service${n}_desc`]} onChange={e=>set(`service${n}_desc` as any,e.target.value)} rows={2} className={textareaCls} /></Field>
                    <ImageUploader label="รูปภาพ" value={(content as any)[`service${n}_image_url`]} onChange={u=>set(`service${n}_image_url` as any,u)} hint="600×400px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─ Card: About ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={5} label="เกี่ยวกับเรา (About Us)" />
            <div className="space-y-4">
              <Field label="รายละเอียด">
                <textarea value={content.about_text} onChange={e=>set('about_text',e.target.value)} rows={4} className={textareaCls} required />
              </Field>
              <ImageUploader label="รูปประกอบ" value={content.about_image_url} onChange={u=>set('about_image_url',u)} hint="800×1000px (แนวตั้ง)" />
            </div>
          </div>

          {/* ─ Card: CTA ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={6} label="Call to Action (CTA)" />
            <div className="space-y-4">
              <Field label="หัวข้อ CTA"><input value={content.cta_title} onChange={e=>set('cta_title',e.target.value)} className={inputCls} /></Field>
              <Field label="คำอธิบาย CTA"><textarea value={content.cta_subtitle} onChange={e=>set('cta_subtitle',e.target.value)} rows={2} className={textareaCls} /></Field>
            </div>
          </div>

          {/* ─ Card: Contact ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={7} label="ข้อมูลติดต่อ (Contact Info)" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="เบอร์โทรศัพท์"><input value={content.contact_phone} onChange={e=>set('contact_phone',e.target.value)} className={inputCls} required /></Field>
              <Field label="Line ID"><input value={content.contact_line_id} onChange={e=>set('contact_line_id',e.target.value)} className={inputCls} required /></Field>
              <Field label="Facebook Link"><input value={content.contact_facebook} onChange={e=>set('contact_facebook',e.target.value)} className={inputCls} required /></Field>
            </div>
          </div>

          {/* ─ Card: Footer ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <SectionHead n={8} label="Footer" />
            <Field label="คำอธิบายในส่วน Footer">
              <textarea value={content.footer_description} onChange={e=>set('footer_description',e.target.value)} rows={2} className={textareaCls} />
            </Field>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 flex items-center gap-2">
              {saving ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />กำลังบันทึก...</> : <><FloppyDisk weight="fill" className="text-xl" />บันทึกข้อมูลเว็บไซต์</>}
            </button>
          </div>
        </form>
      )}

      {/* ══════════ TAB: BLOG ══════════ */}
      {tab === 'blog' && !editPost && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">บทความทั้งหมด</h2>
              <p className="text-sm text-slate-500">บทความที่เผยแพร่จะแสดงบนเว็บไซต์และช่วย SEO</p>
            </div>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-600/30">
              <Plus weight="bold" /> สร้างบทความใหม่
            </button>
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <Article className="text-5xl text-slate-200 mx-auto mb-3" weight="thin" />
              <p className="text-slate-400 font-medium">ยังไม่มีบทความ</p>
              <p className="text-slate-300 text-sm mt-1">กดปุ่ม "สร้างบทความใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-slate-300 transition-all">
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt={p.title} className="w-16 h-12 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Article className="text-2xl text-slate-300" weight="thin" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wide ${p.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        {p.published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{p.category}</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(p.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => togglePublish(p)} title={p.published ? 'ซ่อน' : 'เผยแพร่'}
                      className={`p-2 rounded-lg transition-all ${p.published ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}>
                      <Eye weight="bold" className="text-sm" />
                    </button>
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition-all">
                      <PencilSimple weight="bold" className="text-sm" />
                    </button>
                    <button onClick={() => deletePost(p.id, p.title)} className="p-2 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition-all">
                      <Trash weight="bold" className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ BLOG EDITOR ══════════ */}
      {tab === 'blog' && editPost && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={closeEdit} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
              <X weight="bold" className="text-slate-600" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{editPost.id ? 'แก้ไขบทความ' : 'สร้างบทความใหม่'}</h2>
              <p className="text-sm text-slate-500">กรอกข้อมูลให้ครบเพื่อ SEO ที่ดี</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-all ${editPost.published ? 'bg-green-500' : 'bg-slate-300'} relative`}
                  onClick={() => setEditPost(p => p ? { ...p, published: !p.published } : p)}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${editPost.published ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className={`text-sm font-semibold ${editPost.published ? 'text-green-600' : 'text-slate-400'}`}>
                  {editPost.published ? 'เผยแพร่' : 'ฉบับร่าง'}
                </span>
              </label>
              <button onClick={savePost} disabled={postSaving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-70 shadow-md shadow-blue-600/20">
                {postSaving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />บันทึก...</> : <><FloppyDisk weight="fill" />บันทึก</>}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Main content */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <Field label="ชื่อบทความ *">
                  <input value={editPost.title} onChange={e => {
                    const t = e.target.value;
                    setEditPost(p => p ? { ...p, title: t, slug: p.id ? p.slug : slugify(t) } : p);
                  }} className={inputCls} placeholder="ชื่อบทความที่น่าสนใจ..." />
                </Field>
                <Field label="Slug (URL) *">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm shrink-0">/blog/</span>
                    <input value={editPost.slug} onChange={e => setEditPost(p => p ? { ...p, slug: slugify(e.target.value) } : p)} className={inputCls} placeholder="url-friendly-name" />
                  </div>
                </Field>
                <Field label="บทคัดย่อ (ปรากฏในหน้ารายการ)">
                  <textarea value={editPost.excerpt} onChange={e => setEditPost(p => p ? { ...p, excerpt: e.target.value } : p)} rows={2} className={textareaCls} placeholder="สรุปสั้นๆ เกี่ยวกับบทความนี้..." />
                </Field>
                <Field label="เนื้อหาบทความ (รองรับ Markdown พื้นฐาน)">
                  <textarea value={editPost.content} onChange={e => setEditPost(p => p ? { ...p, content: e.target.value } : p)} rows={14} className={textareaCls} placeholder="เขียนเนื้อหาบทความที่นี่...&#10;&#10;# หัวข้อใหญ่&#10;## หัวข้อรอง&#10;**ตัวหนา** *ตัวเอียง*" />
                </Field>
              </div>

              {/* SEO */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Hash weight="bold" className="text-blue-500" /> SEO Settings
                </h3>
                <Field label="Meta Title (ชื่อในผลการค้นหา)">
                  <input value={editPost.meta_title} onChange={e => setEditPost(p => p ? { ...p, meta_title: e.target.value } : p)} className={inputCls} placeholder="ปล่อยว่างเพื่อใช้ชื่อบทความ" />
                  <p className="text-xs text-slate-400 mt-1">{editPost.meta_title.length}/60 ตัวอักษร</p>
                </Field>
                <Field label="Meta Description (คำอธิบายในผลการค้นหา)">
                  <textarea value={editPost.meta_description} onChange={e => setEditPost(p => p ? { ...p, meta_description: e.target.value } : p)} rows={2} className={textareaCls} placeholder="ปล่อยว่างเพื่อใช้บทคัดย่อ" />
                  <p className="text-xs text-slate-400 mt-1">{editPost.meta_description.length}/160 ตัวอักษร</p>
                </Field>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700">รายละเอียด</h3>
                <Field label="หมวดหมู่">
                  <select value={editPost.category} onChange={e => setEditPost(p => p ? { ...p, category: e.target.value } : p)} className={inputCls}>
                    {['ทั่วไป','ฟิล์มกันความร้อน','ฟิล์มนิรภัย','ฟิล์มรถยนต์','เคล็ดลับ & วิธีดูแล','ข่าวสาร','รีวิวโครงการ'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (คีย์เวิร์ด SEO)</label>
                  <div className="flex gap-2 mb-2">
                    <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addTag())}
                      className={`${inputCls} flex-1`} placeholder="พิมพ์แล้วกด Enter" />
                    <button type="button" onClick={addTag} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all">
                      <Plus weight="bold" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {editPost.tags?.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-lg">
                        {tag}
                        <button type="button" onClick={() => removeTag(i)} className="hover:text-red-500 transition-colors"><X weight="bold" className="text-xs" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-3">รูปปก (Cover Image)</h3>
                <ImageUploader label="รูปปกบทความ" value={editPost.cover_image_url} onChange={u => setEditPost(p => p ? { ...p, cover_image_url: u } : p)} hint="1200×630px แนะนำ" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

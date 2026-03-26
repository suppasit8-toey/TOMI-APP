'use client';
import { useState, useEffect } from 'react';
import { Plus, Tag, Trash, CaretRight } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function FilmBrandsPage() {
  const { user } = useAuth();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', note: '' });

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('film_brands').select('*').order('created_at', { ascending: false });
    setBrands(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const submitAdd = async () => {
    if (!form.name) return Swal.fire('เตือน', 'กรุณาระบุชื่อแบรนด์ฟิล์ม', 'warning');
    setLoading(true);
    
    const id = 'FB' + new Date().getTime();
    const { error } = await supabase.from('film_brands').insert({
      id,
      name: form.name,
      note: form.note
    });

    if (error) {
      setLoading(false);
      return Swal.fire('ผิดพลาด', error.message, 'error');
    }

    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'ADD_FILM_BRAND', description: `เพิ่มแบรนด์ฟิล์ม ${form.name}`, ref_id: id });
    
    Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย', 'success');
    setShowAdd(false);
    setForm({ name: '', note: '' });
    loadData();
  };

  const deleteBrand = async (id: string, name: string) => {
    const res = await Swal.fire({
      title: 'ลบแบรนด์ฟิล์ม?',
      text: `คุณต้องการลบแบรนด์ "${name}" ใช่หรือไม่? (รุ่นฟิล์มและราคาที่ผูกไว้จะถูกลบไปด้วย)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบทิ้ง',
      cancelButtonText: 'ยกเลิก'
    });
    
    if (res.isConfirmed) {
      setLoading(true);
      await supabase.from('film_brands').delete().eq('id', id);
      await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'DEL_FILM_BRAND', description: `ลบแบรนด์ฟิล์ม ${name}`, ref_id: id });
      Swal.fire('ลบแล้ว!', 'ข้อมูลถูกลบเรียบร้อย', 'success');
      loadData();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4 no-print">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <Tag weight="fill" className="text-blue-600 text-2xl" /> แบรนด์ฟิล์ม (Film Brands)
        </h2>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg shadow-blue-200 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700">
          <Plus weight="bold" /> เพิ่มแบรนด์
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(b => (
          <Link href={`/brands/${encodeURIComponent(b.name)}`} key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative group transition hover:shadow-md hover:border-blue-300 block">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition z-10">
               <button onClick={(e) => { e.preventDefault(); deleteBrand(b.id, b.name); }} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition"><Trash weight="fill" /></button>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-100 shrink-0">
                 <Tag weight="duotone" />
              </div>
              <div className="flex-1">
                 <div className="font-bold text-lg text-slate-800 leading-tight">{b.name}</div>
                 <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{b.note || 'ไม่มีหมายเหตุ'}</div>
              </div>
              <CaretRight weight="bold" className="text-slate-300 group-hover:text-blue-500 transition" />
            </div>
          </Link>
        ))}
        {brands.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
             <Tag className="text-5xl mx-auto mb-3 text-slate-300" />
             <p className="font-semibold text-lg">ยังไม่มีข้อมูลแบรนด์ฟิล์ม</p>
             <p className="text-sm">กดเพิ่มข้อมูลที่ปุ่มมุมขวาบนได้เลย</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800 flex items-center gap-2">
               <Tag weight="fill" className="text-blue-500" /> เพิ่มแบรนด์ฟิล์ม
            </h3>
            
            <label className="block text-sm font-semibold mb-1">ชื่อแบรนด์ <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Ex. 3M, V-Kool, Lamina..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none mb-3 focus:border-blue-500 font-bold" />
            
            <label className="block text-sm font-semibold mb-1">หมายเหตุ / ข้อมูลเพิ่มเติม</label>
            <textarea value={form.note} onChange={e=>setForm({...form, note:e.target.value})} placeholder="ระบุข้อมูลเพิ่มเติม..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none mb-4 focus:border-blue-500 min-h-[80px]" />
            
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 font-bold py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">ยกเลิก</button>
              <button disabled={loading} onClick={submitAdd} className="flex-1 font-bold py-3 bg-blue-600 text-white rounded-xl shadow-md disabled:opacity-50 hover:bg-blue-700">บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

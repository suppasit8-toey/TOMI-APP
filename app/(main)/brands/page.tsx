'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, MagnifyingGlass, Hash, ArrowRight, CaretRight, Eraser } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('film_brands').select('*').order('name', { ascending: true });
    setBrands(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const addBrand = async () => {
    if (!newBrand.trim()) return Swal.fire('เตือน', 'กรุณาระบุชื่อแบรนด์', 'warning');
    setLoading(true);
    const { error } = await supabase.from('film_brands').insert({ 
      id: 'B' + new Date().getTime(),
      name: newBrand.trim() 
    });

    if (error) {
      setLoading(false);
      return Swal.fire('ผิดพลาด', error.message, 'error');
    }

    Swal.fire('สำเร็จ', 'เพิ่มแบรนด์ฟิล์มแล้ว', 'success');
    setShowAdd(false);
    setNewBrand('');
    loadData();
  };
  
  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center border border-pink-100 shrink-0 shadow-sm">
            <Tag weight="fill" className="text-pink-500 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">แบรนด์ฟิล์ม</h2>
            <p className="text-sm text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
              จัดการรายการยี่ห้อฟิล์มทั้งหมด <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">{brands.length} แบรนด์</span>
            </p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white py-2.5 px-6 rounded-xl font-bold shadow-lg shadow-blue-600/30 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700 w-full md:w-auto justify-center">
          <Plus weight="bold" /> เพิ่มแบรนด์ใหม่
        </button>
      </div>
      
      {/* Search */}
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อแบรนด์..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center justify-center bg-slate-200 rounded-full p-0.5">
              <Plus className="rotate-45" weight="bold" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
           <Tag className="text-7xl mx-auto mb-4 text-slate-200" weight="thin" />
           <p className="font-black text-slate-400 text-xl">ไม่พบข้อมูลแบรนด์ฟิล์ม</p>
           <p className="text-slate-400 text-sm mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มแบรนด์ใหม่</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(b => (
            <Link href={`/brands/${b.id}`} key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-bl-full -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
              
              <div className="w-16 h-16 bg-slate-50 group-hover:bg-blue-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:border-blue-100 transition-colors mb-4 text-3xl font-black text-slate-300 group-hover:text-blue-500 uppercase tracking-tighter">
                {b.name.substring(0, 2)}
              </div>
              
              <div className="font-black text-lg text-slate-800 transition group-hover:text-blue-600 uppercase tracking-wide truncate w-full">{b.name}</div>
              
              <div className="mt-3 pt-3 border-t border-slate-100 w-full flex justify-between items-center text-slate-400 group-hover:text-blue-400 transition">
                 <span className="text-[10px] font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center gap-0.5">
                   <Hash className="text-[8px]" /> {b.id.substring(b.id.length - 4)}
                 </span>
                 <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center border border-pink-100 shadow-inner">
                <Tag weight="fill" className="text-pink-500 text-xl" />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-800 leading-tight">เพิ่มแบรนด์ฟิล์ม</h3>
                <p className="text-xs text-slate-400 font-medium">บันทึกชื่อยี่ห้อฟิล์มใหม่เข้าระบบ</p>
              </div>
            </div>
            
            <div className="mt-6 mb-8">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">ชื่อแบรนด์ฟิล์ม (Brand Name) <span className="text-red-500">*</span></label>
              <input 
                value={newBrand} 
                onChange={e => setNewBrand(e.target.value)} 
                placeholder="เช่น V-KOOL, 3M, Hi-Kool" 
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-black text-lg text-slate-800 uppercase transition" 
                autoFocus
              />
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAdd(false)} className="flex-1 font-bold py-3.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button disabled={loading} onClick={addBrand} className="flex-1 font-bold py-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                <Plus weight="bold" /> บันทึกแบรนด์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

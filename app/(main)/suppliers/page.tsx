'use client';
import { useState, useEffect } from 'react';
import { Plus, Storefront, Trash, Phone, ClipboardText, Info, Hash } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/AuthProvider';

export default function SuppliersPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', contact_name: '', tel: '', note: '' });

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
    setSuppliers(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const submitAdd = async () => {
    if (!form.name) return Swal.fire('เตือน', 'กรุณาระบุชื่อซัพพลายเออร์', 'warning');
    setLoading(true);
    
    const id = 'S' + new Date().getTime();
    const { error } = await supabase.from('suppliers').insert({
      id,
      name: form.name,
      contact_name: form.contact_name,
      tel: form.tel,
      note: form.note
    });

    if (error) {
      setLoading(false);
      return Swal.fire('ผิดพลาด', error.message, 'error');
    }

    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'ADD_SUPPLIER', description: `เพิ่มซัพพลายเออร์ ${form.name}`, ref_id: id });
    
    Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย', 'success');
    setShowAdd(false);
    setForm({ name: '', contact_name: '', tel: '', note: '' });
    loadData();
  };

  const deleteSupplier = async (id: string, name: string) => {
    const res = await Swal.fire({
      title: 'ลบซัพพลายเออร์?',
      text: `คุณต้องการลบ "${name}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบทิ้ง',
      cancelButtonText: 'ยกเลิก'
    });
    
    if (res.isConfirmed) {
      setLoading(true);
      await supabase.from('suppliers').delete().eq('id', id);
      await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'DEL_SUPPLIER', description: `ลบซัพพลายเออร์ ${name}`, ref_id: id });
      Swal.fire('ลบแล้ว!', 'ข้อมูลถูกลบเรียบร้อย', 'success');
      loadData();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({ title: 'คัดลอกแล้ว', icon: 'success', timer: 1000, showConfirmButton: false });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shrink-0 shadow-sm">
            <Storefront weight="fill" className="text-amber-500 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">ซัพพลายเออร์</h2>
            <p className="text-sm text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
              จัดการข้อมูลร้านค้าผู้ส่งมอบฟิล์มและอุปกรณ์ <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">{suppliers.length} รายการ</span>
            </p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white py-2.5 px-6 rounded-xl font-bold shadow-lg shadow-blue-600/30 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700 w-full md:w-auto justify-center">
          <Plus weight="bold" /> เพิ่มซัพพลายเออร์
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
           <Storefront className="text-7xl mx-auto mb-4 text-slate-200" weight="thin" />
           <p className="font-black text-slate-400 text-xl">ยังไม่มีข้อมูลซัพพลายเออร์</p>
           <p className="text-slate-400 text-sm mt-1">กด "เพิ่มซัพพลายเออร์" เพื่อบันทึกร้านรับซื้อและตัวแทนจำหน่าย</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map(s => (
            <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative group transition-all hover:shadow-md hover:border-amber-300 flex flex-col h-full">
              
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-amber-50 text-amber-500 flex items-center justify-center text-2xl border border-amber-100/50 shrink-0">
                   <Storefront weight="duotone" />
                </div>
                <div className="flex-1 pr-8">
                   <div className="font-black text-lg text-slate-800 leading-tight group-hover:text-amber-600 transition truncate" title={s.name}>{s.name}</div>
                   <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1 bg-slate-50 w-fit px-1.5 py-0.5 rounded border border-slate-100">
                     <Hash className="text-[10px]" /> {s.id}
                   </div>
                </div>
                {/* Delete Button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => deleteSupplier(s.id, s.name)} className="text-red-400 hover:text-white bg-red-50 hover:bg-red-500 p-2 rounded-lg transition border border-red-100 hover:border-red-500" title="ลบข้อมูล">
                    <Trash weight="bold" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col flex-1 justify-end space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                  <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">👤</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">ชื่อผู้ติดต่อ</div>
                    <div className="font-bold text-slate-700 truncate">{s.contact_name || '-'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm bg-blue-50/30 p-2 rounded-lg border border-blue-100/30">
                  <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-blue-400 border border-blue-200 shrink-0">
                    <Phone weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">เบอร์โทรติดต่อ</div>
                    <div className="font-black text-blue-600 truncate">{s.tel || '-'}</div>
                  </div>
                  {s.tel && (
                    <button onClick={() => copyToClipboard(s.tel)} className="shrink-0 p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition" title="คัดลอกเบอร์">
                      <ClipboardText weight="bold" />
                    </button>
                  )}
                </div>
                {s.note && (
                  <div className="mt-1 text-xs bg-amber-50/50 p-2.5 rounded-lg text-slate-600 border border-amber-100/50 flex gap-2 items-start">
                    <Info weight="fill" className="text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{s.note}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-inner">
                <Storefront weight="fill" className="text-amber-500 text-xl" />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-800 leading-tight">เพิ่มซัพพลายเออร์</h3>
                <p className="text-xs text-slate-400 font-medium">เพิ่มข้อมูลร้านค้า / แบรนด์</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">ชื่อซัพพลายเออร์ <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="เช่น ร้านอุปกรณ์หน้าปากซอย" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 font-bold text-slate-800 transition" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">ชื่อผู้ติดต่อ</label>
                <input value={form.contact_name} onChange={e=>setForm({...form, contact_name:e.target.value})} placeholder="เช่น คุณสมชาย" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">เบอร์โทรติดต่อ</label>
                <input value={form.tel} onChange={e=>setForm({...form, tel:e.target.value})} placeholder="เช่น 081-234-5678" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">หมายเหตุ / ข้อมูลเพิ่มเติม</label>
                <textarea value={form.note} onChange={e=>setForm({...form, note:e.target.value})} placeholder="ระบุข้อมูลที่อยู่ หรือเงื่อนไขเพิ่มเติม..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition min-h-[80px]" />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAdd(false)} className="flex-1 font-bold py-3.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button disabled={loading} onClick={submitAdd} className="flex-1 font-bold py-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition">บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

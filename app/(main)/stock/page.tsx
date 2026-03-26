'use client';

import { useState, useEffect } from 'react';
import { Plus, ClockCounterClockwise, PencilSimple, CalendarBlank } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/AuthProvider';

export default function StockPage() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [loading, setLoading] = useState(true);

  // Add Stock Modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], brand: '', code: '', type: '', price: '', width: '152', length: '30' });

  // Detail Modal
  const [detailModal, setDetailModal] = useState<any>({ open: false, info: null });
  const [history, setHistory] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState('');

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('stocks').select('*').order('created_at', { ascending: false });
    const { data: bData } = await supabase.from('suppliers').select('id, name').order('name', { ascending: true });
    setStocks(data || []);
    setBrands(bData || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = filter === 'ทั้งหมด' ? stocks : stocks.filter(s => s.status === filter);

  const submitAdd = async () => {
    if (!form.brand || !form.code || !form.price) return Swal.fire('เตือน', 'กรุณากรอกข้อมูลให้ครบ', 'warning');
    setLoading(true);
    const id = 'R' + new Date().getTime();
    const price = Number(form.price);
    const length = Number(form.length) || 30;
    const cost = Math.ceil(price / length / 10) * 10; // ceilTo10 equivalent

    const { error } = await supabase.from('stocks').insert({
      id,
      brand: form.brand,
      film_code: form.code,
      film_type: form.type,
      price: price,
      width: Number(form.width),
      initial_length: length,
      remaining_length: length,
      cost_per_meter: cost,
      status: 'มีของ'
    });

    if (error) {
      setLoading(false);
      return Swal.fire('ผิดพลาด', error.message, 'error');
    }

    // Add Expense to Accounts
    await supabase.from('accounts').insert({
      id: 'ACC' + id,
      transaction_date: form.date,
      type: 'Expense',
      category: 'ซื้อสินค้า (Stock)',
      detail: `ซื้อ ${form.brand} ${form.code}`,
      amount: price,
      created_by: user?.name
    });

    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'ADD_STOCK', description: `เพิ่มสต็อก ${form.code}`, ref_id: id });

    setLoading(false);
    Swal.fire('สำเร็จ', 'เพิ่มสต็อกเรียบร้อย', 'success');
    setShowAdd(false);
    setForm({ date: new Date().toISOString().split('T')[0], brand: '', code: '', type: '', price: '', width: '152', length: '30' });
    loadData();
  };

  const openDetail = async (s: any) => {
    setDetailModal({ open: true, info: s });
    setIsEditing(false);
    
    // Fetch History
    const { data } = await supabase.from('project_transactions')
      .select('*, projects(name)')
      .eq('stock_id', s.id)
      .order('created_at', { ascending: false });
      
    const mapped = (data || []).map((t: any) => ({
      date: t.action_date,
      projectName: t.projects?.name || 'ไม่ระบุ',
      meter: t.amount_used,
      user: t.created_by
    }));
    setHistory(mapped);
  };

  const saveEdit = async () => {
    setLoading(true);
    const qty = Number(editQty);
    const info = detailModal.info;
    const { error } = await supabase.from('stocks').update({
      remaining_length: qty,
      status: qty > 0 ? 'มีของ' : 'หมด',
      updated_at: new Date().toISOString()
    }).eq('id', info.id);

    setLoading(false);
    if (error) return Swal.fire('ผิดพลาด', error.message, 'error');

    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'UPDATE_STOCK', description: `แก้ไขสต็อก ${info.film_code} เป็น ${qty}`, ref_id: info.id });
    Swal.fire('สำเร็จ', 'แก้ไขสต็อกเรียบร้อย', 'success');
    setDetailModal({...detailModal, open: false});
    loadData();
  };

  const fmt = (num: number) => new Intl.NumberFormat('th-TH').format(num || 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4 no-print">
        <h2 className="text-xl font-bold text-slate-800">สต็อกฟิล์ม</h2>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg shadow-blue-200 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700">
          <Plus weight="bold" /> เพิ่ม
        </button>
      </div>
      
      <div className="flex gap-2 mb-3">
        {['ทั้งหมด', 'มีของ', 'หมด'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-bold transition shadow-sm border ${filter === f ? (f === 'ทั้งหมด' ? 'bg-slate-800 text-white border-slate-800' : f === 'มีของ' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600') : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} onClick={() => openDetail(s)} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-blue-400 hover:shadow-md transition relative overflow-hidden group">
            <div className={`absolute top-0 right-0 px-3 py-1.5 text-[10px] font-bold rounded-bl-2xl shadow-sm tracking-wider ${s.status === 'หมด' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              {s.status}
            </div>
            <div className="flex flex-col mb-3">
              <div className="font-bold text-lg text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition">{s.brand} {s.film_code}</div>
              <div className="text-[11px] text-blue-600 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded-full mb-1 w-fit border border-blue-100">{s.film_type}</div>
              <div className="mt-1 flex flex-col pt-1">
                <span className="font-barcode text-slate-400 tracking-[0.2em] text-4xl opacity-50 leading-none">{s.id}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end border-t border-slate-100 pt-3 mt-1">
              <div>
                <div className="text-[11px] text-gray-400 font-medium">คงเหลือ / เริ่มต้น</div>
                <div className={`text-[17px] font-bold ${s.remaining_length < 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {s.remaining_length} <span className="text-gray-400 text-xs font-medium">/ {s.initial_length} ม.</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-blue-600">{fmt(s.price)} บ.</div>
                <div className="text-[11px] text-gray-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded mt-0.5">ทุน {fmt(s.cost_per_meter)}/ม.</div>
              </div>
            </div>
            
            <div className="bg-slate-100 rounded-full w-full overflow-hidden mt-3 h-2 block">
              <div className={`h-full rounded-full transition-all duration-500 ${s.remaining_length < 5 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.max(0, s.remaining_length) / s.initial_length * 100}%`}}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Stock Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800">เพิ่มสต็อกฟิล์ม</h3>
            <label className="block text-sm font-semibold mb-1">วันที่</label>
            <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="w-full border rounded-xl px-4 py-2.5 outline-none mb-3 bg-slate-50" />
            
            <label className="block text-sm font-semibold mb-1">ยี่ห้อ (Brand)</label>
            <select value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} className="w-full border rounded-xl px-4 py-2.5 outline-none mb-3 bg-white font-bold text-slate-700">
              <option value="">- เลือกแบรนด์/ซัพพลายเออร์ -</option>
              {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
            
            <label className="block text-sm font-semibold mb-1">รหัสฟิล์ม</label>
            <input value={form.code} onChange={e=>setForm({...form, code:e.target.value})} placeholder="Ex. R10" className="w-full border rounded-xl px-4 py-2.5 outline-none mb-3" />
            
            <label className="block text-sm font-semibold mb-1">ประเภท</label>
            <input value={form.type} onChange={e=>setForm({...form, type:e.target.value})} placeholder="Ex. Ceramic" className="w-full border rounded-xl px-4 py-2.5 outline-none mb-3" />
            
            <label className="block text-sm font-semibold mb-1">ราคาต้นทุน (ยกม้วน)</label>
            <input type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="บาท" className="w-full border rounded-xl px-4 py-2.5 outline-none font-bold text-lg text-blue-600 mb-3" />
            
            <div className="grid grid-cols-2 gap-3 mb-1">
               <div>
                  <label className="block text-sm font-semibold mb-1">หน้ากว้าง (ซม.)</label>
                  <input type="number" value={form.width} onChange={e=>setForm({...form, width:e.target.value})} placeholder="152" className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 font-bold" />
               </div>
               <div>
                  <label className="block text-sm font-semibold mb-1">ความยาว (เมตร)</label>
                  <input type="number" value={form.length} onChange={e=>setForm({...form, length:e.target.value})} placeholder="30" className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 font-bold" />
               </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAdd(false)} className="flex-1 font-semibold py-3 bg-slate-100 text-slate-600 rounded-xl">ยกเลิก</button>
              <button disabled={loading} onClick={submitAdd} className="flex-1 font-semibold py-3 bg-blue-600 text-white rounded-xl shadow-md disabled:opacity-50">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Detail Modal */}
      {detailModal.open && detailModal.info && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4" onClick={() => setDetailModal({open: false})}>
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-xl text-slate-800">{detailModal.info.brand} {detailModal.info.film_code}</h3>
                <p className="text-xs text-gray-500 font-mono mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded-full font-bold">ID: {detailModal.info.id}</p>
              </div>
              <div className="text-right">
                {!isEditing ? (
                  <>
                    <div className="font-black text-blue-600 text-3xl flex items-center justify-end gap-2 leading-none">
                      {detailModal.info.remaining_length} <span className="text-sm font-medium text-slate-400 mt-2">ม.</span>
                      <button onClick={() => { setEditQty(detailModal.info.remaining_length); setIsEditing(true); }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition ml-2 -mt-1">
                        <PencilSimple weight="bold" />
                      </button>
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase mt-1">คงเหลือ</div>
                  </>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    <input type="number" value={editQty} onChange={e=>setEditQty(e.target.value)} className="w-24 text-right p-2 text-xl font-bold border-2 border-blue-500 rounded-xl bg-blue-50 text-blue-700 outline-none" autoFocus />
                    <div className="flex gap-1.5 mt-1">
                      <button onClick={saveEdit} disabled={loading} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700">บันทึก</button>
                      <button onClick={() => setIsEditing(false)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-300">ยกเลิก</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
               ประวัติการตัดสต็อก
            </h4>
            
            {history.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {history.map((h, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center transition hover:bg-white hover:shadow-sm">
                    <div>
                      <div className="font-bold text-slate-800 text-sm mb-1">{h.projectName}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                        <CalendarBlank weight="fill" className="text-slate-400" /> {h.date} • {h.user}
                      </div>
                    </div>
                    <div className="font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg text-sm">- {h.meter} ม.</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                <ClockCounterClockwise weight="duotone" className="text-4xl mb-2 text-slate-300" />
                <span className="font-medium text-sm">ยังไม่มีประวัติการใช้งาน</span>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t">
              <button onClick={() => setDetailModal({open: false})} className="font-bold py-3 bg-slate-100 text-slate-600 w-full rounded-xl hover:bg-slate-200 transition">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

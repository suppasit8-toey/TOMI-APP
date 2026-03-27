'use client';

import { useState, useEffect } from 'react';
import { Plus, ClockCounterClockwise, PencilSimple, CalendarBlank, Printer } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/AuthProvider';

export default function StockPage() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ทั้งหมด');
  const [selectedType, setSelectedType] = useState('ทั้งหมด');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  // Add Stock Modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], brand: '', code: '', type: '', price: '', width: '152', length: '30' });

  // Detail Modal
  const [detailModal, setDetailModal] = useState<any>({ open: false, info: null });
  const [history, setHistory] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState('');
  const [printItem, setPrintItem] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('stocks').select('*').order('created_at', { ascending: false });
    const { data: bData } = await supabase.from('suppliers').select('id, name').order('name', { ascending: true });
    setStocks(data || []);
    setBrands(bData || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);
  
  const uniqueBrands = ['ทั้งหมด', ...Array.from(new Set(stocks.map(s => s.brand))).sort()];
  const uniqueTypes = ['ทั้งหมด', ...Array.from(new Set(stocks.map(s => s.film_type))).filter(Boolean).sort()];

  const filtered = stocks.filter(s => {
    const matchStatus = filter === 'ทั้งหมด' || s.status === filter;
    const matchSearch = !searchQuery || 
      (s.film_code?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       s.brand?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchBrand = selectedBrand === 'ทั้งหมด' || s.brand === selectedBrand;
    const matchType = selectedType === 'ทั้งหมด' || s.film_type === selectedType;
    
    return matchStatus && matchSearch && matchBrand && matchType;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === 'most_remain') return b.remaining_length - a.remaining_length;
    if (sortBy === 'least_remain') return a.remaining_length - b.remaining_length;
    return 0;
  });

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

  const handlePrint = (s: any) => {
    setPrintItem(s);
    setTimeout(() => {
      window.print();
    }, 300);
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
      
      <div className="flex flex-col md:flex-row gap-3 mb-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm no-print">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="ค้นหารหัสหรือยี่ห้อ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2">
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-xs sm:text-sm appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '40px' }}
          >
            <option value="ทั้งหมด">📦 แบรนด์: ทั้งหมด</option>
            {uniqueBrands.filter(b => b !== 'ทั้งหมด').map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-xs sm:text-sm appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '40px' }}
          >
            <option value="ทั้งหมด">🎞️ ประเภท: ทั้งหมด</option>
            {uniqueTypes.filter(t => t !== 'ทั้งหมด').map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-xs sm:text-sm appearance-none sm:col-span-2 lg:col-span-1"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '40px' }}
          >
            <option value="newest">📅 ใหม่สุด - เก่าสุด</option>
            <option value="oldest">📅 เก่าสุด - ใหม่สุด</option>
            <option value="most_remain">📏 เหลือเยอะสุด</option>
            <option value="least_remain">📏 เหลือน้อยสุด</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-3 items-center overflow-x-auto pb-1 no-scrollbar no-print">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 whitespace-nowrap">สถานะ:</span>
        {['ทั้งหมด', 'มีของ', 'หมด'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-bold transition shadow-sm border whitespace-nowrap ${filter === f ? (f === 'ทั้งหมด' ? 'bg-slate-800 text-white border-slate-800' : f === 'มีของ' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600') : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
        {(searchQuery || selectedBrand !== 'ทั้งหมด' || selectedType !== 'ทั้งหมด' || filter !== 'ทั้งหมด' || sortBy !== 'newest') && (
           <button 
             onClick={() => { setSearchQuery(''); setSelectedBrand('ทั้งหมด'); setSelectedType('ทั้งหมด'); setFilter('ทั้งหมด'); setSortBy('newest'); }}
             className="text-[10px] font-bold text-red-500 hover:underline ml-2"
           >
             ล้างตัวกรอง
           </button>
        )}
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

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition">
               <button 
                 onClick={(e) => { e.stopPropagation(); handlePrint(s); }}
                 className="bg-white border border-slate-200 p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-400 shadow-sm transition"
                 title="พิมพ์ฉลาก"
               >
                 <Printer weight="bold" />
               </button>
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
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded-full font-bold">ID: {detailModal.info.id}</p>
                  <button onClick={() => handlePrint(detailModal.info)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition">
                    <Printer weight="fill" /> พิมพ์ฉลาก
                  </button>
                </div>
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

      {/* PRINTABLE LABEL TEMPLATE */}
      <div id="print-label" className="stock-label-area" style={{ display: 'none' }}>
         <style>{`
           @media print {
             @page { size: 150mm 100mm; margin: 0; }
             * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
             body, html { margin: 0; padding: 0; background: white; width: 150mm; height: 100mm; overflow: hidden; }
             body * { visibility: hidden; }
             .stock-label-area, .stock-label-area * { visibility: visible; }
             .stock-label-area { 
               display: block !important;
               position: absolute; 
               left: 0; 
               top: 0; 
               width: 150mm; 
               height: 100mm; 
               margin: 0;
               padding: 0;
               background: white;
               z-index: 99999;
             }
             .no-print { display: none !important; }
           }
         `}</style>
         {printItem && (
           <div className="w-[150mm] h-[100mm] p-[4mm] flex flex-col bg-white text-black font-sans" style={{ color: '#000' }}>
             {/* TOP BRAND BAR - PREMIUM INVERTED */}
             <div className="flex bg-black text-white p-4 h-[30mm] items-center justify-between shrink-0 mb-3">
               <div className="flex flex-col flex-1 overflow-visible">
                 <div className="text-[60px] font-black leading-none uppercase tracking-tighter whitespace-nowrap" style={{ color: '#fff' }}>{printItem.brand}</div>
                 <div className="text-[22px] font-black mt-2 opacity-90 uppercase whitespace-nowrap" style={{ color: '#fff' }}>{printItem.film_code}</div>
               </div>
               <div className="w-[45mm] text-right border-l border-white/30 pl-4 h-full flex flex-col justify-center shrink-0">
                 <div className="text-[16px] font-black uppercase tracking-widest leading-tight mb-1" style={{ color: '#fff' }}>{printItem.film_type}</div>
                 <div className="text-[16px] font-bold" style={{ color: '#fff' }}>{printItem.width}cm x {printItem.initial_length}m</div>
               </div>
             </div>

             {/* MIDDLE SECTION - CLEAN USAGE TRACKING */}
             <div className="flex-grow flex flex-col mb-3">
               <div className="flex justify-between items-end mb-1 border-b-2 border-black pb-1">
                 <div className="text-[12px] font-black uppercase tracking-widest text-black">Manual Usage Recording</div>
                 <div className="text-[11px] font-bold text-black opacity-60 italic">Purchased: {new Date(printItem.created_at).toLocaleDateString('th-TH')}</div>
               </div>
               
               <div className="flex flex-col gap-0 border-x-2 border-black">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex items-center border-b-2 border-black h-[9mm] relative">
                     <div className="absolute left-1 bottom-0.5 text-[7px] font-black text-black opacity-20 tracking-[0.2em]">ROW {i}</div>
                     <div className="w-1/3 border-r-2 border-black h-full flex items-center px-4 italic text-[10px] opacity-60">Date:</div>
                     <div className="w-1/3 border-r-2 border-black h-full flex items-center px-4 italic text-[10px] opacity-60">Used:</div>
                     <div className="w-1/3 h-full flex items-center px-4 italic text-[10px] opacity-60">Balance:</div>
                   </div>
                 ))}
               </div>
             </div>

             {/* FOOTER - CLEAR ID ONLY */}
             <div className="flex flex-col items-center justify-center shrink-0 border-t-2 border-black pt-2 pb-1">
                <div className="text-[9px] font-black tracking-[0.4em] uppercase opacity-40 mb-1">TOMI FILM MANAGEMENT SYSTEM</div>
                <div className="text-[36px] font-mono font-black tracking-[0.3em] leading-none text-center" style={{ color: '#000' }}>{printItem.id}</div>
                <div className="mt-1 text-[8px] font-bold opacity-30 tracking-widest uppercase">Premium Quality Stock Label v2.5</div>
             </div>
           </div>
         )}
      </div>

    </div>
  );
}

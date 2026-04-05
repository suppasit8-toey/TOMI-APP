'use client';

import { useState, useEffect } from 'react';
import { Plus, ClockCounterClockwise, PencilSimple, CalendarBlank, Printer, Scroll, MagnifyingGlass, Funnel, Hash, ArrowSquareUpRight, ArrowSquareDownRight, ChartLineUp, Package, Tag, CurrencyDollar, WarningCircle } from '@phosphor-icons/react';
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
    const cost = Math.ceil(price / length / 10) * 10;

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

  // Calculate Stats
  const totalStockValue = stocks.reduce((sum, s) => sum + (s.cost_per_meter * s.remaining_length), 0);
  const lowStockCount = stocks.filter(s => s.remaining_length < 5 && s.remaining_length > 0).length;
  const outOfStockCount = stocks.filter(s => s.remaining_length <= 0).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
            <Scroll weight="fill" className="text-blue-500 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">สต็อกฟิล์ม</h2>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">จัดการรายการม้วนฟิล์มและการเบิกใช้</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white py-2.5 px-5 rounded-xl font-bold shadow-lg shadow-blue-200 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700 whitespace-nowrap w-full md:w-auto justify-center">
          <Plus weight="bold" className="text-lg" /> เพิ่มสต็อก
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 no-print">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
            <Package weight="duotone" className="text-blue-500 text-xl" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ม้วนทั้งหมด</div>
            <div className="text-lg font-black text-slate-800 leading-none mt-0.5">{stocks.length}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
            <CurrencyDollar weight="duotone" className="text-emerald-500 text-xl" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">มูลค่าคงเหลือ</div>
            <div className="text-lg font-black text-slate-800 leading-none mt-0.5 max-w-[100px] truncate" title={fmt(totalStockValue)}>฿{fmt(totalStockValue)}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex items-center gap-3 relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 opacity-10 transform group-hover:scale-110 transition duration-500">
            <WarningCircle weight="fill" className="text-amber-500 text-6xl" />
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200 shrink-0 z-10">
            <WarningCircle weight="duotone" className="text-amber-500 text-xl" />
          </div>
          <div className="z-10">
            <div className="text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">ใกล้หมด (น้อยกว่า 5ม.)</div>
            <div className="text-lg font-black text-amber-600 leading-none mt-0.5">{lowStockCount}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100 flex items-center gap-3 relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 opacity-10 transform group-hover:scale-110 transition duration-500">
            <ClockCounterClockwise weight="fill" className="text-red-500 text-6xl" />
          </div>
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-200 shrink-0 z-10">
            <ClockCounterClockwise weight="duotone" className="text-red-500 text-xl" />
          </div>
          <div className="z-10">
            <div className="text-[10px] font-bold text-red-600/80 uppercase tracking-wider">หมดสต็อก</div>
            <div className="text-lg font-black text-red-600 leading-none mt-0.5">{outOfStockCount}</div>
          </div>
        </div>
      </div>
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm no-print mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input 
              type="text" 
              placeholder="ค้นหารหัส หรือ ยี่ห้อฟิล์ม..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700 text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition bg-slate-200 hover:bg-slate-300 rounded-full p-0.5">
                <Plus className="rotate-45" weight="bold" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 shrink-0 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <select 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="min-w-[130px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700 text-sm appearance-none outline-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
            >
              <option value="ทั้งหมด">📦 แบรนด์ (ทั้งหมด)</option>
              {uniqueBrands.filter(b => b !== 'ทั้งหมด').map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="min-w-[130px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700 text-sm appearance-none outline-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
            >
              <option value="ทั้งหมด">🎞️ ประเภท (ทั้งหมด)</option>
              {uniqueTypes.filter(t => t !== 'ทั้งหมด').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-[140px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700 text-sm appearance-none outline-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
            >
              <option value="newest">📅 เพิ่มล่าสุด - เก่าสุด</option>
              <option value="oldest">📅 เก่าสุด - ล่าสุด</option>
              <option value="most_remain">📏 เหลือมากสุด - น้อยสุด</option>
              <option value="least_remain">📏 เหลือน้อยสุด - มากสุด</option>
            </select>
          </div>
        </div>
        
        {/* Status Pills */}
        <div className="flex gap-2 items-center mt-3 pt-3 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1.5 whitespace-nowrap"><Funnel weight="fill"/> สถานะ:</span>
          {['ทั้งหมด', 'มีของ', 'หมด'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm border whitespace-nowrap ${filter === f ? (f === 'ทั้งหมด' ? 'bg-slate-800 text-white border-slate-800' : f === 'มีของ' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600') : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
          {(searchQuery || selectedBrand !== 'ทั้งหมด' || selectedType !== 'ทั้งหมด' || filter !== 'ทั้งหมด' || sortBy !== 'newest') && (
             <button 
               onClick={() => { setSearchQuery(''); setSelectedBrand('ทั้งหมด'); setSelectedType('ทั้งหมด'); setFilter('ทั้งหมด'); setSortBy('newest'); }}
               className="text-[11px] font-bold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full ml-auto transition whitespace-nowrap"
             >
               ล้างตัวกรองทั้งหมด
             </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
          <Scroll weight="thin" className="text-7xl text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold text-lg">ไม่พบข้อมูลสต็อก</p>
          <p className="text-slate-300 text-sm mt-1">ลองเปลี่ยนคำค้นหา หรือ เพิ่มตัวใหม่</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(s => {
            const isLowStock = s.remaining_length < 5 && s.remaining_length > 0;
            const isOutOfStock = s.status === 'หมด' || s.remaining_length <= 0;
            const ratio = Math.max(0, s.remaining_length) / s.initial_length * 100;
            
            return (
              <div key={s.id} onClick={() => openDetail(s)} className={`bg-white p-5 rounded-2xl shadow-sm border cursor-pointer transition relative overflow-hidden group hover:-translate-y-1 hover:shadow-md ${isOutOfStock ? 'border-red-200 hover:border-red-400' : isLowStock ? 'border-amber-200 hover:border-amber-400 bg-amber-50/10' : 'border-slate-200 hover:border-blue-400'}`}>
                
                {/* Out of Stock / Low Stock Banner */}
                {isOutOfStock ? (
                  <div className="absolute top-0 right-0 px-3 py-1.5 text-[10px] font-bold rounded-bl-xl shadow-sm tracking-wider bg-red-500 text-white z-10 flex items-center gap-1">
                    <WarningCircle weight="bold" /> หมด
                  </div>
                ) : isLowStock ? (
                  <div className="absolute top-0 right-0 px-3 py-1.5 text-[10px] font-bold rounded-bl-xl shadow-sm tracking-wider bg-amber-500 text-white z-10 flex items-center gap-1">
                    <WarningCircle weight="bold" /> ใกล้หมด
                  </div>
                ) : (
                  <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-xl bg-green-500"></div>
                )}
                
                <div className="flex flex-col mb-3">
                  <div className="font-black text-xl text-slate-800 leading-tight mb-1.5 group-hover:text-blue-600 transition flex items-start justify-between pr-4">
                    <span>
                      <span className="text-slate-400 font-medium text-sm mr-1">{s.brand}</span> 
                      {s.film_code}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <div className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1 whitespace-nowrap"><Tag weight="fill"/> {s.film_type || 'ไม่มีระบุ'}</div>
                    <div className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 whitespace-nowrap">หน้า {s.width}cm</div>
                  </div>
                  <div className="mt-2.5 flex flex-col pt-2 border-t border-slate-100">
                    <span className="font-barcode text-slate-400 tracking-[0.2em] text-4xl opacity-40 leading-none">{s.id}</span>
                    <span className="text-[9px] font-mono font-bold text-slate-300 tracking-wider -mt-1 ml-1">{s.id}</span>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrint(s); }}
                    className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 shadow-sm transition"
                    title="พิมพ์ฉลาก"
                  >
                    <Printer weight="fill" className="text-lg" />
                  </button>
                </div>
                
                <div className="mt-2 text-right">
                  <div className="text-xl font-black text-slate-700 leading-none">฿{fmt(s.price)}</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase">ทุน ฿{fmt(s.cost_per_meter)}/ม.</div>
                </div>
                
                {/* Progress Bar styled */}
                <div className="mt-4 pt-3 border-t border-slate-100/60">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">คงเหลือ</span>
                    <div className={`text-lg font-black leading-none ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-green-600'}`}>
                      {s.remaining_length} <span className="text-slate-400 text-xs font-medium">/ {s.initial_length} ม.</span>
                    </div>
                  </div>
                  <div className="bg-slate-100 rounded-full w-full overflow-hidden h-2 shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} style={{width: `${ratio}%`}}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Stock Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Scroll weight="fill" className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">เพิ่มสต็อกม้วนใหม่</h3>
                <p className="text-xs text-slate-400 font-medium">บันทึกฟิล์มม้วนใหม่เข้าระบบ</p>
              </div>
            </div>
            
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">วันที่นำเข้า</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition font-medium" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">ยี่ห้อ (Brand) <span className="text-red-500">*</span></label>
                <select value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none bg-white font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" required>
                  <option value="">- เลือกแบรนด์/ซัพพลายเออร์ -</option>
                  {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">รหัสฟิล์ม <span className="text-red-500">*</span></label>
                  <input value={form.code} onChange={e=>setForm({...form, code:e.target.value})} placeholder="เช่น R10" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition font-bold" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">ประเภท</label>
                  <input value={form.type} onChange={e=>setForm({...form, type:e.target.value})} placeholder="เช่น Ceramic" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">หน้ากว้าง (ซม.)</label>
                    <input type="number" value={form.width} onChange={e=>setForm({...form, width:e.target.value})} placeholder="152" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition font-bold" />
                 </div>
                 <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">ความยาว (เมตร)</label>
                    <input type="number" value={form.length} onChange={e=>setForm({...form, length:e.target.value})} placeholder="30" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition font-bold" />
                 </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">ราคาต้นทุน (ยกม้วน) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">฿</span>
                  </div>
                  <input type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="0" className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition font-black text-xl text-slate-800" required />
                </div>
                {form.price && form.length && (
                  <p className="text-[10px] text-blue-600 font-bold mt-1.5 bg-blue-50 w-fit px-2 py-0.5 rounded border border-blue-100">
                    เฉลี่ยตารางเมตรละ ≈ ฿{Math.ceil(Number(form.price) / Number(form.length) / 10) * 10}/ม.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAdd(false)} className="flex-1 font-bold py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button disabled={loading} onClick={submitAdd} className="flex-1 font-bold py-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Plus weight="bold" /> นำเข้าสต็อก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Detail Modal */}
      {detailModal.open && detailModal.info && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setDetailModal({open: false})}>
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-5 shrink-0">
              <div>
                <h3 className="font-black text-2xl text-slate-800 tracking-tight leading-none mb-1">
                  <span className="text-slate-400 font-medium text-lg mr-1">{detailModal.info.brand}</span>
                  {detailModal.info.film_code}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-[10px] text-slate-500 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded-md font-bold border border-slate-200 shadow-inner">ID: {detailModal.info.id}</p>
                  <button onClick={() => handlePrint(detailModal.info)} className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 hover:bg-blue-100 transition">
                    <Printer weight="fill" /> พิมพ์ฉลาก
                  </button>
                </div>
              </div>
              <div className="text-right">
                {!isEditing ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 px-4 flex flex-col items-end group shadow-inner">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">คงเหลือ</div>
                    <div className={`font-black text-3xl flex items-center justify-end gap-1.5 leading-none ${detailModal.info.remaining_length <= 0 ? 'text-red-500' : detailModal.info.remaining_length < 5 ? 'text-amber-500' : 'text-blue-600'}`}>
                      {detailModal.info.remaining_length} <span className="text-sm font-medium text-slate-400 mt-2">ม.</span>
                      <button onClick={() => { setEditQty(detailModal.info.remaining_length); setIsEditing(true); }} className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 shadow-sm transition ml-1 opacity-50 group-hover:opacity-100">
                        <PencilSimple weight="bold" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-2 bg-blue-50 p-3 rounded-2xl border border-blue-200">
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5 w-full text-right">แก้ไขยอดคงเหลือ</div>
                    <div className="flex items-center gap-2 w-full">
                      <input type="number" value={editQty} onChange={e=>setEditQty(e.target.value)} className="w-20 text-right p-1.5 text-xl font-bold border-2 border-blue-500 rounded-lg bg-white text-blue-700 outline-none focus:ring-2 focus:ring-blue-200" autoFocus />
                      <span className="text-sm font-bold text-blue-400">ม.</span>
                    </div>
                    <div className="flex gap-1.5 mt-1 w-full justify-end">
                      <button onClick={() => setIsEditing(false)} className="bg-white text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 flex-1">ยกเลิก</button>
                      <button onClick={saveEdit} disabled={loading} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 flex-1">อัปเดต</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2 shrink-0">
               <Hash weight="fill" className="text-slate-400" /> ประวัติการตัดสต็อกนำไปใช้
            </h4>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 pb-4">
              {history.length > 0 ? (
                history.map((h, i) => (
                  <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center transition hover:border-blue-200 group">
                    <div>
                      <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition">{h.projectName}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                        <CalendarBlank weight="fill" className="text-slate-400" /> {new Date(h.date).toLocaleDateString('th-TH', {day:'numeric', month:'short', year:'numeric'})}
                        <span className="text-slate-300">•</span> 
                        <PencilSimple weight="fill" className="text-slate-400" /> {h.user}
                      </div>
                    </div>
                    <div className="font-black text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg text-sm shadow-inner group-hover:bg-red-500 group-hover:text-white transition">
                      -{h.meter} <span className="text-[10px] font-medium opacity-80">ม.</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                  <ClockCounterClockwise weight="duotone" className="text-4xl mb-3 text-slate-300" />
                  <span className="font-bold text-sm text-slate-500">ยังไม่มีประวัติการใช้งาน</span>
                  <span className="text-xs mt-1">ฟิล์มม้วนใหม่ ยังไม่ถูกเบิก</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 shrink-0">
              <button onClick={() => setDetailModal({open: false})} className="font-bold py-3 bg-slate-100 text-slate-600 w-full rounded-xl hover:bg-slate-200 transition">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE LABEL TEMPLATE (Keep exactly as is) */}
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

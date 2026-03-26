'use client';

import { useState, useEffect } from 'react';
import { Plus, Receipt, Trash, Eye, MagnifyingGlass, DownloadSimple } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchQuotations(); }, []);

    const fetchQuotations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('film_quotations')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && data) setQuotations(data);
        setLoading(false);
    };

    const deleteQuotation = async (id: string) => {
        const result = await Swal.fire({ title: 'ลบใบเสนอราคานี้?', text: 'จะไม่สามารถกู้คืนได้', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ลบเลย', cancelButtonText: 'ยกเลิก' });
        if (result.isConfirmed) {
            await supabase.from('film_quotations').delete().eq('id', id);
            setQuotations(prev => prev.filter(q => q.id !== id));
            Swal.fire('ลบแล้ว', '', 'success');
        }
    };

    const statusColor = (s: string) => {
        if (s === 'ส่งแล้ว') return 'bg-emerald-100 text-emerald-700';
        if (s === 'ยกเลิก') return 'bg-red-100 text-red-600';
        return 'bg-amber-100 text-amber-700';
    };

    const filtered = quotations.filter(q =>
        (q.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.film_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.id || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto font-[family-name:var(--font-prompt)]">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Receipt weight="fill" className="text-blue-500" /> ใบเสนอราคา
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">จัดการใบเสนอราคาฟิล์มอาคาร</p>
                </div>
                <Link href="/quotations/create" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center gap-2 text-sm">
                    <Plus weight="bold" /> สร้างใบเสนอราคาใหม่
                </Link>
            </div>

            {/* SEARCH */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
                <div className="relative">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400 text-sm" placeholder="ค้นหาชื่อลูกค้า, ชื่อฟิล์ม, เลขที่ใบเสนอราคา..." />
                </div>
            </div>

            {/* LIST */}
            {loading ? (
                <div className="text-center py-20 text-slate-400 font-bold">กำลังโหลด...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Receipt weight="thin" className="text-7xl text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-lg">ยังไม่มีใบเสนอราคา</p>
                    <p className="text-slate-400 text-sm mt-1">กดปุ่ม &quot;สร้างใบเสนอราคาใหม่&quot; เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(q => (
                        <div key={q.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-xs font-mono text-slate-400">{q.id}</span>
                                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusColor(q.status)}`}>{q.status}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 truncate">{q.customer_name || '(ไม่ระบุชื่อ)'}</h3>
                                <p className="text-sm text-slate-500 truncate">{q.film_name || '-'} &bull; {q.quote_date ? new Date(q.quote_date).toLocaleDateString('th-TH') : '-'}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-lg font-black text-slate-800">฿{(q.grand_total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Link href={`/quotations/create?id=${q.id}`} className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-xl transition" title="ดู/แก้ไข">
                                    <Eye weight="bold" />
                                </Link>
                                <button onClick={() => deleteQuotation(q.id)} className="bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-xl transition" title="ลบ">
                                    <Trash weight="bold" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

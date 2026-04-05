'use client';

import { useState, useEffect } from 'react';
import { Plus, Receipt, Trash, Eye, MagnifyingGlass, ChartBar, CurrencyDollar, Clock, CheckCircle, XCircle } from '@phosphor-icons/react';
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
        if (s === 'ส่งแล้ว') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (s === 'ยกเลิก') return 'bg-red-100 text-red-600 border-red-200';
        return 'bg-amber-100 text-amber-700 border-amber-200';
    };

    const statusIcon = (s: string) => {
        if (s === 'ส่งแล้ว') return <CheckCircle weight="fill" className="text-emerald-500 text-sm" />;
        if (s === 'ยกเลิก') return <XCircle weight="fill" className="text-red-500 text-sm" />;
        return <Clock weight="fill" className="text-amber-500 text-sm" />;
    };

    const filtered = quotations.filter(q =>
        (q.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.film_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.id || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalValue = quotations.reduce((sum, q) => sum + (q.grand_total || 0), 0);
    const sentCount = quotations.filter(q => q.status === 'ส่งแล้ว').length;
    const pendingCount = quotations.filter(q => q.status !== 'ส่งแล้ว' && q.status !== 'ยกเลิก').length;

    return (
        <div className="max-w-5xl mx-auto font-[family-name:var(--font-prompt)] animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                        <Receipt weight="fill" className="text-blue-500 text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">ใบเสนอราคา</h1>
                        <p className="text-sm text-slate-400 mt-0.5 font-medium">จัดการใบเสนอราคาฟิล์มอาคาร</p>
                    </div>
                </div>
                <Link href="/quotations/create" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center gap-2 text-sm hover:-translate-y-0.5">
                    <Plus weight="bold" /> สร้างใบเสนอราคาใหม่
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                        <ChartBar weight="duotone" className="text-blue-500" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ทั้งหมด</div>
                        <div className="text-lg font-black text-slate-800 leading-none mt-0.5">{quotations.length}</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                        <CheckCircle weight="duotone" className="text-emerald-500" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ส่งแล้ว</div>
                        <div className="text-lg font-black text-emerald-600 leading-none mt-0.5">{sentCount}</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100 shrink-0">
                        <CurrencyDollar weight="duotone" className="text-purple-500" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">มูลค่ารวม</div>
                        <div className="text-lg font-black text-slate-800 leading-none mt-0.5">฿{new Intl.NumberFormat('th-TH').format(totalValue)}</div>
                    </div>
                </div>
            </div>

            {/* SEARCH */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
                <div className="relative">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm transition" placeholder="ค้นหาชื่อลูกค้า, ชื่อฟิล์ม, เลขที่ใบเสนอราคา..." />
                </div>
            </div>

            {/* LIST */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <span className="text-slate-400 font-bold">กำลังโหลด...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Receipt weight="thin" className="text-7xl text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-lg">ยังไม่มีใบเสนอราคา</p>
                    <p className="text-slate-300 text-sm mt-1">กดปุ่ม "สร้างใบเสนอราคาใหม่" เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(q => (
                        <div key={q.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center gap-4 group">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{q.id}</span>
                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusColor(q.status)}`}>
                                        {statusIcon(q.status)} {q.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 truncate text-base group-hover:text-blue-600 transition">{q.customer_name || '(ไม่ระบุชื่อ)'}</h3>
                                <p className="text-sm text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                                    <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] font-medium">{q.film_name || '-'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="text-[11px]" />
                                        {q.quote_date ? new Date(q.quote_date).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' }) : '-'}
                                    </span>
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">ยอดรวม</p>
                                <p className="text-xl font-black text-slate-800">฿{(q.grand_total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Link href={`/quotations/create?id=${q.id}`} className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-xl transition border border-blue-100 hover:border-blue-200" title="ดู/แก้ไข">
                                    <Eye weight="bold" />
                                </Link>
                                <button onClick={() => deleteQuotation(q.id)} className="bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-xl transition border border-red-100 hover:border-red-200" title="ลบ">
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

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import { Plus, Calculator, Trash, Clock, CaretRight, Hash, Eye } from '@phosphor-icons/react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function CalculatorIndexPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const { data } = await supabase.from('film_calculations').select('*').order('created_at', { ascending: false });
        setHistory(data || []);
        setLoading(false);
    };

    const deleteItem = async (id: string, name: string) => {
        const res = await Swal.fire({
            title: 'ลบรายการคำนวณ?',
            text: `ต้องการลบรายการของ "${name || 'รายการนี้'}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'ยกเลิก',
            confirmButtonText: 'ลบทิ้ง'
        });
        if (res.isConfirmed) {
            await supabase.from('film_calculations').delete().eq('id', id);
            Swal.fire('ลบแล้ว!', '', 'success');
            loadData();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shrink-0 shadow-sm">
                        <Calculator weight="fill" className="text-amber-500 text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">ประวัติการคำนวณตัดฟิล์ม</h2>
                        <p className="text-sm text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                            รายการคำนวณหน้าเรียงฟิล์มทั้งหมด <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">{history.length} รายการ</span>
                        </p>
                    </div>
                </div>
                <Link href="/calculator/new" className="bg-blue-600 text-white py-2.5 px-6 rounded-xl font-bold shadow-lg shadow-blue-600/30 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700 w-full md:w-auto justify-center">
                    <Plus weight="bold" /> เริ่มคำนวณใหม่
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : history.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <Calculator className="text-7xl mx-auto mb-4 text-slate-200" weight="thin" />
                    <p className="font-black text-slate-400 text-xl">ยังไม่มีประวัติการคำนวณ</p>
                    <p className="text-slate-400 text-sm mt-1">กด "เริ่มคำนวณใหม่" ด้านบนเพื่อคำนวณการใช้ฟิล์ม</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {history.map(item => {
                        const totalWindows = item.windows_data?.length || 0;
                        const date = new Date(item.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col relative overflow-hidden">
                                <Link href={`/calculator/${item.id}`} className="absolute inset-0 z-0"></Link>
                                
                                <div className="flex justify-between items-start mb-3 z-10 pointer-events-none">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
                                            <Calculator weight="fill" className="text-sm" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 leading-none">
                                                ID: {item.id.slice(0, 8)}...
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteItem(item.id, item.project_name); }} className="text-red-400 hover:text-white bg-red-50 hover:bg-red-500 p-2 rounded-lg transition border border-red-100 hover:border-red-500 pointer-events-auto" title="ลบข้อมูล">
                                        <Trash weight="bold" />
                                    </button>
                                </div>
                                
                                <div className="mb-4 z-10 pointer-events-none">
                                    <h3 className="font-black text-xl text-slate-800 leading-tight group-hover:text-blue-600 transition mb-1">{item.project_name || '(ไม่มีชื่อโปรเจกต์)'}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                        <Clock className="text-[11px]" /> {date}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-100 z-10 pointer-events-none">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">บานกระจก</span>
                                            <span className="font-black text-slate-700">{totalWindows} <span className="text-xs font-normal">บาน</span></span>
                                        </div>
                                        <div className="bg-blue-50/50 border border-blue-100/50 rounded-lg p-2.5 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">ความยาวฟิล์ม</span>
                                            <span className="font-black text-blue-600">{item.total_length_needed?.toFixed(2) || 0} <span className="text-xs font-normal">ม.</span></span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-center text-xs font-bold text-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        กดเพื่อดูรายละเอียดผลคำนวณ <CaretRight weight="bold" className="ml-1" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

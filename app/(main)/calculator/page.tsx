'use client';

import { useState, useEffect } from 'react';
import { Plus, Scissors, Trash, MagnifyingGlass, CalendarBlank } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import Link from 'next/link';

interface Session {
    id: string;
    name: string;
    film_code: string;
    unit: string;
    roll_width: number;
    can_rotate: boolean;
    locations: any[];
    created_at: string;
}

export default function CalculatorListPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadSessions(); }, []);

    const loadSessions = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('calculator_sessions')
            .select('*')
            .order('created_at', { ascending: false });
        setSessions(data || []);
        setLoading(false);
    };

    const deleteSession = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'ลบข้อมูล?',
            text: `ยืนยันลบ "${name}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#ef4444'
        });
        if (!result.isConfirmed) return;
        await supabase.from('calculator_sessions').delete().eq('id', id);
        setSessions(sessions.filter(s => s.id !== id));
        Swal.fire('ลบแล้ว', '', 'success');
    };

    const filtered = sessions.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.film_code || '').toLowerCase().includes(search.toLowerCase())
    );

    const countPanes = (locations: any[]) => {
        if (!locations || !Array.isArray(locations)) return 0;
        return locations.reduce((sum, loc) => sum + (loc.items?.length || 0), 0);
    };

    return (
        <div className="max-w-4xl mx-auto font-[family-name:var(--font-prompt)]">
            {/* HEADER */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center border-4 border-blue-100 text-white shrink-0 shadow-inner">
                        <Scissors weight="fill" className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">คำนวณตัดฟิล์ม</h1>
                        <p className="text-sm font-medium text-slate-500">รายการที่บันทึกไว้ทั้งหมด</p>
                    </div>
                </div>
                <Link href="/calculator/new" className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 flex items-center gap-2 text-base w-full md:w-auto justify-center">
                    <Plus weight="bold" /> สร้างใหม่
                </Link>
            </div>

            {/* SEARCH */}
            <div className="relative mb-6">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-400 bg-white shadow-sm text-sm font-medium" placeholder="ค้นหาชื่อ หรือ รหัสฟิล์ม..." />
            </div>

            {/* LIST */}
            {loading ? (
                <div className="text-center py-20 text-slate-400 font-bold">กำลังโหลด...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Scissors className="text-6xl text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-lg">ยังไม่มีรายการที่บันทึก</p>
                    <p className="text-slate-400 text-sm mt-1">กดปุ่ม "สร้างใหม่" เพื่อเริ่มคำนวณ</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(s => {
                        const locCount = s.locations?.length || 0;
                        const paneCount = countPanes(s.locations);
                        return (
                            <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-blue-300 transition group">
                                <div className="flex justify-between items-start">
                                    <Link href={`/calculator/new?id=${s.id}`} className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-800 text-lg truncate group-hover:text-blue-600 transition">{s.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {s.film_code && <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-lg">🏷️ {s.film_code}</span>}
                                            <span className="bg-slate-50 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-lg">🪟 {locCount} ตำแหน่ง / {paneCount} บาน</span>
                                            <span className="bg-slate-50 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-lg">📏 หน้าม้วน {s.roll_width}"</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                            <CalendarBlank weight="bold" />
                                            <span>{new Date(s.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(s.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </Link>
                                    <button onClick={() => deleteSession(s.id, s.name)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition shrink-0 ml-2">
                                        <Trash weight="bold" className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

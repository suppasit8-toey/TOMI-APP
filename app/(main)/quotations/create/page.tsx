'use client';
import React from 'react';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { ArrowLeft, Plus, Trash, DownloadSimple, FloppyDisk, Receipt } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import Link from 'next/link';

interface QuoteItem {
    id: string;
    description: string;
    unit: string;
    qty: number;
    unit_price: number;
    amount: number;
}

interface FilmGroup {
    id: string;
    filmName: string;
    items: QuoteItem[];
}

const genId = () => 'Q' + Date.now() + Math.random().toString(36).slice(2, 6);

const toThaiBahtText = (number: number) => {
    if (number === 0) return 'ศูนย์บาทถ้วน';
    let s = number.toFixed(2).split('.');
    let baht = s[0]; let satang = s[1];
    const n = ['ศูนย์','หนึ่ง','สอง','สาม','สี่','ห้า','หก','เจ็ด','แปด','เก้า'];
    const v = ['','สิบ','ร้อย','พัน','หมื่น','แสน','ล้าน'];
    const readSegment = (str: string) => {
        let res = '';
        for(let i=0; i<str.length; i++) {
            let ch = parseInt(str[i]);
            let p = str.length - i - 1;
            if (ch === 0) continue;
            if (ch === 1 && p === 0 && str.length > 1) res += 'เอ็ด';
            else if (ch === 1 && p === 1) res += '';
            else if (ch === 2 && p === 1) res += 'ยี่';
            else res += n[ch];
            res += v[p];
        }
        return res;
    };
    let res = readSegment(baht) + 'บาท';
    if (satang === '00') res += 'ถ้วน';
    else res += readSegment(satang) + 'สตางค์';
    return res;
};

export default function QuotationCreatePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    const [custName, setCustName] = useState('');
    const [custAddr, setCustAddr] = useState('');
    const [taxId, setTaxId] = useState('');
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [installFee, setInstallFee] = useState<number>(0);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState('ร่าง');
    const [saving, setSaving] = useState(false);

    const [groups, setGroups] = useState<FilmGroup[]>([
        { id: genId(), filmName: '', items: [{ id: genId(), description: '', unit: 'ตร.ฟุต', qty: 0, unit_price: 0, amount: 0 }] }
    ]);

    useEffect(() => {
        if (editId) loadQuotation(editId);
    }, [editId]);

    const loadQuotation = async (id: string) => {
        const { data: q } = await supabase.from('film_quotations').select('*').eq('id', id).single();
        if (q) {
            setCustName(q.customer_name || '');
            setCustAddr(q.customer_address || '');
            setTaxId(q.tax_id || '');
            setQuoteDate(q.quote_date || new Date().toISOString().split('T')[0]);
            setInstallFee(q.install_fee || 0);
            setNote(q.note || '');
            setStatus(q.status || 'ร่าง');
        }
        const { data: its } = await supabase
            .from('film_quotation_items')
            .select('*')
            .eq('quotation_id', id)
            .order('item_order', { ascending: true });
        if (its && its.length > 0) {
            // Reconstruct groups from flat items using group_name
            const groupMap = new Map<string, FilmGroup>();
            its.forEach(it => {
                const gName = it.group_name || '';
                if (!groupMap.has(gName)) {
                    groupMap.set(gName, { id: genId(), filmName: gName, items: [] });
                }
                groupMap.get(gName)!.items.push({
                    id: it.id,
                    description: it.description,
                    unit: it.unit,
                    qty: it.qty,
                    unit_price: it.unit_price,
                    amount: it.amount
                });
            });
            const loadedGroups = Array.from(groupMap.values());
            if (loadedGroups.length > 0) setGroups(loadedGroups);
        }
    };

    // GROUP OPERATIONS
    const addGroup = () => {
        setGroups([...groups, { id: genId(), filmName: '', items: [{ id: genId(), description: '', unit: 'ตร.ฟุต', qty: 0, unit_price: 0, amount: 0 }] }]);
    };

    const removeGroup = (gId: string) => {
        if (groups.length <= 1) return;
        setGroups(groups.filter(g => g.id !== gId));
    };

    const updateGroupFilmName = (gId: string, val: string) => {
        setGroups(groups.map(g => g.id === gId ? { ...g, filmName: val } : g));
    };

    // ITEM OPERATIONS (within a group)
    const addItem = (gId: string) => {
        setGroups(groups.map(g => g.id === gId ? { ...g, items: [...g.items, { id: genId(), description: '', unit: 'ตร.ฟุต', qty: 0, unit_price: 0, amount: 0 }] } : g));
    };

    const removeItem = (gId: string, iId: string) => {
        setGroups(groups.map(g => {
            if (g.id !== gId) return g;
            if (g.items.length <= 1) return g;
            return { ...g, items: g.items.filter(i => i.id !== iId) };
        }));
    };

    const updateItem = (gId: string, iId: string, field: keyof QuoteItem, value: any) => {
        setGroups(groups.map(g => {
            if (g.id !== gId) return g;
            return {
                ...g, items: g.items.map(i => {
                    if (i.id !== iId) return i;
                    const updated = { ...i, [field]: value };
                    if (field === 'qty' || field === 'unit_price') {
                        updated.amount = (updated.qty || 0) * (updated.unit_price || 0);
                    }
                    return updated;
                })
            };
        }));
    };

    const allItems = groups.flatMap(g => g.items);
    const subtotal = allItems.reduce((s, i) => s + (i.amount || 0), 0);
    const grandTotal = subtotal + (installFee || 0);

    const saveQuotation = async () => {
        if (!custName.trim()) {
            Swal.fire('กรุณากรอกชื่อลูกค้า', '', 'warning');
            return;
        }
        setSaving(true);
        const qId = editId || ('QT' + Date.now());
        const quotationData = {
            id: qId,
            customer_name: custName,
            customer_address: custAddr,
            tax_id: taxId,
            film_name: groups.map(g => g.filmName).filter(Boolean).join(', '),
            quote_date: quoteDate,
            install_fee: installFee,
            grand_total: grandTotal,
            note: note,
            status: status,
            updated_at: new Date().toISOString()
        };

        if (editId) {
            await supabase.from('film_quotations').update(quotationData).eq('id', editId);
            await supabase.from('film_quotation_items').delete().eq('quotation_id', editId);
        } else {
            await supabase.from('film_quotations').insert({ ...quotationData, created_at: new Date().toISOString() });
        }

        let order = 1;
        const itemsToInsert: any[] = [];
        groups.forEach(g => {
            g.items.forEach(it => {
                itemsToInsert.push({
                    quotation_id: qId,
                    item_order: order++,
                    group_name: g.filmName,
                    description: it.description,
                    unit: it.unit,
                    qty: it.qty,
                    unit_price: it.unit_price,
                    amount: it.amount
                });
            });
        });
        await supabase.from('film_quotation_items').insert(itemsToInsert);

        setSaving(false);
        Swal.fire('บันทึกสำเร็จ!', '', 'success');
        if (!editId) router.push(`/quotations/create?id=${qId}`);
    };

    const generateQuote = async () => {
        // @ts-ignore
        if (typeof window === 'undefined' || !window.domtoimage) {
            Swal.fire('รอสักครู่', 'ระบบกำลังโหลดโมดูลทำเอกสาร กรุณารอสักครู่แล้วกดใหม่ครับ', 'warning');
            return;
        }
        Swal.fire({ title: 'กำลังเตรียมเอกสาร...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const el = document.getElementById('quote-print-template');
            if (!el) throw new Error('Template not found');
            el.style.position = 'fixed';
            el.style.left = '0';
            el.style.top = '0';
            el.style.zIndex = '-1';
            el.style.opacity = '1';
            
            // Scale up for sharpness
            el.style.transform = 'scale(2)';
            el.style.transformOrigin = 'top left';
            
            await new Promise(r => setTimeout(r, 500));
            // @ts-ignore
            const iData = await window.domtoimage.toJpeg(el, { 
                bgcolor: '#ffffff', 
                quality: 1.0, 
                width: 850 * 2, 
                height: el.scrollHeight * 2 
            });
            el.style.transform = '';
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            el.style.zIndex = '';
            el.style.opacity = '';

            setPreviewImg(iData);
            Swal.close();
        } catch (e: any) {
            console.error(e);
            const el = document.getElementById('quote-print-template');
            if (el) { el.style.position = 'absolute'; el.style.left = '-9999px'; el.style.transform = ''; }
            Swal.fire('ผิดพลาด', 'ไม่สามารถสร้างเอกสารได้: ' + (e.message || ''), 'error');
        }
    };

    const downloadAsPDF = () => {
        if (!previewImg) return;
        // @ts-ignore
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const el = document.getElementById('quote-print-template');
        const iH = ((el?.scrollHeight || 1100) * 190) / 850;
        doc.addImage(previewImg, 'JPEG', 10, 10, 190, iH);
        doc.save(`Quotation_${custName || 'Draft'}.pdf`);
        Swal.fire({ title: 'ดาวน์โหลดสำเร็จ', text: 'ระบบกำลังดาวน์โหลดไฟล์ PDF...', icon: 'success', timer: 2000, showConfirmButton: false });
    };

    const [previewImg, setPreviewImg] = useState<string | null>(null);

    // Running line number for print template
    let printLineNo = 0;

    return (
        <div className="max-w-4xl mx-auto font-[family-name:var(--font-prompt)] pb-32">
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js" strategy="lazyOnload" />

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/quotations" className="bg-white border border-slate-200 hover:bg-slate-50 p-3 rounded-xl transition shadow-sm">
                    <ArrowLeft weight="bold" className="text-xl text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">{editId ? 'แก้ไขใบเสนอราคา' : 'สร้างใบเสนอราคาใหม่'}</h1>
                    {editId && <p className="text-xs text-slate-400 font-mono">{editId}</p>}
                </div>
            </div>

            {/* CUSTOMER INFO */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
                <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3 mb-5">ข้อมูลลูกค้า</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">ชื่อลูกค้า / บริษัท <span className="text-red-500">*</span></label>
                        <input type="text" value={custName} onChange={e => setCustName(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-400" placeholder="บจก. เอบีซี" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">วันที่</label>
                        <input type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-400" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 block mb-1">ที่อยู่</label>
                        <input type="text" value={custAddr} onChange={e => setCustAddr(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-400" placeholder="99/99 ถ.สุขุมวิท..." />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">เลขประจำตัวผู้เสียภาษี</label>
                        <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-400" placeholder="0125564012932" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">สถานะ</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-400 bg-white">
                            <option value="ร่าง">ร่าง</option>
                            <option value="ส่งแล้ว">ส่งแล้ว</option>
                            <option value="ยกเลิก">ยกเลิก</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* NOTE */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
                <h3 className="text-lg font-bold text-slate-800 border-l-4 border-emerald-500 pl-3 mb-5">หมายเหตุ</h3>
                <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-400 h-20 resize-none" placeholder="1. มัดจำ 50%&#10;2. ระยะเวลาดำเนินการ 7-14 วัน" />
            </div>

            {/* FILM GROUPS */}
            {groups.map((group, gIdx) => (
                <div key={group.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-slate-800 border-l-4 border-amber-500 pl-3">รายการที่ {gIdx + 1}</h3>
                        {groups.length > 1 && (
                            <button onClick={() => removeGroup(group.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition text-sm flex items-center gap-1" title="ลบกลุ่มนี้">
                                <Trash weight="bold" /> ลบกลุ่ม
                            </button>
                        )}
                    </div>

                    {/* Film Name for this group */}
                    <div className="mb-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <label className="text-xs font-bold text-slate-500 block mb-1">🏷️ ชื่อฟิล์ม / รายละเอียดงาน</label>
                        <input type="text" value={group.filmName} onChange={e => updateGroupFilmName(group.id, e.target.value)} className="w-full border border-blue-200 p-3 rounded-xl outline-none focus:border-blue-400 bg-white font-bold text-blue-900" placeholder="เช่น ฟิล์มอาคาร Wintech Film รุ่น White Matte (ตัดลาย)" />
                    </div>

                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 px-2 mb-2">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-4">รายละเอียด</div>
                        <div className="col-span-2 text-center">หน่วย</div>
                        <div className="col-span-1 text-center">จำนวน</div>
                        <div className="col-span-2 text-center">ราคา/หน่วย</div>
                        <div className="col-span-1 text-right">รวม</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                        {group.items.map((item, idx) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 items-center">
                                <div className="col-span-1 text-center font-bold text-slate-400 hidden md:block">{idx + 1}</div>
                                <div className="col-span-4">
                                    <input type="text" value={item.description} onChange={e => updateItem(group.id, item.id, 'description', e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-blue-400 bg-white" placeholder="เช่น ห้อง COO ขนาด 2.80 x 0.75 เมตร" />
                                </div>
                                <div className="col-span-2">
                                    <select value={item.unit} onChange={e => updateItem(group.id, item.id, 'unit', e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-blue-400 bg-white text-center">
                                        <option value="ตร.ฟุต">ตร.ฟุต</option>
                                        <option value="ตร.เมตร">ตร.เมตร</option>
                                        <option value="เมตร">เมตร</option>
                                        <option value="ชิ้น">ชิ้น</option>
                                        <option value="บาน">บาน</option>
                                        <option value="งาน">งาน</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <input type="number" value={item.qty || ''} onChange={e => updateItem(group.id, item.id, 'qty', parseFloat(e.target.value) || 0)} className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-blue-400 bg-white text-center" placeholder="0" />
                                </div>
                                <div className="col-span-2">
                                    <input type="number" value={item.unit_price || ''} onChange={e => updateItem(group.id, item.id, 'unit_price', parseFloat(e.target.value) || 0)} className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-blue-400 bg-white text-right" placeholder="0.00" />
                                </div>
                                <div className="col-span-1 text-right font-bold text-slate-700 text-sm">
                                    {item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <button onClick={() => removeItem(group.id, item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition" disabled={group.items.length <= 1}>
                                        <Trash weight="bold" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => addItem(group.id)} className="mt-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 px-4 rounded-xl transition text-sm flex items-center gap-1">
                        <Plus weight="bold" /> เพิ่มแถว
                    </button>
                </div>
            ))}

            {/* ADD GROUP BUTTON */}
            <button onClick={addGroup} className="w-full bg-amber-50 hover:bg-amber-100 border-2 border-dashed border-amber-300 text-amber-700 font-bold py-4 rounded-2xl transition text-base flex items-center justify-center gap-2 mb-6">
                <Plus weight="bold" className="text-xl" /> เพิ่มกลุ่มฟิล์ม / รายการใหม่
            </button>

            {/* TOTALS */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">รวมค่าสินค้า/บริการ</span>
                        <span className="font-bold text-slate-700">{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <label className="text-sm text-slate-500 whitespace-nowrap">ค่าแรงติดตั้ง (บาท)</label>
                        <input type="number" value={installFee || ''} onChange={e => setInstallFee(parseFloat(e.target.value) || 0)} className="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-blue-400 w-40 text-right" placeholder="0" />
                    </div>
                    <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                        <span className="font-black text-emerald-800 text-lg">รวมราคาทั้งสิ้น</span>
                        <span className="font-black text-emerald-800 text-2xl">฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-center text-sm text-slate-500 italic">({toThaiBahtText(grandTotal)})</p>
                </div>
            </div>

            {/* ACTION BUTTONS (BOTTOM BAR) */}
            <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 bg-blue-950 p-4 md:p-5 flex flex-col sm:flex-row justify-center items-center gap-3 z-40 border-t border-blue-900 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] md:pl-72">
                <button onClick={saveQuotation} disabled={saving} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg transition w-full sm:max-w-[220px] flex justify-center items-center gap-2 text-base disabled:opacity-50">
                    <FloppyDisk weight="bold" /> {saving ? 'บันทึก...' : 'บันทึก'}
                </button>
                <button onClick={generateQuote} className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg transition w-full sm:max-w-[400px] flex justify-center items-center gap-2 text-base">
                    <DownloadSimple weight="bold" /> สร้างเอกสาร (PDF / รูปภาพ)
                </button>
            </div>

            {/* ==================== HIDDEN A4 PRINT TEMPLATE ==================== */}
            <div id="quote-print-template" className="bg-white p-10 w-[850px] absolute left-[-9999px]" style={{ fontFamily: 'Prompt' }}>
                <div className="text-right mb-6">
                    <h2 className="text-3xl font-black mb-1">TOMI FILM</h2>
                    <p className="text-sm">95/120 ถนนปัญญาอินทรา แขวงบางชัน เขตคลองสามวา กทม. 10510</p>
                    <p className="text-sm">Mobile: 064-1792417</p>
                </div>
                <h1 className="text-xl font-bold underline mb-4">ใบเสนอราคา</h1>
                <table className="w-full border-collapse border border-black text-sm mb-6">
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 w-[12%] font-bold">ลูกค้า:</td>
                            <td className="border border-black p-2 w-[58%]">{custName}</td>
                            <td className="border border-black p-2 w-[30%] text-center font-bold">วันที่ {quoteDate ? new Date(quoteDate).toLocaleDateString('th-TH') : '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">ที่อยู่:</td>
                            <td colSpan={2} className="border border-black p-2">{custAddr}</td>
                        </tr>
                        {taxId && (
                            <tr>
                                <td className="border border-black p-2 font-bold whitespace-nowrap">เลขผู้เสียภาษี:</td>
                                <td colSpan={2} className="border border-black p-2">{taxId}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <table className="w-full border-collapse border border-black text-sm text-center mb-6">
                    <thead>
                        <tr className="font-bold border-b border-black">
                            <th className="border border-black p-2 w-[8%]">ลำดับ<br />NO.</th>
                            <th className="border border-black p-2 w-[42%]">ชื่อสินค้า/บริการ<br />DESCRIPTION</th>
                            <th className="border border-black p-2 w-[10%]">หน่วย<br />UOM</th>
                            <th className="border border-black p-2 w-[10%]">จำนวน<br />QTY.</th>
                            <th className="border border-black p-2 w-[15%]">ราคา/หน่วย<br />UNIT PRICE</th>
                            <th className="border border-black p-2 w-[15%]">จำนวนเงิน<br />AMOUNT/THB</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            printLineNo = 0;
                            return groups.map(g => (
                                <React.Fragment key={g.id}>
                                    {g.filmName && (
                                        <tr><td colSpan={6} className="border border-black p-2 text-left font-bold bg-slate-50">{g.filmName}</td></tr>
                                    )}
                                    {g.items.map(item => {
                                        printLineNo++;
                                        return (
                                            <tr key={item.id}>
                                                <td className="border border-black p-2">{printLineNo}</td>
                                                <td className="border border-black p-2 text-left">{item.description}</td>
                                                <td className="border border-black p-2">{item.unit}</td>
                                                <td className="border border-black p-2">{item.qty}</td>
                                                <td className="border border-black p-2">{item.unit_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                                <td className="border border-black p-2 text-right">{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            ));
                        })()}
                        {installFee > 0 && (
                            <tr>
                                <td className="border border-black p-2">{printLineNo + 1}</td>
                                <td className="border border-black p-2 text-left">ค่าแรงติดตั้ง</td>
                                <td className="border border-black p-2">งาน</td>
                                <td className="border border-black p-2">1</td>
                                <td className="border border-black p-2">{installFee.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                <td className="border border-black p-2 text-right">{installFee.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        )}
                        <tr className="font-bold bg-slate-50">
                            <td colSpan={4} className="border border-black p-3 text-center">{toThaiBahtText(grandTotal)}</td>
                            <td className="border border-black p-3 text-center">รวมราคาทั้งสิ้น</td>
                            <td className="border border-black p-3 text-right underline">{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="text-sm mb-16 whitespace-pre-line">
                    {note ? `หมายเหตุ: ${note}` : (
                        <>
                            <p>หมายเหตุ: 1. มัดจำ 50% (ชำระยอดที่เหลือวันติดตั้ง)</p>
                            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. ระยะเวลาในการดำเนินการ 7-14 วัน ระยะเวลาในการติดตั้งขึ้นอยู่กับปริมาณงาน</p>
                        </>
                    )}
                </div>
                <div className="flex justify-end pr-10">
                    <div className="text-center font-bold">
                        <div className="border-b-2 border-slate-400 border-dashed w-48 mb-2"></div>
                        <p>ผู้เสนอราคา</p>
                    </div>
                </div>
            </div>
            {/* IMAGE PREVIEW MODAL */}
            {previewImg && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setPreviewImg(null)}>
                    <div className="max-w-4xl w-full h-full flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">ตัวอย่างรูปภาพ (กดค้างที่รูปเพื่อบันทึก)</h3>
                            <button onClick={() => setPreviewImg(null)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition">ปิด</button>
                        </div>
                        <div className="flex-1 overflow-auto bg-white rounded-2xl flex justify-center p-2 shadow-2xl no-scrollbar">
                           <img src={previewImg} alt="Preview" className="max-w-none w-full h-auto object-contain" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={() => setPreviewImg(null)} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition">ยกเลิก</button>
                            <button onClick={downloadAsPDF} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500 transition text-center flex items-center justify-center gap-2">
                                <Receipt weight="bold" /> ดาวน์โหลด PDF
                            </button>
                            <a href={previewImg} download={`Quotation_${custName || 'Draft'}.jpg`} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition text-center flex items-center justify-center gap-2">
                                <DownloadSimple weight="bold" /> ดาวน์โหลด รูปภาพ
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

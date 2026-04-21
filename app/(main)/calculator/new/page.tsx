'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { CaretLeft, Plus, Tag, Trash, DownloadSimple, Printer, FileXls, Scissors, FloppyDisk, FolderOpen, ArrowLeft } from '@phosphor-icons/react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const WASTE_STOCK_LIMIT = 20;

export default function CalculatorNewPage() {
    const searchParams = useSearchParams();
    const loadId = searchParams.get('id');

    const [filmCode, setFilmCode] = useState('');
    const [unit, setUnit] = useState<'inch' | 'cm'>('inch');
    const [rollWidth, setRollWidth] = useState<number>(60);
    const [canRotate, setCanRotate] = useState<boolean>(true);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    
    const [locations, setLocations] = useState<any[]>([
        { id: 1, name: 'ตำแหน่งที่ 1', items: [{ id: 1, name: 'กระจก 1', w: '', h: '', qty: 1 }] }
    ]);

    const [salesModalOpen, setSalesModalOpen] = useState(false);
    const [salesData, setSalesData] = useState<any>(null);
    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [jobData, setJobData] = useState<any>(null);
    const [cutDate, setCutDate] = useState(() => new Date().toISOString().split('T')[0]);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (loadId) loadSession(loadId);
    }, [loadId]);

    useEffect(() => {
        if (resultModalOpen && jobData) renderChart();
    }, [resultModalOpen, jobData]);

    const loadSession = async (id: string) => {
        const { data: session } = await supabase.from('calculator_sessions').select('*').eq('id', id).single();
        if (session) {
            setFilmCode(session.film_code || '');
            setUnit(session.unit || 'inch');
            setRollWidth(session.roll_width || 60);
            setCanRotate(session.can_rotate !== false);
            setLocations(session.locations || []);
            setCurrentSessionId(session.id);
        }
    };

    const addLocation = () => {
        setLocations([...locations, { id: Date.now(), name: `ตำแหน่งที่ ${locations.length + 1}`, items: [{ id: Date.now() + 1, name: 'กระจก 1', w: '', h: '', qty: 1 }] }]);
    };
    const removeLocation = (id: number) => { if(confirm('ยืนยันลบตำแหน่งนี้?')) setLocations(locations.filter(l => l.id !== id)); };
    const addItem = (locId: number) => {
        setLocations(locations.map(loc => {
            if (loc.id === locId) { const c = loc.items.length + 1; return { ...loc, items: [...loc.items, { id: Date.now(), name: `กระจก ${c}`, w: '', h: '', qty: 1 }] }; }
            return loc;
        }));
    };
    const removeItem = (locId: number, itemId: number) => {
        setLocations(locations.map(loc => loc.id === locId ? { ...loc, items: loc.items.filter((i: any) => i.id !== itemId) } : loc));
    };
    const updateLocParams = (locId: number, field: string, value: string) => {
        setLocations(locations.map(loc => loc.id === locId ? { ...loc, [field]: value } : loc));
    };
    const updateItemParams = (locId: number, itemId: number, field: string, value: string) => {
        setLocations(locations.map(loc => {
            if (loc.id === locId) return { ...loc, items: loc.items.map((i: any) => i.id === itemId ? { ...i, [field]: value } : i) };
            return loc;
        }));
    };

    const calculateSales = () => {
        let price = 0; let grandTotalArea = 0; let grandTotalPrice = 0; let hasItems = false; let lines: any[] = [];
        locations.forEach(loc => {
            loc.items.forEach((item: any) => {
                let inputW = parseFloat(item.w) || 0; let inputH = parseFloat(item.h) || 0; let qty = parseInt(item.qty) || 1;
                let w = unit === 'cm' ? inputW / 2.54 : inputW; let h = unit === 'cm' ? inputH / 2.54 : inputH;
                if (w > 0 && h > 0) {
                    hasItems = true; let areaCeil = Math.ceil((w * h) / 144); let totalArea = areaCeil * qty; let lineTotal = totalArea * price;
                    grandTotalArea += totalArea; grandTotalPrice += lineTotal;
                    lines.push({ locName: loc.name || 'ไม่ระบุ', itemName: item.name || 'กระจก', inputW, inputH, w, h, qty, areaCeil, lineTotal });
                }
            });
        });
        if (!hasItems) { Swal.fire('แจ้งเตือน', 'กรุณากรอกขนาดกระจกอย่างน้อย 1 บาน', 'warning'); return; }
        let finalPrice = grandTotalPrice; let feeRow = null;
        if (price > 0 && grandTotalArea < 100) {
            let priceA = grandTotalPrice + 2000; let priceB = 100 * price;
            if (priceB < priceA) { finalPrice = priceB; feeRow = { msg: `ปรับใช้ราคาเหมาแทน`, val: finalPrice }; }
            else { finalPrice = priceA; feeRow = { msg: `พื้นที่ ${grandTotalArea} Sq.Ft (ต่ำกว่า 100) + ค่าติดตั้งเพิ่ม`, val: 2000 }; }
        }
        setSalesData({ lines, grandTotalArea, grandTotalPrice, finalPrice, feeRow }); setSalesModalOpen(true);
    };

    const calculateCutting = () => {
        setSalesModalOpen(false);
        let rawItems: any[] = []; let totalPanes = 0; let rawItemIdx = 0;
        locations.forEach(loc => {
            const locName = loc.name || 'ไม่ระบุ';
            loc.items.forEach((item: any) => {
                let name = item.name || 'กระจก'; let inputW = parseFloat(item.w) || 0; let inputH = parseFloat(item.h) || 0; let qty = parseInt(item.qty) || 1;
                let w = unit === 'cm' ? inputW / 2.54 : inputW; let h = unit === 'cm' ? inputH / 2.54 : inputH;
                if (w > 0 && h > 0) {
                    let fullName = `${locName}: ${name}`;
                    for(let i=0; i<qty; i++) { rawItems.push({ name: qty > 1 ? `${fullName} (#${i+1})` : fullName, w, h, inputW, inputH, id: `raw_${rawItemIdx++}_${Date.now()}` }); }
                    totalPanes += qty;
                }
            });
        });
        if (rawItems.length === 0) return;

        let processedItems: any[] = [];
        rawItems.forEach(item => {
            let w = item.w; let h = item.h;
            if (!canRotate) {
                if (w <= rollWidth) processedItems.push({ ...item, finalW: w, finalH: h });
                else { let parts = Math.ceil(w / rollWidth); let rem = w; for (let k=1; k<=parts; k++) { let tw = rem >= rollWidth ? rollWidth : rem; processedItems.push({ ...item, name: item.name + ` (ส่วน ${k}/${parts})`, finalW: tw, finalH: h }); rem -= tw; } }
            } else {
                let minD = Math.min(w, h); let maxD = Math.max(w, h);
                if ((minD > rollWidth - 10 && minD <= rollWidth) && (maxD > rollWidth)) processedItems.push({ ...item, finalW: minD, finalH: maxD });
                else if (maxD > rollWidth - 10 && maxD <= rollWidth) processedItems.push({ ...item, finalW: maxD, finalH: minD });
                else if (minD <= rollWidth) { if (maxD > rollWidth || minD * 2 <= rollWidth) processedItems.push({ ...item, finalW: minD, finalH: maxD }); else processedItems.push({ ...item, finalW: maxD, finalH: minD }); }
                else { let parts = Math.ceil(minD / rollWidth); let rem = minD; for (let k=1; k<=parts; k++) { let tw = rem >= rollWidth ? rollWidth : rem; processedItems.push({ ...item, name: item.name + ` (ส่วน ${k}/${parts})`, finalW: tw, finalH: maxD }); rem -= tw; } }
            }
        });

        processedItems.sort((a, b) => b.finalH !== a.finalH ? b.finalH - a.finalH : b.finalW - a.finalW);
        let shelves: any[] = [];
        processedItems.forEach(item => {
            let bestShelfIdx = -1; let minWaste = 9999; let isStacked = false;
            for(let i=0; i<shelves.length; i++) { let shelf = shelves[i]; for(let c=0; c<shelf.columns.length; c++) { let col = shelf.columns[c]; if(Math.abs(col.w - item.finalW) < 0.1 && col.remainH >= item.finalH) { col.items.push(item); col.remainH -= item.finalH; isStacked = true; break; } } if(isStacked) break; }
            if(!isStacked) {
                for(let i=0; i<shelves.length; i++) { let shelf = shelves[i]; if (rollWidth - shelf.usedWidth >= item.finalW) { let waste = (rollWidth - shelf.usedWidth) - item.finalW; let diffRatio = (shelf.height - item.finalH) / shelf.height; if (waste < minWaste) { if(diffRatio <= 0.20) { minWaste = waste - 1000; bestShelfIdx = i; } else { minWaste = waste; bestShelfIdx = i; } } } }
                if (bestShelfIdx !== -1) { shelves[bestShelfIdx].columns.push({ w: item.finalW, remainH: shelves[bestShelfIdx].height - item.finalH, items: [item] }); shelves[bestShelfIdx].usedWidth += item.finalW; }
                else shelves.push({ height: item.finalH, usedWidth: item.finalW, columns: [{ w: item.finalW, remainH: 0, items: [item] }] });
            }
        });

        let totalPullLengthInch = 0; let totalPullAreaSqFt = 0; let usedAreaSqFt = 0; let stockAreaSqFt = 0;
        shelves.forEach(shelf => {
            let pullLength = Math.ceil(shelf.height); totalPullLengthInch += pullLength; totalPullAreaSqFt += (pullLength * rollWidth) / 144;
            shelf.columns.forEach((col: any) => { col.items.forEach((item: any) => { usedAreaSqFt += (item.finalW * item.finalH) / 144; }); });
            let wasteW = Math.floor(rollWidth - shelf.usedWidth); if (wasteW >= WASTE_STOCK_LIMIT) stockAreaSqFt += (wasteW * pullLength) / 144;
        });
        let trashArea = Math.max(0, totalPullAreaSqFt - usedAreaSqFt - stockAreaSqFt);
        setJobData({ shelves, totalPanes, totalPullLengthInch, totalPullAreaSqFt, usedAreaSqFt, stockAreaSqFt, trashArea, rawItems }); setResultModalOpen(true);
    };

    const renderChart = () => {
        // @ts-ignore
        if (typeof window === 'undefined' || !window.Chart) return;
        const ctx = document.getElementById('filmChart') as HTMLCanvasElement; if (!ctx) return;
        if (chartRef.current) chartRef.current.destroy();
        // @ts-ignore
        chartRef.current = new window.Chart(ctx, { type: 'doughnut', data: { labels: ['ใช้จริง', 'Stock', 'Waste'], datasets: [{ data: [jobData.usedAreaSqFt, jobData.stockAreaSqFt, jobData.trashArea], backgroundColor: ['#28a745', '#ffc107', '#dc3545'] }] }, options: { responsive: true, plugins: { legend: { display: false } } } });
    };

    const generateSmartPDF = async () => {
        // @ts-ignore
        if (typeof window === 'undefined' || !window.jspdf || !window.domtoimage) { Swal.fire('รอสักครู่', 'ระบบกำลังโหลดโมดูลทำเอกสาร กรุณารอสักครู่แล้วกดใหม่ครับ', 'warning'); return; }
        Swal.fire({ title: 'กำลังสร้าง PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        // @ts-ignore
        const { jsPDF } = window.jspdf; const doc = new jsPDF('p', 'mm', 'a4'); const pageHeight = 297; const margin = 10; const contentWidth = 190; let cursorY = margin;
        async function addElement(elId: string | HTMLElement) {
            let el = (typeof elId === 'string') ? document.getElementById(elId) : elId; if(!el) return;
            const canvas = el.querySelector('canvas'); let origCanvas: any = null;
            if(canvas) { const img = document.createElement('img'); img.src = canvas.toDataURL('image/png'); img.style.width='100%'; canvas.parentNode!.replaceChild(img, canvas); origCanvas = canvas; }
            // @ts-ignore
            const iData = await window.domtoimage.toJpeg(el, { bgcolor: '#ffffff', quality: 0.95 });
            if(origCanvas) { const img = el.querySelector('img'); if(img) img.parentNode!.replaceChild(origCanvas, img); }
            const rect = el.getBoundingClientRect(); const iH = (rect.height * contentWidth) / rect.width;
            if(cursorY + iH > (pageHeight - margin)) { doc.addPage(); cursorY = margin; }
            doc.addImage(iData, 'JPEG', margin, cursorY, contentWidth, iH); cursorY += iH + 5;
        }
        try {
            await addElement('pdf-header-block'); await addElement('pdf-meter-summary'); await addElement('pdf-item-list'); await addElement('pdf-chart-block');
            const rows = document.querySelectorAll('#cut-steps-content .cut-row'); for(let i=0; i<rows.length; i++) await addElement(rows[i] as HTMLElement);
            doc.save('TomiFilm_JobSheet.pdf'); Swal.fire('สำเร็จ', 'บันทึก PDF เรียบร้อย', 'success');
        } catch(e: any) { Swal.fire('ผิดพลาด', 'ไม่สามารถสร้าง PDF ได้: ' + (e.message || ''), 'error'); }
    };

    const generateThermalPDF = async () => {
        if(!jobData || !jobData.shelves) return;
        Swal.fire({ title: 'กำลังสร้างสติ๊กเกอร์...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        // @ts-ignore
        const { jsPDF } = window.jspdf; const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: [50, 40] });
        const dateStr = cutDate ? new Date(cutDate).toLocaleDateString('th-TH') : '-';
        const temp = document.getElementById('thermal-gen-container'); if (!temp) return;
        let allStickers: any[] = [];
        jobData.shelves.forEach((shelf: any, idx: number) => {
            let wasteW = Math.floor(rollWidth - shelf.usedWidth); let pullLength = Math.ceil(shelf.height);
            shelf.columns.forEach((col: any) => { col.items.forEach((item: any) => { allStickers.push({ type: 'item', name: item.name, w: item.finalW.toFixed(1), h: item.finalH.toFixed(1), set: idx+1, date: dateStr, film: filmCode }); }); });
            if(wasteW >= WASTE_STOCK_LIMIT) allStickers.push({ type: 'stock', name: 'เศษสต็อก', w: wasteW.toFixed(1), h: pullLength.toFixed(1), set: idx+1, date: dateStr, film: filmCode });
        });
        for(let i=0; i<allStickers.length; i++) {
            if(i > 0) doc.addPage(); let s = allStickers[i];
            temp.innerHTML = `<div style="width:200px;height:160px;border:3px solid #000;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Prompt',sans-serif;text-align:center;background:#fff;"><div style="background:#000;color:#fff;font-size:16px;padding:2px 8px;font-weight:900;margin-bottom:4px;max-width:90%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${s.film}</div><div style="font-size:14px;font-weight:bold;line-height:1.1;max-width:95%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${s.name}</div><div style="font-size:34px;font-weight:900;line-height:1;">${s.w} x ${s.h}"</div><div style="font-size:12px;margin-top:2px;font-weight:900;border-top:2px solid #000;width:90%;">${s.set} | ${s.date}</div>${s.type === 'stock' ? '<div style="position:absolute;top:2px;right:2px;font-size:10px;border:1px solid #000;padding:1px;font-weight:bold;">STOCK</div>' : ''}</div>`;
            // @ts-ignore
            const imgData = await window.domtoimage.toPng(temp.firstElementChild, { bgcolor: '#ffffff' }); doc.addImage(imgData, 'PNG', 0, 0, 50, 40);
        }
        doc.save('TomiFilm_Stickers_5x4.pdf'); temp.innerHTML = ''; Swal.fire('สำเร็จ', 'ดาวน์โหลดสติ๊กเกอร์เรียบร้อย', 'success');
    };

    const importExcel = (e: any) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target!.result as ArrayBuffer);
                // @ts-ignore
                const workbook = window.XLSX.read(data, {type: 'array'});
                // @ts-ignore
                const j = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1});
                let newLocations: any[] = []; let locIdMap: any = {};
                for(let i=1; i<j.length; i++) {
                    let row = j[i] as any[]; if (!row || row.length < 3) continue;
                    let w = parseFloat(row[2]); let h = parseFloat(row[3]);
                    if (w > 0 && h > 0) {
                        let locName = row[0] ? String(row[0]).trim() : 'ไม่ระบุ'; let itemName = row[1] ? String(row[1]).trim() : 'กระจก'; let qty = parseInt(row[4]) || 1;
                        if (!locIdMap[locName]) { locIdMap[locName] = { id: Date.now() + Object.keys(locIdMap).length, name: locName, items: [] }; newLocations.push(locIdMap[locName]); }
                        locIdMap[locName].items.push({ id: Date.now() + Math.random(), name: itemName, w, h, qty });
                    }
                }
                if (newLocations.length > 0) { setLocations(newLocations); Swal.fire('สำเร็จ', 'นำเข้าข้อมูลเรียบร้อย', 'success'); }
                else Swal.fire('แจ้งเตือน', 'ไม่พบข้อมูลที่ถูกต้องในไฟล์', 'info');
            } catch(err) { Swal.fire('ผิดพลาด', 'รูปแบบไฟล์ไม่ถูกต้อง', 'error'); }
        }; reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const d = [["Location", "Item", "Width", "Height", "Qty"], ["ห้องนอน 1", "บานเลื่อน", 30, 40, 2]];
        // @ts-ignore
        const w = window.XLSX.utils.book_new(); // @ts-ignore
        window.XLSX.utils.book_append_sheet(w, window.XLSX.utils.aoa_to_sheet(d), "Template"); // @ts-ignore
        window.XLSX.writeFile(w, "TomiFilm_Template.xlsx");
    };

    const saveSession = async () => {
        const { value: name } = await Swal.fire({ title: 'บันทึกข้อมูลการคำนวณ', input: 'text', inputLabel: 'ตั้งชื่อ (เช่น บ้านคุณสมชาย)', inputPlaceholder: 'ชื่อ...', inputValue: filmCode || '', showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก', inputValidator: (v) => !v ? 'กรุณาตั้งชื่อ' : null });
        if (!name) return;
        if (currentSessionId) {
            await supabase.from('calculator_sessions').update({ name, film_code: filmCode, unit, roll_width: rollWidth, can_rotate: canRotate, locations: JSON.parse(JSON.stringify(locations)), updated_at: new Date().toISOString() }).eq('id', currentSessionId);
        } else {
            const id = 'CS' + Date.now();
            await supabase.from('calculator_sessions').insert({ id, name, film_code: filmCode, unit, roll_width: rollWidth, can_rotate: canRotate, locations: JSON.parse(JSON.stringify(locations)), updated_at: new Date().toISOString() });
            setCurrentSessionId(id);
        }
        Swal.fire('บันทึกสำเร็จ!', `"${name}" ถูกบันทึกแล้ว`, 'success');
    };

    return (
        <div className="pb-32 max-w-4xl mx-auto font-[family-name:var(--font-prompt)]">
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js" strategy="lazyOnload" />
            <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="lazyOnload" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" strategy="lazyOnload" />

            {/* HEADER */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between no-print">
                <div className="flex items-center gap-4">
                   <Link href="/calculator" className="bg-white border border-slate-200 hover:bg-slate-50 p-3 rounded-xl transition shadow-sm">
                       <ArrowLeft weight="bold" className="text-xl text-slate-600" />
                   </Link>
                   <div className="w-14 h-14 bg-blue-900 rounded-full flex items-center justify-center border-4 border-blue-100 text-white shrink-0 shadow-inner">
                       <Scissors weight="fill" className="text-2xl" />
                   </div>
                   <div>
                       <h1 className="text-xl font-black text-slate-800">{loadId ? 'แก้ไขแผนตัดฟิล์ม' : 'คำนวณตัดฟิล์มใหม่'}</h1>
                       <p className="text-xs font-medium text-slate-500">ระบุขนาด {'>'} วางแผนตัด</p>
                   </div>
                </div>
            </div>

            {/* STEP 1: FILM NAME */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6 no-print">
                <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3 mb-5">1. ข้อมูลฟิล์ม</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center">
                        <label className="block text-sm font-bold text-slate-700 mb-2">🏷️ รหัสฟิล์ม / ชื่อฟิล์ม (สำหรับพิมพ์ลงสลิป)</label>
                        <input type="text" value={filmCode} onChange={e => setFilmCode(e.target.value)} className="w-full border border-blue-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 font-bold bg-white text-blue-900" placeholder="เช่น NANO CARBON 40%" />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center gap-3 shadow-inner">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">หน้าม้วน (นิ้ว):</label>
                            <input type="number" value={rollWidth} onChange={e => setRollWidth(Number(e.target.value))} className="w-24 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-bold bg-white text-center shadow-sm" />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={!canRotate} onChange={e => setCanRotate(!e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition" />
                            <span className="text-sm font-bold text-slate-700 leading-tight">สกรีนลาย / ฟิล์มตกแต่ง <br/><span className="text-rose-500 font-black text-xs">(ห้ามสลับกว้าง x สูง)</span></span>
                        </label>
                    </div>
                </div>
            </div>

            {/* TOOLS BAR */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-print flex-wrap">
                <button onClick={downloadTemplate} className="bg-white border text-xs sm:text-sm border-emerald-600 text-emerald-700 px-4 py-2 rounded-full font-bold shadow-sm hover:bg-emerald-50 transition flex items-center gap-1 shrink-0"><FileXls /> โหลดฟอร์ม</button>
                <button onClick={() => document.getElementById('excelInput')?.click()} className="bg-white border text-xs sm:text-sm border-emerald-600 text-emerald-700 px-4 py-2 rounded-full font-bold shadow-sm hover:bg-emerald-50 transition flex items-center gap-1 shrink-0"><DownloadSimple /> Import</button>
                <button onClick={() => setLocations([{ id: 1, name: 'ตำแหน่งที่ 1', items: [{ id: 1, name: 'กระจก 1', w: '', h: '', qty: 1 }] }])} className="bg-white border text-xs sm:text-sm border-red-500 text-red-600 px-4 py-2 rounded-full font-bold shadow-sm hover:bg-red-50 transition shrink-0 ml-auto">🔄 เริ่มใหม่</button>
                <input type="file" id="excelInput" className="hidden" accept=".xlsx, .xls" onChange={importExcel} />
            </div>

            {/* STEP 2: MEASUREMENTS */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div className="border-l-4 border-blue-500 pl-3"><h3 className="text-lg font-bold text-slate-800">2. ระบุขนาดกระจก (Measurements)</h3></div>
               <div className="flex bg-slate-200 rounded-xl p-1 no-print shrink-0 shadow-inner w-full sm:w-auto">
                   <button onClick={() => setUnit('inch')} className={`flex-1 sm:px-6 py-2 rounded-lg font-bold text-sm transition ${unit === 'inch' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>หน่วย: นิ้ว (Inch)</button>
                   <button onClick={() => setUnit('cm')} className={`flex-1 sm:px-6 py-2 rounded-lg font-bold text-sm transition ${unit === 'cm' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>หน่วย: ซม. (cm)</button>
               </div>
            </div>

            <div className="space-y-6 no-print">
                {locations.map((loc) => (
                    <div key={loc.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                            <input type="text" value={loc.name} onChange={e=>updateLocParams(loc.id, 'name', e.target.value)} className="font-black text-lg sm:text-xl text-slate-800 w-2/3 border-b border-dashed border-slate-300 pb-1 outline-none focus:border-blue-500 transition" placeholder="ชื่อห้อง/ตำแหน่ง" />
                            <button onClick={()=>removeLocation(loc.id)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition"><Trash weight="fill" /></button>
                        </div>
                        <div className="space-y-3">
                            {loc.items.map((item: any) => (
                                <div key={item.id} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-wrap gap-2 sm:gap-3 items-end">
                                    <div className="w-full sm:flex-1 min-w-[120px] order-1"><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">รายการ</label><input type="text" value={item.name} onChange={e=>updateItemParams(loc.id, item.id, 'name', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold text-sm" /></div>
                                    <div className="flex-1 sm:w-24 order-2"><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">กว้าง ({unit === 'cm' ? 'ซม.' : 'นิ้ว'})</label><input type="number" value={item.w} onChange={e=>updateItemParams(loc.id, item.id, 'w', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-bold text-center text-sm" placeholder="0.0" /></div>
                                    <div className="flex-1 sm:w-24 order-3"><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">สูง ({unit === 'cm' ? 'ซม.' : 'นิ้ว'})</label><input type="number" value={item.h} onChange={e=>updateItemParams(loc.id, item.id, 'h', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-bold text-center text-sm" placeholder="0.0" /></div>
                                    <div className="w-16 order-4"><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">จำนวน</label><input type="number" value={item.qty} onChange={e=>updateItemParams(loc.id, item.id, 'qty', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-bold text-center text-sm" /></div>
                                    <button onClick={()=>removeItem(loc.id, item.id)} className="w-10 h-[38px] flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition shrink-0 order-5 mb-0.5"><Trash weight="fill" /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={()=>addItem(loc.id)} className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition text-sm flex items-center justify-center gap-2"><Plus weight="bold" /> เพิ่มกระจกในห้องนี้</button>
                    </div>
                ))}
                <button onClick={addLocation} className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 hover:-translate-y-1 transition text-lg flex items-center justify-center gap-2"><Plus weight="bold" /> เพิ่มตำแหน่งติดตั้งใหม่</button>
            </div>

            {/* BOTTOM ACTION BAR */}
  <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 bg-blue-950 p-3 md:p-5 flex justify-center items-center gap-2 md:gap-3 z-40 border-t border-blue-900 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] md:pl-72 no-print">
     <button onClick={saveSession} className="bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 py-3 md:py-3.5 rounded-xl font-bold shadow-lg transition text-sm md:text-base flex justify-center items-center gap-2 shrink-0"><FloppyDisk weight="bold" /> <span className="hidden xs:inline">บันทึก</span></button>
     <button onClick={calculateSales} className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 md:px-8 py-3 md:py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 text-sm sm:text-lg flex-1 max-w-sm flex justify-center items-center gap-2"><Scissors weight="bold" /> วางแผนตัด <span className="hidden sm:inline">(Job Sheet)</span></button>
  </div>

            {/* SALES MODAL */}
            {salesModalOpen && salesData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#f4f6f8] w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center rounded-t-3xl shadow-sm z-10">
                            <h3 className="text-xl font-black flex items-center gap-2"><Scissors weight="fill" className="text-emerald-500" /> สรุปพื้นที่กระจกเบื้องต้น</h3>
                            <button onClick={()=>setSalesModalOpen(false)} className="text-slate-400 hover:bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white mx-4 mt-6 rounded-2xl shadow-sm border border-slate-100 mb-4">
                            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-900 flex justify-between items-center">
                                <div><span className="font-bold text-sm block mb-1">ฟิล์ม/รายละเอียด: <span className="text-blue-600">{filmCode || 'ไม่ระบุ'}</span></span></div>
                                <div className="text-right"><span className="block text-xs text-blue-400 font-bold uppercase">พื้นที่รวม</span><span className="text-xl font-black">{salesData.grandTotalArea} Sq.Ft</span></div>
                            </div>
                            <table className="w-full text-left border-collapse border border-slate-200">
                                <thead><tr className="bg-slate-800 text-white text-sm"><th className="p-3 border border-slate-300">รายการ</th><th className="p-3 border border-slate-300 text-center">ขนาด x จำนวน</th><th className="p-3 border border-slate-300 text-center">Sq.Ft</th></tr></thead>
                                <tbody>
                                    {salesData.lines.map((l: any, i: number) => (<tr key={i} className="text-sm font-medium border-b border-slate-100 hover:bg-slate-50"><td className="p-3 border border-slate-200">{l.locName}: {l.itemName}</td><td className="p-3 border border-slate-200 text-center whitespace-nowrap">{l.inputW} x {l.inputH} {unit==='cm'?'ซม.':'นิ้ว'} ({l.qty})</td><td className="p-3 border border-slate-200 text-center font-bold text-slate-600">{l.areaCeil}</td></tr>))}
                                    <tr className="bg-emerald-50 text-emerald-900 border-t-2 border-emerald-200 text-base"><td colSpan={2} className="p-3 font-black text-right">พื้นที่ประเมินรวม</td><td className="p-3 font-black text-center border-l-2 border-white">{salesData.grandTotalArea} Sq.Ft</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white p-5 border-t border-slate-100 flex gap-3 justify-center"><button onClick={()=>calculateCutting()} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-xl shadow-sm transition flex items-center gap-2"><Scissors weight="bold" /> วางแผนตัดฟิล์ม (Job Sheet)</button></div>
                    </div>
                </div>
            )}

            {/* CUTTING PLAN MODAL */}
            {resultModalOpen && jobData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#f0f2f5] w-full max-w-5xl h-[95vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center rounded-t-3xl shadow-sm z-10 no-print">
                            <h3 className="text-xl font-black flex items-center gap-2"><Scissors weight="fill" className="text-blue-500" /> ใบสั่งงานตัดฟิล์ม</h3>
                            <button onClick={()=>setResultModalOpen(false)} className="text-slate-400 hover:bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">&times;</button>
                        </div>
                        <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-4 shadow-sm z-10 no-print">
                            <label className="font-bold text-sm text-slate-600">📅 วันที่ตัด:</label>
                            <input type="date" value={cutDate} onChange={e=>setCutDate(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 outline-none font-bold text-sm focus:border-blue-500" />
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-1 relative p-4">
                            <div id="tmk-result-content" className="bg-white p-8 md:p-12 shadow-sm border border-slate-200 mx-auto max-w-[850px]" style={{fontFamily: 'Prompt'}}>
                                <div id="pdf-header-block" className="border-b-4 border-black pb-5 mb-8 flex justify-between items-center">
                                    <div><h2 className="text-3xl font-black text-black tracking-tight leading-none mb-2">ใบสั่งงานตัดฟิล์ม</h2><h2 className="text-[20px] font-black text-black tracking-tight leading-none mb-3">Cutting Plan</h2><div className="text-base font-semibold border-t-2 border-black pt-2 inline-block"><strong>ฟิล์ม:</strong> {filmCode || 'ไม่ระบุ'} &nbsp;|&nbsp; <strong>วันที่:</strong> {cutDate ? new Date(cutDate).toLocaleDateString('th-TH') : '-'}</div></div>
                                    <div className="w-24 h-24 border-4 border-black p-1 shrink-0 bg-white"><div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-white font-black leading-none rounded-sm"><span className="text-xl text-blue-400">TOMI</span><span className="text-sm border-t-2 border-slate-500 pt-0.5 mt-0.5">FILM</span></div></div>
                                </div>
                                <div id="pdf-meter-summary" className="bg-[#d1e7dd] border-2 border-[#0f5132] p-5 text-center mb-8 rounded-xl shadow-sm flex flex-col items-center"><span className="text-[#0f5132] font-black text-lg mb-1">รวมยอดตัดออกจากม้วนสุทธิ</span><div className="text-[#0f5132] font-black text-4xl">{(jobData.totalPullLengthInch * 0.0254).toFixed(2)} <span className="text-xl">เมตร</span></div></div>
                                <h3 className="text-xl font-bold border-b-2 border-black pb-1 mb-4">รายการกระจกทั้งหมด ({jobData.totalPanes} บาน)</h3>
                                <div id="pdf-item-list" className="mb-8"><table className="w-full text-left border-collapse border border-black text-[13px] font-medium"><thead><tr className="bg-slate-200 border-b border-black text-black"><th className="p-2 border border-black">การอ้างอิงของระบบ</th><th className="p-2 border-l border-black text-center w-28">ขนาด {unit==='cm'?'(ซม.)':'(นิ้ว)'}</th></tr></thead><tbody>{jobData.rawItems.map((item:any) => (<tr key={item.id} className="border-b border-slate-200"><td className="p-2 border border-slate-300">{item.name}</td><td className="p-2 border border-slate-300 text-center font-bold">{item.inputW} x {item.inputH}</td></tr>))}</tbody></table></div>
                                <div id="pdf-chart-block" className="flex justify-center items-center gap-10 mb-10 p-6 border-2 border-slate-100 rounded-2xl bg-slate-50">
                                    <div style={{width:'200px', height:'200px'}}><canvas id="filmChart"></canvas></div>
                                    <div className="text-slate-800 text-sm font-semibold space-y-2">
                                        <div className="text-lg font-black border-b-2 border-slate-300 pb-1 mb-3">พื้นที่ดึงรวม: {jobData.totalPullAreaSqFt.toFixed(1)} Sq.Ft.</div>
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#28a745]"></div> ใช้จริง: {jobData.usedAreaSqFt.toFixed(1)} Sq.Ft ({((jobData.usedAreaSqFt/jobData.totalPullAreaSqFt)*100).toFixed(1)}%)</div>
                                        {jobData.stockAreaSqFt > 0 && <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#ffc107]"></div> สต็อกชิ้นใหญ่: {jobData.stockAreaSqFt.toFixed(1)} Sq.Ft ({((jobData.stockAreaSqFt/jobData.totalPullAreaSqFt)*100).toFixed(1)}%)</div>}
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#dc3545]"></div> เศษทิ้ง (Waste): {jobData.trashArea.toFixed(1)} Sq.Ft ({((jobData.trashArea/jobData.totalPullAreaSqFt)*100).toFixed(1)}%)</div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black border-b-4 border-black pb-2 mb-6">ขั้นตอนการตัดม้วน (Cutting Steps)</h3>
                                <div id="cut-steps-content" className="space-y-8">
                                    {jobData.shelves.map((shelf: any, idx: number) => {
                                        let wasteW = Math.floor(rollWidth - shelf.usedWidth); let pullLength = Math.ceil(shelf.height);
                                        return (
                                            <div key={idx} className="cut-row border-2 border-black rounded-xl overflow-hidden shadow-sm page-break-inside-avoid bg-white">
                                                <div className="bg-slate-200 p-3 border-b-2 border-black flex justify-between items-center px-4"><span className="font-black text-lg flex items-center gap-2"><Scissors weight="fill" /> ชุดที่ {idx + 1}</span><span className="font-black text-lg bg-black text-white px-3 py-1 rounded-md tracking-wider">ดึงยาว: {pullLength}&quot;</span></div>
                                                <div className="p-5">
                                                    <div className="h-[70px] bg-slate-100 border-2 border-black rounded-md flex w-full mb-4 overflow-hidden">
                                                        {shelf.columns.map((col: any, cIdx: number) => { let pct = (col.w / rollWidth) * 100; return (<div key={cIdx} className="h-full flex flex-col border-r-2 border-white" style={{width: `${pct}%`}}>{col.items.map((it:any, iIdx:number) => (<div key={iIdx} className="w-full bg-[#17a2b8] text-white flex items-center justify-center font-black text-[10px] sm:text-xs overflow-hidden border-b border-white/50" style={{height: `${(it.finalH / shelf.height)*100}%`}}>{it.finalW.toFixed(1)}x{it.finalH.toFixed(1)}</div>))}{col.remainH > 0 && <div className="w-full bg-[#6c757d] text-white flex items-center justify-center font-bold text-[9px]" style={{height: `${(col.remainH / shelf.height)*100}%`}}>เศษ</div>}</div>); })}
                                                        {wasteW > 0 && (wasteW >= WASTE_STOCK_LIMIT ? <div className="bg-[#ffc107] text-black font-black flex items-center justify-center text-xs" style={{width: `${(wasteW/rollWidth)*100}%`}}>STOCK {wasteW}&quot;</div> : <div className="bg-[#5c636a] text-white font-bold flex items-center justify-center text-[10px]" style={{width: `${(wasteW/rollWidth)*100}%`}}>เศษ {wasteW}&quot;</div>)}
                                                    </div>
                                                    <table className="w-full text-left border-collapse border border-slate-300 text-[13px]"><thead><tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold"><th className="p-2 border-r border-slate-300">รายการในชุดนี้</th><th className="p-2 text-center w-28">มิติ (กxย)</th></tr></thead><tbody>{shelf.columns.map((col:any, cIdx:number) => col.items.map((it:any, iIdx:number) => (<tr key={`col_${cIdx}_item_${iIdx}_${it.id}`} className="border-b border-slate-200"><td className="p-2 border-r border-slate-300 font-medium">{it.name}</td><td className="p-2 text-center font-black text-black">{it.finalW.toFixed(1)} x {it.finalH.toFixed(1)}</td></tr>)))}{wasteW >= WASTE_STOCK_LIMIT && (<tr key="waste" className="bg-amber-50 border-b border-amber-200"><td className="p-2 border-r border-amber-200 font-bold text-amber-800 flex items-center gap-1">♻️ เศษสต็อกเก็บไว้ใช้งาน</td><td className="p-2 text-center font-black text-amber-900">{wasteW.toFixed(1)} x {pullLength}</td></tr>)}</tbody></table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="h-20"></div>
                        </div>
                        <div id="thermal-gen-container" className="absolute top-[-9999px] left-0 bg-white"></div>
                        <div className="bg-white p-4 border-t border-slate-200 flex justify-center gap-4 z-10 no-print">
                            <button onClick={generateThermalPDF} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition flex items-center gap-2"><Printer weight="bold" /> พิมพ์สติ๊กเกอร์ (5x4)</button>
                            <button onClick={generateSmartPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition flex items-center gap-2"><DownloadSimple weight="bold" /> ดาวน์โหลด PDF (A4)</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

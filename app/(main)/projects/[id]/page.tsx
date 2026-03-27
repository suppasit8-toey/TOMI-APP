'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import Swal from 'sweetalert2';
import { ArrowLeft, PencilSimple, User, Phone, MapPin, Image as ImageIcon, Coins, CheckCircle, Plus, FilePdf, ArrowSquareOut, Warning, Trash } from '@phosphor-icons/react';

const filterOptions = ['ทั้งหมด', 'ใหม่', 'นัดวัด', 'เสนอราคา', 'รอติดตั้ง', 'รอรับเงิน', 'รอปิดงาน', 'เสร็จสิ้น', 'ยกเลิก'];

const stepsConfig = [
  {id:1, title:'วัดหน้างาน', hasDate:1, hasUser:1, hasAmt:1, hasFile:1}, 
  {id:2, title:'ใบตัดฟิล์ม', hasFile:1, rpt:1}, 
  {id:3, title:'ใบเสนอราคา', hasAmt:1, hasFile:1, rpt:1}, 
  {id:4, title:'รับมัดจำ', hasDate:1, hasAmt:1, hasFile:1}, 
  {id:5, title:'ใช้ฟิล์ม (ตัดสต็อก)', rpt:1}, 
  {id:6, title:'คุมงานติดตั้ง', hasUser:1, hasAmt:1, hasFile:1, rpt:1}, 
  {id:7, title:'ค่าติดตั้ง', hasAmt:1, hasFile:1, hasDetail:1, rpt:1}, 
  {id:8, title:'งวดสุดท้าย', hasDate:1, hasAmt:1, hasFile:1}, 
  {id:9, title:'ค่าใช้จ่ายอื่น', hasAmt:1, hasFile:1, hasDetail:1, rpt:1}
];

const getStatusColor = (s: string) => ({'ใหม่':'bg-gray-100 text-gray-700','นัดวัด':'bg-yellow-100 text-yellow-700','เสนอราคา':'bg-blue-100 text-blue-700','รอติดตั้ง':'bg-purple-100 text-purple-700','รอรับเงิน':'bg-orange-100 text-orange-700','รอปิดงาน':'bg-orange-100 text-orange-700','เสร็จสิ้น':'bg-green-100 text-green-700','ยกเลิก':'bg-red-100 text-red-700'}[s] || 'bg-gray-100');

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);

  // Modals
  const [showEdit, setShowEdit] = useState(false);
  const [formEdit, setFormEdit] = useState<any>({});
  
  const [showManualStatus, setShowManualStatus] = useState(false);
  const [manualStatusValue, setManualStatusValue] = useState('');

  const [modalAct, setModalAct] = useState<any>({open: false});
  const [formAct, setFormAct] = useState<any>({});
  const [formFilms, setFormFilms] = useState<any[]>([{stock_id:'', amount_used:0}]);
  const [fileRaw, setFileRaw] = useState<File | null>(null);

  const loadData = async () => {
    setLoading(true);
    const { data: pData } = await supabase.from('projects').select('*').eq('id', projectId).single();
    const { data: tData } = await supabase.from('project_transactions').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
    const { data: uData } = await supabase.from('users').select('*');
    const { data: sData } = await supabase.from('stocks').select('*').gt('remaining_length', 0);
    
    setProject(pData);
    setTimeline(tData || []);
    setUserList(uData || []);
    setStocks(sData || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [projectId]);

  const uploadFile = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    // Assuming a 'tomi_files' public bucket exists
    const { data, error } = await supabase.storage.from('tomi_files').upload(fileName, file);
    if (error) return null;
    const { data: publicUrlData } = supabase.storage.from('tomi_files').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  };

  const submitEditPrj = async () => {
    setLoading(true);
    const { error } = await supabase.from('projects').update({
      name: formEdit.name,
      customer_name: formEdit.customer_name,
      tel: formEdit.tel,
      location_link: formEdit.location_link,
      note: formEdit.note,
      folder_before_url: formEdit.folder_before_url,
      folder_after_url: formEdit.folder_after_url,
      updated_at: new Date().toISOString()
    }).eq('id', projectId);
    
    setLoading(false);
    if (error) return Swal.fire('ผิดพลาด', error.message, 'error');
    
    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'EDIT', description: `แก้ไขโปรเจกต์ ${formEdit.name}`, ref_id: projectId });
    Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อย', 'success');
    setShowEdit(false);
    loadData();
  };

  const confirmManualStatus = async () => {
    if (!manualStatusValue) return;
    setLoading(true);
    const { error } = await supabase.from('projects').update({ status: manualStatusValue, updated_at: new Date().toISOString() }).eq('id', projectId);
    setLoading(false);
    if (error) return Swal.fire('ผิดพลาด', error.message, 'error');
    
    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'CHANGE_STATUS', description: `เปลี่ยนสถานะเป็น ${manualStatusValue}`, ref_id: projectId });
    Swal.fire('สำเร็จ', 'เปลี่ยนสถานะเรียบร้อย', 'success');
    setShowManualStatus(false);
    loadData();
  };

  const submitAct = async () => {
    setLoading(true);
    let url = '';
    if (fileRaw) {
      const uploadedUrl = await uploadFile(fileRaw);
      if (uploadedUrl) url = uploadedUrl;
    }

    try {
      if (modalAct.stg === 5) {
        // Stage 5: Use Film (Cut Stock)
        for (const f of formFilms) {
          if (f.stock_id && f.amount_used > 0) {
            const stock = stocks.find(s => s.id === f.stock_id);
            if (stock) {
              const newRemain = Number(stock.remaining_length) - Number(f.amount_used);
              // Update Stock
              await supabase.from('stocks').update({ remaining_length: newRemain, status: newRemain > 0 ? 'มีของ' : 'หมด' }).eq('id', f.stock_id);
              // Add Transaction
              await supabase.from('project_transactions').insert({
                id: 'TR' + new Date().getTime() + Math.floor(Math.random()*1000),
                project_id: projectId,
                stage_name: 'ใช้ฟิล์ม (ตัดสต็อก)',
                detail: `${stock.brand} ${stock.film_code} (${f.amount_used}ม.)`,
                amount: Number(stock.cost_per_meter) * Number(f.amount_used),
                type: '',
                is_cost: true,
                stock_id: f.stock_id,
                amount_used: f.amount_used,
                created_by: user?.name,
                action_date: formAct.date
              });
            }
          }
        }
      } else {
        // Other Stages
        let isCost = [1, 6, 7, 9].includes(modalAct.stg);
        let type = [4, 8].includes(modalAct.stg) ? 'Income' : (isCost ? 'Expense' : '');
        let amount = Number(formAct.amount) || 0;
        let detail = formAct.detail;

        if (formAct.vat) {
          amount *= 1.07;
          detail += ' (VAT)';
        }

        if (modalAct.stg === 9 && formAct.noExpense) {
          detail = 'ไม่มีค่าใช้จ่ายเพิ่มเติม';
          type = '';
          isCost = false;
        }

        const trId = 'TR' + new Date().getTime();
        await supabase.from('project_transactions').insert({
          id: trId,
          project_id: projectId,
          stage_name: formAct.stageName,
          detail: detail,
          amount: amount,
          type: type,
          is_cost: isCost,
          ref_user_id: formAct.refUserId || null,
          evidence_url: url,
          file_name: fileRaw ? fileRaw.name : null,
          created_by: user?.name,
          action_date: formAct.date
        });

        // Add to Accounts if it's income/expense and amount > 0
        if (type && amount > 0) {
          await supabase.from('accounts').insert({
            id: 'ACC_PJ_' + new Date().getTime(),
            transaction_date: formAct.date,
            type: type,
            category: 'โครงการ',
            detail: detail,
            amount: amount,
            evidence_url: url,
            project_id: projectId,
            created_by: user?.name
          });
        }
      }

      // Re-calculate Project Totals and Status Check
      const { data: allTr } = await supabase.from('project_transactions').select('*').eq('project_id', projectId);
      let inc = 0, cost = 0;
      allTr?.forEach(r => {
        if (r.type === 'Income') inc += Number(r.amount);
        if (r.is_cost) cost += Number(r.amount);
      });

      // Auto-Status Logic
      let nextStatus = project.status;
      if (project.status !== 'ยกเลิก') {
        if (modalAct.stg === 1) nextStatus = 'นัดวัด';
        else if (modalAct.stg === 3) nextStatus = 'เสนอราคา';
        else if (modalAct.stg === 4) nextStatus = 'รอติดตั้ง';
        else if (modalAct.stg === 7) nextStatus = 'รอรับเงิน';
        else if (modalAct.stg === 8) nextStatus = 'รอปิดงาน';

        const requiredSteps = ['วัดหน้างาน', 'ใบตัดฟิล์ม', 'ใบเสนอราคา', 'รับมัดจำ', 'ใช้ฟิล์ม', 'คุมงานติดตั้ง', 'ค่าติดตั้ง', 'งวดสุดท้าย', 'ค่าใช้จ่ายอื่น'];
        const completedSteps = allTr?.map(t => t.stage_name) || [];
        if (requiredSteps.every(s => completedSteps.some(cs => cs.includes(s)))) {
          nextStatus = 'เสร็จสิ้น';
        }
      }

      await supabase.from('projects').update({
        total_income: inc,
        total_expense: cost,
        net_profit: inc - cost,
        status: nextStatus,
        updated_at: new Date().toISOString()
      }).eq('id', projectId);

      Swal.fire('สำเร็จ', 'บันทึกรายการแล้ว', 'success');
      setModalAct({open: false});
      loadData();
    } catch (err: any) {
      Swal.fire('ผิดพลาด', err.message, 'error');
    }
    setLoading(false);
  };

  const deleteTransaction = async (t: any) => {
    const result = await Swal.fire({
      title: 'ลบรายการนี้?',
      text: `คุณต้องการลบรายการ "${t.detail || t.stage_name}" ใช่หรือไม่?\nระบบจะหักยอดเงินและปรับสถานะให้ใหม่ (ถ้าเป็นการตัดสต็อก จะคืนยอดฟิล์มกลับเข้าระบบ)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบรายการ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444'
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      // 1. Delete from project_transactions
      await supabase.from('project_transactions').delete().eq('id', t.id);

      // 2. If it was stock cut, return stock
      if (t.stage_name === 'ใช้ฟิล์ม (ตัดสต็อก)' && t.stock_id && t.amount_used) {
        const { data: stock } = await supabase.from('stocks').select('remaining_length').eq('id', t.stock_id).single();
        if (stock) {
          const newRemain = Number(stock.remaining_length) + Number(t.amount_used);
          await supabase.from('stocks').update({ remaining_length: newRemain, status: newRemain > 0 ? 'มีของ' : 'หมด' }).eq('id', t.stock_id);
        }
      }

      // 3. Delete from accounts if exists
      if (t.type && t.amount > 0) {
        // Find matching account record by approximate detail and amount
        await supabase.from('accounts').delete().eq('project_id', projectId).eq('detail', t.detail).eq('amount', t.amount).eq('type', t.type);
      }

      // 4. Recalculate Project Totals and Status
      const { data: allTr } = await supabase.from('project_transactions').select('*').eq('project_id', projectId);
      let inc = 0, cost = 0;
      allTr?.forEach(r => {
        if (r.type === 'Income') inc += Number(r.amount);
        if (r.is_cost) cost += Number(r.amount);
      });

      // Auto-Status Logic
      let nextStatus = project.status;
      if (project.status !== 'ยกเลิก') {
        // Start from beginning and find the furthest step completed
        const completedSteps = allTr?.map(t => t.stage_name) || [];
        if (completedSteps.some(cs => cs.includes('งวดสุดท้าย'))) nextStatus = 'รอปิดงาน';
        else if (completedSteps.some(cs => cs.includes('ค่าติดตั้ง'))) nextStatus = 'รอรับเงิน';
        else if (completedSteps.some(cs => cs.includes('รับมัดจำ'))) nextStatus = 'รอติดตั้ง';
        else if (completedSteps.some(cs => cs.includes('ใบเสนอราคา'))) nextStatus = 'เสนอราคา';
        else if (completedSteps.some(cs => cs.includes('วัดหน้างาน'))) nextStatus = 'นัดวัด';
        else nextStatus = 'ใหม่';

        const requiredSteps = ['วัดหน้างาน', 'ใบตัดฟิล์ม', 'ใบเสนอราคา', 'รับมัดจำ', 'ใช้ฟิล์ม', 'คุมงานติดตั้ง', 'ค่าติดตั้ง', 'งวดสุดท้าย', 'ค่าใช้จ่ายอื่น'];
        if (allTr && allTr.length > 0 && requiredSteps.every(s => completedSteps.some(cs => cs.includes(s)))) {
          nextStatus = 'เสร็จสิ้น';
        }
      }

      await supabase.from('projects').update({
        total_income: inc,
        total_expense: cost,
        net_profit: inc - cost,
        status: nextStatus,
        updated_at: new Date().toISOString()
      }).eq('id', projectId);

      await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'DELETE', description: `ลบรายการ ${t.stage_name} ในโปรเจกต์ ${project.name}`, ref_id: projectId });
      Swal.fire('สำเร็จ', 'ลบรายการแล้ว', 'success');
      loadData();
    } catch (err: any) {
      Swal.fire('ผิดพลาด', err.message, 'error');
    }
    setLoading(false);
  };

  const fmt = (num: number) => new Intl.NumberFormat('th-TH').format(num || 0);

  if (loading && !project) return <div className="p-8 text-center text-slate-500 animate-pulse">กำลังโหลด...</div>;
  if (!project) return <div className="p-8 text-center">ไม่พบโปรเจกต์</div>;

  const totalFilmCost = formFilms.reduce((acc, f) => {
    const s = stocks.find(x => x.id === f.stock_id);
    return acc + ((s ? Number(s.cost_per_meter) : 0) * (f.amount_used || 0));
  }, 0);

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-slate-50 z-40 overflow-y-auto outline-none no-scrollbar">
      <div className="sticky top-0 bg-white border-b flex justify-between items-center shadow-sm z-50 w-full p-3 sm:p-4">
        <button onClick={() => router.back()} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold flex items-center transition">
          <ArrowLeft weight="bold" className="mr-2" /> กลับ
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm py-1 px-3 shadow-sm rounded-full font-bold ${getStatusColor(project.status)}`}>{project.status}</span>
          <button onClick={() => { setManualStatusValue(project.status); setShowManualStatus(true); }} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition">
            <PencilSimple weight="bold" />
          </button>
        </div>
      </div>
      
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full pb-20 animate-in fade-in duration-300">
        <div className="mb-6 relative">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-black text-slate-800">{project.name}</h1>
            <button onClick={() => { setFormEdit(project); setShowEdit(true); }} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition shadow-sm">
              <PencilSimple weight="bold" className="text-lg" />
            </button>
          </div>
          
          <div className="bg-white p-5 rounded-2xl text-sm text-gray-600 border border-slate-100 shadow-sm mt-3">
            <div className="flex items-center mb-2 p-2 hover:bg-gray-50 rounded transition"><User weight="fill" className="mr-3 text-blue-500 text-lg" /> <span className="font-medium text-slate-700">{project.customer_name || '-'}</span></div>
            <div className="flex items-center mb-2 p-2 hover:bg-gray-50 rounded transition"><Phone weight="fill" className="mr-3 text-green-500 text-lg" /> <a href={`tel:${project.tel}`} className="font-medium text-slate-700 hover:text-green-600 underline">{project.tel || '-'}</a></div>
            {project.location_link && <div className="flex items-center mb-2 p-2 hover:bg-gray-50 rounded transition"><MapPin weight="fill" className="mr-3 text-red-500 text-lg" /> <a href={project.location_link} target="_blank" className="font-medium text-slate-700 hover:text-red-600 underline">เปิดแผนที่</a></div>}
            {project.note && <div className="mt-2 pt-3 border-t border-slate-100 italic text-gray-500 pl-2 border-l-4 border-gray-200 my-2">{project.note}</div>}
            
            {(project.folder_before_url || project.folder_after_url) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.folder_before_url && <a href={project.folder_before_url} target="_blank" className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 flex items-center transition shadow-sm font-medium"><ImageIcon weight="fill" className="mr-2 text-blue-500" /> รูปก่อนทำ</a>}
                {project.folder_after_url && <a href={project.folder_after_url} target="_blank" className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white hover:border-green-300 hover:text-green-600 flex items-center transition shadow-sm font-medium"><ImageIcon weight="fill" className="mr-2 text-green-500" /> รูปหลังทำ</a>}
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl mb-8 flex justify-between items-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 z-0"></div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4"><Coins weight="fill" className="text-8xl" /></div>
          <div className="relative z-10">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">กำไรสุทธิ</div>
            <div className="text-4xl font-bold text-green-400 shadow-black drop-shadow-md">{fmt(project.net_profit)}</div>
          </div>
          <div className="text-right text-xs relative z-10 space-y-1 font-medium bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/5">
            <div className="text-green-300 flex items-center justify-end gap-2">รับ <span className="text-white font-bold text-base">{fmt(project.total_income)}</span></div>
            <div className="text-red-300 flex items-center justify-end gap-2">จ่าย <span className="text-white font-bold text-base">{fmt(project.total_expense)}</span></div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6 pl-2 ml-2">
          {stepsConfig.map((s, idx) => {
            const stepTrans = timeline.filter(t => t.stage_name.includes(s.title));
            const hasStep = stepTrans.length > 0;
            return (
              <div key={s.id} className="relative pl-8 pb-2 border-l-2 border-slate-200 last:border-0">
                <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center font-bold text-white text-xs transition-all z-10 ${hasStep ? 'bg-green-500 scale-110' : 'bg-slate-300'}`}>
                  {idx + 1}
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition group">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-700 group-hover:text-blue-600 transition">{s.title}</h4>
                    {(!hasStep || s.rpt) && project.status !== 'ยกเลิก' && (
                      <button onClick={() => {
                        setModalAct({ ...s, open: true, stg: s.id });
                        setFormAct({ date: new Date().toISOString().split('T')[0], amount: 0, detail: s.title, stageName: s.title });
                        setFormFilms([{stock_id:'', amount_used:0}]);
                        setFileRaw(null);
                      }} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1">
                        <Plus weight="bold" /> บันทึก
                      </button>
                    )}
                  </div>

                  {hasStep ? (
                    <div>
                      {stepTrans.map(t => (
                        <div key={t.id} className="text-sm bg-slate-50 p-3 rounded-lg mb-2 border border-slate-100 last:mb-0">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-700">{t.detail || s.title}</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-xs ml-2 whitespace-nowrap ${t.is_cost ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                              {t.is_cost ? '-' : '+'}{fmt(t.amount)}
                            </span>
                          </div>
                          {t.evidence_url && (
                             <div className="mt-2 mb-2">
                               <a href={t.evidence_url} target="_blank" className="flex items-center justify-center gap-2 text-slate-600 bg-white px-3 py-2 rounded-lg hover:bg-slate-100 border border-slate-200 transition shadow-sm font-medium text-xs">
                                 <ImageIcon weight="fill" className="text-lg text-blue-500" /> ดูรูปหลักฐาน/เอกสาร
                               </a>
                             </div>
                          )}
                          <div className="flex justify-between text-[11px] text-gray-400 mt-2 items-center pt-2 border-t border-slate-200/50">
                            <div className="flex items-center gap-2">
                              {t.ref_user_id && <span className="flex items-center gap-1 bg-white border px-1.5 py-0.5 rounded text-slate-500"><User weight="fill" className="text-blue-400" /> {t.ref_user_id}</span>}
                              <span>{t.action_date}</span>
                            </div>
                            <button onClick={() => deleteTransaction(t)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition flex items-center gap-1 font-bold">
                               <Trash weight="bold" /> ลบ
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-300 italic py-1.5 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">ยังไม่มีรายการ</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Project Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowEdit(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800">แก้ไขข้อมูล</h3>
            <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อโปรเจกต์</label>
            <input value={formEdit.name || ''} onChange={e=>setFormEdit({...formEdit, name:e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-blue-500" />
            <label className="block text-sm font-semibold text-slate-700 mb-1">ลูกค้า</label>
            <input value={formEdit.customer_name || ''} onChange={e=>setFormEdit({...formEdit, customer_name:e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-blue-500" />
            <label className="block text-sm font-semibold text-slate-700 mb-1">ลิงก์รูปก่อนติดตั้ง</label>
            <input value={formEdit.folder_before_url || ''} onChange={e=>setFormEdit({...formEdit, folder_before_url:e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-blue-500" />
            <label className="block text-sm font-semibold text-slate-700 mb-1">ลิงก์รูปหลังติดตั้ง</label>
            <input value={formEdit.folder_after_url || ''} onChange={e=>setFormEdit({...formEdit, folder_after_url:e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-blue-500" />
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setShowEdit(false)} className="flex-1 font-semibold py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button onClick={submitEditPrj} className="flex-1 font-semibold py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">อัปเดต</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Status Modal */}
      {showManualStatus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowManualStatus(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800">เปลี่ยนสถานะ</h3>
            <select value={manualStatusValue} onChange={e=>setManualStatusValue(e.target.value)} className="w-full border rounded-xl px-3 py-2 outline-none focus:border-blue-500 mb-4">
              {filterOptions.filter(o=>o!=='ทั้งหมด').map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <div className="p-3 bg-yellow-50 text-yellow-700 text-xs rounded-xl border border-yellow-200 mb-4 flex items-start">
              <Warning weight="fill" className="mr-2 text-lg shrink-0" />
              <span>การเปลี่ยนสถานะด้วยมืออาจขัดแย้งกับลำดับงานอัตโนมัติ กรุณาตรวจสอบก่อนบันทึก</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowManualStatus(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold">ยกเลิก</button>
              <button onClick={confirmManualStatus} className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL */}
      {modalAct.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex justify-center items-end sm:items-center animate-in fade-in" onClick={() => setModalAct({open:false})}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800 flex items-center gap-2">
              <CheckCircle weight="fill" className="text-blue-600" /> {modalAct.title}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">วันที่</label>
              <input type="date" value={formAct.date || ''} onChange={e=>setFormAct({...formAct, date:e.target.value})} className="w-full border rounded-xl px-3 py-2 outline-none" />
            </div>

            {modalAct.hasUser && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">ผู้รับผิดชอบ/คุมงาน</label>
                <select value={formAct.refUserId || ''} onChange={e=>setFormAct({...formAct, refUserId:e.target.value})} className="w-full border rounded-xl px-3 py-2 outline-none">
                  <option value="">- เลือก -</option>
                  {userList.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
            )}

            {modalAct.stg === 5 ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-700 text-sm mb-3">รายการฟิล์มที่ใช้</div>
                  {formFilms.map((f, ix) => (
                    <div key={ix} className="mb-3 border-b pb-3 last:border-0 last:pb-0">
                      <select value={f.stock_id} onChange={e => { const newF = [...formFilms]; newF[ix].stock_id = e.target.value; setFormFilms(newF); }} className="w-full border rounded-xl px-3 py-2 text-sm mb-2 outline-none">
                         <option value="">- เลือกฟิล์ม -</option>
                         {stocks.map(s => <option key={s.id} value={s.id}>{s.brand} {s.film_code} (เหลือ {s.remaining_length}ม.)</option>)}
                      </select>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <input type="number" value={f.amount_used} onChange={e => { const newF = [...formFilms]; newF[ix].amount_used = Number(e.target.value); setFormFilms(newF); }} className="border rounded-lg w-20 px-2 py-1 outline-none text-center" placeholder="เมตร" /> ม.
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setFormFilms([...formFilms, {stock_id:'', amount_used:0}])} className="text-sm text-blue-600 font-bold flex items-center mt-2"><Plus weight="bold" className="mr-1" /> เพิ่มฟิล์ม</button>
                </div>
                <div className="flex justify-between font-bold px-3 py-2 bg-blue-50 text-blue-800 rounded-lg">
                  <span>รวมต้นทุนฟิล์ม (คำนวณเข้าโปรเจกต์):</span>
                  <span>{fmt(totalFilmCost)} บาท</span>
                </div>
              </div>
            ) : (
              <div>
                 {modalAct.stg === 9 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl border cursor-pointer hover:bg-gray-100" onClick={() => setFormAct({...formAct, noExpense: !formAct.noExpense})}>
                      <label className="flex items-center cursor-pointer pointer-events-none">
                        <input type="checkbox" checked={formAct.noExpense} readOnly className="w-5 h-5 mr-3 rounded" />
                        <span className="font-bold text-slate-700">ไม่มีค่าใช้จ่ายเพิ่มเติม (จบงาน)</span>
                      </label>
                    </div>
                 )}

                 {!formAct.noExpense && (
                   <>
                     {modalAct.hasDetail && (
                       <div className="mb-4">
                         <label className="block text-sm font-semibold mb-1">รายละเอียด</label>
                         <input value={formAct.detail || ''} onChange={e=>setFormAct({...formAct, detail:e.target.value})} className="w-full border rounded-xl px-3 py-2 outline-none" />
                       </div>
                     )}
                     {modalAct.hasAmt && (
                       <div className="mb-4">
                         <label className="block text-sm font-semibold mb-1">จำนวนเงิน</label>
                         <input type="number" value={formAct.amount ?? ''} onChange={e=>setFormAct({...formAct, amount:e.target.value})} className="w-full border rounded-xl px-3 py-2 text-xl font-bold outline-none" />
                         {modalAct.stg === 3 && (
                           <label className="flex items-center mt-2 p-2 bg-gray-50 rounded border border-dashed cursor-pointer">
                             <input type="checkbox" checked={formAct.vat} onChange={e=>setFormAct({...formAct, vat:e.target.checked})} className="mr-2" /> <span className="text-sm">บวก VAT 7%</span>
                           </label>
                         )}
                       </div>
                     )}
                     {modalAct.hasFile && (
                        <div className="mb-4">
                          <label className="flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition p-4">
                            <span className="flex items-center gap-2 text-slate-600 font-medium">
                               <ImageIcon weight="bold" className="text-xl" /> {fileRaw ? fileRaw.name : 'แนบรูป/ไฟล์ (1 ภาพ)'}
                            </span>
                            <input type="file" className="hidden" onChange={e => e.target.files && setFileRaw(e.target.files[0])} />
                          </label>
                        </div>
                     )}
                   </>
                 )}
              </div>
            )}

            <div className="flex gap-3 mt-8 pt-4 border-t">
              <button onClick={() => setModalAct({open:false})} className="flex-1 font-bold py-3 bg-slate-100 rounded-xl text-slate-600">ยกเลิก</button>
              <button disabled={loading} onClick={submitAct} className="flex-1 font-bold py-3 bg-blue-600 text-white rounded-xl disabled:opacity-50">บันทึก</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

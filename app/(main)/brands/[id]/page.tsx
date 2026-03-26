'use client';
import { useState, useEffect, use } from 'react';
import { CaretLeft, Plus, Tag, Trash, Storefront, CurrencyCircleDollar, Sun, ShieldCheck, Thermometer } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const brandNameParam = decodeURIComponent(resolvedParams.id);
  const { user } = useAuth();
  const [brand, setBrand] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddSeries, setShowAddSeries] = useState(false);
  const [seriesForm, setSeriesForm] = useState({ name: '', note: '' });

  const [showAddSubSeries, setShowAddSubSeries] = useState<string | null>(null);
  const [subSeriesForm, setSubSeriesForm] = useState({ film_type: '', vlt: '', vlr: '', irr: '', uvr: '', note: '' });

  const [showAddPrice, setShowAddPrice] = useState<{modelId: string, modelName: string} | null>(null);
  const [priceForm, setPriceForm] = useState({ supplier_id: '', price: '', half_roll_price: '', cost_per_meter: '', width: '152', length: '30' });

  const loadData = async () => {
    setLoading(true);
    
    let brandData = null;
    const { data: bByName } = await supabase.from('film_brands').select('*').eq('name', brandNameParam).single();
    if (bByName) {
      brandData = bByName;
    } else {
      const { data: bById } = await supabase.from('film_brands').select('*').eq('id', brandNameParam).single();
      if (bById) brandData = bById;
    }
    
    if (!brandData) {
      setLoading(false);
      return;
    }
    setBrand(brandData);
    const brandId = brandData.id;

    const { data: suppliersData } = await supabase.from('suppliers').select('id, name').order('name');
    setSuppliers(suppliersData || []);

    const { data: modelsData, error: modelsError } = await supabase
      .from('film_models')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: true });

    if (modelsError) console.error("Models fetch error:", modelsError);

    const { data: allPricesData } = await supabase.from('supplier_film_prices').select('*');

    const loadedModels = (modelsData || []).map(m => {
       const mPrices = (allPricesData || []).filter(p => p.film_model_id === m.id).map(p => {
          const sup = (suppliersData || []).find(s => s.id === p.supplier_id);
          return {
             ...p,
             suppliers: sup ? { name: sup.name } : null
          };
       });
       return { ...m, supplier_film_prices: mPrices };
    });
    
    setModels(loadedModels);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [brandNameParam]);

  const submitAddSeries = async () => {
    if (!seriesForm.name) return Swal.fire('เตือน', 'กรุณาระบุชื่อซีรีส์ (รุ่นหลัก)', 'warning');
    if (!brand) return;
    
    if (models.some(m => m.name.toLowerCase() === seriesForm.name.toLowerCase())) {
       return Swal.fire('ซ้ำ', 'มีชื่อซีรีส์นี้อยู่แล้ว', 'warning');
    }

    setLoading(true);
    const id = 'FM' + new Date().getTime();
    const { error } = await supabase.from('film_models').insert({
      id,
      brand_id: brand.id,
      name: seriesForm.name,
      film_type: null,
      note: seriesForm.note
    });

    if (error) {
      setLoading(false);
      return Swal.fire('ผิดพลาด', error.message, 'error');
    }

    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'ADD_FILM_SERIES', description: `เพิ่มซีรีส์ ${seriesForm.name} ให้แบรนด์ ${brand.name}`, ref_id: id });
    Swal.fire('สำเร็จ', 'บันทึกซีรีส์เรียบร้อย', 'success');
    setShowAddSeries(false);
    setSeriesForm({ name: '', note: '' });
    loadData();
  };

  const submitAddSubSeries = async () => {
    if (!subSeriesForm.film_type) return Swal.fire('เตือน', 'กรุณาระบุรุ่นย่อย / ความเข้ม', 'warning');
    if (!brand || !showAddSubSeries) return;

    setLoading(true);
    const id = 'FM' + new Date().getTime();
    const { error } = await supabase.from('film_models').insert({
      id,
      brand_id: brand.id,
      name: showAddSubSeries,
      film_type: subSeriesForm.film_type,
      vlt: subSeriesForm.vlt ? Number(subSeriesForm.vlt) : null,
      vlr: subSeriesForm.vlr ? Number(subSeriesForm.vlr) : null,
      irr: subSeriesForm.irr ? Number(subSeriesForm.irr) : null,
      uvr: subSeriesForm.uvr ? Number(subSeriesForm.uvr) : null,
      note: subSeriesForm.note
    });

    if (error) {
      setLoading(false);
      return Swal.fire('ผิดพลาด', error.message, 'error');
    }

    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'ADD_FILM_SUBSERIES', description: `เพิ่มรุ่นย่อย ${subSeriesForm.film_type} ให้ซีรีส์ ${showAddSubSeries}`, ref_id: id });
    Swal.fire('สำเร็จ', 'บันทึกรุ่นย่อยเรียบร้อย', 'success');
    setShowAddSubSeries(null);
    setSubSeriesForm({ film_type: '', vlt: '', vlr: '', irr: '', uvr: '', note: '' });
    loadData();
  };

  const deleteSeries = async (name: string) => {
    const res = await Swal.fire({
      title: 'ลบซีรีส์นี้?',
      text: `คุณต้องการลบ "${name}" รวมทั้งรุ่นย่อยทั้งหมดใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบทิ้ง'
    });
    
    if (res.isConfirmed) {
      setLoading(true);
      await supabase.from('film_models').delete().eq('brand_id', brand.id).eq('name', name);
      await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'DEL_FILM_SERIES', description: `ลบซีรีส์และรุ่นย่อยทั้งหมดของ ${name}` });
      loadData();
    }
  };

  const deleteSubSeriesModel = async (id: string, name: string, filmType: string) => {
    const res = await Swal.fire({
      title: 'ลบรุ่นย่อย?',
      text: `คุณต้องการลบ "${filmType || 'ข้อมูลรุ่นนี้'}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบทิ้ง'
    });
    
    if (res.isConfirmed) {
      setLoading(true);
      await supabase.from('film_models').delete().eq('id', id);
      await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'DEL_FILM_MODEL', description: `ลบรุ่นย่อย ${filmType} ของ ${name}`, ref_id: id });
      loadData();
    }
  };

  const submitAddPrice = async () => {
    if (!priceForm.supplier_id) return Swal.fire('เตือน', 'กรุณาเลือกซัพพลายเออร์', 'warning');
    setLoading(true);
    
    const { error } = await supabase.from('supplier_film_prices').insert({
      film_model_id: showAddPrice!.modelId,
      supplier_id: priceForm.supplier_id,
      price: Number(priceForm.price) || 0,
      half_roll_price: Number(priceForm.half_roll_price) || 0,
      cost_per_meter: Number(priceForm.cost_per_meter) || 0,
      width: Number(priceForm.width) || 152,
      length: Number(priceForm.length) || 30
    });

    if (error) {
      setLoading(false);
      if (error.code === '23505') return Swal.fire('ซ้ำ', 'มีซัพพลายเออร์นี้ในซีรีส์ฟิล์มนี้แล้ว', 'warning');
      return Swal.fire('ผิดพลาด', error.message, 'error');
    }

    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'ADD_SUPPLIER_PRICE', description: `ตั้งราคาให้ซีรีส์ ${showAddPrice!.modelName}` });
    Swal.fire('สำเร็จ', 'บันทึกราคาเรียบร้อย', 'success');
    setShowAddPrice(null);
    setPriceForm({ supplier_id: '', price: '', half_roll_price: '', cost_per_meter: '', width: '152', length: '30' });
    loadData();
  };

  const deletePrice = async (id: string) => {
    const res = await Swal.fire({
      title: 'ลบราคานี้?',
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ลบทิ้ง'
    });
    if (res.isConfirmed) {
      setLoading(true);
      await supabase.from('supplier_film_prices').delete().eq('id', id);
      loadData();
    }
  };

  const handleQuickAddSupplier = async () => {
    const { value: supplierName } = await Swal.fire({
      title: 'เพิ่มซัพพลายเออร์ใหม่',
      input: 'text',
      inputPlaceholder: 'พิมพ์ชื่อซัพพลายเออร์...',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      inputValidator: (value) => {
        if (!value) return 'กรุณาระบุชื่อซัพพลายเออร์';
      }
    });

    if (supplierName) {
      setLoading(true);
      const newId = 'SP' + new Date().getTime();
      const { error } = await supabase.from('suppliers').insert({
        id: newId,
        name: supplierName
      });
      
      if (error) {
        setLoading(false);
        return Swal.fire('ผิดพลาด', error.message, 'error');
      }
      
      const newSup = { id: newId, name: supplierName };
      setSuppliers(prev => [...prev, newSup].sort((a,b) => a.name.localeCompare(b.name)));
      setPriceForm(prev => ({ ...prev, supplier_id: newId }));
      setLoading(false);
      Swal.fire({ title: 'สำเร็จ!', text: `เพิ่ม ${supplierName} แล้ว`, icon: 'success', timer: 1500, showConfirmButton: false });
    }
  };

  // Group models by Series name
  const groupedModels = models.reduce((acc, m) => {
    if (!acc[m.name]) {
      acc[m.name] = {
        name: m.name,
        note: m.note, // Will take note from first encountered row
        seriesRecord: null,
        subSeries: [],
        combinedPrices: [] // To hold all deduped supplier prices for this series
      };
    }
    
    const hasSpecs = m.vlt || m.vlr || m.irr || m.uvr;
    const hasPrices = m.supplier_film_prices && m.supplier_film_prices.length > 0;
    
    // It's just a placeholder series if there's no film_type, no specs, and no prices.
    if (!m.film_type && !hasSpecs && !hasPrices) {
      acc[m.name].seriesRecord = m;
      // Also grab note from placeholder explicitly if exists
      if (m.note) acc[m.name].note = m.note;
    } else {
      acc[m.name].subSeries.push(m);
    }
    return acc;
  }, {} as Record<string, any>);

  const seriesList = Object.values(groupedModels).map((series: any) => {
     // Deduplicate supplier prices across the entire series (placeholder + subseries)
     const uniquePricesMap = new Map();
     const allAvailablePrices = [
        ...(series.seriesRecord?.supplier_film_prices || []),
        ...series.subSeries.flatMap((s: any) => s.supplier_film_prices || [])
     ];
     
     allAvailablePrices.forEach((p: any) => {
       if (!uniquePricesMap.has(p.supplier_id)) {
           uniquePricesMap.set(p.supplier_id, p);
       }
     });

     series.combinedPrices = Array.from(uniquePricesMap.values());
     return series;
  });

  if (!brand && !loading) return <div className="p-8 text-center text-red-500">ไม่พบข้อมูลแบรนด์</div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center mb-6 no-print">
        <div className="flex items-center gap-3">
          <Link href="/brands" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-600 shadow-sm border border-slate-200">
            <CaretLeft weight="bold" className="text-xl" />
          </Link>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Tag weight="fill" className="text-blue-600" /> {brand?.name}
          </h2>
        </div>
        <button onClick={() => setShowAddSeries(true)} className="bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg shadow-blue-200 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700">
          <Plus weight="bold" /> เพิ่มซีรีส์หลัก
        </button>
      </div>

      {brand?.note && (
        <div className="bg-blue-50/50 p-4 rounded-2xl text-blue-800 text-sm border border-blue-100 mb-6 font-medium">
          <span className="font-bold flex items-center gap-1 mb-1"><Tag /> หมายเหตุแบรนด์:</span>
          {brand.note}
        </div>
      )}

      <div className="space-y-6">
        {seriesList.map((series: any) => (
          <div key={series.name} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 relative transition group">
            <div className="absolute top-6 right-6 flex gap-2 z-10">
               <button onClick={() => deleteSeries(series.name)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition"><Trash weight="fill" /></button>
            </div>
            
            <div className="bg-slate-50/80 border-b border-slate-200 p-6 pr-16 relative">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 mb-2">
                <Tag weight="fill" className="text-blue-500" /> {series.name}
              </h3>
              {series.note && <p className="text-sm text-slate-500 bg-white p-3 rounded-xl border border-slate-100 inline-block">{series.note}</p>}
              
              <div className="mt-4">
                <button onClick={() => setShowAddSubSeries(series.name)} className="bg-white text-blue-600 border border-blue-200 py-1.5 px-4 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-blue-50 transition">
                  <Plus weight="bold" /> เพิ่มรุ่นย่อย
                </button>
              </div>
            </div>

            <div className="p-6 pb-2">
              {series.subSeries.length > 0 ? (
                 <div className="space-y-4">
                    {series.subSeries.map((m: any) => (
                       <div key={m.id} className="bg-white rounded-2xl p-5 border border-slate-200 relative group/sub">
                          <button onClick={() => deleteSubSeriesModel(m.id, series.name, m.film_type)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 rounded-xl transition hover:bg-red-50 opacity-0 group-hover/sub:opacity-100"><Trash weight="fill" /></button>
                          
                          <div className="pr-10">
                            <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                               <span className="bg-slate-800 text-white px-3 py-1 rounded-md text-sm">{m.film_type || 'ไม่ระบุรุ่นย่อย'}</span>
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(m.vlt !== null && m.vlt !== undefined) && <div className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg flex gap-1 items-center"><Sun className="text-slate-400"/> แสงผ่าน (VLT) {m.vlt}%</div>}
                              {(m.vlr !== null && m.vlr !== undefined) && <div className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg flex gap-1 items-center"><Sun className="text-slate-400"/> สะท้อนแสง (VLR) {m.vlr}%</div>}
                              {(m.irr !== null && m.irr !== undefined) && <div className="text-xs font-semibold bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded-lg flex gap-1 items-center"><Thermometer className="text-red-400"/> กันความร้อน (IRR) {m.irr}%</div>}
                              {(m.uvr !== null && m.uvr !== undefined) && <div className="text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-600 px-2 py-1 rounded-lg flex gap-1 items-center"><ShieldCheck className="text-purple-400"/> กัน UV (UVR) {m.uvr}%</div>}
                            </div>
                            {m.note && <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">{m.note}</p>}
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="text-center py-8 text-slate-400 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="font-semibold text-slate-500 mb-1">ยังไม่มีรุ่นย่อยในซีรีส์นี้</p>
                    <p className="text-sm">ราคาทุนจะกำหนดที่ระดับซีรีส์เท่านั้น</p>
                 </div>
              )}
            </div>

            {/* ราคาของซีรีส์ */}
            <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                    <Storefront weight="fill" className="text-blue-500" /> เรทราคาจากซัพพลายเออร์ (สำหรับซีรีส์นี้)
                  </h5>
                  <button onClick={() => setShowAddPrice({modelId: series.seriesRecord?.id || series.subSeries[0]?.id || '', modelName: series.name})} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 py-1.5 px-3 rounded-lg flex items-center gap-1 transition shadow-sm">
                    <Plus weight="bold" /> เพิ่มราคา
                  </button>
                </div>
                {series.combinedPrices?.length > 0 ? (
                   <div className="space-y-2">
                      {series.combinedPrices.map((sp: any) => (
                        <div key={sp.id} className="block lg:flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-2 lg:mb-0">
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                             {sp.suppliers?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 lg:pb-0">
                            <div className="text-right flex items-center gap-2 shrink-0">
                              <div className="text-xs text-slate-500 font-medium bg-white border border-slate-200 px-2 py-1.5 rounded-lg flex items-center gap-1">
                                 <span className="font-bold text-slate-700">{sp.width}</span>cm <span className="text-slate-300">x</span> <span className="font-bold text-slate-700">{sp.length}</span>m
                              </div>
                              {(sp.price > 0) && (
                                <div className="text-sm font-black text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                                   ฿{sp.price.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ ม้วน</span>
                                </div>
                              )}
                              {(sp.half_roll_price > 0) && (
                                <div className="text-sm font-black text-purple-600 bg-purple-50 border border-purple-100 px-2 py-1 rounded-lg">
                                   ฿{sp.half_roll_price.toLocaleString()} <span className="text-xs font-normal opacity-70">/ ครึ่งม้วน</span>
                                </div>
                              )}
                              {(sp.cost_per_meter > 0) && (
                                <div className="text-sm font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                                   ฿{sp.cost_per_meter.toLocaleString()} <span className="text-xs font-normal opacity-70">/ เมตร</span>
                                </div>
                              )}
                            </div>
                            <button onClick={() => deletePrice(sp.id)} className="text-slate-300 hover:text-red-500 transition p-2 bg-white hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg shrink-0 ml-1"><Trash weight="fill" /></button>
                          </div>
                        </div>
                      ))}
                   </div>
                ) : (
                   <div className="text-center py-6 text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                     ยังไม่ได้ผูกราคาสำหรับซีรีส์นี้
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {seriesList.length === 0 && !loading && (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
             <Tag className="text-5xl mx-auto mb-3 text-slate-300" />
             <p className="font-semibold text-lg">ยังไม่มีซีรีส์ในแบรนด์นี้</p>
             <p className="text-sm">กดเพิ่มซีรีส์หลักที่ปุ่มด้านบนได้เลย</p>
          </div>
        )}
      </div>

      {showAddSeries && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto" onClick={() => setShowAddSeries(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom my-4 relative" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800 flex items-center gap-2">
               <Tag weight="fill" className="text-blue-500" /> เพิ่มซีรีส์หลัก
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">ชื่อซีรีส์ (Series Name) <span className="text-red-500">*</span></label>
                <input value={seriesForm.name} onChange={e=>setSeriesForm({...seriesForm, name:e.target.value})} placeholder="Ex. VT BLK05" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 font-bold" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">รายละเอียด / หมายเหตุ</label>
                <textarea value={seriesForm.note} onChange={e=>setSeriesForm({...seriesForm, note:e.target.value})} placeholder="ข้อมูลเพิ่มเติม..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 min-h-[80px]" />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-100 mt-6">
              <button onClick={() => setShowAddSeries(false)} className="flex-1 font-bold py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button disabled={loading} onClick={submitAddSeries} className="flex-1 font-bold py-3 bg-blue-600 text-white rounded-xl shadow-md disabled:opacity-50 hover:bg-blue-700 transition">บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {showAddSubSeries && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto" onClick={() => setShowAddSubSeries(null)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom my-4 relative" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800 flex items-center gap-2">
               <Tag weight="fill" className="text-blue-500" /> เพิ่มรุ่นย่อย {showAddSubSeries}
            </h3>
            
            <div className="max-h-[calc(100vh-160px)] overflow-y-auto pr-2 custom-scrollbar pb-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Sub-Series (รุ่นย่อย / ความเข้ม) <span className="text-red-500">*</span></label>
                <input value={subSeriesForm.film_type} onChange={e=>setSubSeriesForm({...subSeriesForm, film_type:e.target.value})} placeholder="Ex. CARBON BLACK 80%" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 font-bold" />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">สเปคฟิล์ม (%) <span className="font-normal text-xs text-slate-400">- ไม่บังคับกรอก</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500 flex items-center gap-1"><Sun /> แสงผ่าน (VLT)</label>
                    <input type="number" value={subSeriesForm.vlt} onChange={e=>setSubSeriesForm({...subSeriesForm, vlt:e.target.value})} placeholder="%" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500 flex items-center gap-1"><Sun /> สะท้อนแสง (VLR)</label>
                    <input type="number" value={subSeriesForm.vlr} onChange={e=>setSubSeriesForm({...subSeriesForm, vlr:e.target.value})} placeholder="%" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500 flex items-center gap-1"><Thermometer /> ลดความร้อน (IRR)</label>
                    <input type="number" value={subSeriesForm.irr} onChange={e=>setSubSeriesForm({...subSeriesForm, irr:e.target.value})} placeholder="%" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold text-red-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500 flex items-center gap-1"><ShieldCheck /> ป้องกัน UV (UVR)</label>
                    <input type="number" value={subSeriesForm.uvr} onChange={e=>setSubSeriesForm({...subSeriesForm, uvr:e.target.value})} placeholder="%" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold text-purple-600" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">รายละเอียด / หมายเหตุ</label>
                <textarea value={subSeriesForm.note} onChange={e=>setSubSeriesForm({...subSeriesForm, note:e.target.value})} placeholder="ข้อมูลเพิ่มเติม..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 min-h-[80px]" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
              <button onClick={() => setShowAddSubSeries(null)} className="flex-1 font-bold py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button disabled={loading} onClick={submitAddSubSeries} className="flex-1 font-bold py-3 bg-blue-600 text-white rounded-xl shadow-md disabled:opacity-50 hover:bg-blue-700 transition">บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {showAddPrice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto" onClick={() => setShowAddPrice(null)}>
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom my-4 relative" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
               <CurrencyCircleDollar weight="fill" className="text-green-500 text-2xl" /> 
               <div>
                 <div className="text-sm font-semibold text-slate-400 leading-tight">ตั้งราคาทุนสำหรับซีรีส์</div>
                 <div className="leading-tight mt-0.5 text-blue-600">{showAddPrice.modelName}</div>
               </div>
            </h3>
            
            <div className="max-h-[calc(100vh-160px)] overflow-y-auto pr-2 custom-scrollbar pb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold">เลือกซัพพลายเออร์ <span className="text-red-500">*</span></label>
                <button onClick={handleQuickAddSupplier} className="text-xs text-blue-600 font-bold hover:underline bg-blue-50 px-2 py-1 rounded-md transition hover:bg-blue-100">+ เพิ่มซัพพลายใหม่</button>
              </div>
              <select value={priceForm.supplier_id} onChange={e=>setPriceForm({...priceForm, supplier_id:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none mb-4 focus:border-blue-500 bg-white font-medium text-slate-700">
                <option value="">-- เลือกซัพพลายเออร์ --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <label className="block text-sm font-semibold mb-1">สเปคฟิล์ม (ซม. / เมตร)</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-medium text-sm">กว้าง</span>
                  <input type="number" value={priceForm.width} onChange={e=>setPriceForm({...priceForm, width:e.target.value})} placeholder="152" className="w-full border border-slate-200 rounded-xl pl-12 pr-2 py-2.5 outline-none focus:border-blue-500 font-bold" />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-medium text-sm">ยาว</span>
                  <input type="number" value={priceForm.length} onChange={e=>setPriceForm({...priceForm, length:e.target.value})} placeholder="30" className="w-full border border-slate-200 rounded-xl pl-10 pr-2 py-2.5 outline-none focus:border-blue-500 font-bold" />
                </div>
              </div>
              
              <label className="block text-sm font-semibold mb-1">ราคายกม้วน (บาท)</label>
              <div className="relative mb-3">
                <span className="absolute left-4 top-2.5 text-slate-400 font-bold">฿</span>
                <input type="number" value={priceForm.price} onChange={e=>setPriceForm({...priceForm, price:e.target.value})} placeholder="0" className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 outline-none focus:border-blue-500 font-bold" />
              </div>

              <label className="block text-sm font-semibold mb-1">ราคาครึ่งม้วน (บาท)</label>
              <div className="relative mb-3">
                <span className="absolute left-4 top-2.5 text-purple-400 font-bold">฿</span>
                <input type="number" value={priceForm.half_roll_price} onChange={e=>setPriceForm({...priceForm, half_roll_price:e.target.value})} placeholder="0" className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 outline-none focus:border-purple-500 font-bold text-purple-700" />
              </div>
              
              <label className="block text-sm font-semibold mb-1">ต้นทุนต่อเมตร (บาท)</label>
              <div className="relative mb-4">
                <span className="absolute left-4 top-2.5 text-blue-400 font-bold">฿</span>
                <input type="number" value={priceForm.cost_per_meter} onChange={e=>setPriceForm({...priceForm, cost_per_meter:e.target.value})} placeholder="0" className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 outline-none focus:border-blue-500 font-bold text-blue-600" />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
              <button onClick={() => setShowAddPrice(null)} className="flex-1 font-bold py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button disabled={loading} onClick={submitAddPrice} className="flex-1 font-bold py-3 bg-blue-600 text-white rounded-xl shadow-md disabled:opacity-50 hover:bg-blue-700 transition">บันทึกราคา</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { SquaresFour, CheckCircle, Info, Spinner } from '@phosphor-icons/react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';

const predefinedUsers = [
  { id: 'P', name: 'โอปอ' },
  { id: 'T', name: 'เต้ย' },
  { id: 'V', name: 'พี่วิว' },
  { id: 'H', name: 'พี่แฮม' }
];

export default function LoginScreen() {
  const { setUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (pinCode.length !== 4) return Swal.fire('เตือน', 'กรุณาใส่ PIN 4 หลัก', 'warning');
    
    setLoading(true);
    
    // Check against Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_code', selectedUserId)
      .single();

    if (error || !user) {
      setLoading(false);
      return Swal.fire('ผิดพลาด', 'ไม่พบรายชื่อในระบบ (กรุณาเช็คฐานข้อมูล)', 'error');
    }

    if (!user.pin) {
      // First time login -> Register PIN
      const { error: updateError } = await supabase
        .from('users')
        .update({ pin: pinCode })
        .eq('user_code', selectedUserId);
        
      if (updateError) {
        setLoading(false);
        return Swal.fire('ผิดพลาด', 'บันทึก PIN ไม่สำเร็จ', 'error');
      }
      
      setUser(user);
      Swal.fire({ icon: 'success', title: 'ตั้ง PIN สำเร็จ', timer: 1000, showConfirmButton: false });
    } else {
      // Check existing PIN
      if (user.pin !== pinCode) {
        setLoading(false);
        return Swal.fire('ผิดพลาด', 'รหัส PIN ไม่ถูกต้อง', 'error');
      }
      
      setUser(user);
      Swal.fire({ icon: 'success', title: 'เข้าสู่ระบบสำเร็จ', timer: 1000, showConfirmButton: false });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-950 p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-15%] right-[-15%] w-[600px] h-[600px] bg-blue-600 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-15%] left-[-15%] w-[600px] h-[600px] bg-blue-800 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[32px] w-full max-w-[380px] text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10 animate-in fade-in zoom-in duration-500 border border-white/20">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center gap-4 mb-3">
             <div className="flex items-center justify-center p-1 border-[3px] border-blue-900 rounded-[10px] w-14 h-14 bg-gradient-to-br from-blue-700 to-blue-950 shrink-0 shadow-lg">
               <SquaresFour weight="regular" className="text-white text-4xl" />
             </div>
             <div className="flex flex-col shrink-0 text-left">
               <h1 className="font-black text-2xl leading-[1.05] tracking-widest text-blue-950 drop-shadow-sm">TOMI</h1>
               <h1 className="font-black text-2xl leading-[1] tracking-widest text-blue-950 drop-shadow-sm">FILM</h1>
             </div>
          </div>
          <p className="text-blue-900/60 text-[10px] tracking-[0.2em] font-bold uppercase mt-1">Window Film System</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {predefinedUsers.map(u => (
            <div 
              key={u.id}
              onClick={() => { setSelectedUserId(u.id); setPinCode(''); }}
              className={`p-4 rounded-[20px] cursor-pointer flex flex-col items-center justify-center transition-all duration-300 border-2 h-28 relative overflow-hidden group ${
                selectedUserId === u.id 
                  ? 'border-blue-600 bg-blue-50/80 text-blue-800 shadow-md scale-105 ring-4 ring-blue-500/20' 
                  : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              {selectedUserId === u.id && (
                <div className="absolute top-2 right-2 text-blue-600">
                  <CheckCircle weight="fill" className="text-xl drop-shadow-sm" />
                </div>
              )}
              <div className="text-[32px] font-black mb-1 group-hover:scale-110 transition duration-300">{u.id}</div>
              <div className="text-xs font-bold tracking-wide">{u.name}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 relative">
          <input 
            type="password" 
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            maxLength={4} 
            placeholder="PIN" 
            className="w-full text-center text-[28px] tracking-[0.5em] font-black text-blue-950 border-[3px] border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-2xl py-3 outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300 placeholder:font-bold" 
          />
        </div>

        <p className="text-[11px] text-blue-800 mb-7 bg-blue-50/80 p-3 rounded-xl border border-blue-200/50 flex items-start text-left font-medium">
          <Info weight="fill" className="mr-2 text-lg text-blue-500 shrink-0 mt-0.5" />
          <span>กรุณากรอกรหัสผ่านในครั้งแรก<br /><span className="text-blue-600/70">ระบบจะบันทึกการใช้งานโดยอัตโนมัติ</span></span>
        </p>

        <button 
          onClick={login} 
          disabled={loading || !selectedUserId || pinCode.length < 4} 
          className="w-full font-bold px-4 text-lg py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center disabled:hover:translate-y-0"
        >
          {loading ? (
            <><Spinner className="animate-spin mr-2" /> กำลังตรวจสอบ...</>
          ) : (
            'เข้าใช้งาน'
          )}
        </button>
      </div>
    </div>
  );
}

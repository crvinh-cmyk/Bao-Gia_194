import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ADMIN_PIN_DEFAULT = "Vinh123456#";

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN_DEFAULT) {
      setErrorMsg('');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPinInput('');
        onSuccess();
      }, 500);
    } else {
      setErrorMsg('Mã PIN không chính xác! Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1C1917] text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E7C184] to-[#C09B59] p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#1C1917] rounded-[10px] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#E7C184]" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Xác Thực Quản Trị Admin</h3>
              <p className="text-xs text-neutral-400">Tiệm In 194 · Master Catalog Control</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#8C682A]" />
              <span>Nhập mã PIN xưởng</span>
            </label>
            <p className="text-xs text-neutral-500">
              Nhập mã PIN để mở giao diện quản lý giá, mẫu khung & cốt phôi ván.
            </p>
          </div>

          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Nhập mã PIN..."
              autoFocus
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C09B59] focus:bg-white transition-all pr-12 shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Xác thực thành công! Đang chuyển tiếp...</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-[#1C1917] bg-gradient-to-r from-[#E7C184] to-[#C09B59] hover:from-[#f0cf98] hover:to-[#cb072] rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#1C1917]" />
              <span>Mở Chế Độ Admin</span>
            </button>
          </div>
        </form>

        <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-100 text-[11px] text-neutral-400 font-mono text-center">
          Chỉ dành cho quản lý xưởng Tiệm In 194
        </div>

      </div>
    </div>
  );
};

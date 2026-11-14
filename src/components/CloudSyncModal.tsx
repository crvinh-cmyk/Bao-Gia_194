import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Layers, 
  Image as ImageIcon, 
  X, 
  Sparkles,
  ShieldCheck,
  Server
} from 'lucide-react';
import { 
  syncCatalogToFirestore, 
  fetchSyncStatus, 
  subscribeToSyncStatus, 
  SyncStatus,
  SyncCatalogResult,
  RECOMMENDED_FIRESTORE_RULES,
  MASTER_CATALOG_DOC_ID,
  MASTER_FRAMES_DOC_ID
} from '../services/catalogSync';
import { signInAdminWithGoogle } from '../services/firebase';
import { useMasterCatalog } from '../services/adminStore';
import { inEpMikaPricingData, goLuaDongKhungData, mikaPhoThongData, hdGuongSieuBongKhungData, anh4KPricingData } from '../data/tiemIn194Pricing2026';
import { FRAMES } from '../constants/frames';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const catalog = useMasterCatalog();
  const dynamicFrames = catalog?.frames?.length ? catalog.frames : FRAMES;
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [syncResult, setSyncResult] = useState<SyncCatalogResult | null>(null);
  const [activeTab, setActiveTab] = useState<'sync' | 'preview' | 'schema'>('sync');
  const [copiedRules, setCopiedRules] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isActive = true;

    // Fetch initial status
    fetchSyncStatus().then(status => {
      if (isActive && status) setSyncStatus(status);
    });

    // Subscribe to real-time status
    const unsubscribe = subscribeToSyncStatus((status) => {
      if (isActive) setSyncStatus(status);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSync = async () => {
    setIsSyncing(true);
    setProgressLog([]);
    setSyncResult(null);
    setCurrentStep('Khởi động kết nối Cloud Firestore (lab-f7f0a)...');

    const result = await syncCatalogToFirestore((stepMessage) => {
      setCurrentStep(stepMessage);
      setProgressLog(prev => [...prev, `${new Date().toLocaleTimeString('vi-VN')}: ${stepMessage}`]);
    });

    setIsSyncing(false);
    setSyncResult(result);
    if (result.success) {
      setCurrentStep('Đã hoàn thành đồng bộ thành công!');
    } else {
      setCurrentStep('Đồng bộ thất bại. Vui lòng thử lại.');
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Chưa có dữ liệu đồng bộ';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#F8FAFC] text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1E2A78] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#1E2A78] flex items-center justify-center shadow-sm">
              <Cloud className="w-5 h-5 text-[#1E2A78]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">Đồng Bộ Cloud Firestore</h3>
                <span className="text-[10px] uppercase font-mono font-bold bg-white/15 text-amber-300 px-2 py-0.5 rounded-md border border-white/20 tabular-nums">
                  Dự án: lab-f7f0a
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Đóng vai trò Master Catalog để ứng dụng xưởng <code className="text-amber-300 font-mono bg-white/10 px-1.5 py-0.5 rounded">quan-ly-194</code> kéo dữ liệu về
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Pill Tabs */}
        <div className="flex flex-wrap items-center border-b border-slate-200 bg-blue-50/70 px-4 sm:px-6 py-2.5 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl transition-all cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-blue-50 text-[#1E2A78] border border-blue-100 font-semibold'
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            <span>Đồng Bộ Master</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-blue-50 text-[#1E2A78] border border-blue-100 font-semibold'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Xem Dữ Liệu Đồng Bộ (5 Bảng & 14 Khung)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-blue-50 text-[#1E2A78] border border-blue-100 font-semibold'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Cấu Trúc Firestore (quan-ly-194)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-[#F8FAFC]">

          {activeTab === 'sync' && (
            <>
              {/* Status Overview Card */}
              <div className="p-5 bg-gradient-to-r from-[#1E2A78] via-[#1E3A8A] to-[#2563EB] text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                      Cloud Firestore Status: Active
                    </span>
                  </div>
                  <div className="text-sm font-medium text-blue-100">
                    Lần đồng bộ gần nhất: <span className="font-mono text-amber-300 font-bold tabular-nums">{formatDate(syncStatus?.lastSyncedAt || null)}</span>
                  </div>
                  <div className="text-xs text-blue-100/90">
                    {syncStatus?.message || 'Sẵn sàng đẩy dữ liệu bảng giá mới nhất 2026 lên hệ thống Cloud.'}
                  </div>
                </div>

                <button
                  onClick={handleStartSync}
                  disabled={isSyncing}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                    isSyncing 
                      ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-[0.98]'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang Đồng Bộ...' : 'Đẩy Bảng Giá Lên Cloud'}</span>
                </button>
              </div>

              {/* Real-time sync logs & steps */}
              {isSyncing && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E2A78]">
                    <RefreshCw className="w-4 h-4 text-[#2563EB] animate-spin" />
                    <span>{currentStep}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#2563EB] h-2 rounded-full animate-pulse w-full"></div>
                  </div>
                  <div className="mt-2 max-h-32 overflow-y-auto font-mono text-[11px] bg-white p-2.5 rounded-lg border border-blue-100 text-slate-700 space-y-1 tabular-nums">
                    {progressLog.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-[#2563EB]">•</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sync Result Notice */}
              {syncResult && (
                <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
                  syncResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-start gap-3">
                    {syncResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-xs flex-1">
                      <p className="font-bold text-sm">{syncResult.success ? 'Đồng bộ thành công!' : 'Cần xác thực hoặc cấp quyền Firestore'}</p>
                      <p>{syncResult.message}</p>
                      {syncResult.timestamp && (
                        <p className="font-mono text-[11px] opacity-75 tabular-nums">
                          Thời gian: {new Date(syncResult.timestamp).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                  {syncResult.permissionDenied && (
                    <div className="pt-2 border-t border-rose-200 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await signInAdminWithGoogle();
                            await handleStartSync();
                          } catch {
                            // Handled in UI
                          }
                        }}
                        className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        🔑 Đăng nhập Google Admin & Thử lại
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(RECOMMENDED_FIRESTORE_RULES);
                          setCopiedRules(true);
                          setTimeout(() => setCopiedRules(false), 2500);
                        }}
                        className="px-3.5 py-2 bg-white border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        {copiedRules ? '✓ Đã Copy Firestore Rules!' : '📋 Copy Firestore Rules chuẩn cho lab-f7f0a'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Scope summary list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2A78] font-mono flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Nội Dung Đồng Bộ Trong Master Catalog</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E2A78] flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-500" />
                        1. In Ép Mika
                      </span>
                      <span className="text-[11px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full tabular-nums">
                        {(catalog?.tiers?.studio?.inEpMika || inEpMikaPricingData).length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Giá in ảnh, in ép mika từ 13x18 đến 110x180 & khung xương gia cố</p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E2A78] flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        2. Gỗ Lụa Đóng Khung
                      </span>
                      <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full tabular-nums">
                        {(catalog?.tiers?.studio?.goLua || goLuaDongKhungData).length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Toàn bộ bảng giá khung K0-K11 & Titan cho ảnh Gỗ Lụa</p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E2A78] flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#2563EB]" />
                        3. Mika Phổ Thông
                      </span>
                      <span className="text-[11px] font-mono bg-blue-100 text-[#1E2A78] font-bold px-2 py-0.5 rounded-full tabular-nums">
                        {(catalog?.tiers?.studio?.mikaPhoThong || mikaPhoThongData).length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Bảng giá đầy đủ dòng Mika phổ thông các mẫu khung</p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E2A78] flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        4. HD Gương Siêu Bóng
                      </span>
                      <span className="text-[11px] font-mono bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full tabular-nums">
                        {(catalog?.tiers?.studio?.hdGuongSieuBong || hdGuongSieuBongKhungData).length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Mức giá dòng HD gương tráng gương siêu bóng</p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E2A78] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        5. Bảng Giá Ảnh 4K
                      </span>
                      <span className="text-[11px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full tabular-nums">
                        {(catalog?.tiers?.studio?.anh4K || anh4KPricingData).length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Dòng Ảnh 4K cao cấp phối Khung Nổi K4-K6 và Titan 2</p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E2A78] flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        6. Danh Mục Khung Ảnh
                      </span>
                      <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full tabular-nums">
                        {dynamicFrames.length} mã khung
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Mô tả, kích thước, ảnh mẫu K0 - K11, Titan 1 & Titan 2</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2A78] font-mono">
                  Bản xem trước dữ liệu JSON đẩy lên Firestore
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Dự án Target: <strong className="text-[#1E2A78]">lab-f7f0a</strong>
                </span>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs max-h-96 overflow-y-auto border border-slate-800 space-y-2 tabular-nums">
                <div className="text-amber-300 font-bold text-[11px]">// Master Catalog Structure (master_catalog/{MASTER_CATALOG_DOC_ID})</div>
                <pre className="text-emerald-400 whitespace-pre-wrap">
{JSON.stringify({
  version: catalog?.version || "2026.2",
  shopName: catalog?.shopInfo?.name || "Tiệm In 194",
  sourceApp: "tiem-in-194",
  targetApp: "quan-ly-194",
  totalTables: 7 + (catalog?.customMaterials?.length || 0),
  sampleInEpMikaRow: (catalog?.tiers?.studio?.inEpMika || inEpMikaPricingData)[0],
  sampleMika20x30Row: (catalog?.tiers?.studio?.mikaPhoThong || mikaPhoThongData).find(r => r.size.includes('20')) || mikaPhoThongData[2],
  sampleAnh4KRow: (catalog?.tiers?.studio?.anh4K || anh4KPricingData)[0],
  sampleFrameCode: dynamicFrames[0]?.code || FRAMES[0].code,
  totalFrameModels: dynamicFrames.length
}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs text-[#1E2A78]">
                <div className="flex items-center gap-2 font-bold text-[#1E2A78]">
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>Hướng dẫn dành cho Ứng dụng Quản Lý Xưởng (quan-ly-194)</span>
                </div>
                <p>
                  Ứng dụng <strong>quan-ly-194</strong> chỉ cần lắng nghe hoặc truy vấn từ Cloud Firestore dự án <strong>lab-f7f0a</strong> theo các đường dẫn sau:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-1 border border-slate-800">
                  <div className="text-amber-400 font-bold">1. Master Pricing Document:</div>
                  <code className="text-emerald-300 block bg-black/40 p-2 rounded">
                    doc(db, "master_catalog", "{MASTER_CATALOG_DOC_ID}")
                  </code>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">Chứa trọn bộ bảng giá chuẩn + quy chuẩn khung reference guide.</p>
                </div>

                <div className="p-3.5 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-1 border border-slate-800">
                  <div className="text-amber-400 font-bold">2. Master Frames Catalog Document:</div>
                  <code className="text-emerald-300 block bg-black/40 p-2 rounded">
                    doc(db, "master_catalog", "{MASTER_FRAMES_DOC_ID}")
                  </code>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">Chứa mảng 14 mẫu khung K0 - K11, Titan 1, Titan 2 cùng link ảnh, mô tả, chất liệu.</p>
                </div>

                <div className="p-3.5 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-1 border border-slate-800">
                  <div className="text-amber-400 font-bold">3. System Config Master Pricing Document:</div>
                  <code className="text-emerald-300 block bg-black/40 p-2 rounded">
                    doc(db, "system_config", "master_pricing")
                  </code>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">Đồng bộ trực tiếp mảng phẳng skus, items, products và tiers sang quan-ly-194.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Firebase Security: lab-f7f0a.firebaseapp.com</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Đóng Window
            </button>
            <button
              onClick={handleStartSync}
              disabled={isSyncing}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CloudUpload className="w-3.5 h-3.5 text-slate-950" />
              <span>Đồng Bộ Ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

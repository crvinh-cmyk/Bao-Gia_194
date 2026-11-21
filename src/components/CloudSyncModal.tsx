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

    fetchSyncStatus().then(status => {
      if (isActive && status) setSyncStatus(status);
    });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#F8FAFC] text-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-[#0F172A] flex items-center justify-center shadow-xs">
              <Cloud className="w-5 h-5 text-[#0F172A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">Đồng Bộ Cloud Firestore</h3>
                <span className="text-[11px] font-mono font-semibold text-slate-400 tabular-nums">
                  · lab-f7f0a
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Master Catalog đồng bộ trực tiếp sang ứng dụng xưởng <code className="text-[#FBBF24] font-mono">quan-ly-194</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Segmented Tabs */}
        <div className="flex flex-wrap items-center border-b border-slate-200 bg-slate-100/90 px-4 sm:px-6 py-2.5 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-[#0F172A] text-white font-bold shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold'
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            <span>Đồng Bộ Master</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#0F172A] text-white font-bold shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Xem Dữ Liệu Đồng Bộ</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-[#0F172A] text-white font-bold shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Cấu Trúc Firestore</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-[#F8FAFC]">

          {activeTab === 'sync' && (
            <>
              {/* Status Overview Card */}
              <div className="p-5 bg-[#0F172A] text-white rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-[#FBBF24] uppercase tracking-wider font-mono">
                    Cloud Firestore · lab-f7f0a
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    Lần đồng bộ gần nhất:{' '}
                    <span className="font-mono text-[#FBBF24] font-bold tabular-nums">
                      {formatDate(syncStatus?.lastSyncedAt || null)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {syncStatus?.message || 'Sẵn sàng đẩy dữ liệu bảng giá mới nhất 2026 lên hệ thống Cloud.'}
                  </div>
                </div>

                <button
                  onClick={handleStartSync}
                  disabled={isSyncing}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm ${
                    isSyncing 
                      ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                      : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A]'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang Đồng Bộ...' : 'Đẩy Bảng Giá Lên Cloud'}</span>
                </button>
              </div>

              {/* Real-time sync logs & steps */}
              {isSyncing && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <RefreshCw className="w-4 h-4 text-[#D97706] animate-spin" />
                    <span>{currentStep}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#F59E0B] h-1.5 rounded-full animate-pulse w-full"></div>
                  </div>
                  <div className="mt-2 max-h-32 overflow-y-auto font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 space-y-1 tabular-nums">
                    {progressLog.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-[#D97706]">•</span>
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
                        className="px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Đăng nhập Google Admin & Thử lại
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
                        {copiedRules ? 'Đã Copy Firestore Rules!' : 'Copy Firestore Rules chuẩn'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Scope summary list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-mono flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Nội Dung Đồng Bộ Trong Master Catalog</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: <Layers className="w-4 h-4 text-[#D97706]" />,
                      title: '1. In Ép Mika',
                      count: `${(catalog?.tiers?.studio?.inEpMika || inEpMikaPricingData).length} kích thước`,
                      desc: 'Giá in ảnh, in ép mika từ 13x18 đến 110x180 & khung xương gia cố'
                    },
                    {
                      icon: <Layers className="w-4 h-4 text-[#D97706]" />,
                      title: '2. Gỗ Lụa Đóng Khung',
                      count: `${(catalog?.tiers?.studio?.goLua || goLuaDongKhungData).length} kích thước`,
                      desc: 'Toàn bộ bảng giá khung K0-K11 & Titan cho ảnh Gỗ Lụa'
                    },
                    {
                      icon: <Layers className="w-4 h-4 text-[#D97706]" />,
                      title: '3. Mika Phổ Thông',
                      count: `${(catalog?.tiers?.studio?.mikaPhoThong || mikaPhoThongData).length} kích thước`,
                      desc: 'Bảng giá đầy đủ dòng Mika phổ thông các mẫu khung'
                    },
                    {
                      icon: <Layers className="w-4 h-4 text-[#D97706]" />,
                      title: '4. HD Gương Siêu Bóng',
                      count: `${(catalog?.tiers?.studio?.hdGuongSieuBong || hdGuongSieuBongKhungData).length} kích thước`,
                      desc: 'Mức giá dòng HD gương tráng gương siêu bóng'
                    },
                    {
                      icon: <Sparkles className="w-4 h-4 text-[#D97706]" />,
                      title: '5. Bảng Giá Ảnh 4K',
                      count: `${(catalog?.tiers?.studio?.anh4K || anh4KPricingData).length} kích thước`,
                      desc: 'Dòng Ảnh 4K cao cấp phối Khung Nổi K4-K6 và Titan 2'
                    },
                    {
                      icon: <ImageIcon className="w-4 h-4 text-[#D97706]" />,
                      title: '6. Danh Mục Khung Ảnh',
                      count: `${dynamicFrames.length} mã khung`,
                      desc: 'Mô tả, kích thước, ảnh mẫu K0 - K11, Titan 1 & Titan 2'
                    }
                  ].map((box) => (
                    <div key={box.title} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                          {box.icon}
                          {box.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 font-bold tabular-nums">
                          {box.count}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{box.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-mono">
                  Bản xem trước dữ liệu JSON đẩy lên Firestore
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Dự án Target: <strong className="text-[#0F172A]">lab-f7f0a</strong>
                </span>
              </div>

              <div className="bg-[#0F172A] text-slate-200 p-4 rounded-xl font-mono text-xs max-h-96 overflow-y-auto border border-slate-800 space-y-2 tabular-nums">
                <div className="text-[#FBBF24] font-bold text-[11px]">
                  Master Catalog Structure (master_catalog/{MASTER_CATALOG_DOC_ID})
                </div>
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
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                  <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                  <span>Hướng dẫn dành cho Ứng dụng Quản Lý Xưởng (quan-ly-194)</span>
                </div>
                <p>
                  Ứng dụng <strong>quan-ly-194</strong> lắng nghe hoặc truy vấn từ Cloud Firestore dự án <strong>lab-f7f0a</strong> theo các đường dẫn sau:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#0F172A] text-white rounded-xl font-mono text-xs space-y-1 border border-slate-800">
                  <div className="text-[#FBBF24] font-bold">1. Master Pricing Document:</div>
                  <code className="text-emerald-300 block bg-black/40 p-2 rounded">
                    doc(db, "master_catalog", "{MASTER_CATALOG_DOC_ID}")
                  </code>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">Chứa trọn bộ bảng giá chuẩn + quy chuẩn khung reference guide.</p>
                </div>

                <div className="p-3.5 bg-[#0F172A] text-white rounded-xl font-mono text-xs space-y-1 border border-slate-800">
                  <div className="text-[#FBBF24] font-bold">2. Master Frames Catalog Document:</div>
                  <code className="text-emerald-300 block bg-black/40 p-2 rounded">
                    doc(db, "master_catalog", "{MASTER_FRAMES_DOC_ID}")
                  </code>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">Chứa mảng mẫu khung K0 - K11, Titan 1, Titan 2 cùng link ảnh, mô tả, chất liệu.</p>
                </div>

                <div className="p-3.5 bg-[#0F172A] text-white rounded-xl font-mono text-xs space-y-1 border border-slate-800">
                  <div className="text-[#FBBF24] font-bold">3. System Config Master Pricing Document:</div>
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
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span>lab-f7f0a.firebaseapp.com</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#0F172A] bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleStartSync}
              disabled={isSyncing}
              className="px-4 py-2 text-xs font-bold text-[#0F172A] bg-[#F59E0B] hover:bg-[#D97706] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CloudUpload className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>Đồng Bộ Ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

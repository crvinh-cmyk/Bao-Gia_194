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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#000000]/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#f5f5f7] text-[#1d1d1f] rounded-[18px] border border-[#e0e0e0] overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#000000] text-[#ffffff] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#272729] text-[#2997ff] flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-[17px] text-[#ffffff] tracking-[-0.374px]">
                  Đồng Bộ Cloud Firestore
                </h3>
                <span className="text-[12px] font-mono text-[#cccccc] tabular-nums">
                  · lab-f7f0a
                </span>
              </div>
              <p className="text-[12px] text-[#cccccc] mt-0.5">
                Master Catalog đồng bộ trực tiếp sang ứng dụng xưởng <code className="text-[#2997ff] font-mono">quan-ly-194</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#cccccc] hover:text-[#ffffff] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Configurator Chips */}
        <div className="flex flex-wrap items-center border-b border-[#e0e0e0] bg-[#ffffff] px-6 py-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-1.5 px-4 py-2 text-[13px] rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3]'
                : 'bg-[#f5f5f7] hover:bg-[#e0e0e0]/60 text-[#1d1d1f] font-normal'
            }`}
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Đồng Bộ Master</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-2 text-[13px] rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3]'
                : 'bg-[#f5f5f7] hover:bg-[#e0e0e0]/60 text-[#1d1d1f] font-normal'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Xem Dữ Liệu Đồng Bộ</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-4 py-2 text-[13px] rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3]'
                : 'bg-[#f5f5f7] hover:bg-[#e0e0e0]/60 text-[#1d1d1f] font-normal'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Cấu Trúc Firestore</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#f5f5f7]">

          {activeTab === 'sync' && (
            <>
              {/* Dark Tile 1 Status Overview Card */}
              <div className="p-6 bg-[#272729] text-[#ffffff] rounded-[18px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-[#2997ff] font-mono">
                    Cloud Firestore · lab-f7f0a
                  </div>
                  <div className="text-[14px] font-normal text-[#ffffff]">
                    Lần đồng bộ gần nhất:{' '}
                    <span className="font-semibold text-[#2997ff] tabular-nums">
                      {formatDate(syncStatus?.lastSyncedAt || null)}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#cccccc]">
                    {syncStatus?.message || 'Sẵn sàng đẩy dữ liệu bảng giá mới nhất 2026 lên hệ thống Cloud.'}
                  </div>
                </div>

                <button
                  onClick={handleStartSync}
                  disabled={isSyncing}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-[22px] py-[11px] rounded-full font-normal text-[14px] leading-none transition-all active:scale-95 cursor-pointer shrink-0 ${
                    isSyncing 
                      ? 'bg-[#333333] text-[#7a7a7a] cursor-not-allowed'
                      : 'bg-[#0066cc] hover:bg-[#0071e3] text-[#ffffff]'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang Đồng Bộ...' : 'Đẩy Bảng Giá Lên Cloud'}</span>
                </button>
              </div>

              {/* Real-time sync logs & steps */}
              {isSyncing && (
                <div className="p-5 bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] space-y-2.5">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#1d1d1f]">
                    <RefreshCw className="w-4 h-4 text-[#0066cc] animate-spin" />
                    <span>{currentStep}</span>
                  </div>
                  <div className="w-full bg-[#f5f5f7] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#0066cc] h-1.5 rounded-full animate-pulse w-full"></div>
                  </div>
                  <div className="mt-2 max-h-32 overflow-y-auto font-mono text-[11px] bg-[#f5f5f7] p-3 rounded-[11px] border border-[#e0e0e0] text-[#333333] space-y-1 tabular-nums">
                    {progressLog.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-[#0066cc]">•</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sync Result Notice */}
              {syncResult && (
                <div className={`p-5 rounded-[18px] border flex flex-col gap-3 ${
                  syncResult.success 
                    ? 'bg-[#ffffff] border-emerald-300 text-[#1d1d1f]' 
                    : 'bg-[#ffffff] border-rose-300 text-[#1d1d1f]'
                }`}>
                  <div className="flex items-start gap-3">
                    {syncResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-[14px] flex-1">
                      <p className="font-semibold text-[#1d1d1f]">
                        {syncResult.success ? 'Đồng bộ thành công!' : 'Cần xác thực hoặc cấp quyền Firestore'}
                      </p>
                      <p className="text-[#333333]">{syncResult.message}</p>
                      {syncResult.timestamp && (
                        <p className="text-[12px] text-[#7a7a7a] tabular-nums">
                          Thời gian: {new Date(syncResult.timestamp).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                  {syncResult.permissionDenied && (
                    <div className="pt-3 border-t border-[#f0f0f0] flex flex-wrap items-center gap-2">
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
                        className="px-4 py-2 bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] rounded-full text-[13px] font-normal cursor-pointer transition-all"
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
                        className="px-4 py-2 bg-[#fafafc] border-[3px] border-[#f0f0f0] text-[#333333] rounded-[11px] text-[13px] font-normal active:scale-95 cursor-pointer transition-all"
                      >
                        {copiedRules ? 'Đã Copy Firestore Rules!' : 'Copy Firestore Rules chuẩn'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Scope summary list */}
              <div className="space-y-3">
                <h4 className="text-[14px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0066cc]" />
                  <span>Nội Dung Đồng Bộ Trong Master Catalog</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    {
                      icon: <Layers className="w-4 h-4 text-[#0066cc]" />,
                      title: '1. In Ép Mika',
                      count: `${(catalog?.tiers?.studio?.inEpMika || inEpMikaPricingData).length} kích thước`,
                      desc: 'Giá in ảnh, in ép mika từ 13x18 đến 110x180 & khung xương gia cố'
                    },
                    {
                      icon: <Layers className="w-4 h-4 text-[#0066cc]" />,
                      title: '2. Gỗ Lụa Đóng Khung',
                      count: `${(catalog?.tiers?.studio?.goLua || goLuaDongKhungData).length} kích thước`,
                      desc: 'Toàn bộ bảng giá khung K0-K11 & Titan cho ảnh Gỗ Lụa'
                    },
                    {
                      icon: <Layers className="w-4 h-4 text-[#0066cc]" />,
                      title: '3. Mika Phổ Thông',
                      count: `${(catalog?.tiers?.studio?.mikaPhoThong || mikaPhoThongData).length} kích thước`,
                      desc: 'Bảng giá đầy đủ dòng Mika phổ thông các mẫu khung'
                    },
                    {
                      icon: <Layers className="w-4 h-4 text-[#0066cc]" />,
                      title: '4. HD Gương Siêu Bóng',
                      count: `${(catalog?.tiers?.studio?.hdGuongSieuBong || hdGuongSieuBongKhungData).length} kích thước`,
                      desc: 'Mức giá dòng HD gương tráng gương siêu bóng'
                    },
                    {
                      icon: <Sparkles className="w-4 h-4 text-[#0066cc]" />,
                      title: '5. Bảng Giá Ảnh 4K',
                      count: `${(catalog?.tiers?.studio?.anh4K || anh4KPricingData).length} kích thước`,
                      desc: 'Dòng Ảnh 4K cao cấp phối Khung Nổi K4-K6 và Titan 2'
                    },
                    {
                      icon: <ImageIcon className="w-4 h-4 text-[#0066cc]" />,
                      title: '6. Danh Mục Khung Ảnh',
                      count: `${dynamicFrames.length} mã khung`,
                      desc: 'Mô tả, kích thước, ảnh mẫu K0 - K11, Titan 1 & Titan 2'
                    }
                  ].map((box) => (
                    <div key={box.title} className="p-4 bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                          {box.icon}
                          {box.title}
                        </span>
                        <span className="text-[12px] text-[#7a7a7a] font-semibold tabular-nums">
                          {box.count}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#333333] leading-[1.43]">{box.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-semibold text-[#1d1d1f]">
                  Bản xem trước dữ liệu JSON đẩy lên Firestore
                </h4>
                <span className="text-[12px] text-[#7a7a7a]">
                  Dự án Target: <strong className="text-[#1d1d1f]">lab-f7f0a</strong>
                </span>
              </div>

              <div className="bg-[#252527] text-[#cccccc] p-5 rounded-[18px] font-mono text-xs max-h-96 overflow-y-auto space-y-2 tabular-nums">
                <div className="text-[#2997ff] font-semibold text-[12px]">
                  Master Catalog Structure (master_catalog/{MASTER_CATALOG_DOC_ID})
                </div>
                <pre className="text-[#ffffff] whitespace-pre-wrap">
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
              <div className="p-5 bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] space-y-2 text-[14px] text-[#333333]">
                <div className="flex items-center gap-2 font-semibold text-[#1d1d1f]">
                  <ShieldCheck className="w-4 h-4 text-[#0066cc]" />
                  <span>Hướng dẫn dành cho Ứng dụng Quản Lý Xưởng (quan-ly-194)</span>
                </div>
                <p>
                  Ứng dụng <strong>quan-ly-194</strong> lắng nghe hoặc truy vấn từ Cloud Firestore dự án <strong>lab-f7f0a</strong> theo các đường dẫn sau:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-5 bg-[#272729] text-[#ffffff] rounded-[18px] font-mono text-xs space-y-1.5">
                  <div className="text-[#2997ff] font-semibold">1. Master Pricing Document:</div>
                  <code className="text-[#ffffff] block bg-[#000000]/50 p-2.5 rounded-[8px]">
                    doc(db, "master_catalog", "{MASTER_CATALOG_DOC_ID}")
                  </code>
                  <p className="text-[12px] text-[#cccccc] font-sans mt-1">Chứa trọn bộ bảng giá chuẩn + quy chuẩn khung reference guide.</p>
                </div>

                <div className="p-5 bg-[#272729] text-[#ffffff] rounded-[18px] font-mono text-xs space-y-1.5">
                  <div className="text-[#2997ff] font-semibold">2. Master Frames Catalog Document:</div>
                  <code className="text-[#ffffff] block bg-[#000000]/50 p-2.5 rounded-[8px]">
                    doc(db, "master_catalog", "{MASTER_FRAMES_DOC_ID}")
                  </code>
                  <p className="text-[12px] text-[#cccccc] font-sans mt-1">Chứa mảng mẫu khung K0 - K11, Titan 1, Titan 2 cùng link ảnh, mô tả, chất liệu.</p>
                </div>

                <div className="p-5 bg-[#272729] text-[#ffffff] rounded-[18px] font-mono text-xs space-y-1.5">
                  <div className="text-[#2997ff] font-semibold">3. System Config Master Pricing Document:</div>
                  <code className="text-[#ffffff] block bg-[#000000]/50 p-2.5 rounded-[8px]">
                    doc(db, "system_config", "master_pricing")
                  </code>
                  <p className="text-[12px] text-[#cccccc] font-sans mt-1">Đồng bộ trực tiếp mảng phẳng skus, items, products và tiers sang quan-ly-194.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#ffffff] border-t border-[#e0e0e0] flex items-center justify-between shrink-0">
          <div className="text-[12px] text-[#7a7a7a] font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0066cc]" />
            <span>lab-f7f0a.firebaseapp.com</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-5 py-2 text-[14px] font-normal text-[#333333] bg-[#fafafc] hover:bg-[#f5f5f7] border-[3px] border-[#f0f0f0] rounded-[11px] active:scale-95 transition-all cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleStartSync}
              disabled={isSyncing}
              className="px-[22px] py-[10px] text-[14px] font-normal text-[#ffffff] bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 rounded-full transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Đồng Bộ Ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

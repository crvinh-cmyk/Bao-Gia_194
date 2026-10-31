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
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { 
  syncCatalogToFirestore, 
  fetchSyncStatus, 
  subscribeToSyncStatus, 
  SyncStatus,
  MASTER_CATALOG_DOC_ID,
  MASTER_FRAMES_DOC_ID
} from '../services/catalogSync';
import { inEpMikaPricingData, goLuaDongKhungData, mikaPhoThongData, hdGuongSieuBongKhungData, anh4KPricingData } from '../data/tiemIn194Pricing2026';
import { FRAMES } from '../constants/frames';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; timestamp?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'sync' | 'preview' | 'schema'>('sync');

  useEffect(() => {
    if (!isOpen) return;

    // Fetch initial status
    fetchSyncStatus().then(status => {
      if (status) setSyncStatus(status);
    });

    // Subscribe to real-time status
    const unsubscribe = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
    });

    return () => unsubscribe();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1C1917] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E7C184] to-[#C09B59] p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#1C1917] rounded-[10px] flex items-center justify-center">
                <Cloud className="w-5 h-5 text-[#E7C184]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">Đồng Bộ Cloud Firestore</h3>
                <span className="text-[10px] uppercase font-mono font-bold bg-[#E7C184]/20 text-[#E7C184] px-2 py-0.5 rounded border border-[#E7C184]/30">
                  Dự án: lab-f7f0a
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Đóng vai trò Master Catalog để ứng dụng xưởng <code className="text-[#E7C184] bg-white/10 px-1 rounded">quan-ly-194</code> kéo dữ liệu về
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-neutral-200 bg-neutral-50 px-4 sm:px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'sync'
                ? 'border-[#C09B59] text-[#8C682A] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            <span>Đồng Bộ Master</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'preview'
                ? 'border-[#C09B59] text-[#8C682A] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Xem Dữ Liệu Đồng Bộ (5 Bảng & 14 Khung)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'schema'
                ? 'border-[#C09B59] text-[#8C682A] bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Cấu Trúc Firestore (quan-ly-194)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {activeTab === 'sync' && (
            <>
              {/* Status Overview Card */}
              <div className="p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-xl border border-neutral-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                      Cloud Firestore Status: Active
                    </span>
                  </div>
                  <div className="text-sm font-medium text-neutral-200">
                    Lần đồng bộ gần nhất: <span className="font-mono text-[#E7C184] font-semibold">{formatDate(syncStatus?.lastSyncedAt || null)}</span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {syncStatus?.message || 'Sẵn sàng đẩy dữ liệu bảng giá mới nhất 2026 lên hệ thống Cloud.'}
                  </div>
                </div>

                <button
                  onClick={handleStartSync}
                  disabled={isSyncing}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                    isSyncing 
                      ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#E7C184] to-[#C09B59] hover:from-[#f0cf98] hover:to-[#cb072] text-[#1C1917] hover:shadow-lg active:scale-[0.98]'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang Đồng Bộ...' : 'Đẩy Bảng Giá Lên Cloud'}</span>
                </button>
              </div>

              {/* Real-time sync logs & steps */}
              {isSyncing && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>{currentStep}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
                  </div>
                  <div className="mt-2 max-h-32 overflow-y-auto font-mono text-[11px] bg-white p-2.5 rounded-lg border border-blue-100 text-neutral-700 space-y-1">
                    {progressLog.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-blue-500">•</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sync Result Notice */}
              {syncResult && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  syncResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {syncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm">{syncResult.success ? 'Đồng bộ thành công!' : 'Đồng bộ không thành công'}</p>
                    <p>{syncResult.message}</p>
                    {syncResult.timestamp && (
                      <p className="font-mono text-[11px] opacity-75">
                        Thời gian: {new Date(syncResult.timestamp).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Scope summary list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#C09B59]" />
                  <span>Nội Dụng Đồng Bộ Trong Master Catalog</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-600" />
                        1. In Ép Mika
                      </span>
                      <span className="text-[11px] font-mono bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                        {inEpMikaPricingData.length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">Giá in ép mika từ 13x18 đến 110x180 & khung xương gia cố</p>
                  </div>

                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        2. Gỗ Lụa Đóng Khung
                      </span>
                      <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                        {goLuaDongKhungData.length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">Toàn bộ bảng giá khung K0-K11 & Titan cho ảnh Gỗ Lụa</p>
                  </div>

                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-sky-600" />
                        3. Mika Phổ Thông
                      </span>
                      <span className="text-[11px] font-mono bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
                        {mikaPhoThongData.length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">Bảng giá đầy đủ dòng Mika phổ thông các mẫu khung</p>
                  </div>

                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-purple-600" />
                        4. HD Gương Siêu Bóng
                      </span>
                      <span className="text-[11px] font-mono bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                        {hdGuongSieuBongKhungData.length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">Mức giá dòng HD gương tráng gương siêu bóng</p>
                  </div>

                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-rose-600" />
                        5. Bảng Giá Ảnh 4K
                      </span>
                      <span className="text-[11px] font-mono bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full">
                        {anh4KPricingData.length} kích thước
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">Dòng Ảnh 4K cao cấp phối Khung Nổi K4-K6 và Titan 2</p>
                  </div>

                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        6. Danh Mục Khung Ảnh
                      </span>
                      <span className="text-[11px] font-mono bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                        {FRAMES.length} mã khung
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">Mô tả, kích thước, ảnh mẫu K0 - K11, Titan 1 & Titan 2</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 font-mono">
                  Bản xem trước dữ liệu JSON đẩy lên Firestore
                </h4>
                <span className="text-[11px] font-mono text-neutral-500">
                  Dự án Target: <strong className="text-neutral-800">lab-f7f0a</strong>
                </span>
              </div>

              <div className="bg-neutral-900 text-neutral-200 p-4 rounded-xl font-mono text-xs max-h-96 overflow-y-auto border border-neutral-800 space-y-2">
                <div className="text-[#E7C184] font-bold text-[11px]">// Master Catalog Structure (master_catalog/{MASTER_CATALOG_DOC_ID})</div>
                <pre className="text-emerald-400 whitespace-pre-wrap">
{JSON.stringify({
  version: "2026.1",
  shopName: "Tiệm In 194",
  sourceApp: "tiem-in-194",
  targetApp: "quan-ly-194",
  totalTables: 5,
  sampleInEpMikaRow: inEpMikaPricingData[0],
  sampleGoLuaRow: goLuaDongKhungData[0],
  sampleAnh4KRow: anh4KPricingData[0],
  sampleFrameCode: FRAMES[0].code,
  totalFrameModels: FRAMES.length
}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Hướng dẫn dành cho Ứng dụng Quản Lý Xưởng (quan-ly-194)</span>
                </div>
                <p>
                  Ứng dụng <strong>quan-ly-194</strong> chỉ cần lắng nghe hoặc truy vấn từ Cloud Firestore dự án <strong>lab-f7f0a</strong> theo các đường dẫn sau:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-neutral-900 text-white rounded-xl font-mono text-xs space-y-1 border border-neutral-800">
                  <div className="text-amber-400 font-bold">1. Master Pricing Document:</div>
                  <code className="text-emerald-300 block bg-black/40 p-2 rounded">
                    doc(db, "master_catalog", "{MASTER_CATALOG_DOC_ID}")
                  </code>
                  <p className="text-[11px] text-neutral-400 font-sans mt-1">Chứa trọn bộ 5 bảng giá chuẩn + quy chuẩn khung reference guide.</p>
                </div>

                <div className="p-3 bg-neutral-900 text-white rounded-xl font-mono text-xs space-y-1 border border-neutral-800">
                  <div className="text-amber-400 font-bold">2. Master Frames Catalog Document:</div>
                  <code className="text-emerald-300 block bg-black/40 p-2 rounded">
                    doc(db, "master_catalog", "{MASTER_FRAMES_DOC_ID}")
                  </code>
                  <p className="text-[11px] text-neutral-400 font-sans mt-1">Chứa mảng 14 mẫu khung K0 - K11, Titan 1, Titan 2 cùng link ảnh, mô tả, chất liệu.</p>
                </div>

                <div className="p-3 bg-neutral-900 text-white rounded-xl font-mono text-xs space-y-1 border border-neutral-800">
                  <div className="text-amber-400 font-bold">3. Collection Khung Chi Tiết:</div>
                  <code className="text-emerald-300 block bg-black/40 p-2 rounded">
                    collection(db, "frames") // Query theo docId: "k0", "k1", "titan1", ...
                  </code>
                  <p className="text-[11px] text-neutral-400 font-sans mt-1">Phục vụ hiển thị chi tiết sản phẩm từng mẫu khung khi làm đơn hàng tại xưởng.</p>
                </div>

                <div className="p-3 bg-neutral-900 text-white rounded-xl font-mono text-xs space-y-1 border border-neutral-800">
                  <div className="text-amber-400 font-bold">4. Collection Bảng Giá Chi Tiết:</div>
                  <code className="text-emerald-300 block bg-black/40 p-2 rounded">
                    collection(db, "pricing_tables") // DocIds: in_ep_mika, go_lua_dong_khung, mika_pho_thong, hd_guong_sieu_bong, anh_4k
                  </code>
                  <p className="text-[11px] text-neutral-400 font-sans mt-1">Phục vụ lấy dữ liệu riêng từng bảng khi tính tiền cho khách hàng.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-500 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Firebase Security: lab-f7f0a.firebaseapp.com</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
            >
              Đóng Window
            </button>
            <button
              onClick={handleStartSync}
              disabled={isSyncing}
              className="px-4 py-2 text-xs font-bold text-white bg-[#1C1917] hover:bg-black rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CloudUpload className="w-3.5 h-3.5 text-[#E7C184]" />
              <span>Đồng Bộ Ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

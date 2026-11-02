import React, { useState, useEffect } from 'react';
import { 
  useMasterCatalog, 
  saveCatalog, 
  resetCatalogToDefault,
  syncFreelanceTierFromStudio,
  syncRetailTierFromStudio,
  switchActiveTier,
  addCustomMaterial,
  deleteCustomMaterial,
  addSizeToMaterial,
  deleteSizeFromMaterial,
  updateRetailPriceCell,
  updateRetailPassportPrice,
  addRetailSizeRow,
  deleteRetailSizeRow,
  defaultRetailPricingData,
  defaultRetailPassportData,
  getTableColumnConfigs,
  addColumnToTable,
  reorderTableColumns,
  deleteColumnFromTable
} from '../services/adminStore';
import { 
  syncCatalogToFirestore
} from '../services/catalogSync';
import { 
  PricingMaterialType, 
  AudienceTierId, 
  CustomMaterialDef,
  RetailPriceRow,
  TableColumnConfig
} from '../types/admin';
import {
  FRAMES,
  FrameConstantItem,
  getFrameImageUrl,
  handleFrameImageError,
  sanitizeFramePathForFirestore
} from '../constants/frames';
import { generateCellSku, generateRetailCellSku, normalizeSize } from '../utils/skuGenerator';
import { 
  Settings, 
  Layers, 
  Image as ImageIcon, 
  CloudUpload, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw, 
  Database, 
  Sliders, 
  Tag,
  Zap,
  Users,
  Building2,
  UserCheck,
  ShoppingBag,
  Copy,
  Link2,
  MessageCircle,
  GripVertical
} from 'lucide-react';

const PRODUCTION_URL = "https://bao-gia194.vercel.app";

const TIER_TOKEN_URLS: Record<AudienceTierId, string> = {
  studio: `${PRODUCTION_URL}/?token=b2b_st99x`,
  freelance: `${PRODUCTION_URL}/?token=pro_f88y`,
  retail: `${PRODUCTION_URL}/?token=rt_k77z`,
};

interface AdminPricingManagerProps {
  onExitAdmin: (previewTier?: AudienceTierId) => void;
}

export const AdminPricingManager: React.FC<AdminPricingManagerProps> = ({ onExitAdmin }) => {
  const catalog = useMasterCatalog();
  const [activeTab, setActiveTab] = useState<'pricing' | 'frames' | 'cloud'>('pricing');
  const [selectedMaterial, setSelectedMaterial] = useState<PricingMaterialType>('go-lua');
  // Always default to Studio tier when opening Admin
  const [currentTier, setCurrentTier] = useState<AudienceTierId>('studio');

  // Cloud Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState('');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; timestamp?: string } | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-app confirm dialog state to reliably replace window.confirm in iframes
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Modal states for Frames
  const [editingFrame, setEditingFrame] = useState<FrameConstantItem | null>(null);
  const [isAddingFrame, setIsAddingFrame] = useState(false);

  // Modal states for Custom Material
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatBoVienPrefix, setNewMatBoVienPrefix] = useState('');
  const [newMatKhungPrefix, setNewMatKhungPrefix] = useState('');
  const [newMatType, setNewMatType] = useState<'dong-khung' | 'in-ep' | 'album'>('dong-khung');
  const [newMatTiers, setNewMatTiers] = useState<AudienceTierId[]>(['studio', 'freelance', 'retail']);

  // Modal states for Add Size
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newSizeTiers, setNewSizeTiers] = useState<AudienceTierId[]>(['studio', 'freelance', 'retail']);

  // Modal states & handlers for Retail Single Table
  const [isAddingRetailSize, setIsAddingRetailSize] = useState(false);
  const [newRetailSizeInput, setNewRetailSizeInput] = useState('');

  const handleRetailPriceChange = (rowIndex: number, field: string, value: any) => {
    const numVal = value === '' || value === null ? null : Number(value);
    updateRetailPriceCell(rowIndex, field, numVal);
  };

  const handleRetailPassportChange = (rowIndex: number, value: any) => {
    const numVal = value === '' || value === null ? null : Number(value);
    updateRetailPassportPrice(rowIndex, numVal);
  };

  const handleAddRetailSize = () => {
    if (!newRetailSizeInput.trim()) return;
    addRetailSizeRow(newRetailSizeInput);
    setIsAddingRetailSize(false);
    setNewRetailSizeInput('');
    showToast(`Đã thêm kích thước [${newRetailSizeInput}] vào Bảng Giá Khách Lẻ!`);
  };

  const handleDeleteRetailSizeRow = (rowIndex: number, sizeStr: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa kích thước Khách Lẻ',
      message: `Bạn có chắc chắn muốn xóa kích thước [${sizeStr}] khỏi Bảng Giá Khách Lẻ?`,
      confirmText: 'Xác nhận xóa',
      onConfirm: () => {
        deleteRetailSizeRow(rowIndex);
        showToast(`Đã xóa kích thước ${sizeStr} khỏi Bảng Giá Khách Lẻ.`);
      }
    });
  };

  // Dynamic Columns & Drag-and-Drop state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColLabel, setNewColLabel] = useState('');
  const [newColSkuPrefix, setNewColSkuPrefix] = useState('');
  const [colTargetTable, setColTargetTable] = useState('retail');
  const [colTargetTiers, setColTargetTiers] = useState<AudienceTierId[]>(['studio']);
  const [colTargetMaterials, setColTargetMaterials] = useState<string[]>(['go-lua']);

  // State for Delete Column Modal (asking which pricing table(s) to remove the column from)
  const [deletingColumnInfo, setDeletingColumnInfo] = useState<{
    sourceTableKey: string;
    columnKey: string;
    columnLabel: string;
    columnSkuPrefix?: string;
  } | null>(null);
  const [delColTiers, setDelColTiers] = useState<AudienceTierId[]>(['studio']);
  const [delColMaterials, setDelColMaterials] = useState<string[]>(['go-lua']);

  // Drag and Drop State for middle column reordering
  const [draggedColIdx, setDraggedColIdx] = useState<number | null>(null);
  const [dragOverColIdx, setDragOverColIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    setDraggedColIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColIdx !== index) {
      setDragOverColIdx(index);
    }
  };

  const handleDropColumn = (targetIndex: number, tableKey: string) => {
    if (draggedColIdx === null || draggedColIdx === targetIndex) {
      setDraggedColIdx(null);
      setDragOverColIdx(null);
      return;
    }
    const targetTierForDrop = tableKey === 'retail' ? 'retail' : currentTier;
    const currentCols = [...getTableColumnConfigs(tableKey, targetTierForDrop)];
    const itemToMove = currentCols[draggedColIdx];
    currentCols.splice(draggedColIdx, 1);
    currentCols.splice(targetIndex, 0, itemToMove);
    reorderTableColumns(tableKey, currentCols, targetTierForDrop);
    setDraggedColIdx(null);
    setDragOverColIdx(null);
    showToast(`Đã sắp xếp lại thứ tự cột thành công!`);
  };

  const openAddColumnModal = (defaultTableKey: string) => {
    setColTargetTable(defaultTableKey);
    if (defaultTableKey === 'retail') {
      setColTargetTiers(['retail']);
      setColTargetMaterials(['go-lua']);
    } else {
      setColTargetTiers([currentTier]);
      setColTargetMaterials([defaultTableKey]);
    }
    setNewColLabel('');
    setNewColSkuPrefix('');
    setIsAddingColumn(true);
  };

  const handleAddColumnConfirm = () => {
    if (!newColLabel.trim() || !newColSkuPrefix.trim()) return;
    if (colTargetTiers.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 phân hệ bảng giá áp dụng!');
      return;
    }
    const hasB2BTier = colTargetTiers.includes('studio') || colTargetTiers.includes('freelance');
    if (hasB2BTier && colTargetMaterials.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 bảng giá chất liệu áp dụng!');
      return;
    }

    addColumnToTable(
      colTargetTable,
      newColLabel.trim(),
      newColSkuPrefix.trim(),
      colTargetTiers,
      colTargetMaterials
    );
    setIsAddingColumn(false);
    const addedLabel = newColLabel.trim();
    const tierNames = colTargetTiers.map(t => t === 'studio' ? 'Studio' : t === 'freelance' ? 'Freelance' : 'Khách Lẻ').join(', ');
    setNewColLabel('');
    setNewColSkuPrefix('');
    showToast(`Đã thêm cột [${addedLabel}] vào bảng giá: ${tierNames}!`);
  };

  const handleDeleteColumn = (tableKey: string, columnKey: string, columnLabel: string, columnSkuPrefix?: string) => {
    setDeletingColumnInfo({
      sourceTableKey: tableKey,
      columnKey,
      columnLabel,
      columnSkuPrefix
    });
    if (tableKey === 'retail') {
      setDelColTiers(['retail']);
      setDelColMaterials(['go-lua']);
    } else {
      setDelColTiers([currentTier]);
      setDelColMaterials([tableKey]);
    }
  };

  const handleDeleteColumnConfirm = () => {
    if (!deletingColumnInfo) return;
    if (delColTiers.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 phân hệ bảng giá cần xóa cột!');
      return;
    }
    const hasB2BTier = delColTiers.includes('studio') || delColTiers.includes('freelance');
    if (hasB2BTier && delColMaterials.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 bảng giá chất liệu cần xóa cột!');
      return;
    }

    deleteColumnFromTable(
      deletingColumnInfo.sourceTableKey,
      deletingColumnInfo.columnKey,
      delColTiers,
      delColMaterials,
      deletingColumnInfo.columnSkuPrefix,
      deletingColumnInfo.columnLabel
    );
    const tierNames = delColTiers.map(t => t === 'studio' ? 'Studio' : t === 'freelance' ? 'Freelance' : 'Khách Lẻ').join(', ');
    showToast(`Đã xóa cột [${deletingColumnInfo.columnLabel}] khỏi bảng giá: ${tierNames}.`);
    setDeletingColumnInfo(null);
  };

  // Enforce Studio as default tier on mount
  useEffect(() => {
    setCurrentTier('studio');
    switchActiveTier('studio');
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectTier = (tierId: AudienceTierId) => {
    setCurrentTier(tierId);
    switchActiveTier(tierId);
    showToast(`Đã chuyển sang ${tierId === 'studio' ? 'Bảng Giá Studio (Gốc)' : tierId === 'freelance' ? 'Bảng Giá Freelance (+10%)' : 'Bảng Giá Khách Lẻ'}`);
  };

  const handleAutoSyncFreelance = () => {
    syncFreelanceTierFromStudio();
    showToast("Đã đồng bộ tự động Bảng Giá Freelance = Studio x 1.1 (+10%)!");
  };

  const handleAutoSyncRetail = () => {
    syncRetailTierFromStudio(1.5);
    showToast("Đã tính tự động Bảng Giá Khách Lẻ = Studio x 1.5 (+50%)!");
  };

  const handleCopyTierLink = (tier: AudienceTierId) => {
    const url = TIER_TOKEN_URLS[tier];
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          showToast(`Đã sao chép link ${tier === 'studio' ? 'Studio' : tier === 'freelance' ? 'Freelance' : 'Khách Lẻ'}: ${url}`);
        })
        .catch(() => {
          fallbackCopyText(url, tier);
        });
    } else {
      fallbackCopyText(url, tier);
    }
  };

  const getZaloShareUrlForTier = (tier: AudienceTierId) => {
    const url = TIER_TOKEN_URLS[tier];
    const message = `Gửi anh/chị Biểu Giá Tiệm In 194:\n${url}`;
    const cleanPhone = (catalog.shopInfo?.zaloTho || '0969799194').replace(/\D/g, '');
    return `https://zalo.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const fallbackCopyText = (text: string, tier: AudienceTierId) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(`Đã sao chép link ${tier === 'studio' ? 'Studio' : tier === 'freelance' ? 'Freelance' : 'Khách Lẻ'} thành công!`);
    } catch {
      showToast("Không thể tự động sao chép. Vui lòng copy thủ công!");
    }
    document.body.removeChild(textArea);
  };

  // Get active tier tables
  const tierTables = catalog.tiers?.[currentTier] || catalog.tiers.studio;
  const customMaterials = catalog.customMaterials || [];
  const visibleCustomMaterials = customMaterials.filter(mat => !mat.targetTiers || mat.targetTiers.includes(currentTier));
  const currentCustomDef = customMaterials.find(m => m.id === selectedMaterial);

  // Switch to go-lua if selected custom material is not in current tier
  useEffect(() => {
    if (selectedMaterial.startsWith('custom-')) {
      const isVisible = visibleCustomMaterials.some(m => m.id === selectedMaterial);
      if (!isVisible) {
        setSelectedMaterial('go-lua');
      }
    }
  }, [currentTier, visibleCustomMaterials, selectedMaterial]);

  // --- Handlers for Pricing Edits ---
  const handlePriceChange = (material: PricingMaterialType, rowIndex: number, field: string, value: any) => {
    const updated = { ...catalog };
    const numVal = value === '' || value === null ? null : Number(value);
    const targetTables = updated.tiers[currentTier];

    if (material === 'in-ep-mika') {
      targetTables.inEpMika[rowIndex] = { ...targetTables.inEpMika[rowIndex], [field]: numVal };
    } else if (material === 'go-lua') {
      targetTables.goLua[rowIndex] = { ...targetTables.goLua[rowIndex], [field]: numVal };
    } else if (material === 'mika-pho-thong') {
      targetTables.mikaPhoThong[rowIndex] = { ...targetTables.mikaPhoThong[rowIndex], [field]: numVal };
    } else if (material === 'hd-guong-sieu-bong') {
      targetTables.hdGuongSieuBong[rowIndex] = { ...targetTables.hdGuongSieuBong[rowIndex], [field]: numVal };
    } else if (material === 'anh-4k') {
      targetTables.anh4K[rowIndex] = { ...targetTables.anh4K[rowIndex], [field]: numVal };
    } else if (material === 'hd-pro') {
      targetTables.hdPro[rowIndex] = { ...targetTables.hdPro[rowIndex], [field]: numVal };
    } else if (material === 'album-mo-phang') {
      targetTables.albumMoPhang[rowIndex] = { ...targetTables.albumMoPhang[rowIndex], [field]: numVal };
    } else {
      if (!targetTables.customTables) targetTables.customTables = {};
      if (!targetTables.customTables[material]) targetTables.customTables[material] = [];
      targetTables.customTables[material][rowIndex] = {
        ...targetTables.customTables[material][rowIndex],
        [field]: numVal
      };
    }

    saveCatalog(updated);
    showToast("Đã lưu thay đổi giá!");
  };

  // --- Handlers for Custom Materials & Dynamic Sizes ---
  const handleCreateCustomMaterial = () => {
    if (!newMatName.trim() || !newMatBoVienPrefix.trim()) {
      showToast("Vui lòng nhập Tên chất liệu và Tiền tố SKU Bo Viền!");
      return;
    }
    if (newMatTiers.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 bảng giá áp dụng!");
      return;
    }
    const slug = newMatName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const newMaterial: CustomMaterialDef = {
      id: `custom-${slug}-${Date.now()}`,
      name: newMatName.trim(),
      boVienPrefix: newMatBoVienPrefix.trim().toUpperCase(),
      khungPrefix: (newMatKhungPrefix.trim() || newMatBoVienPrefix.trim()).toUpperCase(),
      type: newMatType,
      isCustom: true,
      targetTiers: newMatTiers
    };

    addCustomMaterial(newMaterial, newMatTiers);
    if (newMatTiers.includes(currentTier)) {
      setSelectedMaterial(newMaterial.id);
    }
    setIsAddingMaterial(false);
    setNewMatName('');
    setNewMatBoVienPrefix('');
    setNewMatKhungPrefix('');
    setNewMatTiers(['studio', 'freelance', 'retail']);
    showToast(`Đã thêm chất liệu mới: ${newMaterial.name}`);
  };

  const handleDeleteCustomMaterial = (matId: string) => {
    const matObj = customMaterials.find(m => m.id === matId);
    if (!matObj) return;
    const tierName = currentTier === 'studio' ? 'Studio (Gốc)' : currentTier === 'freelance' ? 'Freelance (+10%)' : 'Khách Lẻ';

    setConfirmDialog({
      isOpen: true,
      title: 'Xóa chất liệu tùy chỉnh',
      message: `Bạn có chắc muốn xóa chất liệu [${matObj.name}] khỏi bảng giá [${tierName}]? Thao tác này CHỈ xóa ở phân hệ [${tierName}], các phân hệ khác hoàn toàn không bị ảnh hưởng.`,
      confirmText: 'Xác nhận xóa',
      onConfirm: () => {
        deleteCustomMaterial(matId, currentTier);
        setSelectedMaterial('go-lua');
        showToast(`Đã xóa chất liệu [${matObj.name}] khỏi bảng ${tierName}`);
      }
    });
  };

  const handleAddNewSize = () => {
    if (!newSizeInput.trim()) {
      showToast("Vui lòng nhập kích thước mới (ví dụ: 45x60)!");
      return;
    }
    if (newSizeTiers.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 bảng giá áp dụng!");
      return;
    }
    const normalized = normalizeSize(newSizeInput);
    addSizeToMaterial(selectedMaterial, normalized, newSizeTiers);
    setIsAddingSize(false);
    setNewSizeInput('');
    setNewSizeTiers(['studio', 'freelance', 'retail']);
    showToast(`Đã thêm kích thước [${normalized}] vào các bảng giá đã chọn!`);
  };

  const handleDeleteSizeRow = (rowIndex: number, sizeStr: string) => {
    const tierName = currentTier === 'studio' ? 'Studio (Gốc)' : currentTier === 'freelance' ? 'Freelance (+10%)' : 'Khách Lẻ';

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa kích thước',
      message: `Bạn có chắc muốn xóa kích thước [${sizeStr}] khỏi bảng giá [${tierName}]? Thao tác này CHỈ xóa ở phân hệ [${tierName}], các phân hệ khác hoàn toàn không bị ảnh hưởng.`,
      confirmText: 'Xác nhận xóa',
      onConfirm: () => {
        deleteSizeFromMaterial(selectedMaterial, rowIndex, currentTier);
        showToast(`Đã xóa kích thước ${sizeStr} khỏi bảng ${tierName}`);
      }
    });
  };

  // --- Handlers for Frame Edits ---
  const [adminFrameVariantIdx, setAdminFrameVariantIdx] = useState<Record<string, number>>({});

  const handleSaveFrame = (frame: FrameConstantItem) => {
    const cleanPrimaryUrl = sanitizeFramePathForFirestore(frame.imageUrl || frame.image);
    const sanitizedFrame: FrameConstantItem = {
      ...frame,
      imageUrl: cleanPrimaryUrl,
      image: cleanPrimaryUrl,
      images: Array.isArray(frame.images) && frame.images.length > 0
        ? frame.images.map((img) => ({
            ...img,
            url: sanitizeFramePathForFirestore(img.url, cleanPrimaryUrl)
          }))
        : [{ name: frame.name, url: cleanPrimaryUrl }]
    };

    const updated = { ...catalog };
    const idx = updated.frames.findIndex(f => f.id === sanitizedFrame.id || f.code === sanitizedFrame.code);
    if (idx >= 0) {
      updated.frames[idx] = sanitizedFrame;
    } else {
      updated.frames.push(sanitizedFrame);
    }
    saveCatalog(updated);
    setEditingFrame(null);
    setIsAddingFrame(false);
    showToast(`Đã lưu thông số mẫu khung ${sanitizedFrame.code}!`);
  };

  const handleDeleteFrame = (frameId: string) => {
    const frame = catalog.frames.find(f => f.id === frameId || f.code === frameId);
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa mẫu khung',
      message: `Bạn có chắc chắn muốn xóa mẫu khung [${frame?.code || frameId} - ${frame?.name || ''}] khỏi danh mục Master?`,
      confirmText: 'Xác nhận xóa',
      onConfirm: () => {
        const updated = { ...catalog };
        updated.frames = updated.frames.filter(f => f.id !== frameId && f.code !== frameId);
        saveCatalog(updated);
        showToast("Đã xóa mẫu khung.");
      }
    });
  };

  // --- Handlers for Backup JSON Export / Import ---
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(catalog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BaoGia194_MasterCatalog_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Đã xuất file JSON sao lưu thành công!");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && (parsed.inEpMika || parsed.frames)) {
            saveCatalog(parsed);
            showToast("Đã nhập dữ liệu thành công từ file JSON!");
          } else {
            alert("File JSON không đúng định dạng Master Catalog Tiệm In 194!");
          }
        } catch (error) {
          alert("Lỗi đọc file JSON. Vui lòng kiểm tra lại cấu trúc file!");
        }
      };
    }
  };

  const handleResetDefaults = () => {
    if (confirm("XÁC NHẬN KHÔI PHỤC: Toàn bộ dữ liệu bảng giá và mẫu khung sẽ trở về mặc định ban đầu. Bạn có chắc chắn không?")) {
      resetCatalogToDefault();
      showToast("Đã khôi phục dữ liệu về mặc định ban đầu!");
    }
  };

  // --- Cloud Sync Execution ---
  const handleTriggerCloudSync = async () => {
    setIsSyncing(true);
    setSyncLogs([]);
    setSyncResult(null);
    setSyncStep("Khởi tạo tiến trình đẩy dữ liệu Master Catalog lên Cloud Firestore...");

    const res = await syncCatalogToFirestore((step) => {
      setSyncStep(step);
      setSyncLogs(prev => [...prev, `${new Date().toLocaleTimeString('vi-VN')}: ${step}`]);
    });

    setIsSyncing(false);
    setSyncResult(res);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans antialiased selection:bg-[#E7C184] selection:text-[#1C1917]">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#E7C184] text-[#1C1917] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-[#1C1917]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Quản Trị Master Catalog */}
      <header className="sticky top-0 z-40 bg-[#141211] border-b border-neutral-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E7C184] to-[#C09B59] p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-[#1C1917] rounded-[10px] flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#E7C184]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-display text-base sm:text-lg font-bold text-white tracking-tight">
                ⚙️ Quản Trị Master Catalog 194
              </h1>
              <span className="text-[10px] font-mono uppercase bg-[#E7C184]/20 text-[#E7C184] font-extrabold px-2 py-0.5 rounded border border-[#E7C184]/30">
                {7 + customMaterials.length} DÒNG · 3 PHÂN HỆ
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Quản lý toàn bộ chất liệu, kích thước & mã SKU định danh trước khi đồng bộ Cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onExitAdmin(currentTier)}
            className="px-3.5 py-2 text-xs font-bold text-neutral-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-4 h-4 text-neutral-400" />
            <span className="hidden sm:inline">✕ Thoát Chế Độ Admin</span>
            <span className="sm:hidden">Thoát</span>
          </button>
        </div>
      </header>

      {/* 2. Top Navigation Tabs (3 Main Admin Tabs) */}
      <div className="bg-[#1C1917] border-b border-neutral-800 px-4 sm:px-8 pt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'pricing'
                ? 'border-[#E7C184] text-[#E7C184] bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Bảng Giá {7 + customMaterials.length} Dòng Sản Phẩm</span>
          </button>

          <button
            onClick={() => setActiveTab('frames')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'frames'
                ? 'border-[#E7C184] text-[#E7C184] bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>2. Danh Mục Mẫu Khung ({catalog.frames.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'cloud'
                ? 'border-[#E7C184] text-[#E7C184] bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            <span>3. Trung Tâm Đồng Bộ Cloud Firestore</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pb-2 font-mono text-[11px] text-neutral-400">
          <span>Lần cập nhật cuối:</span>
          <span className="text-[#E7C184] font-semibold">{new Date(catalog.lastUpdated).toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>

      {/* Main Admin View Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">

        {/* TAB 1: BẢNG GIÁ DÒNG SẢN PHẨM & 3 PHÂN HỆ GIÁ */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">

            {/* 🔗 TIỆN ÍCH SAO CHÉP ĐƯỜNG LINK BẢNG GIÁ THEO TỆP KHÁCH HÀNG */}
            <div className="bg-[#181615] border border-[#E7C184]/40 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E7C184]/15 border border-[#E7C184]/40 flex items-center justify-center text-[#E7C184]">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🔗 ĐƯỜNG LINK GỬI BÁO GIÁ CHO TỪNG TỆP KHÁCH HÀNG</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Gửi link tương ứng cho từng đối tượng. Khách truy cập sẽ bị khóa cố định vào bảng giá đó (không chuyển đổi hay xem lén được giá sỉ khác).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Link Studio */}
                <div className="bg-neutral-900/90 border border-neutral-800 hover:border-[#E7C184]/50 rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#E7C184]">
                      <Building2 className="w-4 h-4" />
                      <span>1. Link Dành Cho Studio</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E7C184]/15 text-[#E7C184] font-mono font-bold">GIÁ GỐC</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-300 truncate bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800 select-all" title={TIER_TOKEN_URLS.studio}>
                    {TIER_TOKEN_URLS.studio}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleCopyTierLink('studio')}
                      className="py-2 px-2 bg-[#E7C184] hover:bg-[#d8b06e] active:scale-[0.99] text-neutral-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>Sao Chép</span>
                    </button>
                    <a
                      href={getZaloShareUrlForTier('studio')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyTierLink('studio')}
                      className="py-2 px-2 bg-[#0068FF] hover:bg-[#0052cc] active:scale-[0.99] text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Gửi Zalo</span>
                    </a>
                    <button
                      onClick={() => onExitAdmin('studio')}
                      className="py-2 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-lg border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Mở xem thử giao diện Bảng giá Studio"
                    >
                      <span>👁️ Xem Thử</span>
                    </button>
                  </div>
                </div>

                {/* 2. Link Freelance */}
                <div className="bg-neutral-900/90 border border-neutral-800 hover:border-[#E7C184]/50 rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#E7C184]">
                      <UserCheck className="w-4 h-4" />
                      <span>2. Link Dành Cho Freelance</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono font-bold">+10%</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-300 truncate bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800 select-all" title={TIER_TOKEN_URLS.freelance}>
                    {TIER_TOKEN_URLS.freelance}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleCopyTierLink('freelance')}
                      className="py-2 px-2 bg-[#E7C184] hover:bg-[#d8b06e] active:scale-[0.99] text-neutral-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>Sao Chép</span>
                    </button>
                    <a
                      href={getZaloShareUrlForTier('freelance')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyTierLink('freelance')}
                      className="py-2 px-2 bg-[#0068FF] hover:bg-[#0052cc] active:scale-[0.99] text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Gửi Zalo</span>
                    </a>
                    <button
                      onClick={() => onExitAdmin('freelance')}
                      className="py-2 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-lg border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Mở xem thử giao diện Bảng giá Freelance"
                    >
                      <span>👁️ Xem Thử</span>
                    </button>
                  </div>
                </div>

                {/* 3. Link Khách Lẻ */}
                <div className="bg-neutral-900/90 border border-neutral-800 hover:border-[#E7C184]/50 rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#E7C184]">
                      <ShoppingBag className="w-4 h-4" />
                      <span>3. Link Dành Cho Khách Lẻ</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono font-bold">NIÊM YẾT</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-300 truncate bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800 select-all" title={TIER_TOKEN_URLS.retail}>
                    {TIER_TOKEN_URLS.retail}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleCopyTierLink('retail')}
                      className="py-2 px-2 bg-[#E7C184] hover:bg-[#d8b06e] active:scale-[0.99] text-neutral-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>Sao Chép</span>
                    </button>
                    <a
                      href={getZaloShareUrlForTier('retail')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyTierLink('retail')}
                      className="py-2 px-2 bg-[#0068FF] hover:bg-[#0052cc] active:scale-[0.99] text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Gửi Zalo</span>
                    </a>
                    <button
                      onClick={() => onExitAdmin('retail')}
                      className="py-2 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-lg border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Mở xem thử giao diện Bảng giá Khách Lẻ"
                    >
                      <span>👁️ Xem Thử</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Tier Switcher (Studio, Freelance, Khách Lẻ) */}
            <div className="p-4 bg-gradient-to-r from-[#1A1816] via-[#24201D] to-[#1A1816] border border-[#E7C184]/40 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#E7C184] font-extrabold tracking-wider block">
                  PHÂN HỆ BẢNG GIÁ DÀNH CHO ĐỐI TƯỢNG:
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E7C184]" />
                  <span>
                    {currentTier === 'studio' ? '1. BẢNG GIÁ STUDIO (GỐC)' :
                     currentTier === 'freelance' ? '2. BẢNG GIÁ FREELANCE (+10%)' :
                     '3. BẢNG GIÁ KHÁCH LẺ (DỊCH VỤ)'}
                  </span>
                </h2>
              </div>

              {/* Tier Toggle Buttons */}
              <div className="flex flex-wrap items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                <button
                  onClick={() => handleSelectTier('studio')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTier === 'studio'
                      ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>1. Studio (Gốc)</span>
                </button>

                <button
                  onClick={() => handleSelectTier('freelance')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTier === 'freelance'
                      ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>2. Freelance (+10%)</span>
                </button>

                <button
                  onClick={() => handleSelectTier('retail')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTier === 'retail'
                      ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>3. Khách Lẻ</span>
                </button>
              </div>

              {/* Tier Auto Sync Tools */}
              {currentTier === 'freelance' && (
                <button
                  onClick={handleAutoSyncFreelance}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Zap className="w-4 h-4 text-neutral-950 fill-neutral-950" />
                  <span>⚡ Đồng bộ tự động từ Bảng Studio (+10%)</span>
                </button>
              )}

              {currentTier === 'retail' && (
                <button
                  onClick={handleAutoSyncRetail}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Zap className="w-4 h-4 text-neutral-950 fill-neutral-950" />
                  <span>⚡ Đồng bộ tự động Khách Lẻ (+50% từ Studio)</span>
                </button>
              )}
            </div>
            
            {/* Product Line Selector (Standard 7 + Custom Materials) - Only for Studio & Freelance */}
            {currentTier !== 'retail' && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#1C1917] rounded-xl border border-neutral-800">
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => setSelectedMaterial('go-lua')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedMaterial === 'go-lua'
                        ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    1. Gỗ Lụa Đóng Khung
                  </button>

                  <button
                    onClick={() => setSelectedMaterial('hd-guong-sieu-bong')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedMaterial === 'hd-guong-sieu-bong'
                        ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    2. HD Gương Siêu Bóng
                  </button>

                  <button
                    onClick={() => setSelectedMaterial('mika-pho-thong')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedMaterial === 'mika-pho-thong'
                        ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    3. Mika Phổ Thông
                  </button>

                  <button
                    onClick={() => setSelectedMaterial('in-ep-mika')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedMaterial === 'in-ep-mika'
                        ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    4. In Ép Mika
                  </button>

                  <button
                    onClick={() => setSelectedMaterial('anh-4k')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedMaterial === 'anh-4k'
                        ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    5. Bảng Giá Ảnh 4K
                  </button>

                  <button
                    onClick={() => setSelectedMaterial('hd-pro')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedMaterial === 'hd-pro'
                        ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    6. HD PRO Khung Cao Cấp
                  </button>

                  <button
                    onClick={() => setSelectedMaterial('album-mo-phang')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedMaterial === 'album-mo-phang'
                        ? 'bg-[#E7C184] text-[#1C1917] shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    7. Album Mở Phẳng
                  </button>

                  {/* Render Custom Materials Tabs (Only active for current tier) */}
                  {visibleCustomMaterials.map((mat, i) => (
                    <button
                      key={mat.id}
                      onClick={() => setSelectedMaterial(mat.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        selectedMaterial === mat.id
                          ? 'bg-amber-400 text-neutral-950 shadow-md'
                          : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                      }`}
                    >
                      <span>{8 + i}. {mat.name}</span>
                      <span className="text-[10px] opacity-75">({mat.boVienPrefix})</span>
                    </button>
                  ))}
                </div>

                {/* Add Custom Material Action */}
                <button
                  onClick={() => setIsAddingMaterial(true)}
                  className="px-3 py-2 bg-[#E7C184] hover:bg-[#D4AF37] text-[#1C1917] font-bold text-xs rounded-lg shadow transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#1C1917]" />
                  <span>+ Thêm Chất Liệu Mới</span>
                </button>
              </div>
            )}

            {/* RETAIL SINGLE TABLE VIEW vs B2B MULTI-MATERIAL TABLES */}
            {currentTier === 'retail' ? (
              <div className="space-y-6">

                {/* 1. DỊCH VỤ ẢNH THẺ (3x4 & 4x6) */}
                <div className="bg-[#1C1917] p-5 rounded-xl border border-neutral-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#E7C184]" />
                        <span>📸 DỊCH VỤ CHỤP & IN ẢNH THẺ (3x4 & 4x6)</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Biểu giá chụp, chỉnh sửa & in ảnh thẻ lấy ngay.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-1 rounded border border-emerald-500/30">
                      BIỂU GIÁ NIÊM YẾT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(catalog.retailPassports || defaultRetailPassportData).map((pass, pIdx) => {
                      const codeStr = pass.code || pass.size;
                      const sku = `ATKL${normalizeSize(codeStr)}`;
                      const displayName = pass.name || `Chụp & In Ảnh Thẻ ${pass.size}`;
                      return (
                        <div key={codeStr} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-sm text-white">{displayName}</div>
                            <div className="text-[11px] font-mono text-[#94a3b8] mt-0.5 select-all">
                              MÃ SKU: <span className="font-bold text-[#E7C184]">{sku}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={pass.price ?? ''}
                              onChange={(e) => handleRetailPassportChange(pIdx, e.target.value)}
                              className="w-28 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-[#E7C184] text-right"
                            />
                            <span className="text-xs font-bold text-neutral-400">đ</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. BIỂU GIÁ IN ẢNH & ĐÓNG KHUNG HOÀN THIỆN */}
                <div className="bg-[#1C1917] p-4 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#E7C184]" />
                      <span>🖼️ BIỂU GIÁ IN ẢNH & ĐÓNG KHUNG HOÀN THIỆN</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Biểu giá trọn gói bao gồm in ảnh chất lượng cao và đóng khung hoàn thiện (Kéo thả tiêu đề cột để đổi vị trí).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddColumnModal('retail')}
                      className="px-3.5 py-2 bg-[#E7C184] hover:bg-[#d8b06e] text-neutral-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4 text-neutral-950" />
                      <span>+ Thêm Cột Khung/Chất Liệu</span>
                    </button>

                    <button
                      onClick={() => setIsAddingRetailSize(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>+ Thêm Kích Thước Mới</span>
                    </button>
                  </div>
                </div>

                {/* SINGLE RETAIL TABLE (DYNAMIC DRAGGABLE COLUMNS) */}
                {(() => {
                  const retailCols = getTableColumnConfigs('retail', 'retail');

                  return (
                    <div className="bg-[#1C1917] rounded-xl border border-neutral-800 overflow-x-auto shadow-2xl">
                      <table className="w-full text-left text-xs text-neutral-300 min-w-[1050px]">
                        <thead className="bg-[#141211] text-[#E7C184] font-mono uppercase text-[11px] border-b border-neutral-800">
                          <tr>
                            {/* 1. STT - KHÓA CỐ ĐỊNH, KHÔNG KÉO THẢ */}
                            <th className="p-3 w-12 text-center select-none text-neutral-400">
                              STT
                            </th>

                            {/* 2. KÍCH THƯỚC - KHÓA CỐ ĐỊNH, KHÔNG KÉO THẢ */}
                            <th className="p-3 select-none text-neutral-400 min-w-[110px]">
                              KÍCH THƯỚC
                            </th>

                            {/* CÁC CỘT GIÁ Ở GIỮA - CHO PHÉP KÉO THẢ ĐỔI CHỖ & XÓA */}
                            {retailCols.map((col, cIdx) => {
                              const isDragging = draggedColIdx === cIdx;
                              const isOver = dragOverColIdx === cIdx;

                              return (
                                <th
                                  key={col.key}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, cIdx)}
                                  onDragOver={(e) => handleDragOver(e, cIdx)}
                                  onDragLeave={() => { if (dragOverColIdx === cIdx) setDragOverColIdx(null); }}
                                  onDrop={() => handleDropColumn(cIdx, 'retail')}
                                  className={`p-3 select-none transition-all cursor-grab active:cursor-grabbing border-r border-neutral-800/60 relative group ${
                                    isDragging ? 'opacity-30 bg-[#E7C184]/10' : ''
                                  } ${
                                    isOver ? 'bg-[#E7C184]/20 border-l-2 border-l-[#E7C184]' : 'hover:bg-white/5'
                                  }`}
                                  title="Kéo thả tiêu đề cột để thay đổi thứ tự"
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <GripVertical className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#E7C184] transition-colors shrink-0" />
                                      <span className="font-bold text-white whitespace-nowrap">{col.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {col.skuPrefix && (
                                        <span className="text-[9px] px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                                          {col.skuPrefix}
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColumn('retail', col.key, col.label, col.skuPrefix);
                                        }}
                                        className="p-1 hover:text-rose-400 hover:bg-rose-500/20 rounded text-neutral-400 transition-colors cursor-pointer"
                                        title="Xóa cột khung này"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </th>
                              );
                            })}

                            {/* 3. THAO TÁC - KHÓA CỐ ĐỊNH, KHÔNG KÉO THẢ */}
                            <th className="p-3 text-center w-16 select-none text-neutral-400">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {(catalog.retailTable || defaultRetailPricingData).map((row, rIdx) => {
                            const normSize = normalizeSize(row.size);

                            return (
                              <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 text-center font-mono text-neutral-500 align-top pt-4">{rIdx + 1}</td>
                                <td className="p-3 font-bold text-white font-mono text-sm align-top pt-3.5">{normSize}</td>
                                
                                {retailCols.map((col) => {
                                  const val = row[col.key];
                                  const isEmpty = val === null || val === undefined;
                                  const sku = generateRetailCellSku(normSize, col.key, col.skuPrefix);
                                  const colorClass = col.defaultColor || (col.isCustom ? 'text-amber-300 font-bold' : 'text-neutral-200');

                                  return (
                                    <td key={col.key} className="p-2.5 align-top">
                                      <div className="space-y-1">
                                        <input
                                          type="number"
                                          value={val ?? ''}
                                          placeholder="-"
                                          onChange={(e) => handleRetailPriceChange(rIdx, col.key, e.target.value)}
                                          className={`w-32 bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs font-mono ${colorClass} focus:outline-none focus:border-[#E7C184]`}
                                        />
                                        <div className={`text-[10px] font-mono select-all ${isEmpty ? 'text-[#94a3b8]/40' : 'text-[#94a3b8]'}`}>
                                          SKU: {sku}
                                        </div>
                                      </div>
                                    </td>
                                  );
                                })}

                                <td className="p-3 text-center align-top pt-3.5">
                                  <button
                                    onClick={() => handleDeleteRetailSizeRow(rIdx, normSize)}
                                    className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                                    title="Xóa kích thước khỏi bảng Khách Lẻ"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

              </div>
            ) : (
              /* STANDARD B2B TABLES FOR STUDIO & FREELANCE TIERS */
              <>
                {/* Table Header & Size Action Toolbar */}
                <div className="bg-[#1C1917] p-4 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#E7C184]" />
                      <span>
                        Biểu Giá - {
                          currentCustomDef ? currentCustomDef.name :
                          selectedMaterial === 'go-lua' ? 'Gỗ Lụa Đóng Khung' :
                          selectedMaterial === 'hd-guong-sieu-bong' ? 'HD Gương Siêu Bóng' :
                          selectedMaterial === 'mika-pho-thong' ? 'Mika Phổ Thông' :
                          selectedMaterial === 'in-ep-mika' ? 'In Ép Mika' :
                          selectedMaterial === 'anh-4k' ? 'Ảnh 4K Cao Cấp' :
                          selectedMaterial === 'hd-pro' ? 'HD PRO Khung Cao Cấp' : 'Album Mở Phẳng'
                        }
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Mã SKU định danh tự động hiển thị bên dưới từng ô giá ({currentTier === 'studio' ? 'ST' : 'FL'}).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedMaterial !== 'album-mo-phang' && (!currentCustomDef || currentCustomDef.type === 'dong-khung') && (
                      <button
                        onClick={() => openAddColumnModal(selectedMaterial)}
                        className="px-3 py-2 bg-[#E7C184] hover:bg-[#d8b06e] text-neutral-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-4 h-4 text-neutral-950" />
                        <span>+ Thêm Cột Khung/Chất Liệu</span>
                      </button>
                    )}

                    <button
                      onClick={() => setIsAddingSize(true)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>+ Thêm Kích Thước</span>
                    </button>

                    {currentCustomDef && (
                      <button
                        onClick={() => handleDeleteCustomMaterial(currentCustomDef.id)}
                        className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900/90 text-rose-200 border border-rose-800/80 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <span>🗑️ Xóa Chất Liệu Này</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid / Editable Pricing Table for All Lines & Custom Materials */}
                <div className="bg-[#1C1917] rounded-xl border border-neutral-800 overflow-x-auto shadow-2xl">
                  
                  {/* 1. IN ÉP MIKA */}
                  {selectedMaterial === 'in-ep-mika' && (() => {
                    const currentCols = getTableColumnConfigs('in-ep-mika', currentTier);
                    return (
                      <table className="w-full text-left text-xs text-neutral-300">
                        <thead className="bg-[#141211] text-[#E7C184] font-mono uppercase text-[11px] border-b border-neutral-800">
                          <tr>
                            <th className="p-3 select-none text-neutral-400 w-14">STT</th>
                            <th className="p-3 select-none text-neutral-400 min-w-[100px]">Kích Thước</th>
                            {currentCols.map((col, cIdx) => {
                              const isDragging = draggedColIdx === cIdx;
                              const isOver = dragOverColIdx === cIdx;
                              return (
                                <th
                                  key={col.key}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, cIdx)}
                                  onDragOver={(e) => handleDragOver(e, cIdx)}
                                  onDragLeave={() => { if (dragOverColIdx === cIdx) setDragOverColIdx(null); }}
                                  onDrop={() => handleDropColumn(cIdx, 'in-ep-mika')}
                                  className={`p-3 select-none transition-all cursor-grab active:cursor-grabbing border-r border-neutral-800/60 relative group ${
                                    isDragging ? 'opacity-30 bg-[#E7C184]/10' : ''
                                  } ${
                                    isOver ? 'bg-[#E7C184]/20 border-l-2 border-l-[#E7C184]' : 'hover:bg-white/5'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <GripVertical className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#E7C184] transition-colors shrink-0" />
                                      <span className="font-bold text-white whitespace-nowrap">{col.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {col.skuPrefix && (
                                        <span className="text-[9px] px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                                          {col.skuPrefix}
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColumn('in-ep-mika', col.key, col.label, col.skuPrefix);
                                        }}
                                        className="p-1 hover:text-rose-400 hover:bg-rose-500/20 rounded text-neutral-400 transition-colors cursor-pointer"
                                        title="Xóa cột này"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </th>
                              );
                            })}
                            <th className="p-3 text-center w-16 select-none text-neutral-400">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {tierTables.inEpMika.map((row: any, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="p-3 font-mono text-neutral-500">{row.stt}</td>
                              <td className="p-3 font-bold text-white font-mono">{normalizeSize(row.size)}</td>
                              {currentCols.map((col) => {
                                const val = row[col.key];
                                const cellSku = generateCellSku('in-ep-mika', currentTier, row.size, col.key, customMaterials, col.isCustom ? col.skuPrefix : undefined);
                                const colorClass = col.defaultColor || (col.isCustom ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold');
                                return (
                                  <td key={col.key} className="p-3">
                                    <div className="space-y-1">
                                      <input
                                        type="number"
                                        value={val ?? ''}
                                        placeholder="-"
                                        onChange={(e) => handlePriceChange('in-ep-mika', idx, col.key, e.target.value)}
                                        className={`w-36 bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs font-mono ${colorClass} focus:outline-none focus:border-[#E7C184]`}
                                      />
                                      <div className="text-[11px] font-mono text-[#94a3b8] select-all">
                                        SKU: {cellSku}
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleDeleteSizeRow(idx, row.size)}
                                  className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                  title="Xóa kích thước"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* 2, 3, 4, 5, 6. GỖ LỤA, MIKA PHỔ THÔNG, HD GƯƠNG, ẢNH 4K, HD PRO (DYNAMIC DRAGGABLE COLUMNS) */}
                  {(['go-lua', 'mika-pho-thong', 'hd-guong-sieu-bong', 'anh-4k', 'hd-pro'].includes(selectedMaterial)) && (() => {
                    const currentCols = getTableColumnConfigs(selectedMaterial, currentTier);
                    const rowsData =
                      selectedMaterial === 'go-lua' ? tierTables.goLua :
                      selectedMaterial === 'mika-pho-thong' ? tierTables.mikaPhoThong :
                      selectedMaterial === 'hd-guong-sieu-bong' ? tierTables.hdGuongSieuBong :
                      selectedMaterial === 'anh-4k' ? tierTables.anh4K :
                      tierTables.hdPro;

                    return (
                      <table className="w-full text-left text-xs text-neutral-300 min-w-[850px]">
                        <thead className="bg-[#141211] text-[#E7C184] font-mono uppercase text-[11px] border-b border-neutral-800">
                          <tr>
                            {/* Cột 1: KÍCH THƯỚC (Khóa cố định, không kéo thả) */}
                            <th className="p-3 select-none text-neutral-400 min-w-[100px]">Kích Thước</th>

                            {/* Các cột giá ở giữa: Cho phép kéo thả đổi chỗ & xóa */}
                            {currentCols.map((col, cIdx) => {
                              const isDragging = draggedColIdx === cIdx;
                              const isOver = dragOverColIdx === cIdx;

                              return (
                                <th
                                  key={col.key}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, cIdx)}
                                  onDragOver={(e) => handleDragOver(e, cIdx)}
                                  onDragLeave={() => { if (dragOverColIdx === cIdx) setDragOverColIdx(null); }}
                                  onDrop={() => handleDropColumn(cIdx, selectedMaterial)}
                                  className={`p-3 select-none transition-all cursor-grab active:cursor-grabbing border-r border-neutral-800/60 relative group ${
                                    isDragging ? 'opacity-30 bg-[#E7C184]/10' : ''
                                  } ${
                                    isOver ? 'bg-[#E7C184]/20 border-l-2 border-l-[#E7C184]' : 'hover:bg-white/5'
                                  }`}
                                  title="Kéo thả tiêu đề cột để thay đổi thứ tự"
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <GripVertical className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#E7C184] transition-colors shrink-0" />
                                      <span className="font-bold text-white whitespace-nowrap">{col.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {col.skuPrefix && (
                                        <span className="text-[9px] px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                                          {col.skuPrefix}
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColumn(selectedMaterial, col.key, col.label, col.skuPrefix);
                                        }}
                                        className="p-1 hover:text-rose-400 hover:bg-rose-500/20 rounded text-neutral-400 transition-colors cursor-pointer"
                                        title="Xóa cột khung này"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </th>
                              );
                            })}

                            {/* Cột cuối: Xóa (Khóa cố định, không kéo thả) */}
                            <th className="p-3 text-center w-16 select-none text-neutral-400">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {(rowsData || []).map((row: any, idx) => {
                            return (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 font-bold text-white font-mono align-top pt-3.5">{normalizeSize(row.size)}</td>
                                {currentCols.map((col) => {
                                  const val = row[col.key];
                                  const isEmpty = val === null || val === undefined;
                                  const cellSku = generateCellSku(
                                    selectedMaterial,
                                    currentTier,
                                    row.size,
                                    col.key,
                                    customMaterials,
                                    col.isCustom ? col.skuPrefix : undefined
                                  );
                                  const colorClass = col.defaultColor || (col.isCustom ? 'text-amber-300 font-bold' : 'text-neutral-200');

                                  return (
                                    <td key={col.key} className="p-2 align-top">
                                      <div className="space-y-1">
                                        <input
                                          type="number"
                                          value={val ?? ''}
                                          placeholder="-"
                                          onChange={(e) => handlePriceChange(selectedMaterial, idx, col.key, e.target.value)}
                                          className={`w-28 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-[11px] font-mono ${colorClass} focus:outline-none focus:border-[#E7C184]`}
                                        />
                                        <div className={`text-[10px] font-mono select-all leading-tight ${isEmpty ? 'text-[#94a3b8]/45' : 'text-[#94a3b8]'}`}>
                                          SKU: {cellSku}
                                        </div>
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="p-3 text-center align-top pt-3.5">
                                  <button
                                    onClick={() => handleDeleteSizeRow(idx, row.size)}
                                    className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                                    title="Xóa kích thước"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* 7. ALBUM MỞ PHẲNG */}
                  {selectedMaterial === 'album-mo-phang' && (
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-[#141211] text-[#E7C184] font-mono uppercase text-[11px] border-b border-neutral-800">
                        <tr>
                          <th className="p-3">STT</th>
                          <th className="p-3">Kích Thước Album</th>
                          <th className="p-3">Số Tờ Tiêu Chuẩn</th>
                          <th className="p-3">Đơn Giá Hoàn Thiện (VND)</th>
                          <th className="p-3 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {tierTables.albumMoPhang.map((row, idx) => {
                          const skuAlbum = generateCellSku('album-mo-phang', currentTier, row.size, 'price', customMaterials);
                          return (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="p-3 font-mono text-neutral-500">{row.stt}</td>
                              <td className="p-3 font-bold text-white font-mono">{row.size}</td>
                              <td className="p-3 font-mono text-amber-300 font-semibold">{row.sheets} tờ (20 trang)</td>
                              <td className="p-3">
                                <div className="space-y-1">
                                  <input
                                    type="number"
                                    value={row.price ?? ''}
                                    placeholder="-"
                                    onChange={(e) => handlePriceChange('album-mo-phang', idx, 'price', e.target.value)}
                                    className="w-40 bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-[#E7C184]"
                                  />
                                  <div className="text-xs font-mono text-[#94a3b8] select-all">
                                    SKU: {skuAlbum}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleDeleteSizeRow(idx, row.size)}
                                  className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                  title="Xóa kích thước"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {/* DYNAMIC TABLE FOR CUSTOM MATERIALS */}
                  {currentCustomDef && (() => {
                    const customCols = getTableColumnConfigs(currentCustomDef.id, currentTier);
                    return (
                      <table className="w-full text-left text-xs text-neutral-300 min-w-[900px]">
                        <thead className="bg-[#141211] text-[#E7C184] font-mono uppercase text-[11px] border-b border-neutral-800">
                          <tr>
                            <th className="p-3">Kích Thước</th>
                            {currentCustomDef.type === 'dong-khung' ? (
                              customCols.map((col, cIdx) => {
                                const isDragging = draggedColIdx === cIdx;
                                const isOver = dragOverColIdx === cIdx;
                                return (
                                  <th
                                    key={col.key}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, cIdx)}
                                    onDragOver={(e) => handleDragOver(e, cIdx)}
                                    onDragLeave={() => { if (dragOverColIdx === cIdx) setDragOverColIdx(null); }}
                                    onDrop={() => handleDropColumn(cIdx, currentCustomDef.id)}
                                    className={`p-3 select-none transition-all cursor-grab active:cursor-grabbing border-r border-neutral-800/60 relative group ${
                                      isDragging ? 'opacity-30 bg-[#E7C184]/10' : ''
                                    } ${
                                      isOver ? 'bg-[#E7C184]/20 border-l-2 border-l-[#E7C184]' : 'hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1.5">
                                      <div className="flex items-center gap-1">
                                        <GripVertical className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#E7C184] transition-colors shrink-0" />
                                        <span className="font-bold text-white whitespace-nowrap">{col.label}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColumn(currentCustomDef.id, col.key, col.label, col.skuPrefix);
                                        }}
                                        className="p-1 hover:text-rose-400 hover:bg-rose-500/20 rounded text-neutral-400 transition-colors cursor-pointer"
                                        title="Xóa cột khung này"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </th>
                                );
                              })
                            ) : (
                              <th className="p-3">Đơn Giá Hoàn Thiện (VND)</th>
                            )}
                            <th className="p-3 text-center">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {(tierTables.customTables?.[currentCustomDef.id] || []).map((row, idx) => {
                            if (currentCustomDef.type === 'dong-khung') {
                              return (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-bold text-white font-mono align-top pt-3.5">{normalizeSize(row.size)}</td>
                                  {customCols.map(col => {
                                    const f = col.key;
                                    const cellSku = generateCellSku(currentCustomDef.id, currentTier, row.size, f, customMaterials, col.isCustom ? col.skuPrefix : undefined);
                                    return (
                                      <td key={f} className="p-2 align-top">
                                        <div className="space-y-1">
                                          <input
                                            type="number"
                                            value={row[f] ?? ''}
                                            placeholder="-"
                                            onChange={(e) => handlePriceChange(currentCustomDef.id, idx, f, e.target.value)}
                                            className="w-24 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-[11px] font-mono text-emerald-400 focus:outline-none focus:border-[#E7C184]"
                                          />
                                          <div className="text-[10px] font-mono text-[#94a3b8] select-all">
                                            SKU: {cellSku}
                                          </div>
                                        </div>
                                      </td>
                                    );
                                  })}
                                  <td className="p-3 text-center align-top pt-3.5">
                                    <button
                                      onClick={() => handleDeleteSizeRow(idx, row.size)}
                                      className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                      title="Xóa kích thước"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            } else {
                              const cellSku = generateCellSku(currentCustomDef.id, currentTier, row.size, 'boVien', customMaterials);
                              return (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-bold text-white font-mono">{normalizeSize(row.size)}</td>
                                  <td className="p-3">
                                    <div className="space-y-1">
                                      <input
                                        type="number"
                                        value={row.boVien ?? row.price ?? row.inEpMika ?? ''}
                                        placeholder="-"
                                        onChange={(e) => handlePriceChange(currentCustomDef.id, idx, 'boVien', e.target.value)}
                                        className="w-40 bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-[#E7C184]"
                                      />
                                      <div className="text-xs font-mono text-[#94a3b8] select-all">
                                        SKU: {cellSku}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleDeleteSizeRow(idx, row.size)}
                                      className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                      title="Xóa kích thước"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            }
                          })}
                        </tbody>
                      </table>
                    );
                  })()}

                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: DANH MỤC MẪU KHUNG (FRAMES MASTER) */}
        {activeTab === 'frames' && (
          <div className="space-y-6">
            <div className="bg-[#1C1917] p-4 rounded-xl border border-neutral-800 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#E7C184]" />
                  <span>Quản Lý Danh Mục Mẫu Khung Ảnh (K0 - K11, Titan 1, Titan 2)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Chỉnh sửa bản rộng (cm), độ sâu (cm), quy cách màu sắc và ảnh thực tế xưởng cho từng mẫu khung.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingFrame({
                    id: `k_${Date.now()}`,
                    code: `K${catalog.frames.length}`,
                    name: 'Khung Mới',
                    imageUrl: '/images/frames/khung-k0.jpg',
                    image: '/images/frames/khung-k0.jpg',
                    dimensions: 'Bản rộng 3.0 cm',
                    description: 'Mô tả khung mới...',
                    suitableFor: 'Phù hợp cho...',
                    variants: 'Màu sắc...',
                    hasRealPhotos: true,
                    images: []
                  });
                  setIsAddingFrame(true);
                }}
                className="px-4 py-2 bg-[#E7C184] hover:bg-[#D4AF37] text-[#1C1917] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#1C1917]" />
                <span>Thêm Mẫu Khung Mới</span>
              </button>
            </div>

            {/* Grid list of Frames */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalog.frames.map((frame) => {
                const canonical = FRAMES.find(
                  (cf) => cf.code.toLowerCase() === (frame.code || '').trim().toLowerCase()
                );
                const frameImages =
                  frame.images && frame.images.length > 0
                    ? frame.images
                    : canonical?.images && canonical.images.length > 0
                    ? canonical.images
                    : [{ name: frame.name, url: frame.imageUrl || frame.image || '/images/frames/khung-k0.jpg' }];

                const activeVarIdx = adminFrameVariantIdx[frame.code] || 0;
                const activeVarImg = frameImages[activeVarIdx] || frameImages[0];
                const rawFrameUrl = activeVarImg?.url || frame.imageUrl || frame.image || '/images/frames/khung-k0.jpg';

                return (
                  <div key={frame.id || frame.code} className="bg-[#1C1917] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all">
                    <div>
                      <div className="relative h-48 bg-neutral-950 overflow-hidden border-b border-neutral-800">
                        <img
                          key={`${frame.code}-${activeVarIdx}-${rawFrameUrl}`}
                          src={getFrameImageUrl(rawFrameUrl)}
                          onError={(e) => handleFrameImageError(e, rawFrameUrl)}
                          alt={`${frame.name} - ${activeVarImg?.name || ''}`}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute top-2 left-2 bg-[#1C1917]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono text-xs font-bold text-[#E7C184]">
                          Mã: {frame.code}
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        {frameImages.length > 1 && (
                          <div className="flex items-center gap-1.5 flex-wrap pb-1">
                            <span className="text-[10px] font-mono text-neutral-400">Màu:</span>
                            {frameImages.map((img, vIdx) => (
                              <button
                                key={`${frame.code}-var-${vIdx}`}
                                type="button"
                                onClick={() =>
                                  setAdminFrameVariantIdx((prev) => ({
                                    ...prev,
                                    [frame.code]: vIdx
                                  }))
                                }
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                  activeVarIdx === vIdx
                                    ? 'bg-[#E7C184] text-[#1C1917] font-bold'
                                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                }`}
                              >
                                {img.colorHex && (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0 inline-block"
                                    style={{ backgroundColor: img.colorHex }}
                                  />
                                )}
                                <span>{img.name.split(': ')[1] || img.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <h4 className="font-bold text-sm text-white">{frame.name}</h4>
                        <p className="text-xs text-amber-400 font-mono font-semibold">{frame.dimensions}</p>
                        <p className="text-xs text-neutral-400 line-clamp-2">{frame.description}</p>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          Biến thể: <span className="text-neutral-300">{frame.variants}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingFrame({ ...frame, images: frameImages });
                          setIsAddingFrame(false);
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#E7C184]" />
                        <span>Sửa Thông Số</span>
                      </button>

                      <button
                        onClick={() => handleDeleteFrame(frame.id || frame.code)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Xóa mẫu khung"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Frame Edit Modal */}
            {editingFrame && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="bg-[#1C1917] border border-neutral-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#E7C184]" />
                      <span>{isAddingFrame ? 'Thêm Mẫu Khung Mới' : `Chỉnh Sửa Thông Số Mẫu Khung (${editingFrame.code})`}</span>
                    </h3>
                    <button onClick={() => setEditingFrame(null)} className="text-neutral-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-neutral-400 font-mono font-bold mb-1">Mã Khung (e.g. K0, K1)</label>
                      <input
                        type="text"
                        value={editingFrame.code}
                        onChange={(e) => setEditingFrame({ ...editingFrame, code: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-white font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-mono font-bold mb-1">Tên Mẫu Khung</label>
                      <input
                        type="text"
                        value={editingFrame.name}
                        onChange={(e) => setEditingFrame({ ...editingFrame, name: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-mono font-bold mb-1">Kích Thước Bản Rộng</label>
                      <input
                        type="text"
                        value={editingFrame.dimensions}
                        onChange={(e) => setEditingFrame({ ...editingFrame, dimensions: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-mono font-bold mb-1">Biến Thể Màu Sắc</label>
                      <input
                        type="text"
                        value={editingFrame.variants}
                        onChange={(e) => setEditingFrame({ ...editingFrame, variants: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-neutral-400 font-mono font-bold mb-1">Đường Dẫn Ảnh Mẫu (Image URL)</label>
                      <input
                        type="text"
                        value={editingFrame.imageUrl || editingFrame.image}
                        onChange={(e) => setEditingFrame({ ...editingFrame, imageUrl: e.target.value, image: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-neutral-400 font-mono font-bold mb-1">Mô Tả Kỹ Thuật Khung</label>
                      <textarea
                        rows={3}
                        value={editingFrame.description}
                        onChange={(e) => setEditingFrame({ ...editingFrame, description: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-neutral-400 font-mono font-bold mb-1">Ứng Dụng Phù Hợp Cho</label>
                      <textarea
                        rows={2}
                        value={editingFrame.suitableFor}
                        onChange={(e) => setEditingFrame({ ...editingFrame, suitableFor: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingFrame(null)}
                      className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={() => handleSaveFrame(editingFrame)}
                      className="px-5 py-2 bg-[#E7C184] text-[#1C1917] rounded-xl text-xs font-bold shadow-md"
                    >
                      Lưu Mẫu Khung
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: TRUNG TÂM ĐỒNG BỘ CLOUD FIRESTORE */}
        {activeTab === 'cloud' && (
          <div className="space-y-6">
            
            {/* Main Action Banner */}
            <div className="p-6 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-[#E7C184]/30 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#E7C184]">
                    Cloud Target: lab-f7f0a.firebaseapp.com
                  </span>
                </div>

                <h3 className="font-serif-display text-xl font-bold text-white">
                  Trung Tâm Đẩy Dữ Liệu Master Catalog Lên Cloud Firestore
                </h3>

                <p className="text-xs text-neutral-300 max-w-xl">
                  Đẩy trực tiếp toàn bộ {7 + customMaterials.length} bảng giá chuẩn (với 3 phân hệ Studio, Freelance, Khách Lẻ) và danh mục {catalog.frames.length} mẫu khung sang Cloud Firestore chung của dự án <strong>194 lab</strong> để ứng dụng xưởng <strong>quan-ly-194</strong> kéo về sử dụng.
                </p>
              </div>

              <button
                onClick={handleTriggerCloudSync}
                disabled={isSyncing}
                className={`px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-xl cursor-pointer flex items-center gap-3 shrink-0 ${
                  isSyncing
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#E7C184] to-[#C09B59] hover:from-[#f0cf98] hover:to-[#cb072] text-[#1C1917] hover:scale-105 active:scale-95'
                }`}
              >
                <CloudUpload className={`w-6 h-6 ${isSyncing ? 'animate-spin text-neutral-500' : 'text-[#1C1917]'}`} />
                <span>{isSyncing ? 'Đang Đẩy Dữ Liệu...' : '☁️ Đẩy Dữ Liệu Lên Cloud Firestore (194 Lab)'}</span>
              </button>
            </div>

            {/* Syncing Progress Stream */}
            {isSyncing && (
              <div className="p-4 bg-blue-950/60 border border-blue-800/80 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                  <span>{syncStep}</span>
                </div>
                <div className="w-full bg-blue-900/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-400 h-2 rounded-full animate-pulse w-full"></div>
                </div>
                <div className="max-h-40 overflow-y-auto font-mono text-[11px] bg-black/60 p-3 rounded-lg border border-blue-900/50 text-neutral-300 space-y-1">
                  {syncLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-blue-400">►</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sync Result Card */}
            {syncResult && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                syncResult.success 
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' 
                  : 'bg-rose-950/80 border-rose-800 text-rose-200'
              }`}>
                {syncResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-sm">{syncResult.success ? 'Đồng Bộ Firestore Thành Công!' : 'Đồng Bộ Không Thành Công'}</p>
                  <p>{syncResult.message}</p>
                  {syncResult.timestamp && (
                    <p className="font-mono text-[11px] opacity-75">
                      Thời gian hoàn tất: {new Date(syncResult.timestamp).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Backup, Import & Restore Panel */}
            <div className="bg-[#1C1917] p-6 rounded-2xl border border-neutral-800 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#E7C184]" />
                <span>Sao Lưu Dự Phòng & Khôi Phục File (Backup & Restore)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Export JSON */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Xuất Bản Sao Lưu (Export JSON)</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Tải về máy file cấu hình JSON chứa toàn bộ bảng giá và mã khung.
                  </p>
                  <button
                    onClick={handleExportJson}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Tải File JSON Backup
                  </button>
                </div>

                {/* Import JSON */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>Khôi Phục Từ File (Import JSON)</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Tải file JSON backup từ máy tính để phục hồi dữ liệu Master Catalog.
                  </p>
                  <label className="block w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-sky-400 font-mono text-xs font-bold rounded-lg transition-colors text-center cursor-pointer">
                    Chọn File JSON
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                </div>

                {/* Reset Factory */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    <span>Khôi Phục Mặc Định</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Khôi phục dữ liệu nguyên bản do Tiệm In 194 phát hành.
                  </p>
                  <button
                    onClick={handleResetDefaults}
                    className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer border border-rose-900/50"
                  >
                    Khôi Phục Mặc Định 2026
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL: THÊM CHẤT LIỆU MỚI */}
      {isAddingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1C1917] border border-neutral-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#E7C184]" />
                <span>Thêm Chất Liệu Mới Vào Master Catalog</span>
              </h3>
              <button onClick={() => setIsAddingMaterial(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Tên Chất Liệu Mới</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tráng Gương Pha Lê"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#E7C184]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Tiền Tố SKU Bo Viền</label>
                  <input
                    type="text"
                    placeholder="e.g. TG"
                    value={newMatBoVienPrefix}
                    onChange={(e) => setNewMatBoVienPrefix(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white font-mono uppercase focus:outline-none focus:border-[#E7C184]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Tiền Tố SKU Khung</label>
                  <input
                    type="text"
                    placeholder="e.g. TGK"
                    value={newMatKhungPrefix}
                    onChange={(e) => setNewMatKhungPrefix(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white font-mono uppercase focus:outline-none focus:border-[#E7C184]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Loại Bảng Cấu Hình Giá</label>
                <select
                  value={newMatType}
                  onChange={(e) => setNewMatType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#E7C184]"
                >
                  <option value="dong-khung">Đóng Khung Full Cột (K0-K11, Titan 1, Titan 2)</option>
                  <option value="in-ep">Đơn Bảng (In Ép / Một Đơn Giá)</option>
                  <option value="album">Album Mở Phẳng</option>
                </select>
              </div>

              {/* Tier Selection for New Material */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-neutral-300 font-bold">Xuất hiện tại những bảng giá nào:</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    newMatTiers.includes('studio') ? 'bg-[#E7C184]/15 border-[#E7C184] text-[#E7C184] font-bold' : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newMatTiers.includes('studio')}
                      onChange={(e) => {
                        if (e.target.checked) setNewMatTiers([...newMatTiers, 'studio']);
                        else setNewMatTiers(newMatTiers.filter(t => t !== 'studio'));
                      }}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span>1. Studio</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    newMatTiers.includes('freelance') ? 'bg-[#E7C184]/15 border-[#E7C184] text-[#E7C184] font-bold' : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newMatTiers.includes('freelance')}
                      onChange={(e) => {
                        if (e.target.checked) setNewMatTiers([...newMatTiers, 'freelance']);
                        else setNewMatTiers(newMatTiers.filter(t => t !== 'freelance'));
                      }}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span>2. Freelance</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    newMatTiers.includes('retail') ? 'bg-[#E7C184]/15 border-[#E7C184] text-[#E7C184] font-bold' : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newMatTiers.includes('retail')}
                      onChange={(e) => {
                        if (e.target.checked) setNewMatTiers([...newMatTiers, 'retail']);
                        else setNewMatTiers(newMatTiers.filter(t => t !== 'retail'));
                      }}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span>3. Khách Lẻ</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] text-neutral-400 font-mono space-y-1">
                <div>Xem trước mã SKU tự động:</div>
                <div className="text-emerald-400 font-bold">
                  {newMatBoVienPrefix ? `${newMatBoVienPrefix.toUpperCase()}ST60*90` : '[PREFIX]ST60*90'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                onClick={() => setIsAddingMaterial(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateCustomMaterial}
                className="px-5 py-2 bg-[#E7C184] text-[#1C1917] rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Tạo Chất Liệu Mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM KÍCH THƯỚC MỚI */}
      {isAddingSize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1C1917] border border-neutral-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Thêm Kích Thước Mới</span>
              </h3>
              <button onClick={() => setIsAddingSize(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Kích Thước (cm)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 45x60, 45*60, 50x70..."
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Tier Selection for New Size */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-neutral-300 font-bold">Xuất hiện tại những bảng giá nào:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    newSizeTiers.includes('studio') ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold' : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newSizeTiers.includes('studio')}
                      onChange={(e) => {
                        if (e.target.checked) setNewSizeTiers([...newSizeTiers, 'studio']);
                        else setNewSizeTiers(newSizeTiers.filter(t => t !== 'studio'));
                      }}
                      className="rounded text-emerald-500 focus:ring-0"
                    />
                    <span>1. Studio</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    newSizeTiers.includes('freelance') ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold' : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newSizeTiers.includes('freelance')}
                      onChange={(e) => {
                        if (e.target.checked) setNewSizeTiers([...newSizeTiers, 'freelance']);
                        else setNewSizeTiers(newSizeTiers.filter(t => t !== 'freelance'));
                      }}
                      className="rounded text-emerald-500 focus:ring-0"
                    />
                    <span>2. Freelance</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    newSizeTiers.includes('retail') ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold' : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newSizeTiers.includes('retail')}
                      onChange={(e) => {
                        if (e.target.checked) setNewSizeTiers([...newSizeTiers, 'retail']);
                        else setNewSizeTiers(newSizeTiers.filter(t => t !== 'retail'));
                      }}
                      className="rounded text-emerald-500 focus:ring-0"
                    />
                    <span>3. Khách Lẻ</span>
                  </label>
                </div>
              </div>

              {newSizeInput.trim() && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] font-mono space-y-1">
                  <span className="text-neutral-400">Chuẩn hóa tự động: </span>
                  <span className="text-emerald-400 font-bold">{normalizeSize(newSizeInput)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                onClick={() => setIsAddingSize(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNewSize}
                className="px-5 py-2 bg-emerald-500 text-neutral-950 font-bold rounded-xl text-xs shadow cursor-pointer"
              >
                Lưu Kích Thước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Retail Size */}
      {isAddingRetailSize && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1917] border border-neutral-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Thêm Kích Thước Cho Bảng Khách Lẻ</span>
              </h3>
              <button onClick={() => setIsAddingRetailSize(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-neutral-300 font-semibold block">
                Nhập kích thước ảnh (Ví dụ: 35x50, 45x60, 60x120):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 35x50"
                value={newRetailSizeInput}
                onChange={(e) => setNewRetailSizeInput(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingRetailSize(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAddRetailSize}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Thêm Kích Thước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM CỘT KHUNG / CHẤT LIỆU MỚI (DYNAMIC COLUMNS) */}
      {isAddingColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1C1917] border border-neutral-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#E7C184]" />
                <span>Thêm Cột Khung / Quy Cách Mới</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColLabel('');
                  setNewColSkuPrefix('');
                }}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Tên hiển thị cột (VD: HD Khung Gỗ, Khung Hoa Văn Cổ Điển) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  placeholder="VD: HD Khung Gỗ"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E7C184]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Mã tiền tố (Prefix) SKU <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newColSkuPrefix}
                  onChange={(e) => setNewColSkuPrefix(e.target.value)}
                  placeholder="VD: KGO, TT3, HVCD"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-[#E7C184] focus:outline-none focus:border-[#E7C184]"
                />
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  Mã SKU sẽ tự động gắn đuôi: <span className="font-mono text-[#E7C184]">...{newColSkuPrefix.trim().toUpperCase() || 'PREFIX'}</span>
                </p>
              </div>

              {/* CHỌN PHÂN HỆ BẢNG GIÁ ÁP DỤNG */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-300 font-semibold block">
                    Bạn muốn thêm cột này trên phân hệ bảng giá nào? <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (colTargetTiers.length === 3) {
                        setColTargetTiers([currentTier]);
                      } else {
                        setColTargetTiers(['studio', 'freelance', 'retail']);
                      }
                    }}
                    className="text-[11px] font-bold text-[#E7C184] hover:underline cursor-pointer"
                  >
                    {colTargetTiers.length === 3 ? 'Chỉ chọn bảng hiện tại' : 'Chọn cả 3 phân hệ'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'studio' as AudienceTierId, label: '1. Studio (Gốc)' },
                    { id: 'freelance' as AudienceTierId, label: '2. Freelance (+10%)' },
                    { id: 'retail' as AudienceTierId, label: '3. Khách Lẻ' }
                  ].map(tierOpt => {
                    const checked = colTargetTiers.includes(tierOpt.id);
                    return (
                      <label
                        key={tierOpt.id}
                        onClick={() => {
                          setColTargetTiers(prev =>
                            prev.includes(tierOpt.id)
                              ? prev.filter(t => t !== tierOpt.id)
                              : [...prev, tierOpt.id]
                          );
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${
                          checked
                            ? 'bg-[#E7C184]/15 border-[#E7C184] text-[#E7C184]'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="accent-[#E7C184] rounded"
                        />
                        <span>{tierOpt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* CHỌN BẢNG GIÁ CHẤT LIỆU ÁP DỤNG (KHI CHỌN STUDIO HOẶC FREELANCE) */}
              {(colTargetTiers.includes('studio') || colTargetTiers.includes('freelance')) && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  {(() => {
                    const materialTableOptions = [
                      { id: 'go-lua', label: '1. Gỗ Lụa Đóng Khung' },
                      { id: 'hd-guong-sieu-bong', label: '2. HD Gương Siêu Bóng' },
                      { id: 'mika-pho-thong', label: '3. Mika Phổ Thông' },
                      { id: 'in-ep-mika', label: '4. In Ép Mika' },
                      { id: 'anh-4k', label: '5. Bảng Giá Ảnh 4K' },
                      { id: 'hd-pro', label: '6. HD PRO Khung Cao Cấp' },
                      ...customMaterials
                        .filter(m => m.type === 'dong-khung')
                        .map((m, idx) => ({ id: m.id, label: `${7 + idx}. ${m.name}` }))
                    ];
                    const allMatIds = materialTableOptions.map(o => o.id);
                    const isAllSelected = allMatIds.every(id => colTargetMaterials.includes(id));

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-neutral-300 font-semibold block">
                            Áp dụng cho bảng giá chất liệu nào? <span className="text-rose-400">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (isAllSelected) {
                                setColTargetMaterials([colTargetTable === 'retail' ? 'go-lua' : colTargetTable]);
                              } else {
                                setColTargetMaterials(allMatIds);
                              }
                            }}
                            className="text-[11px] font-bold text-[#E7C184] hover:underline cursor-pointer"
                          >
                            {isAllSelected ? 'Chỉ chọn bảng đang mở' : 'Chọn tất cả bảng chất liệu'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                          {materialTableOptions.map(matOpt => {
                            const checked = colTargetMaterials.includes(matOpt.id);
                            return (
                              <label
                                key={matOpt.id}
                                onClick={() => {
                                  setColTargetMaterials(prev =>
                                    prev.includes(matOpt.id)
                                      ? prev.filter(m => m !== matOpt.id)
                                      : [...prev, matOpt.id]
                                  );
                                }}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${
                                  checked
                                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {}}
                                  className="accent-emerald-400 rounded"
                                />
                                <span className="truncate">{matOpt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
                <div className="font-semibold text-[#E7C184]">💡 Lưu ý tự động:</div>
                <div>• Cột mới sẽ chỉ được thêm vào các bảng giá bạn đã tích chọn ở trên với giá trị mặc định là <strong>0đ</strong>.</div>
                <div>• Bạn có thể kéo thả tiêu đề cột để thay đổi thứ tự hiển thị bất cứ lúc nào.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColLabel('');
                  setNewColSkuPrefix('');
                }}
                className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleAddColumnConfirm}
                disabled={!newColLabel.trim() || !newColSkuPrefix.trim() || colTargetTiers.length === 0}
                className="px-5 py-2.5 bg-[#E7C184] hover:bg-[#d8b06e] disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
              >
                Xác Nhận Thêm Cột
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XÓA CỘT KHUNG / CHẤT LIỆU (HỎI NGƯỜI DÙNG MUỐN XÓA TRÊN BẢNG GIÁ NÀO) */}
      {deletingColumnInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1C1917] border border-neutral-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <span>Xóa Cột Khung: <span className="text-rose-400">{deletingColumnInfo.columnLabel}</span></span>
              </h3>
              <button
                onClick={() => setDeletingColumnInfo(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-neutral-200 leading-relaxed">
                Bạn đang yêu cầu xóa cột <strong className="text-rose-300">[{deletingColumnInfo.columnLabel}]</strong>
                {deletingColumnInfo.columnSkuPrefix ? ` (Mã SKU: ${deletingColumnInfo.columnSkuPrefix})` : ''}. Vui lòng chọn những bảng giá mà bạn muốn áp dụng thay đổi xóa cột này:
              </div>

              {/* CHỌN PHÂN HỆ BẢNG GIÁ MUỐN XÓA CỘT */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-300 font-semibold block">
                    1. Bạn muốn xóa cột này trên phân hệ bảng giá nào? <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (delColTiers.length === 3) {
                        setDelColTiers([deletingColumnInfo.sourceTableKey === 'retail' ? 'retail' : currentTier]);
                      } else {
                        setDelColTiers(['studio', 'freelance', 'retail']);
                      }
                    }}
                    className="text-[11px] font-bold text-[#E7C184] hover:underline cursor-pointer"
                  >
                    {delColTiers.length === 3 ? 'Chỉ chọn bảng hiện tại' : 'Chọn cả 3 phân hệ'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'studio' as AudienceTierId, label: '1. Studio (Gốc)' },
                    { id: 'freelance' as AudienceTierId, label: '2. Freelance (+10%)' },
                    { id: 'retail' as AudienceTierId, label: '3. Khách Lẻ' }
                  ].map(tierOpt => {
                    const checked = delColTiers.includes(tierOpt.id);
                    return (
                      <label
                        key={tierOpt.id}
                        onClick={() => {
                          setDelColTiers(prev =>
                            prev.includes(tierOpt.id)
                              ? prev.filter(t => t !== tierOpt.id)
                              : [...prev, tierOpt.id]
                          );
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${
                          checked
                            ? 'bg-rose-500/15 border-rose-500/70 text-rose-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="accent-rose-500 rounded"
                        />
                        <span>{tierOpt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* CHỌN BẢNG GIÁ CHẤT LIỆU MUỐN XÓA CỘT (KHI CHỌN STUDIO HOẶC FREELANCE) */}
              {(delColTiers.includes('studio') || delColTiers.includes('freelance')) && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  {(() => {
                    const materialTableOptions = [
                      { id: 'go-lua', label: '1. Gỗ Lụa Đóng Khung' },
                      { id: 'hd-guong-sieu-bong', label: '2. HD Gương Siêu Bóng' },
                      { id: 'mika-pho-thong', label: '3. Mika Phổ Thông' },
                      { id: 'in-ep-mika', label: '4. In Ép Mika' },
                      { id: 'anh-4k', label: '5. Bảng Giá Ảnh 4K' },
                      { id: 'hd-pro', label: '6. HD PRO Khung Cao Cấp' },
                      ...customMaterials
                        .filter(m => m.type === 'dong-khung')
                        .map((m, idx) => ({ id: m.id, label: `${7 + idx}. ${m.name}` }))
                    ];
                    const allMatIds = materialTableOptions.map(o => o.id);
                    const isAllSelected = allMatIds.every(id => delColMaterials.includes(id));

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-neutral-300 font-semibold block">
                            2. Xóa cột này ở bảng giá chất liệu nào? <span className="text-rose-400">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (isAllSelected) {
                                setDelColMaterials([deletingColumnInfo.sourceTableKey === 'retail' ? 'go-lua' : deletingColumnInfo.sourceTableKey]);
                              } else {
                                setDelColMaterials(allMatIds);
                              }
                            }}
                            className="text-[11px] font-bold text-[#E7C184] hover:underline cursor-pointer"
                          >
                            {isAllSelected ? 'Chỉ chọn bảng đang mở' : 'Chọn tất cả bảng chất liệu'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                          {materialTableOptions.map(matOpt => {
                            const checked = delColMaterials.includes(matOpt.id);
                            return (
                              <label
                                key={matOpt.id}
                                onClick={() => {
                                  setDelColMaterials(prev =>
                                    prev.includes(matOpt.id)
                                      ? prev.filter(m => m !== matOpt.id)
                                      : [...prev, matOpt.id]
                                  );
                                }}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${
                                  checked
                                    ? 'bg-rose-500/15 border-rose-500/60 text-rose-300'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {}}
                                  className="accent-rose-500 rounded"
                                />
                                <span className="truncate">{matOpt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 text-[11px] text-neutral-400">
                • Những phân hệ bảng giá và bảng chất liệu <strong>không được tích chọn</strong> sẽ giữ nguyên cột này như cũ.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setDeletingColumnInfo(null)}
                className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteColumnConfirm}
                disabled={delColTiers.length === 0}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Xóa Cột</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION DIALOG (100% reliable in iframes) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1C1917] border border-neutral-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{confirmDialog.title}</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  action();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDialog.confirmText || 'Xác nhận xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#141211] border-t border-neutral-800 px-6 py-4 text-center text-xs text-neutral-500 font-mono">
        Bao-Gia 194 Master Catalog Control · Tiệm In 194 Lab B2B © 2026
      </footer>

    </div>
  );
};

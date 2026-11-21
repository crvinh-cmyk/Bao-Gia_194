import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  DEFAULT_RETAIL_COLUMNS,
  isAllowedRetailCell,
  EXACT_RETAIL_SKU_SET,
  getTableColumnConfigs,
  addColumnToTable,
  reorderTableColumns,
  deleteColumnFromTable
} from '../services/adminStore';
import { 
  syncCatalogToFirestore,
  RECOMMENDED_FIRESTORE_RULES,
  SyncCatalogResult
} from '../services/catalogSync';
import { auth, signInAdminWithGoogle, signOutAdmin } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
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
import { generateCellSku, generateRetailCellSku, normalizeSize, normalizeAlbumSizeLabel } from '../utils/skuGenerator';
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
  const [syncResult, setSyncResult] = useState<SyncCatalogResult | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(() => auth.currentUser);
  const [showRulesHelper, setShowRulesHelper] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAdminUser(u));
    return () => unsub();
  }, []);

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
  const [newAlbumSheets, setNewAlbumSheets] = useState<number>(10);
  const [newAlbumPrice, setNewAlbumPrice] = useState<string>('');

  // Modal states & handlers for Retail Single Table
  const [isAddingRetailSize, setIsAddingRetailSize] = useState(false);
  const [newRetailSizeInput, setNewRetailSizeInput] = useState('');

  const handleRetailPriceChange = (rowIndex: number, field: string, value: any) => {
    const numVal = value === '' || value === null ? null : Number(value);
    updateRetailPriceCell(rowIndex, field, numVal);
    showToast("Đã lưu tạm tại máy (Local) — Hãy bấm 'Đồng Bộ Cloud' khi sửa xong để xuất bản!");
  };

  const handleRetailPassportChange = (rowIndex: number, value: any) => {
    const numVal = value === '' || value === null ? null : Number(value);
    updateRetailPassportPrice(rowIndex, numVal);
    showToast("Đã lưu tạm tại máy (Local) — Hãy bấm 'Đồng Bộ Cloud' khi sửa xong để xuất bản!");
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

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enforce Studio as default tier on mount
  useEffect(() => {
    setCurrentTier('studio');
    switchActiveTier('studio');
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3000);
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
  const customMaterials = useMemo(() => catalog.customMaterials || [], [catalog.customMaterials]);
  const visibleCustomMaterials = useMemo(
    () => customMaterials.filter(mat => !mat.targetTiers || mat.targetTiers.includes(currentTier)),
    [customMaterials, currentTier]
  );
  const currentCustomDef = useMemo(
    () => customMaterials.find(m => m.id === selectedMaterial),
    [customMaterials, selectedMaterial]
  );

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
    showToast("Đã lưu tạm tại máy (Local) — Hãy bấm 'Đồng Bộ Cloud' khi sửa xong để xuất bản!");
  };

  const handleAlbumRowFieldChange = (
    rowIndex: number,
    field: 'size' | 'sheets' | 'price',
    value: string
  ) => {
    const updated = { ...catalog };
    const targetTables = updated.tiers[currentTier];
    const rows = [...(targetTables.albumMoPhang || [])];
    const currentRow = rows[rowIndex];
    if (!currentRow) return;

    if (field === 'size') {
      rows[rowIndex] = { ...currentRow, size: value };
    } else if (field === 'sheets') {
      const parsed = value === '' ? 0 : Math.max(0, Math.floor(Number(value)));
      rows[rowIndex] = { ...currentRow, sheets: Number.isFinite(parsed) ? parsed : 1 };
    } else {
      const numVal = value === '' ? null : Number(value);
      rows[rowIndex] = { ...currentRow, price: numVal !== null && Number.isFinite(numVal) ? numVal : null };
    }

    targetTables.albumMoPhang = rows;
    saveCatalog(updated);
    showToast("Đã lưu tạm tại máy (Local) — Hãy bấm 'Đồng Bộ Cloud' khi sửa xong để xuất bản!");
  };

  const handleAlbumRowBlur = (rowIndex: number, field: 'size' | 'sheets') => {
    const updated = { ...catalog };
    const targetTables = updated.tiers[currentTier];
    const rows = [...(targetTables.albumMoPhang || [])];
    const currentRow = rows[rowIndex];
    if (!currentRow) return;

    let changed = false;
    if (field === 'size') {
      const normalized = normalizeAlbumSizeLabel(currentRow.size);
      const safeSize = normalized || '20*20';
      if (safeSize !== currentRow.size) {
        rows[rowIndex] = { ...currentRow, size: safeSize };
        changed = true;
      }
    } else if (field === 'sheets') {
      const safeSheets = Math.max(1, Math.floor(Number(currentRow.sheets) || 1));
      if (safeSheets !== currentRow.sheets) {
        rows[rowIndex] = { ...currentRow, sheets: safeSheets };
        changed = true;
      }
    }

    if (changed) {
      targetTables.albumMoPhang = rows;
      saveCatalog(updated);
    }
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
    if (selectedMaterial === 'album-mo-phang') {
      if (!newSizeInput.trim()) {
        showToast("Vui lòng nhập kích thước Album (ví dụ: 25*35 hoặc Thêm tờ 25*35)!");
        return;
      }
      const tiersToApply = newSizeTiers.filter((t) => t !== 'retail');
      if (tiersToApply.length === 0) {
        showToast("Vui lòng chọn ít nhất 1 bảng giá áp dụng (Studio hoặc Freelance)!");
        return;
      }
      const normalized = normalizeAlbumSizeLabel(newSizeInput);
      const sheetsVal = Math.max(1, Math.floor(Number(newAlbumSheets) || 10));
      const parsedPrice = newAlbumPrice.trim() === '' ? 0 : Number(newAlbumPrice);
      const priceVal = Number.isFinite(parsedPrice) ? parsedPrice : 0;

      addSizeToMaterial('album-mo-phang', normalized, tiersToApply, {
        sheets: sheetsVal,
        price: priceVal
      });
      setIsAddingSize(false);
      setNewSizeInput('');
      setNewAlbumSheets(10);
      setNewAlbumPrice('');
      setNewSizeTiers(['studio', 'freelance', 'retail']);
      showToast(`Đã thêm [${normalized} | ${sheetsVal} tờ] vào bảng Album Mở Phẳng!`);
      return;
    }

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
    const updatedImages =
      Array.isArray(frame.images) && frame.images.length > 1
        ? frame.images.map((img, i) => ({
            ...img,
            url: i === 0 ? cleanPrimaryUrl : sanitizeFramePathForFirestore(img.url, cleanPrimaryUrl)
          }))
        : [
            {
              name: `${frame.code}: ${frame.variants || frame.name}`,
              url: cleanPrimaryUrl
            }
          ];

    const cleanedVariants = (frame.variants || '').replace(/^(màu sắc\s*:\s*)+/i, '').trim();
    const sanitizedFrame: FrameConstantItem = {
      ...frame,
      variants: cleanedVariants || 'Màu tiêu chuẩn',
      imageUrl: cleanPrimaryUrl,
      image: cleanPrimaryUrl,
      hasRealPhotos: true,
      images: updatedImages
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
            showToast("File JSON không đúng định dạng Master Catalog Tiệm In 194!");
          }
        } catch (error) {
          showToast("Lỗi đọc file JSON. Vui lòng kiểm tra lại cấu trúc file!");
        }
      };
    }
  };

  const handleResetDefaults = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Khôi phục dữ liệu mặc định',
      message: 'XÁC NHẬN KHÔI PHỤC: Toàn bộ dữ liệu bảng giá và mẫu khung sẽ trở về mặc định ban đầu. Bạn có chắc chắn không?',
      confirmText: 'Khôi phục mặc định',
      onConfirm: () => {
        resetCatalogToDefault();
        showToast("Đã khôi phục dữ liệu về mặc định ban đầu!");
      }
    });
  };

  // --- Cloud Sync Execution ---
  const handleTriggerCloudSync = async () => {
    setIsSyncing(true);
    setSyncLogs([]);
    setSyncResult(null);
    setSyncStep("Khởi tạo tiến trình xuất bản dữ liệu Master Catalog lên Cloud Firestore (2-3 lượt ghi)...");

    const res = await syncCatalogToFirestore((step) => {
      setSyncStep(step);
      setSyncLogs(prev => [...prev, `${new Date().toLocaleTimeString('vi-VN')}: ${step}`]);
    });

    setIsSyncing(false);
    setSyncResult(res);

    if (res.success) {
      showToast(`✅ Đã xuất bản lên Cloud Firestore thành công (${res.writesPerformed || 2} lượt ghi)!`);
    } else {
      showToast(`⚠️ LỖI ĐỒNG BỘ CLOUD: Dữ liệu mới chỉ lưu ở máy cục bộ (Local), chưa lên được Cloud!`);
    }
  };

  const getAdminInputColorClass = (col: any) => {
    const raw = col?.defaultColor || '';
    if (col?.key === 'khungXuongGiaCo' || raw.includes('amber')) {
      return 'text-[#0066cc]';
    }
    return 'text-[#1d1d1f]';
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans antialiased selection:bg-[#0066cc]/15 selection:text-[#0066cc]">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-full font-semibold text-[13px] flex items-center gap-2 border ${
          toastMessage.includes('LỖI') || toastMessage.includes('⚠️')
            ? 'bg-rose-600 text-[#ffffff] border-rose-500'
            : 'bg-[#272729] text-[#ffffff] border-white/10'
        }`}>
          {toastMessage.includes('LỖI') || toastMessage.includes('⚠️') ? (
            <AlertCircle className="w-4 h-4 text-[#ffffff] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#2997ff] shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Quản Trị Master Catalog — True Black Global Bar */}
      <header className="sticky top-0 z-40 bg-[#000000] text-[#ffffff] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#272729] text-[#2997ff] flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-[17px] sm:text-[19px] font-semibold text-[#ffffff] tracking-[-0.28px]">
                Quản Trị Master Catalog 194
              </h1>
              <span className="text-[12px] text-[#cccccc] tabular-nums">
                · {7 + customMaterials.length} dòng · 3 phân hệ
              </span>
            </div>
            <p className="text-[12px] text-[#cccccc]">
              Khi sửa giá chỉ lưu tức thì vào máy (Local) — Bấm &quot;Đồng Bộ Cloud&quot; để xuất bản sang quan-ly-194
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTriggerCloudSync}
            disabled={isSyncing}
            className={`px-[18px] py-[9px] text-[13px] font-normal rounded-full transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              isSyncing
                ? 'bg-[#272729] text-[#7a7a7a] cursor-not-allowed'
                : 'bg-[#0066cc] hover:bg-[#0071e3] text-[#ffffff]'
            }`}
            title="Đẩy dữ liệu bảng giá và mẫu khung lên Cloud Firestore (chỉ 2-3 lượt ghi)"
          >
            <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Đang Đồng Bộ...' : 'Đồng Bộ Cloud Firestore / Xuất Bản Giá'}</span>
            <span className="sm:hidden">{isSyncing ? 'Đang đẩy...' : 'Đồng Bộ Cloud'}</span>
          </button>

          <button
            onClick={() => onExitAdmin(currentTier)}
            className="px-[15px] py-[8px] text-[13px] font-normal text-[#ffffff] bg-[#1d1d1f] hover:bg-[#272729] active:scale-95 rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <X className="w-4 h-4 text-[#cccccc]" />
            <span className="hidden sm:inline">Thoát Admin</span>
            <span className="sm:hidden">Thoát</span>
          </button>
        </div>
      </header>

      {/* Banner cảnh báo nổi bật trên mọi Tab nếu lần bấm Đồng bộ Cloud gần nhất bị thất bại */}
      {syncResult && !syncResult.success && activeTab !== 'cloud' && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-[13px] text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-rose-950">LỖI ĐỒNG BỘ CLOUD FIRESTORE: </span>
              <span>{syncResult.message}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('cloud')}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-[#ffffff] rounded-full text-[13px] font-normal shrink-0 cursor-pointer transition-all"
          >
            Mở Trung Tâm Đồng Bộ →
          </button>
        </div>
      )}

      {/* 2. Top Navigation Frosted Bar (3 Main Admin Tabs) */}
      <div className="apple-frosted border-b border-black/[0.08] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Bảng Giá {7 + customMaterials.length} Dòng Sản Phẩm</span>
          </button>

          <button
            onClick={() => setActiveTab('frames')}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'frames'
                ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>2. Danh Mục Mẫu Khung ({catalog.frames.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            <span>3. Trung Tâm Đồng Bộ Cloud Firestore</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[#7a7a7a] tabular-nums">
          <span>Lần cập nhật cuối:</span>
          <span className="text-[#1d1d1f] font-semibold">{new Date(catalog.lastUpdated).toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>

      {/* Main Admin View Content */}
      <main className="flex-1 p-5 sm:p-8 max-w-[1440px] mx-auto w-full space-y-6">

        {/* TAB 1: BẢNG GIÁ DÒNG SẢN PHẨM & 3 PHÂN HỆ GIÁ */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">

            {/* 🔗 TIỆN ÍCH SAO CHÉP ĐƯỜNG LINK BẢNG GIÁ THEO TỆP KHÁCH HÀNG */}
            <div className="bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[8px] bg-[#f5f5f7] border border-[#e0e0e0] flex items-center justify-center text-[#0066cc]">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px]">
                      Đường Link Gửi Báo Giá Theo Từng Tệp Khách Hàng
                    </h3>
                    <p className="text-[13px] text-[#7a7a7a]">
                      Gửi link tương ứng cho từng đối tượng. Khách truy cập sẽ bị khóa cố định vào bảng giá đó (không chuyển đổi hay xem lén được giá sỉ khác).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Link Studio */}
                <div className="bg-[#f5f5f7] border border-[#e0e0e0] rounded-[14px] p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1d1d1f]">
                      <Building2 className="w-4 h-4 text-[#0066cc]" />
                      <span>1. Link Dành Cho Studio</span>
                    </div>
                    <span className="text-[11px] text-[#7a7a7a] font-semibold">Giá gốc</span>
                  </div>
                  <div className="text-[12px] font-mono text-[#333333] truncate bg-[#ffffff] px-3 py-2 rounded-[8px] border border-[#e0e0e0] select-all" title={TIER_TOKEN_URLS.studio}>
                    {TIER_TOKEN_URLS.studio}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleCopyTierLink('studio')}
                      className="py-2 px-2 bg-[#1d1d1f] hover:bg-[#333333] active:scale-95 text-[#ffffff] font-normal text-[12px] rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>Sao Chép</span>
                    </button>
                    <a
                      href={getZaloShareUrlForTier('studio')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyTierLink('studio')}
                      className="py-2 px-2 bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] font-normal text-[12px] rounded-full transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Gửi Zalo</span>
                    </a>
                    <button
                      onClick={() => onExitAdmin('studio')}
                      className="py-2 px-2 bg-[#fafafc] hover:bg-[#ffffff] active:scale-95 text-[#333333] font-normal text-[12px] rounded-[11px] border-[3px] border-[#f0f0f0] transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Mở xem thử giao diện Bảng giá Studio"
                    >
                      <span>Xem Thử</span>
                    </button>
                  </div>
                </div>

                {/* 2. Link Freelance */}
                <div className="bg-[#f5f5f7] border border-[#e0e0e0] rounded-[14px] p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1d1d1f]">
                      <UserCheck className="w-4 h-4 text-[#0066cc]" />
                      <span>2. Link Dành Cho Freelance</span>
                    </div>
                    <span className="text-[11px] text-[#0066cc] font-semibold tabular-nums">+10%</span>
                  </div>
                  <div className="text-[12px] font-mono text-[#333333] truncate bg-[#ffffff] px-3 py-2 rounded-[8px] border border-[#e0e0e0] select-all" title={TIER_TOKEN_URLS.freelance}>
                    {TIER_TOKEN_URLS.freelance}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleCopyTierLink('freelance')}
                      className="py-2 px-2 bg-[#1d1d1f] hover:bg-[#333333] active:scale-95 text-[#ffffff] font-normal text-[12px] rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>Sao Chép</span>
                    </button>
                    <a
                      href={getZaloShareUrlForTier('freelance')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyTierLink('freelance')}
                      className="py-2 px-2 bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] font-normal text-[12px] rounded-full transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Gửi Zalo</span>
                    </a>
                    <button
                      onClick={() => onExitAdmin('freelance')}
                      className="py-2 px-2 bg-[#fafafc] hover:bg-[#ffffff] active:scale-95 text-[#333333] font-normal text-[12px] rounded-[11px] border-[3px] border-[#f0f0f0] transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Mở xem thử giao diện Bảng giá Freelance"
                    >
                      <span>Xem Thử</span>
                    </button>
                  </div>
                </div>

                {/* 3. Link Khách Lẻ */}
                <div className="bg-[#f5f5f7] border border-[#e0e0e0] rounded-[14px] p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1d1d1f]">
                      <ShoppingBag className="w-4 h-4 text-[#0066cc]" />
                      <span>3. Link Dành Cho Khách Lẻ</span>
                    </div>
                    <span className="text-[11px] text-[#7a7a7a] font-semibold">Niêm yết</span>
                  </div>
                  <div className="text-[12px] font-mono text-[#333333] truncate bg-[#ffffff] px-3 py-2 rounded-[8px] border border-[#e0e0e0] select-all" title={TIER_TOKEN_URLS.retail}>
                    {TIER_TOKEN_URLS.retail}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleCopyTierLink('retail')}
                      className="py-2 px-2 bg-[#1d1d1f] hover:bg-[#333333] active:scale-95 text-[#ffffff] font-normal text-[12px] rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>Sao Chép</span>
                    </button>
                    <a
                      href={getZaloShareUrlForTier('retail')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyTierLink('retail')}
                      className="py-2 px-2 bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] font-normal text-[12px] rounded-full transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Gửi Zalo</span>
                    </a>
                    <button
                      onClick={() => onExitAdmin('retail')}
                      className="py-2 px-2 bg-[#fafafc] hover:bg-[#ffffff] active:scale-95 text-[#333333] font-normal text-[12px] rounded-[11px] border-[3px] border-[#f0f0f0] transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Mở xem thử giao diện Bảng giá Khách Lẻ"
                    >
                      <span>Xem Thử</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Tier Switcher (Studio, Freelance, Khách Lẻ) */}
            <div className="p-6 bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[12px] text-[#0066cc] font-semibold block">
                  Phân hệ bảng giá đang chỉnh sửa
                </span>
                <h2 className="font-display text-[19px] font-semibold text-[#1d1d1f] flex items-center gap-2 mt-0.5 tracking-[-0.28px]">
                  <Users className="w-5 h-5 text-[#0066cc]" />
                  <span>
                    {currentTier === 'studio' ? '1. Bảng Giá Studio (Gốc)' :
                     currentTier === 'freelance' ? '2. Bảng Giá Freelance (+10%)' :
                     '3. Bảng Giá Khách Lẻ (Dịch Vụ)'}
                  </span>
                </h2>
              </div>

              {/* Tier Toggle Configurator Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSelectTier('studio')}
                  className={`px-4 py-2 rounded-full text-[13px] transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    currentTier === 'studio'
                      ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>1. Giá Sỉ Studio (Gốc)</span>
                </button>

                <button
                  onClick={() => handleSelectTier('freelance')}
                  className={`px-4 py-2 rounded-full text-[13px] transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    currentTier === 'freelance'
                      ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>2. Giá Freelance (+10%)</span>
                </button>

                <button
                  onClick={() => handleSelectTier('retail')}
                  className={`px-4 py-2 rounded-full text-[13px] transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    currentTier === 'retail'
                      ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>3. Giá Khách Lẻ</span>
                </button>
              </div>

              {/* Tier Auto Sync Tools */}
              {currentTier === 'freelance' && (
                <button
                  onClick={handleAutoSyncFreelance}
                  className="px-5 py-2.5 bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] font-normal text-[13px] rounded-full transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>Đồng bộ tự động từ Bảng Studio (+10%)</span>
                </button>
              )}

              {currentTier === 'retail' && (
                <button
                  onClick={handleAutoSyncRetail}
                  className="px-5 py-2.5 bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] font-normal text-[13px] rounded-full transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>Đồng bộ tự động Khách Lẻ (+50% từ Studio)</span>
                </button>
              )}
            </div>
            
            {/* Product Line Selector (Apple Configurator Option Chips) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
                {currentTier === 'retail' ? (
                  <>
                    <button
                      onClick={() => setSelectedMaterial('go-lua')}
                      className={`px-4 py-2 rounded-full text-[13px] transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                        !currentCustomDef
                          ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                          : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
                      }`}
                    >
                      1. Bảng Giá Khách Lẻ (Chính)
                    </button>

                    {visibleCustomMaterials.map((mat, i) => (
                      <button
                        key={mat.id}
                        onClick={() => setSelectedMaterial(mat.id)}
                        className={`px-4 py-2 rounded-full text-[13px] transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          selectedMaterial === mat.id
                            ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                            : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
                        }`}
                      >
                        <span>{2 + i}. {mat.name}</span>
                        <span className="text-[11px] text-[#7a7a7a] font-mono">({mat.boVienPrefix})</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { id: 'go-lua', label: '1. Gỗ Lụa Đóng Khung' },
                      { id: 'hd-guong-sieu-bong', label: '2. HD Gương Siêu Bóng' },
                      { id: 'mika-pho-thong', label: '3. Mika Phổ Thông' },
                      { id: 'in-ep-mika', label: '4. In Ép Mika' },
                      { id: 'anh-4k', label: '5. Bảng Giá Ảnh 4K' },
                      { id: 'hd-pro', label: '6. HD PRO Khung Cao Cấp' },
                      { id: 'album-mo-phang', label: '7. Album Mở Phẳng' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedMaterial(item.id as PricingMaterialType)}
                        className={`px-4 py-2 rounded-full text-[13px] transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                          selectedMaterial === item.id
                            ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                            : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}

                    {/* Render Custom Materials Tabs (Only active for current tier) */}
                    {visibleCustomMaterials.map((mat, i) => (
                      <button
                        key={mat.id}
                        onClick={() => setSelectedMaterial(mat.id)}
                        className={`px-4 py-2 rounded-full text-[13px] transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          selectedMaterial === mat.id
                            ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                            : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
                        }`}
                      >
                        <span>{8 + i}. {mat.name}</span>
                        <span className="text-[11px] text-[#7a7a7a] font-mono">({mat.boVienPrefix})</span>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Add Custom Material Action */}
              <button
                onClick={() => {
                  setNewMatTiers(currentTier === 'retail' ? ['retail'] : ['studio', 'freelance', 'retail']);
                  setIsAddingMaterial(true);
                }}
                className="px-5 py-2.5 bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] font-normal text-[13px] rounded-full transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Chất Liệu Mới</span>
              </button>
            </div>

            {/* RETAIL MAIN TABLE VIEW vs B2B / CUSTOM MATERIAL TABLES */}
            {currentTier === 'retail' && !currentCustomDef ? (
              <div key={`${currentTier}-${selectedMaterial}`} className="space-y-6 animate-tab-panel">

                {/* 1. DỊCH VỤ ẢNH THẺ (3x4 & 4x6) */}
                <div className="bg-white p-5 rounded-[18px] border border-[#e0e0e0] space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-[#f0f0f0] pb-3 gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1d1d1f] flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#0066cc]" />
                        <span>📸 DỊCH VỤ CHỤP & IN ẢNH THẺ (3x4 & 4x6)</span>
                      </h3>
                      <p className="text-xs text-[#7a7a7a] mt-0.5">
                        Biểu giá chụp, chỉnh sửa & in ảnh thẻ lấy ngay (chỉ hiển thị tại Admin, ẩn trên link khách lẻ).
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-1 rounded-lg border border-emerald-200">
                      CHỈ ĐỒNG BỘ MÃ CÓ GIÁ &gt; 0
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(catalog.retailPassports || defaultRetailPassportData).map((pass, pIdx) => {
                      const codeStr = pass.code || pass.size;
                      const sku = `ATKL${normalizeSize(codeStr)}`;
                      const displayName = pass.name || `Chụp & In Ảnh Thẻ ${pass.size}`;
                      return (
                        <div key={codeStr} className="bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl p-3.5 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-sm text-[#1d1d1f]">{displayName}</div>
                            <div className="text-[11px] font-mono text-[#7a7a7a] mt-0.5 select-all tabular-nums">
                              MÃ SKU: <span className="font-bold text-[#0066cc]">{sku}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={pass.price ?? ''}
                              placeholder="-"
                              onChange={(e) => handleRetailPassportChange(pIdx, e.target.value)}
                              className="w-32 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold tabular-nums text-emerald-700 focus:outline-none text-right"
                            />
                            <span className="text-xs font-bold text-[#333333]">đ</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. BIỂU GIÁ IN ẢNH & ĐÓNG KHUNG HOÀN THIỆN */}
                <div className="bg-white p-4 rounded-[18px] border border-[#e0e0e0] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#1d1d1f] flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#0066cc]" />
                      <span>🖼️ BIỂU GIÁ IN ẢNH & ĐÓNG KHUNG HOÀN THIỆN (KHÁCH LẺ)</span>
                    </h3>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">
                      Tự do thêm sản phẩm/kích thước, thêm cột chất liệu/khung. Hệ thống tự động chỉ đồng bộ các mã SKU có giá &gt; 0 sang <span className="text-[#0066cc] font-bold font-mono">quan-ly-194</span>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openAddColumnModal('retail')}
                      className="px-3.5 py-2 bg-[#272729] hover:bg-[#333333] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>+ Thêm Cột Khung/Chất Liệu</span>
                    </button>

                    <button
                      onClick={() => setIsAddingRetailSize(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>+ Thêm Sản Phẩm / Kích Thước</span>
                    </button>
                  </div>
                </div>

                {/* RETAIL TABLE (DYNAMIC COLUMNS & SIZES, ONLY PRICE > 0 SYNCED) */}
                {(() => {
                  const retailCols = getTableColumnConfigs('retail', 'retail');
                  const displayRows = (catalog.retailTable && catalog.retailTable.length > 0
                    ? catalog.retailTable
                    : defaultRetailPricingData);

                  return (
                    <div className="bg-white rounded-[18px] border border-[#e0e0e0] overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#333333] min-w-[1050px]">
                        <thead className="bg-[#f5f5f7] text-[#1d1d1f] font-mono uppercase text-[11px] border-b border-[#e0e0e0]">
                          <tr>
                            {/* 1. STT */}
                            <th className="p-3 w-12 text-center select-none text-[#1d1d1f] font-extrabold">
                              STT
                            </th>

                            {/* 2. KÍCH THƯỚC */}
                            <th className="p-3 select-none text-[#1d1d1f] font-extrabold min-w-[110px]">
                              KÍCH THƯỚC
                            </th>

                            {/* CÁC CỘT CHẤT LIỆU / KHUNG KHÁCH LẺ (CHO PHÉP KÉO THẢ & XÓA) */}
                            {retailCols.map((col: any, cIdx: number) => {
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
                                  className={`p-3 select-none transition-all cursor-grab active:cursor-grabbing border-r border-[#e0e0e0] relative group ${
                                    isDragging ? 'opacity-30 bg-[#f5f5f7]' : ''
                                  } ${
                                    isOver ? 'bg-[#f5f5f7] border-l-2 border-l-[#0071e3]' : 'hover:bg-[#e0e0e0]/60'
                                  }`}
                                  title="Kéo thả tiêu đề cột để thay đổi thứ tự"
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <GripVertical className="w-3.5 h-3.5 text-[#7a7a7a] group-hover:text-[#0066cc] transition-colors shrink-0" />
                                      <span className="font-extrabold text-[#1d1d1f] whitespace-nowrap">{col.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {col.skuPrefix && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#1d1d1f] font-mono font-bold">
                                          {col.skuPrefix}
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColumn('retail', col.key, col.label, col.skuPrefix);
                                        }}
                                        className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded text-[#7a7a7a] transition-colors cursor-pointer"
                                        title="Xóa cột này"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </th>
                              );
                            })}

                            {/* CỘT XÓA DÒNG */}
                            <th className="p-3 text-center w-16 select-none text-[#1d1d1f] font-extrabold">
                              Xóa
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e0e0e0]/70">
                          {displayRows.map((row, rIdx) => {
                            const normSize = normalizeSize(row.size);

                            return (
                              <tr key={rIdx} className="odd:bg-white even:bg-[#f5f5f7]/65 hover:bg-[#0066cc]/[0.05] transition-colors">
                                <td className="p-3 text-center font-mono text-[#7a7a7a] tabular-nums align-top pt-4">{rIdx + 1}</td>
                                <td className="p-3 font-extrabold text-[#1d1d1f] font-mono tabular-nums text-sm align-top pt-3.5 bg-[#f5f5f7]/70">{normSize}</td>
                                
                                {retailCols.map((col: any) => {
                                  const val = row[col.key];
                                  const hasValidPrice = typeof val === 'number' && val > 0;
                                  const sku = generateRetailCellSku(normSize, col.key, col.skuPrefix);
                                  const colorClass = getAdminInputColorClass(col);

                                  return (
                                    <td key={col.key} className="p-2.5 align-top">
                                      <div className="space-y-1">
                                        <input
                                          type="number"
                                          value={val ?? ''}
                                          placeholder="-"
                                          onChange={(e) => handleRetailPriceChange(rIdx, col.key, e.target.value)}
                                          className={`w-32 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold tabular-nums ${colorClass} focus:outline-none`}
                                        />
                                        <div className={`text-[10px] font-mono tabular-nums select-all ${hasValidPrice ? 'text-[#0066cc] font-bold' : 'text-[#7a7a7a]'}`}>
                                          SKU: {sku}
                                        </div>
                                      </div>
                                    </td>
                                  );
                                })}

                                <td className="p-3 text-center align-top pt-3.5">
                                  <button
                                    onClick={() => handleDeleteRetailSizeRow(rIdx, normSize)}
                                    className="p-1.5 text-[#7a7a7a] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Xóa kích thước này"
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
              /* STANDARD B2B TABLES & CUSTOM MATERIAL TABLES (FOR STUDIO, FREELANCE, AND RETAIL CUSTOM MATERIALS) */
              <>
                {/* Table Header & Size Action Toolbar */}
                <div className="bg-white p-4 rounded-[18px] border border-[#e0e0e0] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#1d1d1f] flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#0066cc]" />
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
                    <p className="text-xs text-[#7a7a7a] mt-0.5">
                      Mã SKU định danh tự động hiển thị bên dưới từng ô giá ({currentTier === 'studio' ? 'ST' : currentTier === 'freelance' ? 'FL' : 'KL'}). Chỉ đồng bộ mã có giá &gt; 0 sang quan-ly-194.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedMaterial !== 'album-mo-phang' && (!currentCustomDef || currentCustomDef.type === 'dong-khung') && (
                      <button
                        onClick={() => openAddColumnModal(selectedMaterial)}
                        className="px-3.5 py-2 bg-[#272729] hover:bg-[#333333] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-white" />
                        <span>+ Thêm Cột Khung/Chất Liệu</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setNewSizeInput('');
                        if (selectedMaterial === 'album-mo-phang') {
                          setNewSizeTiers(['studio', 'freelance']);
                          setNewAlbumSheets(10);
                          setNewAlbumPrice('');
                        } else {
                          setNewSizeTiers(['studio', 'freelance', 'retail']);
                        }
                        setIsAddingSize(true);
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>+ Thêm Kích Thước</span>
                    </button>

                    {currentCustomDef && (
                      <button
                        onClick={() => handleDeleteCustomMaterial(currentCustomDef.id)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>🗑️ Xóa Chất Liệu Này</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid / Editable Pricing Table for All Lines & Custom Materials */}
                <div key={`${currentTier}-${selectedMaterial}`} className="bg-white rounded-[18px] border border-[#e0e0e0] overflow-x-auto animate-tab-panel">
                  
                  {/* 1. IN ÉP MIKA */}
                  {selectedMaterial === 'in-ep-mika' && (() => {
                    const currentCols = getTableColumnConfigs('in-ep-mika', currentTier);
                    return (
                      <table className="w-full text-left text-xs text-[#333333]">
                        <thead className="bg-[#f5f5f7] text-[#1d1d1f] font-mono uppercase text-[11px] border-b border-[#e0e0e0]">
                          <tr>
                            <th className="p-3 select-none text-[#1d1d1f] font-extrabold w-14">STT</th>
                            <th className="p-3 select-none text-[#1d1d1f] font-extrabold min-w-[100px]">Kích Thước</th>
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
                                  className={`p-3 select-none transition-all cursor-grab active:cursor-grabbing border-r border-[#e0e0e0] relative group ${
                                    isDragging ? 'opacity-30 bg-[#f5f5f7]' : ''
                                  } ${
                                    isOver ? 'bg-[#f5f5f7] border-l-2 border-l-[#0071e3]' : 'hover:bg-[#e0e0e0]/60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <GripVertical className="w-3.5 h-3.5 text-[#7a7a7a] group-hover:text-[#0066cc] transition-colors shrink-0" />
                                      <span className="font-extrabold text-[#1d1d1f] whitespace-nowrap">{col.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {col.skuPrefix && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#1d1d1f] font-mono font-bold">
                                          {col.skuPrefix}
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColumn('in-ep-mika', col.key, col.label, col.skuPrefix);
                                        }}
                                        className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded text-[#7a7a7a] transition-colors cursor-pointer"
                                        title="Xóa cột này"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </th>
                              );
                            })}
                            <th className="p-3 text-center w-16 select-none text-[#1d1d1f] font-extrabold">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e0e0e0]/70">
                          {tierTables.inEpMika.map((row: any, idx) => (
                            <tr key={idx} className="odd:bg-white even:bg-[#f5f5f7]/65 hover:bg-[#0066cc]/[0.05] transition-colors">
                              <td className="p-3 font-mono text-[#7a7a7a] tabular-nums">{row.stt}</td>
                              <td className="p-3 font-extrabold text-[#1d1d1f] font-mono tabular-nums bg-[#f5f5f7]/70">{normalizeSize(row.size)}</td>
                              {currentCols.map((col) => {
                                const val = row[col.key];
                                const cellSku = generateCellSku('in-ep-mika', currentTier, row.size, col.key, customMaterials, col.isCustom ? col.skuPrefix : undefined);
                                const colorClass = getAdminInputColorClass(col);
                                return (
                                  <td key={col.key} className="p-3">
                                    <div className="space-y-1">
                                      <input
                                        type="number"
                                        value={val ?? ''}
                                        placeholder="-"
                                        onChange={(e) => handlePriceChange('in-ep-mika', idx, col.key, e.target.value)}
                                        className={`w-36 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold tabular-nums ${colorClass} focus:outline-none`}
                                      />
                                      <div className="text-[11px] font-mono tabular-nums text-[#7a7a7a] select-all">
                                        SKU: {cellSku}
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleDeleteSizeRow(idx, row.size)}
                                  className="p-1.5 text-[#7a7a7a] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                      <table className="w-full text-left text-xs text-[#333333] min-w-[850px]">
                        <thead className="bg-[#f5f5f7] text-[#1d1d1f] font-mono uppercase text-[11px] border-b border-[#e0e0e0]">
                          <tr>
                            {/* Cột 1: KÍCH THƯỚC */}
                            <th className="p-3 select-none text-[#1d1d1f] font-extrabold min-w-[100px]">Kích Thước</th>

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
                                  className={`p-3 select-none transition-all cursor-grab active:cursor-grabbing border-r border-[#e0e0e0] relative group ${
                                    isDragging ? 'opacity-30 bg-[#f5f5f7]' : ''
                                  } ${
                                    isOver ? 'bg-[#f5f5f7] border-l-2 border-l-[#0071e3]' : 'hover:bg-[#e0e0e0]/60'
                                  }`}
                                  title="Kéo thả tiêu đề cột để thay đổi thứ tự"
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <GripVertical className="w-3.5 h-3.5 text-[#7a7a7a] group-hover:text-[#0066cc] transition-colors shrink-0" />
                                      <span className="font-extrabold text-[#1d1d1f] whitespace-nowrap">{col.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {col.skuPrefix && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#1d1d1f] font-mono font-bold">
                                          {col.skuPrefix}
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColumn(selectedMaterial, col.key, col.label, col.skuPrefix);
                                        }}
                                        className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded text-[#7a7a7a] transition-colors cursor-pointer"
                                        title="Xóa cột khung này"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </th>
                              );
                            })}

                            {/* Cột cuối: Xóa */}
                            <th className="p-3 text-center w-16 select-none text-[#1d1d1f] font-extrabold">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e0e0e0]/70">
                          {(rowsData || []).map((row: any, idx) => {
                            return (
                              <tr key={idx} className="odd:bg-white even:bg-[#f5f5f7]/65 hover:bg-[#0066cc]/[0.05] transition-colors">
                                <td className="p-3 font-extrabold text-[#1d1d1f] font-mono tabular-nums align-top pt-3.5 bg-[#f5f5f7]/70">{normalizeSize(row.size)}</td>
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
                                  const colorClass = getAdminInputColorClass(col);

                                  return (
                                    <td key={col.key} className="p-2 align-top">
                                      <div className="space-y-1">
                                        <input
                                          type="number"
                                          value={val ?? ''}
                                          placeholder="-"
                                          onChange={(e) => handlePriceChange(selectedMaterial, idx, col.key, e.target.value)}
                                          className={`w-28 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-lg px-2 py-1 text-[11px] font-mono font-bold tabular-nums ${colorClass} focus:outline-none`}
                                        />
                                        <div className={`text-[10px] font-mono tabular-nums select-all leading-tight ${isEmpty ? 'text-[#7a7a7a]' : 'text-[#7a7a7a]'}`}>
                                          SKU: {cellSku}
                                        </div>
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="p-3 text-center align-top pt-3.5">
                                  <button
                                    onClick={() => handleDeleteSizeRow(idx, row.size)}
                                    className="p-1.5 text-[#7a7a7a] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                    <table className="w-full text-left text-xs text-[#333333]">
                      <thead className="bg-[#f5f5f7] text-[#1d1d1f] font-mono uppercase text-[11px] border-b border-[#e0e0e0]">
                        <tr>
                          <th className="p-3 font-extrabold w-14">STT</th>
                          <th className="p-3 font-extrabold min-w-[200px]">Kích Thước Album</th>
                          <th className="p-3 font-extrabold min-w-[210px]">Số Tờ Tiêu Chuẩn</th>
                          <th className="p-3 font-extrabold min-w-[230px]">Đơn Giá Hoàn Thiện (VND)</th>
                          <th className="p-3 text-center font-extrabold w-16">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e0e0]/70">
                        {tierTables.albumMoPhang.map((row, idx) => {
                          const effectiveSheets = row.sheets > 0 ? row.sheets : 1;
                          const skuAlbum = generateCellSku(
                            'album-mo-phang',
                            currentTier,
                            row.size,
                            'price',
                            customMaterials,
                            undefined,
                            effectiveSheets
                          );
                          const isExtraSheetRow =
                            effectiveSheets === 1 || /th[eê]m\s*t[oơờ]/i.test(row.size);

                          return (
                            <tr
                              key={idx}
                              className={`odd:bg-white even:bg-[#f5f5f7]/65 hover:bg-[#0066cc]/[0.05] transition-colors ${
                                isExtraSheetRow ? 'bg-[#0066cc]/[0.04]' : ''
                              }`}
                            >
                              <td className="p-3 font-mono text-[#7a7a7a] tabular-nums align-top pt-4">
                                {row.stt || idx + 1}
                              </td>
                              <td className="p-3 bg-[#f5f5f7]/70 align-top">
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={row.size}
                                    placeholder="VD: 20*30 hoặc Thêm tờ 20*30"
                                    onChange={(e) => handleAlbumRowFieldChange(idx, 'size', e.target.value)}
                                    onBlur={() => handleAlbumRowBlur(idx, 'size')}
                                    className="w-48 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-lg px-2.5 py-1.5 text-xs font-mono font-extrabold tabular-nums text-[#1d1d1f] focus:outline-none"
                                  />
                                  {isExtraSheetRow && (
                                    <div className="text-[10px] font-bold text-[#0066cc]">
                                      Dòng thêm tờ lẻ theo khổ
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={1}
                                    value={row.sheets === 0 ? '' : row.sheets}
                                    placeholder="10"
                                    onChange={(e) => handleAlbumRowFieldChange(idx, 'sheets', e.target.value)}
                                    onBlur={() => handleAlbumRowBlur(idx, 'sheets')}
                                    className="w-20 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold tabular-nums text-[#0066cc] focus:outline-none"
                                  />
                                  <span className="font-mono tabular-nums text-[#0066cc] font-bold whitespace-nowrap">
                                    tờ ({(row.sheets || 0) * 2} trang)
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                <div className="space-y-1">
                                  <input
                                    type="number"
                                    value={row.price ?? ''}
                                    placeholder="-"
                                    onChange={(e) => handleAlbumRowFieldChange(idx, 'price', e.target.value)}
                                    className="w-40 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold tabular-nums text-emerald-700 focus:outline-none"
                                  />
                                  <div className="text-xs font-mono tabular-nums text-[#7a7a7a] select-all">
                                    SKU: {skuAlbum}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center align-top pt-3.5">
                                <button
                                  onClick={() => handleDeleteSizeRow(idx, `${row.size} (${effectiveSheets} tờ)`)}
                                  className="p-1.5 text-[#7a7a7a] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                      <table className="w-full text-left text-xs text-[#333333] min-w-[900px]">
                        <thead className="bg-[#f5f5f7] text-[#1d1d1f] font-mono uppercase text-[11px] border-b border-[#e0e0e0]">
                          <tr>
                            <th className="p-3 font-extrabold">Kích Thước</th>
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
                                    className={`p-3 select-none transition-all cursor-grab active:cursor-grabbing border-r border-[#e0e0e0] relative group ${
                                      isDragging ? 'opacity-30 bg-[#f5f5f7]' : ''
                                    } ${
                                      isOver ? 'bg-[#f5f5f7] border-l-2 border-l-[#0071e3]' : 'hover:bg-[#e0e0e0]/60'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1.5">
                                      <div className="flex items-center gap-1">
                                        <GripVertical className="w-3.5 h-3.5 text-[#7a7a7a] group-hover:text-[#0066cc] transition-colors shrink-0" />
                                        <span className="font-extrabold text-[#1d1d1f] whitespace-nowrap">{col.label}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColumn(currentCustomDef.id, col.key, col.label, col.skuPrefix);
                                        }}
                                        className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded text-[#7a7a7a] transition-colors cursor-pointer"
                                        title="Xóa cột khung này"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </th>
                                );
                              })
                            ) : (
                              <th className="p-3 font-extrabold">Đơn Giá Hoàn Thiện (VND)</th>
                            )}
                            <th className="p-3 text-center font-extrabold">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e0e0e0]/70">
                          {(tierTables.customTables?.[currentCustomDef.id] || []).map((row, idx) => {
                            if (currentCustomDef.type === 'dong-khung') {
                              return (
                                <tr key={idx} className="odd:bg-white even:bg-[#f5f5f7]/65 hover:bg-[#0066cc]/[0.05] transition-colors">
                                  <td className="p-3 font-extrabold text-[#1d1d1f] font-mono tabular-nums align-top pt-3.5 bg-[#f5f5f7]/70">{normalizeSize(row.size)}</td>
                                  {customCols.map(col => {
                                    const f = col.key;
                                    const cellSku = generateCellSku(currentCustomDef.id, currentTier, row.size, f, customMaterials, col.isCustom ? col.skuPrefix : undefined);
                                    const colorClass = getAdminInputColorClass(col);
                                    return (
                                      <td key={f} className="p-2 align-top">
                                        <div className="space-y-1">
                                          <input
                                            type="number"
                                            value={row[f] ?? ''}
                                            placeholder="-"
                                            onChange={(e) => handlePriceChange(currentCustomDef.id, idx, f, e.target.value)}
                                            className={`w-28 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-lg px-2 py-1 text-[11px] font-mono font-bold tabular-nums ${colorClass} focus:outline-none`}
                                          />
                                          <div className="text-[10px] font-mono tabular-nums text-[#7a7a7a] select-all">
                                            SKU: {cellSku}
                                          </div>
                                        </div>
                                      </td>
                                    );
                                  })}
                                  <td className="p-3 text-center align-top pt-3.5">
                                    <button
                                      onClick={() => handleDeleteSizeRow(idx, row.size)}
                                      className="p-1.5 text-[#7a7a7a] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                                <tr key={idx} className="odd:bg-white even:bg-[#f5f5f7]/65 hover:bg-[#0066cc]/[0.05] transition-colors">
                                  <td className="p-3 font-extrabold text-[#1d1d1f] font-mono tabular-nums bg-[#f5f5f7]/70">{normalizeSize(row.size)}</td>
                                  <td className="p-3">
                                    <div className="space-y-1">
                                      <input
                                        type="number"
                                        value={row.boVien ?? row.price ?? row.inEpMika ?? ''}
                                        placeholder="-"
                                        onChange={(e) => handlePriceChange(currentCustomDef.id, idx, 'boVien', e.target.value)}
                                        className="w-40 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold tabular-nums text-emerald-700 focus:outline-none"
                                      />
                                      <div className="text-xs font-mono tabular-nums text-[#7a7a7a] select-all">
                                        SKU: {cellSku}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleDeleteSizeRow(idx, row.size)}
                                      className="p-1.5 text-[#7a7a7a] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
            <div className="bg-white p-4 sm:p-5 rounded-[18px] border border-[#e0e0e0] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-[#1d1d1f] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#0066cc]" />
                  <span>Quản Lý Danh Mục Mẫu Khung Ảnh (K0 - K11, Titan 1, Titan 2)</span>
                </h3>
                <p className="text-xs text-[#7a7a7a] mt-0.5">
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
                    variants: 'Trắng · Đen',
                    hasRealPhotos: true,
                    images: []
                  });
                  setIsAddingFrame(true);
                }}
                className="px-4 py-2 bg-[#272729] hover:bg-[#333333] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-white" />
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
                  <div key={frame.id || frame.code} className="bg-white border border-[#e0e0e0] rounded-[18px] overflow-hidden flex flex-col justify-between hover:border-[#0071e3] transition-all">
                    <div>
                      <div className="relative h-48 bg-[#f5f5f7] overflow-hidden border-b border-[#e0e0e0]">
                        <img
                          key={`${frame.code}-${activeVarIdx}-${rawFrameUrl}`}
                          src={getFrameImageUrl(rawFrameUrl)}
                          onError={(e) => handleFrameImageError(e, rawFrameUrl)}
                          alt={`${frame.name} - ${activeVarImg?.name || ''}`}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-[#272729] px-2.5 py-1 rounded-lg font-mono text-xs font-bold text-[#2997ff] tabular-nums">
                          Mã: {frame.code}
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        {frameImages.length > 1 && (
                          <div className="flex items-center gap-1.5 flex-wrap pb-1">
                            <span className="text-[10px] font-mono text-[#7a7a7a]">Màu:</span>
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
                                    ? 'bg-[#272729] text-white font-bold'
                                    : 'bg-[#f5f5f7] text-[#333333] hover:bg-[#e0e0e0] hover:text-[#1d1d1f]'
                                }`}
                              >
                                {img.colorHex && (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block"
                                    style={{ backgroundColor: img.colorHex }}
                                  />
                                )}
                                <span>{img.name.split(': ')[1] || img.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <h4 className="font-extrabold text-sm text-[#1d1d1f]">{frame.name}</h4>
                        <p className="text-xs text-[#0066cc] font-mono font-bold tabular-nums">{frame.dimensions}</p>
                        <p className="text-xs text-[#333333] line-clamp-2">{frame.description}</p>
                        <div className="text-[11px] text-[#7a7a7a] font-mono">
                          Biến thể: <span className="text-[#1d1d1f] font-semibold">{frame.variants}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#f5f5f7] border-t border-[#e0e0e0] flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingFrame({ ...frame, images: frameImages });
                          setIsAddingFrame(false);
                        }}
                        className="px-3.5 py-1.5 bg-[#f5f5f7] hover:bg-[#272729] text-[#1d1d1f] hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 group/edit"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#0066cc] group-hover/edit:text-white transition-colors" />
                        <span>Sửa Thông Số</span>
                      </button>

                      <button
                        onClick={() => handleDeleteFrame(frame.id || frame.code)}
                        className="p-1.5 text-[#7a7a7a] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/70 backdrop-blur-sm">
                <div className="bg-white border border-[#e0e0e0] rounded-[18px] max-w-2xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
                  <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3">
                    <h3 className="font-extrabold text-base text-[#1d1d1f] flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#0066cc]" />
                      <span>{isAddingFrame ? 'Thêm Mẫu Khung Mới' : `Chỉnh Sửa Thông Số Mẫu Khung (${editingFrame.code})`}</span>
                    </h3>
                    <button onClick={() => setEditingFrame(null)} className="text-[#7a7a7a] hover:text-[#333333] cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[#333333] font-mono font-bold mb-1">Mã Khung (e.g. K0, K1)</label>
                      <input
                        type="text"
                        value={editingFrame.code}
                        onChange={(e) => setEditingFrame({ ...editingFrame, code: e.target.value })}
                        className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] font-mono font-bold tabular-nums focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#333333] font-mono font-bold mb-1">Tên Mẫu Khung</label>
                      <input
                        type="text"
                        value={editingFrame.name}
                        onChange={(e) => setEditingFrame({ ...editingFrame, name: e.target.value })}
                        className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] font-semibold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#333333] font-mono font-bold mb-1">Kích Thước Bản Rộng</label>
                      <input
                        type="text"
                        value={editingFrame.dimensions}
                        onChange={(e) => setEditingFrame({ ...editingFrame, dimensions: e.target.value })}
                        className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] font-mono font-bold tabular-nums focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#333333] font-mono font-bold mb-1">Biến Thể Màu Sắc</label>
                      <input
                        type="text"
                        value={editingFrame.variants}
                        onChange={(e) => setEditingFrame({ ...editingFrame, variants: e.target.value })}
                        className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[#333333] font-mono font-bold mb-1">Đường Dẫn Ảnh Mẫu (Image URL)</label>
                      <input
                        type="text"
                        value={editingFrame.imageUrl || editingFrame.image}
                        onChange={(e) => setEditingFrame({ ...editingFrame, imageUrl: e.target.value, image: e.target.value })}
                        className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] font-mono focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[#333333] font-mono font-bold mb-1">Mô Tả Kỹ Thuật Khung</label>
                      <textarea
                        rows={3}
                        value={editingFrame.description}
                        onChange={(e) => setEditingFrame({ ...editingFrame, description: e.target.value })}
                        className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[#333333] font-mono font-bold mb-1">Ứng Dụng Phù Hợp Cho</label>
                      <textarea
                        rows={2}
                        value={editingFrame.suitableFor}
                        onChange={(e) => setEditingFrame({ ...editingFrame, suitableFor: e.target.value })}
                        className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e0e0e0] flex justify-end gap-2">
                    <button
                      onClick={() => setEditingFrame(null)}
                      className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#333333] rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={() => handleSaveFrame(editingFrame)}
                      className="px-5 py-2 bg-[#272729] hover:bg-[#333333] text-white rounded-xl text-xs font-bold cursor-pointer"
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
            <div className="p-6 bg-[#272729] text-white rounded-[18px] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2997ff] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2997ff]"></span>
                  </span>
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#2997ff]">
                    Cloud Target: lab-f7f0a.firebaseapp.com
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white">
                  Trung Tâm Đẩy Dữ Liệu Master Catalog Lên Cloud Firestore
                </h3>

                <p className="text-xs text-[#cccccc] max-w-xl leading-relaxed">
                  Đẩy trực tiếp toàn bộ {7 + customMaterials.length} bảng giá chuẩn (với 3 phân hệ Studio, Freelance, Khách Lẻ) và danh mục {catalog.frames.length} mẫu khung sang Cloud Firestore chung của dự án <strong>194 lab</strong> để ứng dụng xưởng <strong>quan-ly-194</strong> kéo về sử dụng.
                </p>
              </div>

              <button
                onClick={handleTriggerCloudSync}
                disabled={isSyncing}
                className={`px-7 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-3 shrink-0 ${
                  isSyncing
                    ? 'bg-[#333333] text-[#cccccc] cursor-not-allowed'
                    : 'bg-[#0066cc] hover:bg-[#0071e3] text-[#ffffff] active:scale-95 active:scale-95'
                }`}
              >
                <CloudUpload className={`w-6 h-6 ${isSyncing ? 'animate-spin text-[#cccccc]' : 'text-[#1d1d1f]'}`} />
                <span>{isSyncing ? 'Đang Đẩy Dữ Liệu...' : '☁️ Đẩy Dữ Liệu Lên Cloud Firestore (194 Lab)'}</span>
              </button>
            </div>

            {/* Syncing Progress Stream */}
            {isSyncing && (
              <div className="p-4 bg-white border border-[#e0e0e0] rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1d1d1f]">
                  <RefreshCw className="w-4 h-4 text-[#0066cc] animate-spin" />
                  <span>{syncStep}</span>
                </div>
                <div className="w-full bg-[#e0e0e0] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#0066cc] h-2 rounded-full animate-pulse w-full"></div>
                </div>
                <div className="max-h-40 overflow-y-auto font-mono text-[11px] bg-[#f5f5f7] p-3 rounded-lg border border-[#e0e0e0] text-[#333333] space-y-1 tabular-nums">
                  {syncLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[#0066cc]">►</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sync Result Card */}
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
                    <p className="font-bold text-sm">
                      {syncResult.success
                        ? 'Đồng Bộ Firestore Thành Công!'
                        : syncResult.quotaExceeded
                        ? 'Đồng Bộ Thất Bại (Hết Quota Ghi Firestore) — Mới Chỉ Lưu Ở Máy Cục Bộ (Local)'
                        : syncResult.permissionDenied
                        ? 'Đồng Bộ Cloud Firestore Cần Xác Thực Quyền Ghi — Mới Chỉ Lưu Ở Máy Cục Bộ (Local)'
                        : 'Đồng Bộ Cloud Firestore Thất Bại — Mới Chỉ Lưu Ở Máy Cục Bộ (Local)'}
                    </p>
                    <p>{syncResult.message}</p>
                    {syncResult.timestamp && (
                      <p className="font-mono text-[11px] opacity-75 tabular-nums">
                        Thời gian hoàn tất: {new Date(syncResult.timestamp).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>

                {syncResult.permissionDenied && (
                  <div className="pt-3 border-t border-rose-200 flex flex-wrap items-center gap-2">
                    {!adminUser && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await signInAdminWithGoogle();
                            showToast("Đã đăng nhập Google Admin thành công! Hãy bấm Đẩy Dữ Liệu lại.");
                          } catch (e: any) {
                            showToast(`Không thể mở đăng nhập Google: ${e?.message || 'Vui lòng kiểm tra cấu hình Auth'}`);
                          }
                        }}
                        className="px-3.5 py-2 bg-[#272729] hover:bg-[#333333] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        🔑 Đăng nhập Google Admin (lab-f7f0a)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowRulesHelper(prev => !prev)}
                      className="px-3.5 py-2 bg-white hover:bg-[#f5f5f7] text-rose-800 border border-rose-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      {showRulesHelper ? 'Ẩn cấu hình Firestore Rules' : '📋 Xem & Copy Firestore Rules chuẩn cho lab-f7f0a'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Firebase Auth & Security Rules Status Bar */}
            <div className="bg-white p-5 rounded-[18px] border border-[#e0e0e0] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1d1d1f] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#0066cc]" />
                    <span>Trạng Thái Xác Thực & Phân Quyền Firestore (lab-f7f0a)</span>
                  </h4>
                  <p className="text-xs text-[#333333]">
                    {adminUser
                      ? `Đang đăng nhập với tài khoản: ${adminUser.email || adminUser.displayName || adminUser.uid}`
                      : 'Chưa đăng nhập tài khoản Google trên phiên làm việc này. Dữ liệu vẫn luôn được lưu an toàn tại trình duyệt.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {adminUser ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await signOutAdmin();
                        showToast("Đã đăng xuất tài khoản Google Admin.");
                      }}
                      className="px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#333333] rounded-xl text-xs font-bold border border-[#e0e0e0] cursor-pointer"
                    >
                      Đăng xuất ({adminUser.email?.split('@')[0] || 'Admin'})
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await signInAdminWithGoogle();
                          showToast("Đã xác thực Google Admin thành công!");
                        } catch (e: any) {
                          const msg = String(e?.message || '');
                          if (msg.includes('auth/unauthorized-domain') || e?.code === 'auth/unauthorized-domain') {
                            showToast(`Tên miền (${window.location.hostname}) chưa được thêm vào Firebase Authorized Domains. Hãy xem hướng dẫn bên dưới.`);
                            setShowRulesHelper(true);
                          } else {
                            showToast(`Lỗi đăng nhập Google: ${e?.message || 'Vui lòng kiểm tra Firebase Auth'}`);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-[#272729] hover:bg-[#333333] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      🔑 Đăng Nhập Google Admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowRulesHelper(prev => !prev)}
                    className="px-3.5 py-2 bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] rounded-xl text-xs font-semibold border border-[#e0e0e0] cursor-pointer"
                  >
                    {showRulesHelper ? 'Ẩn Hướng Dẫn Phân Quyền' : 'Cấu Hình & Khắc Phục Lỗi'}
                  </button>
                </div>
              </div>

              {showRulesHelper && (
                <div className="p-4 bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl space-y-4">
                  {/* Hướng dẫn sửa lỗi auth/unauthorized-domain */}
                  <div className="p-3.5 bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-[#1d1d1f] flex flex-wrap items-center justify-between gap-2">
                      <span>🌐 Khắc phục lỗi [auth/unauthorized-domain] khi Đăng nhập Google:</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.hostname);
                          showToast(`Đã sao chép tên miền: ${window.location.hostname}`);
                        }}
                        className="px-2.5 py-1 bg-[#0066cc] hover:bg-[#0071e3] text-[#ffffff] active:scale-95 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Tên Miền ({window.location.hostname})</span>
                      </button>
                    </div>
                    <p className="text-[#1d1d1f] text-[11px] leading-relaxed">
                      Để đăng nhập Google thành công, mở <strong>Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains</strong> của dự án <strong>lab-f7f0a</strong> và bấm <strong>Add domain</strong> dán tên miền: <code className="bg-white text-[#1d1d1f] border border-[#0071e3] px-1.5 py-0.5 rounded font-mono font-bold">{window.location.hostname}</code>.
                    </p>
                  </div>

                  {/* Hướng dẫn Firestore Rules */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-xs text-[#333333]">
                        ⚡ <strong>Cách tối ưu nhất (Không cần đăng nhập Google vẫn đẩy dữ liệu được):</strong> Vào <strong>Firebase Console &rarr; Firestore Database &rarr; Rules</strong> của <strong>lab-f7f0a</strong> và dán bộ quy tắc:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(RECOMMENDED_FIRESTORE_RULES);
                          showToast("Đã sao chép Firestore Rules vào bộ nhớ tạm!");
                        }}
                        className="px-3.5 py-1.5 bg-[#272729] hover:bg-[#333333] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Firestore Rules</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-emerald-400 bg-[#252527] p-3.5 rounded-xl border border-white/10 overflow-x-auto">
                      {RECOMMENDED_FIRESTORE_RULES}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Backup, Import & Restore Panel */}
            <div className="bg-white p-6 rounded-[18px] border border-[#e0e0e0] space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1d1d1f] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0066cc]" />
                <span>Sao Lưu Dự Phòng & Khôi Phục File (Backup & Restore)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Export JSON */}
                <div className="p-4 bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1d1d1f]">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Xuất Bản Sao Lưu (Export JSON)</span>
                  </div>
                  <p className="text-[11px] text-[#333333]">
                    Tải về máy file cấu hình JSON chứa toàn bộ bảng giá và mã khung.
                  </p>
                  <button
                    onClick={handleExportJson}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Tải File JSON Backup
                  </button>
                </div>

                {/* Import JSON */}
                <div className="p-4 bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1d1d1f]">
                    <Upload className="w-4 h-4 text-[#0066cc]" />
                    <span>Khôi Phục Từ File (Import JSON)</span>
                  </div>
                  <p className="text-[11px] text-[#333333]">
                    Tải file JSON backup từ máy tính để phục hồi dữ liệu Master Catalog.
                  </p>
                  <label className="block w-full py-2 bg-[#272729] hover:bg-[#333333] text-white font-mono text-xs font-bold rounded-xl transition-colors text-center cursor-pointer">
                    Chọn File JSON
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                </div>

                {/* Reset Factory */}
                <div className="p-4 bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1d1d1f]">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>Khôi Phục Mặc Định</span>
                  </div>
                  <p className="text-[11px] text-[#333333]">
                    Khôi phục dữ liệu nguyên bản do Tiệm In 194 phát hành.
                  </p>
                  <button
                    onClick={handleResetDefaults}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer border border-rose-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/70 backdrop-blur-sm">
          <div className="bg-white border border-[#e0e0e0] rounded-[18px] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3">
              <h3 className="font-extrabold text-sm text-[#1d1d1f] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0066cc]" />
                <span>Thêm Chất Liệu Mới Vào Master Catalog</span>
              </h3>
              <button onClick={() => setIsAddingMaterial(false)} className="text-[#7a7a7a] hover:text-[#333333] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#333333] font-bold mb-1">Tên Chất Liệu Mới</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tráng Gương Pha Lê"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#333333] font-bold mb-1">Tiền Tố SKU Bo Viền</label>
                  <input
                    type="text"
                    placeholder="e.g. TG"
                    value={newMatBoVienPrefix}
                    onChange={(e) => setNewMatBoVienPrefix(e.target.value)}
                    className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] font-mono font-bold uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#333333] font-bold mb-1">Tiền Tố SKU Khung</label>
                  <input
                    type="text"
                    placeholder="e.g. TGK"
                    value={newMatKhungPrefix}
                    onChange={(e) => setNewMatKhungPrefix(e.target.value)}
                    className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] font-mono font-bold uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#333333] font-bold mb-1">Loại Bảng Cấu Hình Giá</label>
                <select
                  value={newMatType}
                  onChange={(e) => setNewMatType(e.target.value as any)}
                  className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] font-semibold focus:outline-none"
                >
                  <option value="dong-khung">Đóng Khung Full Cột (K0-K11, Titan 1, Titan 2)</option>
                  <option value="in-ep">Đơn Bảng (In Ép / Một Đơn Giá)</option>
                  <option value="album">Album Mở Phẳng</option>
                </select>
              </div>

              {/* Tier Selection for New Material */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[#333333] font-bold">Xuất hiện tại những bảng giá nào:</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                    newMatTiers.includes('studio') ? 'bg-[#f5f5f7] border-[#0071e3] text-[#0066cc] font-bold' : 'bg-white border-[#e0e0e0] text-[#333333]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newMatTiers.includes('studio')}
                      onChange={(e) => {
                        if (e.target.checked) setNewMatTiers([...newMatTiers, 'studio']);
                        else setNewMatTiers(newMatTiers.filter(t => t !== 'studio'));
                      }}
                      className="rounded accent-[#0066cc] focus:ring-0"
                    />
                    <span>1. Studio</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                    newMatTiers.includes('freelance') ? 'bg-[#f5f5f7] border-[#0071e3] text-[#0066cc] font-bold' : 'bg-white border-[#e0e0e0] text-[#333333]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newMatTiers.includes('freelance')}
                      onChange={(e) => {
                        if (e.target.checked) setNewMatTiers([...newMatTiers, 'freelance']);
                        else setNewMatTiers(newMatTiers.filter(t => t !== 'freelance'));
                      }}
                      className="rounded accent-[#0066cc] focus:ring-0"
                    />
                    <span>2. Freelance</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                    newMatTiers.includes('retail') ? 'bg-[#f5f5f7] border-[#0071e3] text-[#0066cc] font-bold' : 'bg-white border-[#e0e0e0] text-[#333333]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newMatTiers.includes('retail')}
                      onChange={(e) => {
                        if (e.target.checked) setNewMatTiers([...newMatTiers, 'retail']);
                        else setNewMatTiers(newMatTiers.filter(t => t !== 'retail'));
                      }}
                      className="rounded accent-[#0066cc] focus:ring-0"
                    />
                    <span>3. Khách Lẻ</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl text-[11px] text-[#333333] font-mono space-y-1 tabular-nums">
                <div>Xem trước mã SKU tự động:</div>
                <div className="text-emerald-700 font-bold">
                  {newMatBoVienPrefix ? `${newMatBoVienPrefix.toUpperCase()}ST60*90` : '[PREFIX]ST60*90'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e0e0e0] flex justify-end gap-2">
              <button
                onClick={() => setIsAddingMaterial(false)}
                className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#333333] rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateCustomMaterial}
                className="px-5 py-2 bg-[#272729] hover:bg-[#333333] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Tạo Chất Liệu Mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM KÍCH THƯỚC MỚI */}
      {isAddingSize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/70 backdrop-blur-sm">
          <div className={`bg-white border border-[#e0e0e0] rounded-[18px] w-full p-6 space-y-4 ${selectedMaterial === 'album-mo-phang' ? 'max-w-md' : 'max-w-sm'}`}>
            <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3">
              <h3 className="font-extrabold text-sm text-[#1d1d1f] flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{selectedMaterial === 'album-mo-phang' ? 'Thêm Kích Thước Album Mở Phẳng' : 'Thêm Kích Thước Mới'}</span>
              </h3>
              <button onClick={() => setIsAddingSize(false)} className="text-[#7a7a7a] hover:text-[#333333] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#333333] font-bold mb-1">
                  {selectedMaterial === 'album-mo-phang' ? 'Kích Thước Album' : 'Kích Thước (cm)'}
                </label>
                <input
                  type="text"
                  placeholder={selectedMaterial === 'album-mo-phang' ? 'VD: 25*35, 30*40 hoặc Thêm tờ 25*35' : 'Ví dụ: 45x60, 45*60, 50x70...'}
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-[#1d1d1f] font-mono text-sm font-bold tabular-nums focus:outline-none"
                />
              </div>

              {selectedMaterial === 'album-mo-phang' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-[#333333] font-bold">Số Tờ Tiêu Chuẩn</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { sheets: 1, label: '1 tờ (2 trang)' },
                        { sheets: 10, label: '10 tờ (20 trang)' },
                        { sheets: 15, label: '15 tờ (30 trang)' }
                      ].map((preset) => (
                        <button
                          key={preset.sheets}
                          type="button"
                          onClick={() => {
                            setNewAlbumSheets(preset.sheets);
                            const trimmed = newSizeInput.trim();
                            if (preset.sheets === 1 && /^\d+\s*[*xX]\s*\d+$/.test(trimmed)) {
                              setNewSizeInput(`Thêm tờ ${trimmed.replace(/[xX]/g, '*')}`);
                            } else if (preset.sheets !== 1 && /^th[eê]m\s*t[oơờ]\s+/i.test(trimmed)) {
                              setNewSizeInput(trimmed.replace(/^th[eê]m\s*t[oơờ]\s+/i, ''));
                            }
                          }}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                            newAlbumSheets === preset.sheets
                              ? 'bg-[#272729] border-[#272729] text-[#ffffff]'
                              : 'bg-[#f5f5f7] border-[#e0e0e0] text-[#333333] hover:bg-[#f5f5f7]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min={1}
                        value={newAlbumSheets === 0 ? '' : newAlbumSheets}
                        onChange={(e) => {
                          const v = e.target.value === '' ? 0 : Math.max(0, Math.floor(Number(e.target.value)));
                          setNewAlbumSheets(Number.isFinite(v) ? v : 1);
                        }}
                        className="w-24 bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl px-2.5 py-2 text-sm font-mono font-bold tabular-nums text-[#0066cc] focus:outline-none"
                      />
                      <span className="font-mono tabular-nums text-[#333333] font-bold">
                        tờ ({(newAlbumSheets || 0) * 2} trang)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#333333] font-bold mb-1">Đơn Giá Hoàn Thiện (VNĐ)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="VD: 350000 (có thể để trống nhập sau)"
                      value={newAlbumPrice}
                      onChange={(e) => setNewAlbumPrice(e.target.value)}
                      className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl p-2.5 text-emerald-700 font-mono text-sm font-bold tabular-nums focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Tier Selection for New Size */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[#333333] font-bold">Xuất hiện tại những bảng giá nào:</label>
                <div className={`grid grid-cols-1 gap-2 ${selectedMaterial === 'album-mo-phang' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                    newSizeTiers.includes('studio') ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'bg-white border-[#e0e0e0] text-[#333333]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newSizeTiers.includes('studio')}
                      onChange={(e) => {
                        if (e.target.checked) setNewSizeTiers([...newSizeTiers, 'studio']);
                        else setNewSizeTiers(newSizeTiers.filter(t => t !== 'studio'));
                      }}
                      className="rounded accent-emerald-600 focus:ring-0"
                    />
                    <span>1. Studio</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                    newSizeTiers.includes('freelance') ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'bg-white border-[#e0e0e0] text-[#333333]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newSizeTiers.includes('freelance')}
                      onChange={(e) => {
                        if (e.target.checked) setNewSizeTiers([...newSizeTiers, 'freelance']);
                        else setNewSizeTiers(newSizeTiers.filter(t => t !== 'freelance'));
                      }}
                      className="rounded accent-emerald-600 focus:ring-0"
                    />
                    <span>2. Freelance</span>
                  </label>

                  {selectedMaterial !== 'album-mo-phang' && (
                    <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                      newSizeTiers.includes('retail') ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'bg-white border-[#e0e0e0] text-[#333333]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={newSizeTiers.includes('retail')}
                        onChange={(e) => {
                          if (e.target.checked) setNewSizeTiers([...newSizeTiers, 'retail']);
                          else setNewSizeTiers(newSizeTiers.filter(t => t !== 'retail'));
                        }}
                        className="rounded accent-emerald-600 focus:ring-0"
                      />
                      <span>3. Khách Lẻ</span>
                    </label>
                  )}
                </div>
              </div>

              {newSizeInput.trim() && (
                <div className="p-3 bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl text-[11px] font-mono tabular-nums space-y-1">
                  <div>
                    <span className="text-[#7a7a7a]">Chuẩn hóa tự động: </span>
                    <span className="text-emerald-700 font-bold">
                      {selectedMaterial === 'album-mo-phang'
                        ? normalizeAlbumSizeLabel(newSizeInput)
                        : normalizeSize(newSizeInput)}
                    </span>
                  </div>
                  {selectedMaterial === 'album-mo-phang' && (
                    <div>
                      <span className="text-[#7a7a7a]">Mã SKU dự kiến ({currentTier === 'freelance' ? 'FL' : 'ST'}): </span>
                      <span className="text-[#1d1d1f] font-extrabold">
                        {generateCellSku(
                          'album-mo-phang',
                          currentTier,
                          normalizeAlbumSizeLabel(newSizeInput),
                          'price',
                          customMaterials,
                          undefined,
                          Math.max(1, newAlbumSheets || 10)
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#e0e0e0] flex justify-end gap-2">
              <button
                onClick={() => setIsAddingSize(false)}
                className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#333333] rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNewSize}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Lưu Kích Thước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Retail Size */}
      {isAddingRetailSize && (
        <div className="fixed inset-0 z-50 bg-[#000000]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e0e0e0] rounded-[18px] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3">
              <h3 className="text-sm font-extrabold text-[#1d1d1f] flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Thêm Kích Thước Cho Bảng Khách Lẻ</span>
              </h3>
              <button onClick={() => setIsAddingRetailSize(false)} className="text-[#7a7a7a] hover:text-[#333333] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#333333] font-bold block">
                Nhập kích thước ảnh (Ví dụ: 35x50, 45x60, 60x120):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 35x50"
                value={newRetailSizeInput}
                onChange={(e) => setNewRetailSizeInput(e.target.value)}
                className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl px-3 py-2 text-sm text-[#1d1d1f] font-mono font-bold tabular-nums focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingRetailSize(false)}
                className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#333333] font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAddRetailSize}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Thêm Kích Thước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM CỘT KHUNG / CHẤT LIỆU MỚI (DYNAMIC COLUMNS) */}
      {isAddingColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-[#e0e0e0] rounded-[18px] w-full max-w-lg p-6 space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3">
              <h3 className="font-extrabold text-base text-[#1d1d1f] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0066cc]" />
                <span>Thêm Cột Khung / Quy Cách Mới</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColLabel('');
                  setNewColSkuPrefix('');
                }}
                className="text-[#7a7a7a] hover:text-[#333333] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5">
                  Tên hiển thị cột (VD: HD Khung Gỗ, Khung Hoa Văn Cổ Điển) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  placeholder="VD: HD Khung Gỗ"
                  className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#1d1d1f] font-semibold focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5">
                  Mã tiền tố (Prefix) SKU <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newColSkuPrefix}
                  onChange={(e) => setNewColSkuPrefix(e.target.value)}
                  placeholder="VD: KGO, TT3, HVCD"
                  className="w-full bg-white border border-[#e0e0e0] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-[#0066cc] focus:outline-none"
                />
                <p className="text-[11px] text-[#7a7a7a] mt-1.5">
                  Mã SKU sẽ tự động gắn đuôi: <span className="font-mono font-bold text-[#0066cc]">...{newColSkuPrefix.trim().toUpperCase() || 'PREFIX'}</span>
                </p>
              </div>

              {/* CHỌN PHÂN HỆ BẢNG GIÁ ÁP DỤNG */}
              <div className="space-y-2 pt-2 border-t border-[#e0e0e0]">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#333333] font-bold block">
                    Bạn muốn thêm cột này trên phân hệ bảng giá nào? <span className="text-rose-500">*</span>
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
                    className="text-[11px] font-bold text-[#0066cc] hover:underline cursor-pointer"
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
                            ? 'bg-[#f5f5f7] border-[#0071e3] text-[#0066cc]'
                            : 'bg-white border-[#e0e0e0] text-[#333333] hover:text-[#1d1d1f]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="accent-[#0066cc] rounded"
                        />
                        <span>{tierOpt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* CHỌN BẢNG GIÁ CHẤT LIỆU ÁP DỤNG (KHI CHỌN STUDIO HOẶC FREELANCE) */}
              {(colTargetTiers.includes('studio') || colTargetTiers.includes('freelance')) && (
                <div className="space-y-2 pt-2 border-t border-[#e0e0e0]">
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
                          <label className="text-xs text-[#333333] font-bold block">
                            Áp dụng cho bảng giá chất liệu nào? <span className="text-rose-500">*</span>
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
                            className="text-[11px] font-bold text-[#0066cc] hover:underline cursor-pointer"
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
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                    : 'bg-white border-[#e0e0e0] text-[#333333] hover:text-[#1d1d1f]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {}}
                                  className="accent-emerald-600 rounded"
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

              <div className="p-3.5 bg-[#f5f5f7] rounded-xl border border-[#e0e0e0] text-xs text-[#333333] space-y-1.5">
                <div className="font-bold text-[#1d1d1f]">💡 Lưu ý tự động:</div>
                <div>• Cột mới sẽ chỉ được thêm vào các bảng giá bạn đã tích chọn ở trên với giá trị mặc định là <strong>0đ</strong>.</div>
                <div>• Bạn có thể kéo thả tiêu đề cột để thay đổi thứ tự hiển thị bất cứ lúc nào.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e0e0e0]">
              <button
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColLabel('');
                  setNewColSkuPrefix('');
                }}
                className="px-4 py-2 text-xs font-bold text-[#333333] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e0e0e0] rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleAddColumnConfirm}
                disabled={!newColLabel.trim() || !newColSkuPrefix.trim() || colTargetTiers.length === 0}
                className="px-5 py-2.5 bg-[#272729] hover:bg-[#333333] disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Xác Nhận Thêm Cột
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XÓA CỘT KHUNG / CHẤT LIỆU (HỎI NGƯỜI DÙNG MUỐN XÓA TRÊN BẢNG GIÁ NÀO) */}
      {deletingColumnInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-[#e0e0e0] rounded-[18px] w-full max-w-lg p-6 space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3">
              <h3 className="font-extrabold text-base text-[#1d1d1f] flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>Xóa Cột Khung: <span className="text-rose-600">{deletingColumnInfo.columnLabel}</span></span>
              </h3>
              <button
                onClick={() => setDeletingColumnInfo(null)}
                className="text-[#7a7a7a] hover:text-[#333333] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed">
                Bạn đang yêu cầu xóa cột <strong className="text-rose-700">[{deletingColumnInfo.columnLabel}]</strong>
                {deletingColumnInfo.columnSkuPrefix ? ` (Mã SKU: ${deletingColumnInfo.columnSkuPrefix})` : ''}. Vui lòng chọn những bảng giá mà bạn muốn áp dụng thay đổi xóa cột này:
              </div>

              {/* CHỌN PHÂN HỆ BẢNG GIÁ MUỐN XÓA CỘT */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#333333] font-bold block">
                    1. Bạn muốn xóa cột này trên phân hệ bảng giá nào? <span className="text-rose-500">*</span>
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
                    className="text-[11px] font-bold text-[#0066cc] hover:underline cursor-pointer"
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
                            ? 'bg-rose-50 border-rose-500 text-rose-700'
                            : 'bg-white border-[#e0e0e0] text-[#333333] hover:text-[#1d1d1f]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="accent-rose-600 rounded"
                        />
                        <span>{tierOpt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* CHỌN BẢNG GIÁ CHẤT LIỆU MUỐN XÓA CỘT (KHI CHỌN STUDIO HOẶC FREELANCE) */}
              {(delColTiers.includes('studio') || delColTiers.includes('freelance')) && (
                <div className="space-y-2 pt-2 border-t border-[#e0e0e0]">
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
                          <label className="text-xs text-[#333333] font-bold block">
                            2. Xóa cột này ở bảng giá chất liệu nào? <span className="text-rose-500">*</span>
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
                            className="text-[11px] font-bold text-[#0066cc] hover:underline cursor-pointer"
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
                                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                                    : 'bg-white border-[#e0e0e0] text-[#333333] hover:text-[#1d1d1f]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {}}
                                  className="accent-rose-600 rounded"
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

              <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e0e0e0] text-[11px] text-[#333333]">
                • Những phân hệ bảng giá và bảng chất liệu <strong>không được tích chọn</strong> sẽ giữ nguyên cột này như cũ.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e0e0e0]">
              <button
                onClick={() => setDeletingColumnInfo(null)}
                className="px-4 py-2 text-xs font-bold text-[#333333] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e0e0e0] rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteColumnConfirm}
                disabled={delColTiers.length === 0}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[#e0e0e0] rounded-[18px] max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1d1d1f]">{confirmDialog.title}</h4>
                <p className="text-xs text-[#333333] mt-1 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#e0e0e0]">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-2 bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#333333] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  action();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDialog.confirmText || 'Xác nhận xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#272729] border-t border-white/10 px-6 py-4 text-center text-xs text-[#7a7a7a] font-mono">
        Bao-Gia 194 Master Catalog Control · Tiệm In 194 Lab B2B © 2026
      </footer>

    </div>
  );
};

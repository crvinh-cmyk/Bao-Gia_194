import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  onSnapshot 
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { getMasterCatalog, markLocalFirestoreWriteStart, markLocalFirestoreWriteEnd } from "./adminStore";
import { buildEnrichedTierData } from "../utils/skuGenerator";
import { sanitizeFramesForFirestore } from "../utils/frameImageResolver";

export interface SyncStatus {
  lastSyncedAt: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  totalPricingTables: number;
  totalFrames: number;
  message?: string;
  sourceApp?: string;
}

export interface SyncCatalogResult {
  success: boolean;
  message: string;
  timestamp: string;
  permissionDenied?: boolean;
  quotaExceeded?: boolean;
  writesPerformed?: number;
}

export interface FlatProductPayloadItem {
  sku: string;
  name: string;
  size: string;
  price: number;
  category: string;
}

export const MASTER_CATALOG_DOC_ID = "pricing2026_master";
export const MASTER_FRAMES_DOC_ID = "frames2026_master";
const LAST_SYNCED_FRAMES_FP_KEY = "tiem194_last_synced_frames_fp_v1";

export const RECOMMENDED_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Cho phép Khách xem Báo giá & Mẫu khung (ĐỌC PUBLIC), nhưng CHỈ ADMIN ĐĂNG NHẬP mới được GHI / SỬA
    match /system_config/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /master_catalog/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /pricing_tables/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /frames/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /shop_info/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /sync_history/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /system_metadata/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 2. Bảo vệ tuyệt đối Dữ Liệu Khách Hàng, Hóa Đơn, Đơn Hàng của xưởng "quan-ly-194"
    // Khách xem link báo giá KHÔNG THỂ đọc hoặc sửa bất kỳ đơn hàng / hóa đơn nào!
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

function isPermissionDeniedError(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || '').toLowerCase();
  const msg = String(err.message || '').toLowerCase();
  return (
    code.includes('permission-denied') ||
    code.includes('permission_denied') ||
    msg.includes('missing or insufficient permissions')
  );
}

function isQuotaExceededError(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || '').toLowerCase();
  const msg = String(err.message || '').toLowerCase();
  return (
    code.includes('resource-exhausted') ||
    code.includes('resource_exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('quota')
  );
}

function getStoredFramesFingerprint(): string | null {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(LAST_SYNCED_FRAMES_FP_KEY);
    }
  } catch {
    // Ignore storage read error
  }
  return null;
}

function saveStoredFramesFingerprint(fp: string) {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(LAST_SYNCED_FRAMES_FP_KEY, fp);
    }
  } catch {
    // Ignore storage write error
  }
}

let activeSyncPromise: Promise<SyncCatalogResult> | null = null;
let lastSyncedFramesFingerprint: string | null = getStoredFramesFingerprint();

/**
 * Xuất bản Master Catalog lên Cloud Firestore `lab-f7f0a` chỉ với 2 - 3 lượt ghi tối ưu:
 * 1. `system_config/master_pricing` (1 lượt ghi - dùng `setDoc` với `{ merge: true }`)
 * 2. `master_catalog/pricing2026_master` (1 lượt ghi)
 * 3. `master_catalog/frames2026_master` (1 lượt ghi - chỉ ghi khi danh mục mẫu khung có sự thay đổi)
 */
export async function syncCatalogToFirestore(
  onProgress?: (step: string) => void
): Promise<SyncCatalogResult> {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  const runPromise = executeCatalogSync(onProgress);
  activeSyncPromise = runPromise;

  try {
    return await runPromise;
  } finally {
    if (activeSyncPromise === runPromise) {
      activeSyncPromise = null;
    }
  }
}

async function executeCatalogSync(
  onProgress?: (step: string) => void
): Promise<SyncCatalogResult> {
  const nowIso = new Date().toISOString();
  markLocalFirestoreWriteStart(nowIso);
  let syncSucceeded = false;

  try {
    const catalog = getMasterCatalog();
    const customMats = catalog.customMaterials || [];

    // Build SKU-enriched tier datasets for all 3 tiers (Studio, Freelance, Retail)
    const studioEnriched = buildEnrichedTierData(catalog.tiers.studio, 'studio', customMats);
    const freelanceEnriched = buildEnrichedTierData(catalog.tiers.freelance, 'freelance', customMats);
    const retailEnriched = buildEnrichedTierData(catalog.tiers.retail, 'retail', customMats);

    const activeTierId = catalog.activeTier || 'studio';
    const activeEnriched = activeTierId === 'studio' ? studioEnriched : activeTierId === 'freelance' ? freelanceEnriched : retailEnriched;
    const retailProducts = retailEnriched.retailProducts || [];

    // Chuẩn hóa mảng phẳng { sku, name, size, price, category } cho Studio và Freelance để quan-ly-194 đọc trực tiếp
    const studioProducts: FlatProductPayloadItem[] = studioEnriched.flatItems.map(item => ({
      sku: item.sku,
      name: item.name || `${item.variantLabel || item.material} ${item.size}`,
      size: item.size,
      price: item.price as number,
      category: item.category || String(item.material)
    }));

    const freelanceProducts: FlatProductPayloadItem[] = freelanceEnriched.flatItems.map(item => ({
      sku: item.sku,
      name: item.name || `${item.variantLabel || item.material} ${item.size}`,
      size: item.size,
      price: item.price as number,
      category: item.category || String(item.material)
    }));

    const allSkuItems = [
      ...studioEnriched.flatItems,
      ...freelanceEnriched.flatItems,
      ...retailEnriched.flatItems
    ];

    const totalTablesCount = 7 + customMats.length;
    const sanitizedFrames = sanitizeFramesForFirestore(catalog.frames || []);
    const currentFramesFingerprint = JSON.stringify(sanitizedFrames);
    const framesChanged = currentFramesFingerprint !== lastSyncedFramesFingerprint;

    const masterPricingPayload = {
      version: catalog.version || "2026.2",
      shopName: catalog.shopInfo.name,
      shopInfo: catalog.shopInfo,
      updatedAt: nowIso,
      lastSyncedAt: nowIso,
      lastSyncedBy: auth.currentUser?.email || "Tiệm In 194 Admin Panel",
      status: "success",
      updatedAtServer: serverTimestamp(),
      sourceApp: "tiem-in-194-admin",
      targetApp: "quan-ly-194",
      activeTier: activeTierId,
      totalPricingTables: totalTablesCount,
      totalSkuCount: allSkuItems.length,
      totalFramesCount: sanitizedFrames.length,
      totalFrames: sanitizedFrames.length,
      customMaterials: customMats,
      studioProducts: studioProducts,
      freelanceProducts: freelanceProducts,
      retailProducts: retailProducts,
      retailTable: retailEnriched.tables.retailTable || [],
      retailPassports: retailEnriched.tables.retailPassports || [],
      tiers: {
        studio: studioEnriched.tables,
        freelance: freelanceEnriched.tables,
        retail: retailEnriched.tables
      },
      skuItemsByTier: {
        studio: studioEnriched.flatItems,
        freelance: freelanceEnriched.flatItems,
        retail: retailProducts
      },
      allSkuItems: allSkuItems,
      tables: {
        inEpMika: { title: "Bảng Giá In Ép Mika (Trang 1)", data: activeEnriched.tables.inEpMika },
        goLuaDongKhung: { title: "Gỗ Lụa Đóng Khung (Trang 2)", data: activeEnriched.tables.goLua },
        mikaPhoThong: { title: "Mika Phổ Thông Đóng Khung (Trang 3)", data: activeEnriched.tables.mikaPhoThong },
        hdGuongSieuBongKhung: { title: "HD Gương Siêu Bóng Khung (Trang 4)", data: activeEnriched.tables.hdGuongSieuBong },
        anh4K: { title: "Bảng Giá Ảnh 4K Cao Cấp (Trang 5)", data: activeEnriched.tables.anh4K },
        hdPro: { title: "HD PRO Khung Cao Cấp (Trang 6)", data: activeEnriched.tables.hdPro },
        albumMoPhang: { title: "Album Mở Phẳng (Trang 7)", data: activeEnriched.tables.albumMoPhang },
        retailSingleTable: { title: "Bảng Giá Khách Lẻ (Dịch Vụ)", data: retailEnriched.tables.retailTable, passports: retailEnriched.tables.retailPassports },
        customTables: activeEnriched.tables.customTables || {}
      },
      frames: sanitizedFrames,
      frameReferenceGuide: sanitizedFrames
    };

    let writesCount = 0;

    // Lượt ghi 1: Ghi vào system_config/master_pricing (dùng setDoc với { merge: true })
    if (onProgress) {
      onProgress(`[Lượt ghi 1] Đang xuất bản ${allSkuItems.length} mã SKU (Studio: ${studioProducts.length}, Freelance: ${freelanceProducts.length}, Khách Lẻ: ${retailProducts.length}) lên system_config/master_pricing...`);
    }
    await setDoc(doc(db, "system_config", "master_pricing"), masterPricingPayload, { merge: true });
    writesCount += 1;

    // Lượt ghi 2: Ghi vào master_catalog/pricing2026_master
    if (onProgress) {
      onProgress(`[Lượt ghi 2] Đang đồng bộ bản sao chuẩn sang master_catalog/${MASTER_CATALOG_DOC_ID}...`);
    }
    await setDoc(doc(db, "master_catalog", MASTER_CATALOG_DOC_ID), masterPricingPayload, { merge: true });
    writesCount += 1;

    // Lượt ghi 3 (Chỉ thực hiện khi danh mục mẫu khung có thay đổi): Ghi vào master_catalog/frames2026_master
    if (framesChanged) {
      if (onProgress) {
        onProgress(`[Lượt ghi 3] Phát hiện thay đổi mẫu khung — đang cập nhật ${sanitizedFrames.length} mẫu khung sang master_catalog/${MASTER_FRAMES_DOC_ID}...`);
      }
      const masterFramesPayload = {
        version: catalog.version || "2026.2",
        updatedAt: nowIso,
        updatedAtServer: serverTimestamp(),
        totalFrames: sanitizedFrames.length,
        frames: sanitizedFrames
      };
      await setDoc(doc(db, "master_catalog", MASTER_FRAMES_DOC_ID), masterFramesPayload, { merge: true });
      writesCount += 1;
      lastSyncedFramesFingerprint = currentFramesFingerprint;
      saveStoredFramesFingerprint(currentFramesFingerprint);
    } else {
      if (onProgress) {
        onProgress(`Danh mục ${sanitizedFrames.length} mẫu khung không thay đổi — bỏ qua ghi master_catalog/${MASTER_FRAMES_DOC_ID} để tiết kiệm lượt ghi.`);
      }
    }

    syncSucceeded = true;
    if (onProgress) {
      onProgress(`Hoàn tất xuất bản lên Cloud Firestore chỉ với ${writesCount} lượt ghi!`);
    }

    return {
      success: true,
      writesPerformed: writesCount,
      message: `Đã xuất bản thành công lên Cloud Firestore (lab-f7f0a) chỉ với ${writesCount} lượt ghi! Đồng bộ đầy đủ ${allSkuItems.length} mã SKU (Studio: ${studioProducts.length}, Freelance: ${freelanceProducts.length}, Khách Lẻ: ${retailProducts.length}) và ${sanitizedFrames.length} mẫu khung sang quan-ly-194.`,
      timestamp: nowIso
    };

  } catch (error: any) {
    const isPermDenied = isPermissionDeniedError(error);
    const isQuota = isQuotaExceededError(error);
    const rawMsg = error?.message || "Lỗi không xác định khi ghi Firestore";

    if (isQuota) {
      const quotaMessage = `⚠️ CHƯA ĐỒNG BỘ LÊN CLOUD (MỚI CHỈ LƯU Ở MÁY CỤC BỘ - LOCAL): Dự án Firestore "lab-f7f0a" đã hết hạn mức ghi (Quota Exceeded). Dữ liệu của bạn hiện MỚI CHỈ LƯU Ở MÁY CỤC BỘ (localStorage), CHƯA LÊN ĐƯỢC CLOUD FIRESTORE cho ứng dụng quan-ly-194. Chi tiết: ${rawMsg}`;
      if (onProgress) onProgress(quotaMessage);
      return {
        success: false,
        quotaExceeded: true,
        message: quotaMessage,
        timestamp: nowIso
      };
    }

    if (isPermDenied) {
      const signedInUser = auth.currentUser?.email;
      const permMessage = signedInUser
        ? `⚠️ CHƯA ĐỒNG BỘ LÊN CLOUD (MỚI CHỈ LƯU Ở MÁY CỤC BỘ - LOCAL): Tài khoản (${signedInUser}) bị Firestore từ chối quyền ghi (Missing or insufficient permissions). Dữ liệu mới chỉ lưu ở máy cục bộ (localStorage), chưa lên được Cloud Firestore. Vui lòng kiểm tra Firestore Rules trên dự án "lab-f7f0a".`
        : `⚠️ CHƯA ĐỒNG BỘ LÊN CLOUD (MỚI CHỈ LƯU Ở MÁY CỤC BỘ - LOCAL): Dự án Cloud Firestore "lab-f7f0a" từ chối quyền ghi (Missing or insufficient permissions). Dữ liệu của bạn hiện MỚI CHỈ LƯU Ở MÁY CỤC BỘ (localStorage), CHƯA LÊN ĐƯỢC CLOUD. Hãy bấm "Đăng Nhập Google" hoặc cập nhật Firestore Rules bên dưới.`;

      if (onProgress) onProgress(permMessage);

      return {
        success: false,
        permissionDenied: true,
        message: permMessage,
        timestamp: nowIso
      };
    }

    const detailedErrorMsg = `⚠️ CHƯA ĐỒNG BỘ LÊN CLOUD (MỚI CHỈ LƯU Ở MÁY CỤC BỘ - LOCAL): Firestore từ chối hoặc mất kết nối (${rawMsg}). Dữ liệu hiện MỚI CHỈ LƯU Ở MÁY CỤC BỘ (localStorage), CHƯA LÊN ĐƯỢC CLOUD FIRESTORE!`;
    if (onProgress) onProgress(detailedErrorMsg);

    return {
      success: false,
      message: detailedErrorMsg,
      timestamp: nowIso
    };
  } finally {
    markLocalFirestoreWriteEnd(syncSucceeded);
  }
}

/**
 * Gets the current Cloud Sync Status from Firestore (đọc từ system_config/master_pricing)
 */
export async function fetchSyncStatus(): Promise<SyncStatus | null> {
  try {
    const docRef = doc(db, "system_config", "master_pricing");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        lastSyncedAt: data.lastSyncedAt || data.updatedAt || null,
        status: data.status || 'success',
        totalPricingTables: data.totalPricingTables || 7,
        totalFrames: data.totalFramesCount || data.totalFrames || 17,
        message: `Đang lưu trữ ${data.totalSkuCount || 0} mã SKU trên system_config/master_pricing`,
        sourceApp: data.lastSyncedBy || data.sourceApp || 'tiem-in-194-admin'
      };
    }
    return null;
  } catch {
    return null;
  }
}

type SyncStatusCallback = (status: SyncStatus | null) => void;
const syncStatusSubscribers: Set<SyncStatusCallback> = new Set();
let syncStatusUnsubscribe: (() => void) | null = null;
let latestSyncStatusValue: SyncStatus | null = null;

/**
 * Subscribe to real-time sync status updates (Singleton listener — chỉ duy trì 1 kết nối onSnapshot duy nhất)
 */
export function subscribeToSyncStatus(callback: SyncStatusCallback) {
  syncStatusSubscribers.add(callback);
  if (latestSyncStatusValue !== null) {
    callback(latestSyncStatusValue);
  }

  if (!syncStatusUnsubscribe) {
    try {
      const docRef = doc(db, "system_config", "master_pricing");
      syncStatusUnsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            latestSyncStatusValue = {
              lastSyncedAt: data.lastSyncedAt || data.updatedAt || null,
              status: data.status || 'success',
              totalPricingTables: data.totalPricingTables || 7,
              totalFrames: data.totalFramesCount || data.totalFrames || 17,
              message: `Đang lưu trữ ${data.totalSkuCount || 0} mã SKU trên system_config/master_pricing`,
              sourceApp: data.lastSyncedBy || data.sourceApp || 'tiem-in-194-admin'
            };
          } else {
            latestSyncStatusValue = null;
          }
          syncStatusSubscribers.forEach((cb) => cb(latestSyncStatusValue));
        },
        () => {
          latestSyncStatusValue = null;
          syncStatusSubscribers.forEach((cb) => cb(null));
        }
      );
    } catch {
      callback(null);
    }
  }

  return () => {
    syncStatusSubscribers.delete(callback);
    if (syncStatusSubscribers.size === 0 && syncStatusUnsubscribe) {
      syncStatusUnsubscribe();
      syncStatusUnsubscribe = null;
    }
  };
}

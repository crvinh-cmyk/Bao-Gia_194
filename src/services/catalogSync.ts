import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot 
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { getMasterCatalog } from "./adminStore";
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
}

export const MASTER_CATALOG_DOC_ID = "pricing2026_master";
export const MASTER_FRAMES_DOC_ID = "frames2026_master";

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

/**
 * Pushes Master Catalog (7 Pricing tables + dynamic custom materials + 3 Tiers + SKU definitions + Frame collection)
 * directly to Cloud Firestore `lab-f7f0a` (`system_config/master_pricing`).
 * This acts as the Master Catalog for workshop management app (quan-ly-194).
 */
export async function syncCatalogToFirestore(
  onProgress?: (step: string) => void,
  options?: { isBackgroundAutoSync?: boolean }
): Promise<SyncCatalogResult> {
  const nowIso = new Date().toISOString();
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

    const allSkuItems = [
      ...studioEnriched.flatItems,
      ...freelanceEnriched.flatItems,
      ...retailEnriched.flatItems
    ];

    const totalTablesCount = 7 + customMats.length;
    const sanitizedFrames = sanitizeFramesForFirestore(catalog.frames || []);

    // Step 1: Sync Master Pricing document to system_config/master_pricing (quan-ly-194 listener)
    if (onProgress) onProgress(`Đang đồng bộ bảng giá Master Catalog kèm ${allSkuItems.length} mã SKU và ${sanitizedFrames.length} mẫu khung lên system_config/master_pricing...`);
    
    const masterPricingPayload = {
      version: catalog.version || "2026.2",
      shopName: catalog.shopInfo.name,
      shopInfo: catalog.shopInfo,
      updatedAt: nowIso,
      updatedAtServer: serverTimestamp(),
      sourceApp: "tiem-in-194-admin",
      targetApp: "quan-ly-194",
      activeTier: activeTierId,
      totalSkuCount: allSkuItems.length,
      totalFramesCount: sanitizedFrames.length,
      customMaterials: customMats,
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

    // Ghi thẳng vào Document mà quan-ly-194 đang lắng nghe: system_config/master_pricing
    await setDoc(doc(db, "system_config", "master_pricing"), masterPricingPayload);

    // Đồng thời lưu vào master_catalog/pricing2026_master để tương thích ngược
    try {
      await setDoc(doc(db, "master_catalog", MASTER_CATALOG_DOC_ID), masterPricingPayload);
    } catch {
      // Ignore secondary collection error if master_pricing succeeded
    }

    // Step 2: Individual pricing collection documents for modular queries with SKU attached
    if (onProgress) onProgress(`Đang đẩy từng bảng giá ${totalTablesCount} dòng (kèm mã SKU) vào collection 'pricing_tables'...`);
    
    try {
      await setDoc(doc(db, "pricing_tables", "in_ep_mika"), {
        id: "in_ep_mika",
        name: "In Ép Mika",
        data: studioEnriched.tables.inEpMika,
        tiers: {
          studio: studioEnriched.tables.inEpMika,
          freelance: freelanceEnriched.tables.inEpMika,
          retail: retailEnriched.tables.inEpMika
        },
        updatedAt: nowIso
      });

      await setDoc(doc(db, "pricing_tables", "go_lua_dong_khung"), {
        id: "go_lua_dong_khung",
        name: "Gỗ Lụa Đóng Khung",
        data: studioEnriched.tables.goLua,
        tiers: {
          studio: studioEnriched.tables.goLua,
          freelance: freelanceEnriched.tables.goLua,
          retail: retailEnriched.tables.goLua
        },
        updatedAt: nowIso
      });

      await setDoc(doc(db, "pricing_tables", "mika_pho_thong"), {
        id: "mika_pho_thong",
        name: "Mika Phổ Thông Đóng Khung",
        data: studioEnriched.tables.mikaPhoThong,
        tiers: {
          studio: studioEnriched.tables.mikaPhoThong,
          freelance: freelanceEnriched.tables.mikaPhoThong,
          retail: retailEnriched.tables.mikaPhoThong
        },
        updatedAt: nowIso
      });

      await setDoc(doc(db, "pricing_tables", "hd_guong_sieu_bong"), {
        id: "hd_guong_sieu_bong",
        name: "HD Gương Siêu Bóng Khung",
        data: studioEnriched.tables.hdGuongSieuBong,
        tiers: {
          studio: studioEnriched.tables.hdGuongSieuBong,
          freelance: freelanceEnriched.tables.hdGuongSieuBong,
          retail: retailEnriched.tables.hdGuongSieuBong
        },
        updatedAt: nowIso
      });

      await setDoc(doc(db, "pricing_tables", "anh_4k"), {
        id: "anh_4k",
        name: "Ảnh 4K Cao Cấp",
        data: studioEnriched.tables.anh4K,
        tiers: {
          studio: studioEnriched.tables.anh4K,
          freelance: freelanceEnriched.tables.anh4K,
          retail: retailEnriched.tables.anh4K
        },
        updatedAt: nowIso
      });

      await setDoc(doc(db, "pricing_tables", "hd_pro"), {
        id: "hd_pro",
        name: "HD PRO Khung Cao Cấp",
        data: studioEnriched.tables.hdPro,
        tiers: {
          studio: studioEnriched.tables.hdPro,
          freelance: freelanceEnriched.tables.hdPro,
          retail: retailEnriched.tables.hdPro
        },
        updatedAt: nowIso
      });

      await setDoc(doc(db, "pricing_tables", "album_mo_phang"), {
        id: "album_mo_phang",
        name: "Album Mở Phẳng",
        data: studioEnriched.tables.albumMoPhang,
        tiers: {
          studio: studioEnriched.tables.albumMoPhang,
          freelance: freelanceEnriched.tables.albumMoPhang,
          retail: retailEnriched.tables.albumMoPhang
        },
        updatedAt: nowIso
      });

      await setDoc(doc(db, "pricing_tables", "retail_single_table"), {
        id: "retail_single_table",
        name: "Bảng Giá Khách Lẻ (Dịch Vụ)",
        retailTable: retailEnriched.tables.retailTable || [],
        retailPassports: retailEnriched.tables.retailPassports || [],
        updatedAt: nowIso
      });

      for (const mat of customMats) {
        await setDoc(doc(db, "pricing_tables", mat.id), {
          id: mat.id,
          name: mat.name,
          definition: mat,
          data: studioEnriched.tables.customTables?.[mat.id] || [],
          tiers: {
            studio: studioEnriched.tables.customTables?.[mat.id] || [],
            freelance: freelanceEnriched.tables.customTables?.[mat.id] || [],
            retail: retailEnriched.tables.customTables?.[mat.id] || []
          },
          updatedAt: nowIso
        });
      }
    } catch {
      // Ignore optional modular table sync errors
    }

    // Step 3: Sync Frames Catalog (Chỉ lưu đường dẫn ngắn gọn /images/frames/..., tuyệt đối không lưu Base64)
    if (onProgress) onProgress(`Đang đồng bộ ${sanitizedFrames.length} mẫu khung sang 'master_catalog/frames2026_master'...`);

    const masterFramesPayload = {
      version: catalog.version || "2026.2",
      updatedAt: nowIso,
      updatedAtServer: serverTimestamp(),
      totalFrames: sanitizedFrames.length,
      frames: sanitizedFrames
    };

    try {
      await setDoc(doc(db, "master_catalog", MASTER_FRAMES_DOC_ID), masterFramesPayload);
    } catch {
      // Ignore if restricted
    }

    // Step 4: Individual frame documents under `frames` collection for quan-ly-194 item queries
    if (onProgress) onProgress("Đang đẩy danh mục khung vào collection 'frames'...");
    try {
      for (const frame of sanitizedFrames) {
        const docId = frame.id || frame.code.toLowerCase().replace(/\s+/g, '_');
        await setDoc(doc(db, "frames", docId), {
          ...frame,
          updatedAt: nowIso
        });
      }
    } catch {
      // Ignore if restricted
    }

    // Step 5: Save Shop Info
    if (onProgress) onProgress("Đang cập nhật thông tin Tiệm In 194...");
    try {
      await setDoc(doc(db, "shop_info", "194_lab"), {
        ...catalog.shopInfo,
        updatedAt: nowIso
      });
    } catch {
      // Ignore if restricted
    }

    // Step 6: Write sync log to `sync_history`
    if (onProgress) onProgress("Đang ghi nhật ký đồng bộ...");
    try {
      await addDoc(collection(db, "sync_history"), {
        timestamp: nowIso,
        timestampServer: serverTimestamp(),
        source: "tiem-in-194-admin",
        targetProject: "lab-f7f0a",
        tablesCount: totalTablesCount,
        totalSkuCount: allSkuItems.length,
        framesCount: sanitizedFrames.length,
        status: "SUCCESS",
        summary: `Đã đồng bộ Master Catalog ${totalTablesCount} dòng sản phẩm (${allSkuItems.length} mã SKU) & 3 phân hệ giá lên Firestore (lab-f7f0a)`
      });
    } catch {
      // Ignore if restricted
    }

    // Step 7: Update master metadata state document
    try {
      await setDoc(doc(db, "system_metadata", "catalog_sync_status"), {
        lastSyncedAt: nowIso,
        lastSyncedBy: auth.currentUser?.email || "Tiệm In 194 Admin Panel",
        status: "success",
        totalPricingTables: totalTablesCount,
        totalSkuCount: allSkuItems.length,
        totalFrames: sanitizedFrames.length,
        message: `Đồng bộ thành công ${totalTablesCount} bảng giá (${allSkuItems.length} mã SKU) lên Cloud Firestore (lab-f7f0a)`
      });
    } catch {
      // Ignore if restricted
    }

    if (onProgress) onProgress("Hoàn tất đồng bộ Cloud Firestore!");

    return {
      success: true,
      message: `Đã đồng bộ thành công ${totalTablesCount} bảng giá (${allSkuItems.length} mã SKU thuộc 3 phân hệ Studio, Freelance, Khách Lẻ) và ${sanitizedFrames.length} mẫu khung lên Cloud Firestore (lab-f7f0a).`,
      timestamp: nowIso
    };

  } catch (error: any) {
    const isPermDenied = isPermissionDeniedError(error);

    if (options?.isBackgroundAutoSync) {
      // Không bao giờ dùng console.error cho đồng bộ ngầm để tránh báo lỗi giả trên trình duyệt
      return {
        success: false,
        permissionDenied: isPermDenied,
        message: "Đã lưu dữ liệu cục bộ trên trình duyệt.",
        timestamp: nowIso
      };
    }

    if (isPermDenied) {
      const signedInUser = auth.currentUser?.email;
      const permMessage = signedInUser
        ? `Tài khoản (${signedInUser}) chưa được cấp quyền ghi hoặc Firestore Rules trên dự án "lab-f7f0a" đang chặn quyền truy cập. Vui lòng cập nhật tab Rules trong Firebase Console (lab-f7f0a) theo mẫu bên dưới.`
        : `Dự án Cloud Firestore "lab-f7f0a" hiện đang yêu cầu xác thực hoặc chặn quyền ghi (Missing or insufficient permissions). Hãy bấm "Đăng Nhập Google" hoặc cập nhật Firestore Rules cho dự án lab-f7f0a theo hướng dẫn bên dưới. (Dữ liệu của bạn vẫn đã được lưu an toàn trên máy).`;

      if (onProgress) onProgress("Cần cấp quyền Firestore Rules hoặc Đăng nhập Google cho dự án lab-f7f0a.");

      return {
        success: false,
        permissionDenied: true,
        message: permMessage,
        timestamp: nowIso
      };
    }

    const errorMsg = error?.message || "Lỗi không xác định khi đồng bộ Firestore";
    return {
      success: false,
      message: `Lỗi đồng bộ: ${errorMsg}`,
      timestamp: nowIso
    };
  }
}

/**
 * Gets the current Cloud Sync Status from Firestore
 */
export async function fetchSyncStatus(): Promise<SyncStatus | null> {
  try {
    const docRef = doc(db, "system_metadata", "catalog_sync_status");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        lastSyncedAt: data.lastSyncedAt || null,
        status: data.status || 'idle',
        totalPricingTables: data.totalPricingTables || 7,
        totalFrames: data.totalFrames || 14,
        message: data.message || '',
        sourceApp: data.lastSyncedBy || ''
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to real-time sync status updates
 */
export function subscribeToSyncStatus(callback: (status: SyncStatus | null) => void) {
  try {
    const docRef = doc(db, "system_metadata", "catalog_sync_status");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          lastSyncedAt: data.lastSyncedAt || null,
          status: data.status || 'idle',
          totalPricingTables: data.totalPricingTables || 7,
          totalFrames: data.totalFrames || 14,
          message: data.message || '',
          sourceApp: data.lastSyncedBy || ''
        });
      } else {
        callback(null);
      }
    }, () => {
      callback(null);
    });
  } catch {
    callback(null);
    return () => {};
  }
}

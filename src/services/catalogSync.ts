import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase";
import { frameReferenceGuide } from "../data/tiemIn194Pricing2026";
import { getMasterCatalog } from "./adminStore";
import { buildEnrichedTierData } from "../utils/skuGenerator";

export interface SyncStatus {
  lastSyncedAt: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  totalPricingTables: number;
  totalFrames: number;
  message?: string;
  sourceApp?: string;
}

export const MASTER_CATALOG_DOC_ID = "pricing2026_master";
export const MASTER_FRAMES_DOC_ID = "frames2026_master";

/**
 * Pushes Master Catalog (7 Pricing tables + dynamic custom materials + 3 Tiers + SKU definitions + Frame collection)
 * directly to Cloud Firestore `lab-f7f0a` (`system_config/master_pricing`).
 * This acts as the Master Catalog for workshop management app (quan-ly-194).
 */
export async function syncCatalogToFirestore(
  onProgress?: (step: string) => void
): Promise<{ success: boolean; message: string; timestamp: string }> {
  try {
    const nowIso = new Date().toISOString();
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

    // Step 1: Sync Master Pricing document to system_config/master_pricing (quan-ly-194 listener)
    if (onProgress) onProgress(`Đang đồng bộ bảng giá Master Catalog kèm ${allSkuItems.length} mã SKU lên system_config/master_pricing...`);
    
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
      frameReferenceGuide: frameReferenceGuide
    };

    // Ghi thẳng vào Document mà quan-ly-194 đang lắng nghe: system_config/master_pricing
    await setDoc(doc(db, "system_config", "master_pricing"), masterPricingPayload);

    // Đồng thời lưu vào master_catalog/pricing2026_master để tương thích ngược
    await setDoc(doc(db, "master_catalog", MASTER_CATALOG_DOC_ID), masterPricingPayload);

    // Step 2: Individual pricing collection documents for modular queries with SKU attached
    if (onProgress) onProgress(`Đang đẩy từng bảng giá ${totalTablesCount} dòng (kèm mã SKU) vào collection 'pricing_tables'...`);
    
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

    // Also push custom material documents under `pricing_tables` collection
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

    // Step 3: Sync Frames Catalog
    if (onProgress) onProgress(`Đang đồng bộ ${catalog.frames.length} mẫu khung sang 'master_catalog/frames2026_master'...`);

    const masterFramesPayload = {
      version: catalog.version || "2026.2",
      updatedAt: nowIso,
      updatedAtServer: serverTimestamp(),
      totalFrames: catalog.frames.length,
      frames: catalog.frames
    };

    await setDoc(doc(db, "master_catalog", MASTER_FRAMES_DOC_ID), masterFramesPayload);

    // Step 4: Individual frame documents under `frames` collection for quan-ly-194 item queries
    if (onProgress) onProgress("Đang đẩy danh mục khung vào collection 'frames'...");
    for (const frame of catalog.frames) {
      const docId = frame.id || frame.code.toLowerCase().replace(/\s+/g, '_');
      await setDoc(doc(db, "frames", docId), {
        ...frame,
        updatedAt: nowIso
      });
    }

    // Step 5: Save Shop Info
    if (onProgress) onProgress("Đang cập nhật thông tin Tiệm In 194...");
    await setDoc(doc(db, "shop_info", "194_lab"), {
      ...catalog.shopInfo,
      updatedAt: nowIso
    });

    // Step 6: Write sync log to `sync_history`
    if (onProgress) onProgress("Đang ghi nhật ký đồng bộ...");
    await addDoc(collection(db, "sync_history"), {
      timestamp: nowIso,
      timestampServer: serverTimestamp(),
      source: "tiem-in-194-admin",
      targetProject: "lab-f7f0a",
      tablesCount: totalTablesCount,
      totalSkuCount: allSkuItems.length,
      framesCount: catalog.frames.length,
      status: "SUCCESS",
      summary: `Đã đồng bộ Master Catalog ${totalTablesCount} dòng sản phẩm (${allSkuItems.length} mã SKU) & 3 phân hệ giá lên Firestore (lab-f7f0a)`
    });

    // Step 7: Update master metadata state document
    await setDoc(doc(db, "system_metadata", "catalog_sync_status"), {
      lastSyncedAt: nowIso,
      lastSyncedBy: "Tiệm In 194 Admin Panel",
      status: "success",
      totalPricingTables: totalTablesCount,
      totalSkuCount: allSkuItems.length,
      totalFrames: catalog.frames.length,
      message: `Đồng bộ thành công ${totalTablesCount} bảng giá (${allSkuItems.length} mã SKU) lên Cloud Firestore (lab-f7f0a)`
    });

    if (onProgress) onProgress("Hoàn tất đồng bộ Cloud Firestore!");

    return {
      success: true,
      message: `Đã đồng bộ thành công ${totalTablesCount} bảng giá (${allSkuItems.length} mã SKU thuộc 3 phân hệ Studio, Freelance, Khách Lẻ) và ${catalog.frames.length} mẫu khung lên Cloud Firestore (lab-f7f0a).`,
      timestamp: nowIso
    };

  } catch (error: any) {
    console.error("Firestore sync error:", error);
    const errorMsg = error?.message || "Lỗi không xác định khi đồng bộ Firestore";
    
    try {
      await setDoc(doc(db, "system_metadata", "catalog_sync_status"), {
        status: "error",
        message: errorMsg,
        failedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      // Ignore metadata update error
    }

    return {
      success: false,
      message: `Lỗi đồng bộ: ${errorMsg}`,
      timestamp: new Date().toISOString()
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
  } catch (e) {
    console.warn("Could not fetch sync status:", e);
    return null;
  }
}

/**
 * Subscribe to real-time sync status updates
 */
export function subscribeToSyncStatus(callback: (status: SyncStatus | null) => void) {
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
  }, (err) => {
    console.warn("Firestore snapshot listener error:", err);
    callback(null);
  });
}

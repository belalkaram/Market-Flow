// MarketFlow Offline-First IndexedDB Storage Layer
// Lightweight, zero-dependency, ultra-fast local database

const DB_NAME = 'MarketFlow_OfflineDB';
const DB_VERSION = 2;

export interface CacheEntry<T = any> {
  url: string;
  data: T;
  updatedAt: number;
}

export interface SyncQueueItem {
  id?: number;
  method: string;
  path: string;
  body?: any;
  createdAt: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed';
  description?: string;
  tempId?: string;
}

export interface OfflineSaleRecord {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  items: any[];
  totalAmount: string;
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  paymentMethod: string;
  synced: boolean;
  syncError?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;

      // Cache store for GET requests
      if (!db.objectStoreNames.contains('api_cache')) {
        db.createObjectStore('api_cache', { keyPath: 'url' });
      }

      // Sync queue for offline mutations
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Offline sales receipts
      if (!db.objectStoreNames.contains('offline_sales')) {
        const salesStore = db.createObjectStore('offline_sales', { keyPath: 'id' });
        salesStore.createIndex('synced', 'synced', { unique: false });
        salesStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// ---------------- API CACHE ----------------
export async function setApiCache<T>(url: string, data: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('api_cache', 'readwrite');
      const store = tx.objectStore('api_cache');
      const entry: CacheEntry<T> = {
        url,
        data,
        updatedAt: Date.now(),
      };
      const req = store.put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to write to api_cache:', err);
  }
}

export async function getApiCache<T>(url: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('api_cache', 'readonly');
      const store = tx.objectStore('api_cache');
      const req = store.get(url);
      req.onsuccess = () => {
        if (req.result && req.result.data !== undefined) {
          resolve(req.result.data as T);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Failed to read from api_cache:', err);
    return null;
  }
}

// ---------------- SYNC QUEUE ----------------
export async function addSyncQueueItem(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retries' | 'status'>): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const fullItem: SyncQueueItem = {
      ...item,
      createdAt: Date.now(),
      retries: 0,
      status: 'pending',
    };
    const req = store.add(fullItem);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const req = store.getAll();
      req.onsuccess = () => {
        const items = (req.result || []) as SyncQueueItem[];
        resolve(items.filter(i => i.status === 'pending' || i.status === 'failed'));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getSyncQueueCount(): Promise<number> {
  try {
    const items = await getPendingSyncItems();
    return items.length;
  } catch {
    return 0;
  }
}

export async function updateSyncItemStatus(id: number, status: 'pending' | 'syncing' | 'failed', incrementRetry = false): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        const item = getReq.result as SyncQueueItem;
        item.status = status;
        if (incrementRetry) item.retries += 1;
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---------------- OFFLINE SALES ----------------
export async function saveOfflineSale(sale: OfflineSaleRecord): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_sales', 'readwrite');
    const store = tx.objectStore('offline_sales');
    const req = store.put(sale);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineSales(): Promise<OfflineSaleRecord[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('offline_sales', 'readonly');
      const store = tx.objectStore('offline_sales');
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result || []) as OfflineSaleRecord[]);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function markOfflineSaleSynced(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_sales', 'readwrite');
    const store = tx.objectStore('offline_sales');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        const item = getReq.result as OfflineSaleRecord;
        item.synced = true;
        delete item.syncError;
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// Offline Sync Engine for MarketFlow
// Monitors connectivity and executes queued background mutations seamlessly

import {
  getPendingSyncItems,
  updateSyncItemStatus,
  removeSyncQueueItem,
  markOfflineSaleSynced,
  SyncQueueItem,
} from './offlineDb';

export type NetworkStatus = 'online' | 'offline' | 'syncing';

type StatusListener = (status: NetworkStatus, pendingCount: number) => void;

class OfflineSyncService {
  private status: NetworkStatus = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
  private pendingCount = 0;
  private listeners: Set<StatusListener> = new Set();
  private isSyncInProgress = false;
  private syncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      // Periodic queue check every 15 seconds if online
      this.syncTimer = setInterval(() => {
        if (this.status === 'online' && !this.isSyncInProgress) {
          this.syncPendingQueue();
        }
      }, 15000);

      // Initial check
      setTimeout(() => this.updateQueueCount(), 500);
    }
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.pendingCount);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStatus(): NetworkStatus {
    return this.status;
  }

  public getPendingCount(): number {
    return this.pendingCount;
  }

  public async updateQueueCount(): Promise<number> {
    const items = await getPendingSyncItems();
    this.pendingCount = items.length;
    this.notify();
    return this.pendingCount;
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.status, this.pendingCount);
    }
  }

  private handleOnline = () => {
    console.log('[MarketFlow OfflineSync] Internet connection restored.');
    this.status = 'online';
    this.notify();
    this.syncPendingQueue();
  };

  private handleOffline = () => {
    console.log('[MarketFlow OfflineSync] Internet connection lost. Entering Offline Mode.');
    this.status = 'offline';
    this.notify();
  };

  public setOfflineManually() {
    this.status = 'offline';
    this.notify();
  }

  public setOnlineManually() {
    this.status = 'online';
    this.notify();
    this.syncPendingQueue();
  }

  public async syncPendingQueue(): Promise<void> {
    if (this.isSyncInProgress) return;
    if (this.status === 'offline') return;

    const items = await getPendingSyncItems();
    if (items.length === 0) {
      this.pendingCount = 0;
      this.notify();
      return;
    }

    this.isSyncInProgress = true;
    this.status = 'syncing';
    this.notify();

    console.log(`[MarketFlow OfflineSync] Syncing ${items.length} queued items...`);

    const token = localStorage.getItem('mf_token');
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '/api';

    for (const item of items) {
      if (!item.id) continue;

      try {
        await updateSyncItemStatus(item.id, 'syncing');

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${apiBase}${item.path}`, {
          method: item.method,
          headers,
          body: item.body ? JSON.stringify(item.body) : undefined,
        });

        if (res.ok) {
          // Success! Remove from queue
          await removeSyncQueueItem(item.id);

          // If this was an offline sale, mark the receipt as synced
          if (item.tempId) {
            await markOfflineSaleSynced(item.tempId);
          }
          console.log(`[MarketFlow OfflineSync] Successfully synced: ${item.method} ${item.path}`);
        } else {
          console.warn(`[MarketFlow OfflineSync] Server error ${res.status} for ${item.path}`);
          await updateSyncItemStatus(item.id, 'failed', true);
        }
      } catch (networkErr) {
        console.warn(`[MarketFlow OfflineSync] Network failure while syncing item ${item.id}:`, networkErr);
        await updateSyncItemStatus(item.id, 'failed', true);
        // If network connection drop prevented this, switch status to offline
        this.status = 'offline';
        break;
      }
    }

    this.isSyncInProgress = false;
    const remaining = await getPendingSyncItems();
    this.pendingCount = remaining.length;
    this.status = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
    this.notify();
  }
}

export const offlineSyncManager = new OfflineSyncService();

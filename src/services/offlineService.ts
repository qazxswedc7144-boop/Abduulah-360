import { openDB, IDBPDatabase } from 'idb';
import CryptoJS from 'crypto-js';

const DB_NAME = 'NDHS_OFFLINE_DB';
const DB_VERSION = 1;
const ENCRYPTION_KEY = process.env.OFFLINE_ENCRYPTION_KEY || 'ndhs-gov-secure-key-2026';

export interface OfflineData {
  id: string;
  type: 'patient' | 'lab' | 'prescription' | 'ai_report';
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('records')) {
          const store = db.createObjectStore('records', { keyPath: 'id' });
          store.createIndex('type', 'type');
          store.createIndex('synced', 'synced');
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }

  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  }

  private decrypt(ciphertext: string): any {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  async saveRecord(id: string, type: OfflineData['type'], data: any, synced: boolean = true) {
    const db = await this.db;
    const record: OfflineData = {
      id,
      type,
      data: this.encrypt(data),
      timestamp: Date.now(),
      synced,
    };
    await db.put('records', record);
  }

  async getRecordsByType(type: OfflineData['type']): Promise<any[]> {
    const db = await this.db;
    const records = await db.getAllFromIndex('records', 'type', type);
    return records.map(r => ({
      ...this.decrypt(r.data),
      id: r.id,
      _offline: true,
      _timestamp: r.timestamp
    }));
  }

  async getRecordById(id: string): Promise<any | null> {
    const db = await this.db;
    const record = await db.get('records', id);
    if (!record) return null;
    return {
      ...this.decrypt(record.data),
      id: record.id,
      _offline: true,
      _timestamp: record.timestamp
    };
  }

  async addToSyncQueue(operation: 'create' | 'update' | 'delete', collection: string, data: any, docId?: string) {
    const db = await this.db;
    await db.add('sync_queue', {
      operation,
      collection,
      data: this.encrypt(data),
      docId,
      timestamp: Date.now(),
    });
  }

  async getSyncQueue(): Promise<any[]> {
    const db = await this.db;
    const queue = await db.getAll('sync_queue');
    return queue.map(q => ({
      ...q,
      data: this.decrypt(q.data)
    }));
  }

  async removeFromSyncQueue(id: number) {
    const db = await this.db;
    await db.delete('sync_queue', id);
  }

  async clearAll() {
    const db = await this.db;
    await db.clear('records');
    await db.clear('sync_queue');
  }
}

export const offlineService = new OfflineService();

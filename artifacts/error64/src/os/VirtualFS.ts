export interface VFSNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size: number;
  created: string;
  modified: string;
  extension?: string;
  parentPath: string;
  readOnly?: boolean;
  hidden?: boolean;
}

const NOW = new Date().toISOString();

const SAMPLE_TXT = `Welcome to Error64!

Error64 is a fully functional Windows 10 simulation running in your browser.

Features:
- Full virtual file system
- Working applications
- Desktop customization
- And much more!

© 2024 Error64. All rights reserved.`;

const DEFAULT_FS: VFSNode[] = [
  { name: 'C:', path: 'C:', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: '' },
  { name: 'Users', path: 'C:\\Users', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:' },
  { name: 'User', path: 'C:\\Users\\User', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:\\Users' },
  { name: 'Desktop', path: 'C:\\Users\\User\\Desktop', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:\\Users\\User' },
  { name: 'Documents', path: 'C:\\Users\\User\\Documents', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:\\Users\\User' },
  { name: 'Downloads', path: 'C:\\Users\\User\\Downloads', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:\\Users\\User' },
  { name: 'Pictures', path: 'C:\\Users\\User\\Pictures', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:\\Users\\User' },
  { name: 'Music', path: 'C:\\Users\\User\\Music', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:\\Users\\User' },
  { name: 'Videos', path: 'C:\\Users\\User\\Videos', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:\\Users\\User' },
  { name: 'AppData', path: 'C:\\Users\\User\\AppData', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:\\Users\\User', hidden: true },
  { name: 'Recycle Bin', path: 'C:\\Recycle Bin', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:' },
  { name: 'Windows', path: 'C:\\Windows', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:', readOnly: true },
  { name: 'System32', path: 'C:\\Windows\\System32', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:\\Windows', readOnly: true },
  { name: 'Program Files', path: 'C:\\Program Files', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:' },
  { name: 'Temp', path: 'C:\\Temp', type: 'folder', size: 0, created: NOW, modified: NOW, parentPath: 'C:', hidden: true },
  { name: 'Welcome.txt', path: 'C:\\Users\\User\\Documents\\Welcome.txt', type: 'file', size: SAMPLE_TXT.length, created: NOW, modified: NOW, extension: 'txt', parentPath: 'C:\\Users\\User\\Documents' },
  { name: 'Notes.txt', path: 'C:\\Users\\User\\Desktop\\Notes.txt', type: 'file', size: 42, created: NOW, modified: NOW, extension: 'txt', parentPath: 'C:\\Users\\User\\Desktop' },
];

const DB_NAME = 'Error64DB';
const DB_VERSION = 1;
const STORES = ['vfs_contents', 'calendar_events', 'mail_messages', 'browser_history', 'bookmarks'];

let db: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = (e.target as IDBOpenDBRequest).result;
      for (const store of STORES) {
        if (!d.objectStoreNames.contains(store)) d.createObjectStore(store);
      }
    };
    req.onsuccess = () => { db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(store: string, key: string): Promise<unknown> {
  const d = await getDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readonly');
    const s = tx.objectStore(store);
    const r = s.get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function dbPut(store: string, key: string, value: unknown): Promise<void> {
  const d = await getDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readwrite');
    const s = tx.objectStore(store);
    const r = s.put(value, key);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

async function dbDelete(store: string, key: string): Promise<void> {
  const d = await getDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readwrite');
    const s = tx.objectStore(store);
    const r = s.delete(key);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

async function dbGetAll(store: string): Promise<{ key: string; value: unknown }[]> {
  const d = await getDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readonly');
    const s = tx.objectStore(store);
    const keys: IDBValidKey[] = [];
    const values: unknown[] = [];
    const kr = s.getAllKeys();
    kr.onsuccess = () => {
      keys.push(...kr.result as IDBValidKey[]);
      const vr = s.getAll();
      vr.onsuccess = () => {
        values.push(...vr.result);
        resolve(keys.map((k, i) => ({ key: String(k), value: values[i] })));
      };
      vr.onerror = () => reject(vr.error);
    };
    kr.onerror = () => reject(kr.error);
  });
}

export class VirtualFS {
  private static getMetadata(): VFSNode[] {
    try {
      const s = localStorage.getItem('vfs_metadata');
      if (s) return JSON.parse(s);
    } catch {}
    // Initialize with defaults
    const defaults = [...DEFAULT_FS];
    localStorage.setItem('vfs_metadata', JSON.stringify(defaults));
    // Seed file contents
    VirtualFS.writeFile('C:\\Users\\User\\Documents\\Welcome.txt', SAMPLE_TXT);
    VirtualFS.writeFile('C:\\Users\\User\\Desktop\\Notes.txt', 'My notes...\n');
    return defaults;
  }

  private static saveMetadata(data: VFSNode[]) {
    localStorage.setItem('vfs_metadata', JSON.stringify(data));
  }

  static getAll(): VFSNode[] {
    return VirtualFS.getMetadata();
  }

  static getNode(path: string): VFSNode | null {
    return VirtualFS.getMetadata().find(n => n.path === path) || null;
  }

  static getChildren(path: string, showHidden = false): VFSNode[] {
    return VirtualFS.getMetadata().filter(n =>
      n.parentPath === path && (showHidden || !n.hidden)
    );
  }

  static search(query: string): VFSNode[] {
    const q = query.toLowerCase();
    return VirtualFS.getMetadata().filter(n =>
      n.name.toLowerCase().includes(q) && !n.hidden
    );
  }

  static createFolder(parentPath: string, name: string): VFSNode | null {
    const parent = VirtualFS.getNode(parentPath);
    if (!parent || parent.readOnly) return null;
    const path = `${parentPath}\\${name}`;
    const existing = VirtualFS.getNode(path);
    if (existing) return existing;
    const node: VFSNode = {
      name, path, type: 'folder', size: 0,
      created: new Date().toISOString(), modified: new Date().toISOString(),
      parentPath,
    };
    const meta = VirtualFS.getMetadata();
    meta.push(node);
    VirtualFS.saveMetadata(meta);
    return node;
  }

  static createFile(parentPath: string, name: string, content = ''): VFSNode | null {
    const parent = VirtualFS.getNode(parentPath);
    if (!parent || parent.readOnly) return null;
    const ext = name.includes('.') ? name.split('.').pop() : undefined;
    const path = `${parentPath}\\${name}`;
    const node: VFSNode = {
      name, path, type: 'file', size: content.length,
      created: new Date().toISOString(), modified: new Date().toISOString(),
      extension: ext, parentPath,
    };
    const meta = VirtualFS.getMetadata();
    const idx = meta.findIndex(n => n.path === path);
    if (idx >= 0) meta[idx] = node; else meta.push(node);
    VirtualFS.saveMetadata(meta);
    VirtualFS.writeFile(path, content);
    return node;
  }

  static rename(path: string, newName: string): boolean {
    const meta = VirtualFS.getMetadata();
    const node = meta.find(n => n.path === path);
    if (!node || node.readOnly) return false;
    const newPath = `${node.parentPath}\\${newName}`;
    // Update node and all children
    for (const n of meta) {
      if (n.path === path) {
        n.name = newName;
        n.path = newPath;
        n.modified = new Date().toISOString();
        n.extension = newName.includes('.') ? newName.split('.').pop() : undefined;
      } else if (n.path.startsWith(path + '\\')) {
        n.path = newPath + n.path.slice(path.length);
        n.parentPath = n.parentPath === path ? newPath : newPath + n.parentPath.slice(path.length);
      } else if (n.parentPath === path) {
        n.parentPath = newPath;
      }
    }
    VirtualFS.saveMetadata(meta);
    return true;
  }

  static delete(path: string): boolean {
    const meta = VirtualFS.getMetadata();
    const node = meta.find(n => n.path === path);
    if (!node || node.readOnly) return false;
    // Move to recycle bin
    const recyclePath = `C:\\Recycle Bin\\${node.name}`;
    const updated = meta.filter(n => !n.path.startsWith(path));
    node.path = recyclePath;
    node.parentPath = 'C:\\Recycle Bin';
    updated.push(node);
    VirtualFS.saveMetadata(updated);
    return true;
  }

  static permanentDelete(path: string): void {
    const meta = VirtualFS.getMetadata().filter(n => !n.path.startsWith(path));
    VirtualFS.saveMetadata(meta);
    dbDelete('vfs_contents', path).catch(() => {});
  }

  static move(fromPath: string, toFolder: string): boolean {
    const meta = VirtualFS.getMetadata();
    const node = meta.find(n => n.path === fromPath);
    if (!node || node.readOnly) return false;
    const newPath = `${toFolder}\\${node.name}`;
    for (const n of meta) {
      if (n.path === fromPath) {
        n.path = newPath;
        n.parentPath = toFolder;
      } else if (n.path.startsWith(fromPath + '\\')) {
        n.path = newPath + n.path.slice(fromPath.length);
        n.parentPath = n.parentPath === fromPath ? newPath : newPath + n.parentPath.slice(fromPath.length);
      }
    }
    VirtualFS.saveMetadata(meta);
    return true;
  }

  static updateNode(path: string, updates: Partial<VFSNode>): void {
    const meta = VirtualFS.getMetadata();
    const idx = meta.findIndex(n => n.path === path);
    if (idx >= 0) {
      meta[idx] = { ...meta[idx], ...updates, modified: new Date().toISOString() };
      VirtualFS.saveMetadata(meta);
    }
  }

  static async readFile(path: string): Promise<string | null> {
    try {
      const result = await dbGet('vfs_contents', path);
      return result as string | null;
    } catch { return null; }
  }

  static async writeFile(path: string, content: string): Promise<void> {
    try {
      await dbPut('vfs_contents', path, content);
      const meta = VirtualFS.getMetadata();
      const idx = meta.findIndex(n => n.path === path);
      if (idx >= 0) {
        meta[idx].size = content.length;
        meta[idx].modified = new Date().toISOString();
        VirtualFS.saveMetadata(meta);
      }
    } catch {}
  }

  // DB helpers re-exported
  static dbGet = dbGet;
  static dbPut = dbPut;
  static dbDelete = dbDelete;
  static dbGetAll = dbGetAll;
}

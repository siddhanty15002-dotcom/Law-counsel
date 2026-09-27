import fs from 'fs';
import path from 'path';
import os from 'os';

export interface StoredDocument {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  extractedText: string;
  pageCount?: number;
  wordCount: number;
  preview: string;
  diskPath: string;
  fileBase64?: string;
}

// Netlify Functions have writable ephemeral disk in os.tmpdir() (/tmp)
const TMP_UPLOADS_DIR = path.join(os.tmpdir(), 'law_counsel_uploads');

function ensureDirectoryExists() {
  try {
    if (!fs.existsSync(TMP_UPLOADS_DIR)) {
      fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not initialize /tmp uploads directory:', err);
  }
}

const META_FILE = path.join(TMP_UPLOADS_DIR, 'documents-meta.json');

// In-memory cache for fast lookup during function lifetime
const memoryStore = new Map<string, StoredDocument>();

function loadMetadataIndex() {
  ensureDirectoryExists();
  try {
    if (fs.existsSync(META_FILE)) {
      const raw = fs.readFileSync(META_FILE, 'utf-8');
      const docs: StoredDocument[] = JSON.parse(raw);
      for (const doc of docs) {
        memoryStore.set(doc.id, doc);
      }
    }
  } catch (err) {
    console.warn('Failed to load documents metadata from disk:', err);
  }
}

function persistMetadataIndex() {
  ensureDirectoryExists();
  try {
    const list = Array.from(memoryStore.values());
    fs.writeFileSync(META_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist documents metadata to disk:', err);
  }
}

// Initial index load
loadMetadataIndex();

export const documentStorage = {
  saveDocument(doc: StoredDocument, buffer: Buffer): void {
    ensureDirectoryExists();
    try {
      const diskPath = path.join(TMP_UPLOADS_DIR, `${doc.id}_${doc.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      fs.writeFileSync(diskPath, buffer);
      doc.diskPath = diskPath;
    } catch (err) {
      console.warn('Could not write file to /tmp disk; storing in memory fallback:', err);
      // Fallback: keep base64 in memory
      doc.fileBase64 = buffer.toString('base64');
    }

    memoryStore.set(doc.id, doc);
    persistMetadataIndex();
  },

  getDocument(id: string): StoredDocument | null {
    if (memoryStore.has(id)) {
      return memoryStore.get(id)!;
    }
    loadMetadataIndex();
    return memoryStore.get(id) || null;
  },

  getAllDocuments(): StoredDocument[] {
    loadMetadataIndex();
    return Array.from(memoryStore.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  },

  deleteDocument(id: string): boolean {
    const doc = memoryStore.get(id);
    if (!doc) {
      loadMetadataIndex();
    }
    const target = memoryStore.get(id);
    if (!target) return false;

    try {
      if (target.diskPath && fs.existsSync(target.diskPath)) {
        fs.unlinkSync(target.diskPath);
      }
    } catch (err) {
      console.warn('Could not remove file from disk:', err);
    }

    memoryStore.delete(id);
    persistMetadataIndex();
    return true;
  },

  getFileBuffer(doc: StoredDocument): Buffer | null {
    try {
      if (doc.diskPath && fs.existsSync(doc.diskPath)) {
        return fs.readFileSync(doc.diskPath);
      }
      if (doc.fileBase64) {
        return Buffer.from(doc.fileBase64, 'base64');
      }
    } catch (err) {
      console.error('Failed reading file buffer:', err);
    }
    return null;
  },
};

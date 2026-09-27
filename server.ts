import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Storage directory setup for uploaded documents
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface StoredDocument {
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
}

const META_FILE = path.join(UPLOADS_DIR, 'documents-meta.json');
const documentsStore = new Map<string, StoredDocument>();

function loadDocumentsIndex() {
  try {
    if (fs.existsSync(META_FILE)) {
      const data = fs.readFileSync(META_FILE, 'utf-8');
      const docs: StoredDocument[] = JSON.parse(data);
      for (const doc of docs) {
        if (fs.existsSync(doc.diskPath)) {
          documentsStore.set(doc.id, doc);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load documents metadata index:', err);
  }
}

function persistDocumentsIndex() {
  try {
    const list = Array.from(documentsStore.values());
    fs.writeFileSync(META_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist documents index:', err);
  }
}

loadDocumentsIndex();

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function extractDocumentContent(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ text: string; pages?: number }> {
  const ext = path.extname(fileName).toLowerCase();

  // 1. PDF Document Handling
  if (ext === '.pdf' || mimeType === 'application/pdf') {
    // Magic bytes check for PDF (%PDF-)
    const header = buffer.subarray(0, 5).toString('ascii');
    if (!header.startsWith('%PDF-')) {
      throw new Error('Invalid PDF format: File is missing the standard PDF signature (%PDF-).');
    }

    let parsedText = '';
    let pageCount = 1;

    try {
      const parser = new PDFParse({ data: buffer });
      const res = await parser.getText();
      await parser.destroy();
      parsedText = (res?.text || '').trim();
      pageCount = res?.total || 1;
    } catch (parseErr: any) {
      console.warn('pdf-parse extraction failed:', parseErr.message || parseErr);
    }

    // If PDF text layer yielded readable text, return it
    if (parsedText && parsedText.length >= 30) {
      return { text: parsedText, pages: pageCount };
    }

    // Fallback: If text was empty or minimal (e.g. scanned contract or image-based PDF),
    // use Gemini multimodal PDF extraction
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('Using Gemini OCR fallback to extract text from PDF document...');
        const ocrResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: buffer.toString('base64'),
              },
            },
            {
              text: 'Extract and transcribe all the contract and legal agreement text from this document accurately, preserving clause numbers, headings, and terms verbatim. Return only the extracted plain text.',
            },
          ],
        });

        const ocrText = (ocrResponse?.text || '').trim();
        if (ocrText && ocrText.length > 20) {
          return { text: ocrText, pages: pageCount };
        }
      } catch (geminiErr: any) {
        console.warn('Gemini PDF OCR fallback error:', geminiErr.message || geminiErr);
      }
    }

    if (parsedText) {
      return { text: parsedText, pages: pageCount };
    }

    throw new Error('Could not extract readable text from this PDF. Please ensure the document is not password-protected or empty.');
  }

  // 2. Word Document DOCX Handling
  if (ext === '.docx' || mimeType.includes('wordprocessingml')) {
    const res = await mammoth.extractRawText({ buffer });
    return { text: (res?.value || '').trim(), pages: 1 };
  }

  // 3. Plain Text Handling
  if (ext === '.txt' || mimeType === 'text/plain') {
    return { text: buffer.toString('utf-8').trim(), pages: 1 };
  }

  // Generic fallback if text decodes cleanly
  const utf8 = buffer.toString('utf-8').trim();
  if (utf8.length > 20) {
    return { text: utf8, pages: 1 };
  }

  throw new Error(`Unsupported document format: ${ext || mimeType}`);
}

function cleanAndParseJson(text: string | undefined): any {
  if (!text) return {};
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
  return JSON.parse(cleaned);
}

async function generateWithFallback(params: {
  contents: string;
  systemInstruction: string;
  responseSchema?: any;
}) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: params.responseSchema,
          },
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} (attempt ${attempt + 1}) failed:`, err.message || err);
        // Wait before next attempt or next model
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Law Counsel Legal Intelligence Engine',
      uploadsDirectory: UPLOADS_DIR,
      storedDocumentsCount: documentsStore.size,
    });
  });

  // POST upload - Upload, validate, parse, and store contract documents (PDF, DOCX, TXT)
  app.post(
    ['/api/documents/upload', '/.netlify/functions/upload', '/.netlify/functions/documents/upload'],
    async (req: Request, res: Response) => {
      try {
        const { fileName, fileBase64, mimeType } = req.body;

        // 1. Parameter Validation
        if (!fileName || typeof fileName !== 'string' || !fileBase64 || typeof fileBase64 !== 'string') {
          return res.status(400).json({
            error: 'Missing required parameters. Both fileName and fileBase64 must be provided.',
          });
        }

        // 2. Decode Base64 and Check Empty
        const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');

        if (buffer.length === 0) {
          return res.status(400).json({
            error: 'Uploaded file is empty (0 bytes). Please upload a valid document.',
          });
        }

        // 3. File Size Validation (Max 15MB)
        const MAX_FILE_SIZE = 15 * 1024 * 1024;
        if (buffer.length > MAX_FILE_SIZE) {
          const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
          return res.status(413).json({
            error: `File size exceeds the 15MB limit (${sizeMb}MB). Please upload a smaller document.`,
          });
        }

        // 4. File Extension & MIME Validation
        const ext = path.extname(fileName).toLowerCase();
        const allowedExts = ['.pdf', '.docx', '.doc', '.txt'];
        if (!allowedExts.includes(ext)) {
          return res.status(400).json({
            error: `Unsupported file extension (${ext || 'none'}). Supported formats are PDF (.pdf), Word documents (.docx), and Plain Text (.txt).`,
          });
        }

        const resolvedMime =
          mimeType ||
          (ext === '.pdf'
            ? 'application/pdf'
            : ext === '.docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'text/plain');

        // 5. Extract Text (with PDFParse and fallback OCR)
        const extracted = await extractDocumentContent(buffer, fileName, resolvedMime);

        if (!extracted.text || extracted.text.trim().length === 0) {
          return res.status(422).json({
            error: 'Could not extract readable text from the document. Please ensure the document is not an empty or password-protected PDF.',
          });
        }

        // 6. Generate ID and Store on Disk
        const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const diskFilename = `${docId}_${safeFileName}`;
        const diskPath = path.join(UPLOADS_DIR, diskFilename);

        fs.writeFileSync(diskPath, buffer);

        const wordCount = extracted.text.split(/\s+/).filter(Boolean).length;
        const preview = extracted.text.slice(0, 300).trim();

        const docRecord: StoredDocument = {
          id: docId,
          fileName,
          originalName: fileName,
          fileSize: buffer.length,
          mimeType: resolvedMime,
          uploadedAt: new Date().toISOString(),
          extractedText: extracted.text,
          pageCount: extracted.pages,
          wordCount,
          preview,
          diskPath,
        };

        documentsStore.set(docId, docRecord);
        persistDocumentsIndex();

        return res.status(201).json({
          id: docRecord.id,
          fileName: docRecord.fileName,
          fileSize: docRecord.fileSize,
          mimeType: docRecord.mimeType,
          uploadedAt: docRecord.uploadedAt,
          extractedText: docRecord.extractedText,
          pageCount: docRecord.pageCount,
          wordCount: docRecord.wordCount,
          preview: docRecord.preview,
          downloadUrl: `/.netlify/functions/documents?id=${docRecord.id}&download=true`,
          message: 'Document uploaded, stored, and parsed successfully.',
        });
      } catch (err: any) {
        console.error('Error handling document upload:', err);
        return res.status(400).json({
          error: err.message || 'Failed to process document upload. Please try again.',
        });
      }
    }
  );

  // GET documents - List all stored documents or single document (supports /api/documents and /.netlify/functions/documents)
  app.get(['/api/documents', '/.netlify/functions/documents'], (req: Request, res: Response) => {
    const docId = req.query.id as string | undefined;

    if (docId) {
      const doc = documentsStore.get(docId);
      if (!doc) {
        return res.status(404).json({ error: 'Document not found.' });
      }

      if (req.query.download === 'true' || req.query.action === 'download') {
        if (!fs.existsSync(doc.diskPath)) {
          return res.status(404).json({ error: 'Document file not found or removed.' });
        }
        res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${encodeURIComponent(doc.fileName)}"`
        );
        return res.sendFile(path.resolve(doc.diskPath));
      }

      return res.json({
        id: doc.id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
        extractedText: doc.extractedText,
        pageCount: doc.pageCount,
        wordCount: doc.wordCount,
        downloadUrl: `/.netlify/functions/documents?id=${doc.id}&download=true`,
      });
    }

    const list = Array.from(documentsStore.values())
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
        pageCount: doc.pageCount,
        wordCount: doc.wordCount,
        preview: doc.preview,
        downloadUrl: `/.netlify/functions/documents?id=${doc.id}&download=true`,
      }));
    res.json(list);
  });

  // GET /api/documents/:id - Retrieve metadata and extracted text of a document
  app.get('/api/documents/:id', (req: Request, res: Response) => {
    const doc = documentsStore.get(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    res.json({
      id: doc.id,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      uploadedAt: doc.uploadedAt,
      extractedText: doc.extractedText,
      pageCount: doc.pageCount,
      wordCount: doc.wordCount,
      downloadUrl: `/.netlify/functions/documents?id=${doc.id}&download=true`,
    });
  });

  // GET /api/documents/:id/download - Stream/download the stored file directly
  app.get('/api/documents/:id/download', (req: Request, res: Response) => {
    const doc = documentsStore.get(req.params.id);
    if (!doc || !fs.existsSync(doc.diskPath)) {
      return res.status(404).json({ error: 'Document file not found or removed.' });
    }

    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(doc.fileName)}"`
    );
    res.sendFile(path.resolve(doc.diskPath));
  });

  // DELETE document
  app.delete(['/api/documents/:id', '/.netlify/functions/documents'], (req: Request, res: Response) => {
    const docId = req.params.id || (req.query.id as string);
    if (!docId) {
      return res.status(400).json({ error: 'Document ID is required.' });
    }
    const doc = documentsStore.get(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    try {
      if (fs.existsSync(doc.diskPath)) {
        fs.unlinkSync(doc.diskPath);
      }
      documentsStore.delete(docId);
      persistDocumentsIndex();
      res.json({ success: true, message: 'Document deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete document: ' + err.message });
    }
  });

  // POST /api/analyze-contract & /.netlify/functions/analyze-contract
  app.post(['/api/analyze-contract', '/.netlify/functions/analyze-contract'], async (req: Request, res: Response) => {
    try {
      const { contractText, category } = req.body;
      if (!contractText || typeof contractText !== 'string' || contractText.trim().length < 20) {
        return res.status(400).json({ error: 'Please provide valid contract text (minimum 20 characters).' });
      }

      const prompt = `You are Law Counsel, an expert legal analyst in Indian contract law, tenancy regulations (Transfer of Property Act 1882, Model Tenancy Act), employment law (Indian Contract Act 1872 Section 27, Shops & Commercial Establishments Acts), and commercial law.

Analyze the following contract text carefully:
=== CONTRACT TEXT ===
${contractText}
=== END CONTRACT TEXT ===

Category hint: ${category || 'general'}

Your task:
1. Extract the key operational clauses and identify one-sided, unfair, or legally vulnerable terms.
2. Evaluate an overall fairnessScore from 0 (heavily predatory/unfavorable to lessee/employee/contractor) to 100 (balanced and fair).
3. Count totalClauses, highConcern (predatory or illegal under Indian law), worthNoting (unfavorable or unusual), and standardFair (customary and balanced).
4. For each key clause, provide:
   - clauseNumber and title
   - subject (e.g., Security Deposit, Non-Compete, Termination, Notice Period, Indemnity, IP Assignment)
   - severity ('high' | 'warning' | 'fair')
   - severityLabel (e.g. '🚨 High Concern • Restraint of Trade' or '⚠️ Worth Noting' or '✅ Standard & Fair')
   - originalText (exact quote from the agreement)
   - plainMeaning (what it practically means for the person signing, in clear simple English without legalese)
   - statutoryContext (Indian law reference, e.g. Section 27 Indian Contract Act 1872, Model Tenancy Act Chapter IV, Section 74 damages, etc.)
   - statutoryLaw (short statute name)
   - suggestedFix (practical, fair counter-proposal)
   - counterRequestCopy (1-2 sentence polite request to change this specific clause)
5. Generate a polite, diplomatic emailSubject and complete emailBody (ready to send via email or WhatsApp to the counterparty requesting reasonable amendments).`;

      const response = await generateWithFallback({
        contents: prompt,
        systemInstruction: 'You are an elite Indian legal readability and contract auditing engine. Be rigorous, grounded strictly in Indian statutes and court precedents, and explain terms in accessible plain English.',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
              fairnessScore: { type: Type.INTEGER, description: 'Fairness score 0-100' },
              categoryKey: { type: Type.STRING, description: 'Category identifier' },
              totalClauses: { type: Type.INTEGER, description: 'Total clauses evaluated' },
              highConcern: { type: Type.INTEGER, description: 'Count of high risk clauses' },
              worthNoting: { type: Type.INTEGER, description: 'Count of moderate caution clauses' },
              standardFair: { type: Type.INTEGER, description: 'Count of standard fair clauses' },
              primaryActionRequired: { type: Type.STRING, description: 'Primary action summary before signing' },
              clauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    clauseNumber: { type: Type.STRING },
                    title: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    severity: { type: Type.STRING, description: "'high', 'warning', or 'fair'" },
                    severityLabel: { type: Type.STRING },
                    originalText: { type: Type.STRING },
                    plainMeaning: { type: Type.STRING },
                    statutoryContext: { type: Type.STRING },
                    statutoryLaw: { type: Type.STRING },
                    suggestedFix: { type: Type.STRING },
                    counterRequestCopy: { type: Type.STRING },
                  },
                  required: [
                    'id',
                    'clauseNumber',
                    'title',
                    'subject',
                    'severity',
                    'severityLabel',
                    'originalText',
                    'plainMeaning',
                    'statutoryContext',
                    'statutoryLaw',
                  ],
                },
              },
              emailSubject: { type: Type.STRING },
              emailBody: { type: Type.STRING },
            },
            required: [
              'fairnessScore',
              'totalClauses',
              'highConcern',
              'worthNoting',
              'standardFair',
              'primaryActionRequired',
              'clauses',
              'emailSubject',
              'emailBody',
            ],
          },
      });

      const parsed = cleanAndParseJson(response.text);
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error analyzing contract:', err);
      return res.status(500).json({ error: 'Failed to analyze contract: ' + (err.message || 'Unknown error') });
    }
  });

  // POST /api/explain-clause & /.netlify/functions/explain-clause
  app.post(['/api/explain-clause', '/.netlify/functions/explain-clause'], async (req: Request, res: Response) => {
    try {
      const { clauseText, queryType } = req.body;
      if (!clauseText || typeof clauseText !== 'string' || clauseText.trim().length < 5) {
        return res.status(400).json({ error: 'Please enter a valid clause text.' });
      }

      const prompt = `Analyze this specific clause under Indian law:
=== CLAUSE ===
${clauseText}
=== END CLAUSE ===

Focus area: ${queryType || 'all'}

Provide:
1. riskLevel: 'high' (void/illegal/predatory), 'warning' (unfavorable/onerous), or 'fair' (standard)
2. riskTitle: short summary title of the legal issue
3. plainMeaning: clear explanation of real-world impact in plain English
4. statutoryContext: precise section of Indian law (e.g. Indian Contract Act 1872 Section 27, Transfer of Property Act Section 108, Model Tenancy Act, Payment of Gratuity Act, Copyright Act, etc.) and Indian Supreme Court/High Court judicial doctrine
5. statutoryLawTag: short badge name of statute
6. negotiationScript: ready-to-send polite WhatsApp or email message to propose fair modification
7. hrQuestions: array of 3 practical questions to ask the counterparty on a call
8. suggestedReplacement: fair, balanced clause text to replace it with`;

      const response = await generateWithFallback({
        contents: prompt,
        systemInstruction: 'You are an expert Indian advocate explaining legal clauses in simple terms. Cite Indian statutes accurately and draft constructive, courteous counter-offers.',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: { type: Type.STRING, description: "'high', 'warning', or 'fair'" },
              riskTitle: { type: Type.STRING },
              plainMeaning: { type: Type.STRING },
              statutoryContext: { type: Type.STRING },
              statutoryLawTag: { type: Type.STRING },
              negotiationScript: { type: Type.STRING },
              hrQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestedReplacement: { type: Type.STRING },
            },
            required: [
              'riskLevel',
              'riskTitle',
              'plainMeaning',
              'statutoryContext',
              'statutoryLawTag',
              'negotiationScript',
              'hrQuestions',
              'suggestedReplacement',
            ],
          },
      });

      const parsed = cleanAndParseJson(response.text);
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error explaining clause:', err);
      return res.status(500).json({ error: 'Failed to explain clause: ' + (err.message || 'Unknown error') });
    }
  });

  // Mount Vite middleware in development or serve static in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});

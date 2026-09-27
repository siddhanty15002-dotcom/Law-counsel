import type { Handler, HandlerEvent } from '@netlify/functions';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { documentStorage, StoredDocument } from './storage';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

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
      console.warn('pdf-parse extraction failed:', parseErr?.message || parseErr);
    }

    // If PDF text layer yielded readable text, return it
    if (parsedText && parsedText.length >= 30) {
      return { text: parsedText, pages: pageCount };
    }

    // Fallback: If text was empty or minimal (e.g. scanned contract or image-based PDF),
    // use Gemini multimodal PDF extraction
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        console.log('Using Gemini OCR fallback to extract text from PDF document...');
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

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
        console.warn('Gemini PDF OCR fallback error:', geminiErr?.message || geminiErr);
      }
    }

    if (parsedText) {
      return { text: parsedText, pages: pageCount };
    }

    throw new Error(
      'Could not extract readable text from this PDF. Please ensure the document is not password-protected or empty.'
    );
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

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request body is empty.' }),
      };
    }

    const payload = JSON.parse(event.body);
    const { fileName, fileBase64, mimeType } = payload;

    // 1. Parameter Validation
    if (!fileName || typeof fileName !== 'string' || !fileBase64 || typeof fileBase64 !== 'string') {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required parameters. Both fileName and fileBase64 must be provided.',
        }),
      };
    }

    // 2. Decode Base64 and Check Empty
    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length === 0) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Uploaded file is empty (0 bytes). Please upload a valid document.',
        }),
      };
    }

    // 3. File Size Validation (Max 15MB)
    const MAX_FILE_SIZE = 15 * 1024 * 1024;
    if (buffer.length > MAX_FILE_SIZE) {
      const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
      return {
        statusCode: 413,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `File size exceeds the 15MB limit (${sizeMb}MB). Please upload a smaller document.`,
        }),
      };
    }

    // 4. File Extension & MIME Validation
    const ext = path.extname(fileName).toLowerCase();
    const allowedExts = ['.pdf', '.docx', '.doc', '.txt'];
    if (!allowedExts.includes(ext)) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Unsupported file extension (${ext || 'none'}). Supported formats are PDF (.pdf), Word documents (.docx), and Plain Text (.txt).`,
        }),
      };
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
      return {
        statusCode: 422,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Could not extract readable text from the document. Please ensure the document is not an empty or password-protected PDF.',
        }),
      };
    }

    // 6. Generate ID and Store in ephemeral storage
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
      diskPath: '',
      fileBase64: cleanBase64,
    };

    documentStorage.saveDocument(docRecord, buffer);

    return {
      statusCode: 201,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    };
  } catch (err: any) {
    console.error('Error handling document upload function:', err);
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: err?.message || 'Failed to process document upload. Please try again.',
      }),
    };
  }
};

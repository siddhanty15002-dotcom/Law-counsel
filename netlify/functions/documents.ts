import type { Handler, HandlerEvent } from '@netlify/functions';
import { documentStorage } from './storage';
import { handler as uploadHandler } from './upload';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

export const handler: Handler = async (event: HandlerEvent, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Support POST on /documents by delegating to upload handler
  if (event.httpMethod === 'POST') {
    const res = await uploadHandler(event, context);
    if (res) return res;
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Upload handler produced no response' }),
    };
  }

  const query = event.queryStringParameters || {};
  const docId = query.id;

  // GET Requests
  if (event.httpMethod === 'GET') {
    // 1. Single document requested
    if (docId) {
      const doc = documentStorage.getDocument(docId);
      if (!doc) {
        return {
          statusCode: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Document not found or session expired.' }),
        };
      }

      // Download file stream / binary
      if (query.download === 'true' || query.action === 'download') {
        const fileBuffer = documentStorage.getFileBuffer(doc);
        if (!fileBuffer) {
          return {
            statusCode: 404,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Original document binary could not be retrieved.' }),
          };
        }

        return {
          statusCode: 200,
          headers: {
            ...CORS_HEADERS,
            'Content-Type': doc.mimeType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.fileName)}"`,
            'Content-Length': fileBuffer.length.toString(),
          },
          body: fileBuffer.toString('base64'),
          isBase64Encoded: true,
        };
      }

      // Return document metadata and extracted text
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: doc.id,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          uploadedAt: doc.uploadedAt,
          extractedText: doc.extractedText,
          pageCount: doc.pageCount,
          wordCount: doc.wordCount,
          preview: doc.preview,
          downloadUrl: `/.netlify/functions/documents?id=${doc.id}&download=true`,
        }),
      };
    }

    // 2. List all documents
    const all = documentStorage.getAllDocuments();
    const list = all.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      uploadedAt: d.uploadedAt,
      pageCount: d.pageCount,
      wordCount: d.wordCount,
      preview: d.preview,
      downloadUrl: `/.netlify/functions/documents?id=${d.id}&download=true`,
    }));

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    };
  }

  // DELETE Requests
  if (event.httpMethod === 'DELETE') {
    if (!docId) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing document id parameter.' }),
      };
    }

    const deleted = documentStorage.deleteDocument(docId);
    if (!deleted) {
      return {
        statusCode: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Document not found.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Document deleted successfully.' }),
    };
  }

  return {
    statusCode: 405,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};

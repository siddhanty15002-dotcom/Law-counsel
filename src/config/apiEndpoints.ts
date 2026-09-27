/**
 * API Endpoints configuration for Law Counsel Legal Intelligence Engine.
 * Configured with standard Netlify Functions URLs for Netlify deployment,
 * and also supported concurrently by the Express development server.
 */

export const API_ENDPOINTS = {
  UPLOAD_DOCUMENT: '/.netlify/functions/upload',
  ANALYZE_CONTRACT: '/.netlify/functions/analyze-contract',
  EXPLAIN_CLAUSE: '/.netlify/functions/explain-clause',
  DOCUMENTS: '/.netlify/functions/documents',

  // Query parameter-based helpers for Netlify Functions
  GET_DOCUMENT: (id: string) => `/.netlify/functions/documents?id=${encodeURIComponent(id)}`,
  DOWNLOAD_DOCUMENT: (id: string) => `/.netlify/functions/documents?id=${encodeURIComponent(id)}&download=true`,
  DELETE_DOCUMENT: (id: string) => `/.netlify/functions/documents?id=${encodeURIComponent(id)}`,

  // Express fallback endpoints for dev server compatibility
  FALLBACK_UPLOAD: '/api/documents/upload',
  FALLBACK_ANALYZE: '/api/analyze-contract',
  FALLBACK_EXPLAIN: '/api/explain-clause',
  FALLBACK_DOCUMENTS: '/api/documents',
};

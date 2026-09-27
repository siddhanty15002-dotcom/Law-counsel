import React, { useState, useEffect } from 'react';
import { ClauseSeverity, ScreenId } from '../../types';
import { SAMPLE_TEMPLATES } from '../../data/mockData';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

interface ClauseItem {
  id: number;
  clauseNumber: string;
  title: string;
  subject: string;
  severity: 'high' | 'warning' | 'fair';
  severityLabel: string;
  originalText: string;
  plainMeaning: string;
  statutoryContext: string;
  statutoryLaw: string;
  suggestedFix?: string;
  counterRequestCopy?: string;
}

interface ContractAnalysisResult {
  fairnessScore: number;
  categoryKey: string;
  totalClauses: number;
  highConcern: number;
  worthNoting: number;
  standardFair: number;
  primaryActionRequired: string;
  clauses: ClauseItem[];
  emailSubject: string;
  emailBody: string;
}

export interface UploadedDocumentMeta {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  pageCount?: number;
  wordCount: number;
  preview: string;
  downloadUrl: string;
  extractedText?: string;
}

interface AnalyzeContractScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const AnalyzeContractScreen: React.FC<AnalyzeContractScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [contractText, setContractText] = useState<string>('');
  const [contractCategory, setContractCategory] = useState<string>('rental');
  const [activeFilter, setActiveFilter] = useState<'all' | ClauseSeverity>('all');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStepMessage, setAuditStepMessage] = useState<string>('Analyzing clauses...');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocumentMeta | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<UploadedDocumentMeta[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showExtractedPreview, setShowExtractedPreview] = useState<boolean>(true);
  const [analysisResult, setAnalysisResult] = useState<ContractAnalysisResult | null>(null);
  const [copiedNegotiation, setCopiedNegotiation] = useState(false);

  const fetchRecentDocuments = async () => {
    try {
      let res = await fetch(API_ENDPOINTS.DOCUMENTS);
      if (res.status === 404) {
        res = await fetch(API_ENDPOINTS.FALLBACK_DOCUMENTS);
      }
      if (res.ok) {
        const docs = await res.json();
        setRecentDocuments(docs);
      }
    } catch (err) {
      console.warn('Could not fetch stored documents:', err);
    }
  };

  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  const handleTemplateSelect = (key: string) => {
    const tmpl = SAMPLE_TEMPLATES[key];
    if (tmpl) {
      setContractText(tmpl.contractText);
      setContractCategory(tmpl.categoryKey);
      setUploadedFileName(null);
      setUploadedDoc(null);
      setUploadError(null);
      onShowToast(`Loaded ${tmpl.title}`);
    }
  };

  const processSelectedFile = async (file: File) => {
    setUploadError(null);

    // 1. File size validation (15MB limit)
    const MAX_FILE_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      const msg = `File "${file.name}" exceeds the 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller document.`;
      setUploadError(msg);
      onShowToast(msg);
      return;
    }

    // 2. File extension check
    const lowerName = file.name.toLowerCase();
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    if (!hasValidExt) {
      const msg = `Unsupported file type "${file.name}". Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file.`;
      setUploadError(msg);
      onShowToast(msg);
      return;
    }

    setIsUploading(true);
    setUploadProgressText(
      lowerName.endsWith('.pdf')
        ? 'Uploading and parsing PDF text & clauses...'
        : 'Uploading and extracting document text...'
    );

    try {
      // Local blob fallback for immediate retrieval
      const localBlobUrl = URL.createObjectURL(file);

      // Read binary file as Base64 data URL
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => reject(new Error('Failed reading file from local storage.'));
        reader.readAsDataURL(file);
      });

      // Call Netlify Function URL
      let response = await fetch(API_ENDPOINTS.UPLOAD_DOCUMENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: base64Data,
          mimeType: file.type || (lowerName.endsWith('.pdf') ? 'application/pdf' : 'text/plain'),
        }),
      });

      // Fallback if running on legacy server without Netlify function routing
      if (response.status === 404) {
        response = await fetch(API_ENDPOINTS.FALLBACK_UPLOAD, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64: base64Data,
            mimeType: file.type || (lowerName.endsWith('.pdf') ? 'application/pdf' : 'text/plain'),
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server rejected upload with HTTP ${response.status}`);
      }

      const docData: UploadedDocumentMeta & { extractedText: string } = await response.json();
      // Ensure download URL is valid
      if (!docData.downloadUrl) {
        docData.downloadUrl = API_ENDPOINTS.DOWNLOAD_DOCUMENT(docData.id) || localBlobUrl;
      }
      setContractText(docData.extractedText);
      setUploadedDoc(docData);
      setUploadedFileName(docData.fileName);
      setUploadError(null);
      onShowToast(`Document "${docData.fileName}" successfully parsed! (${docData.wordCount} words)`);
      fetchRecentDocuments();
    } catch (err: any) {
      console.error('Document upload error:', err);
      const msg = err.message || 'Failed to process document. Please check the file and try again.';
      setUploadError(msg);
      onShowToast(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    // reset input value so re-uploading the same file works
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleLoadStoredDocument = async (doc: UploadedDocumentMeta) => {
    try {
      setIsUploading(true);
      setUploadProgressText(`Loading "${doc.fileName}"...`);
      let res = await fetch(API_ENDPOINTS.GET_DOCUMENT(doc.id));
      if (res.status === 404) {
        res = await fetch(`/api/documents/${doc.id}`);
      }
      if (!res.ok) {
        throw new Error('Document no longer available on server.');
      }
      const fullDoc = await res.json();
      setContractText(fullDoc.extractedText);
      setUploadedDoc(fullDoc);
      setUploadedFileName(fullDoc.fileName);
      setUploadError(null);
      onShowToast(`Loaded "${fullDoc.fileName}" into analyzer.`);
    } catch (err: any) {
      onShowToast(`Could not load document: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  const handleDeleteStoredDocument = async (docId: string, docName: string) => {
    try {
      let res = await fetch(API_ENDPOINTS.DELETE_DOCUMENT(docId), { method: 'DELETE' });
      if (res.status === 404) {
        res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      }
      if (res.ok) {
        if (uploadedDoc?.id === docId) {
          setUploadedDoc(null);
          setUploadedFileName(null);
        }
        onShowToast(`Deleted "${docName}"`);
        fetchRecentDocuments();
      }
    } catch (err: any) {
      onShowToast(`Failed to delete: ${err.message}`);
    }
  };

  const handleAnalyzeClick = async () => {
    const trimmed = contractText.trim();
    if (trimmed.length < 20) {
      onShowToast('Please paste or upload agreement text with at least 20 characters.');
      return;
    }

    setIsAuditing(true);
    setAuditStepMessage('Reading agreement clauses and structure...');

    const timer1 = setTimeout(() => {
      setAuditStepMessage('Auditing terms against Indian Contract Act & State regulations...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setAuditStepMessage('Checking restraint of trade, liabilities, notice & deposits...');
    }, 2500);

    try {
      // Call Netlify Function URL
      let response = await fetch(API_ENDPOINTS.ANALYZE_CONTRACT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText: trimmed,
          category: contractCategory,
        }),
      });

      // Fallback if running on legacy server without function routing
      if (response.status === 404) {
        response = await fetch(API_ENDPOINTS.FALLBACK_ANALYZE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractText: trimmed,
            category: contractCategory,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data: ContractAnalysisResult = await response.json();
      setAnalysisResult(data);
      setActiveFilter('all');
      onShowToast('Contract analysis complete! Review your clause breakdown below.');

      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Analysis error:', err);
      onShowToast(`Analysis error: ${err.message || 'Please try again'}`);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsAuditing(false);
    }
  };

  const handleClear = () => {
    setContractText('');
    setUploadedFileName(null);
    setUploadedDoc(null);
    setUploadError(null);
    setAnalysisResult(null);
    onShowToast('Editor cleared');
  };

  const wordCount = contractText.trim() ? contractText.trim().split(/\s+/).length : 0;
  const filteredClauses = analysisResult
    ? analysisResult.clauses.filter((c) => {
        if (activeFilter === 'all') return true;
        return c.severity === activeFilter;
      })
    : [];

  const score = analysisResult ? analysisResult.fairnessScore : 0;

  return (
    <div className="flex flex-col w-full">
      {/* Top Welcome & Trust Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-[#eff4ff] p-6 sm:p-8 lg:p-10 mb-8 sm:mb-10 shadow-sm border border-[#d5e3fc]/60">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#316bf3]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-[#1e3a8a]/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#d5e3fc] text-[#00236f] text-xs font-bold mb-4 shadow-2xs">
            <span className="material-symbols-outlined text-sm text-[#0051d5]">verified</span>
            <span>Civic Literacy Aid • Tenants, Tech Employees & Freelancers</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#00236f] tracking-tight mb-3">
            Before you sign, know what you're actually agreeing to.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#444651] max-w-3xl mb-6 leading-relaxed">
            Paste or upload any Indian rental agreement, job offer letter, freelance contract, or NDA. Cross-reference against statutory baselines and get one-sided terms explained in simple plain English.
          </p>

          {/* Quick Standard Reference Starters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-[#444651] uppercase tracking-wider">
              Quick Reference Templates:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTemplateSelect('rental')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 bg-white text-[#0d1c2e] hover:bg-[#dce9ff] cursor-pointer"
              >
                <span>🏠 Residential Rental</span>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateSelect('job')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 bg-white text-[#0d1c2e] hover:bg-[#dce9ff] cursor-pointer"
              >
                <span>💼 Employment & Bond</span>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateSelect('freelance')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 bg-white text-[#0d1c2e] hover:bg-[#dce9ff] cursor-pointer"
              >
                <span>🎨 Freelance Retainer</span>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateSelect('nda')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 bg-white text-[#0d1c2e] hover:bg-[#dce9ff] cursor-pointer"
              >
                <span>📄 Mutual NDA</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contract Input & Upload Workspace */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm border border-[#e2e8f0] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('paste')}
              aria-selected={activeTab === 'paste'}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-[#444651] hover:text-[#0d1c2e]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-base">edit_note</span>
              <span>Paste Text / Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              aria-selected={activeTab === 'upload'}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-[#444651] hover:text-[#0d1c2e]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-base">upload_file</span>
              <span>Upload Document</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="contract-category-select" className="text-xs text-[#444651] font-semibold whitespace-nowrap">
              Agreement Type:
            </label>
            <select
              id="contract-category-select"
              value={contractCategory}
              onChange={(e) => setContractCategory(e.target.value)}
              className="bg-[#eff4ff] text-xs font-semibold text-[#00236f] rounded-lg px-3 py-1.5 border border-[#d5e3fc] focus:outline-none focus:ring-1 focus:ring-[#0051d5]"
            >
              <option value="rental">Residential Rental / Lease (India)</option>
              <option value="employment">Employment, Probation & Bond</option>
              <option value="freelance">Freelance / Independent Retainer</option>
              <option value="nda">Mutual Non-Disclosure Agreement</option>
              <option value="commercial">Commercial Contract / Partnership</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Direct Text Editor */}
        {activeTab === 'paste' && (
          <div className="relative">
            {uploadedDoc && (
              <div className="mb-3 px-3.5 py-2.5 bg-[#eff4ff] border border-[#d5e3fc] rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#0051d5]">description</span>
                  <span className="font-semibold text-[#00236f]">Loaded: {uploadedDoc.fileName}</span>
                  <span className="text-[#444651]">
                    ({(uploadedDoc.fileSize / 1024).toFixed(1)} KB
                    {uploadedDoc.pageCount ? ` • ${uploadedDoc.pageCount} ${uploadedDoc.pageCount === 1 ? 'page' : 'pages'}` : ''}
                    {` • ${uploadedDoc.wordCount} words`})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={uploadedDoc.downloadUrl}
                    download={uploadedDoc.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#0051d5] hover:text-[#00236f] font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Retrieve File</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="text-[#444651] hover:text-[#00236f] font-medium underline cursor-pointer"
                  >
                    Upload Tab
                  </button>
                </div>
              </div>
            )}
            <label className="sr-only" htmlFor="contract-editor-textarea">
              Contract Text Editor
            </label>
            <textarea
              id="contract-editor-textarea"
              value={contractText}
              onChange={(e) => {
                setContractText(e.target.value);
                setUploadedFileName(null);
                setUploadedDoc(null);
              }}
              className="w-full bg-[#f8f9ff] rounded-xl p-4 sm:p-5 text-xs sm:text-sm font-mono text-[#0d1c2e] focus:outline-none focus:ring-2 focus:ring-[#0051d5] shadow-inner leading-relaxed resize-y min-h-[220px] border border-[#d5e3fc]"
              placeholder="Paste your Indian rental contract, offer letter, service agreement, or NDA clauses here..."
              rows={9}
            />
            <div className="absolute bottom-3 right-3 text-[#444651] text-xs font-medium bg-white/90 px-2.5 py-1 rounded-md border border-[#c5c5d3]/40 shadow-2xs">
              <span>{wordCount} words</span>
            </div>
          </div>
        )}

        {/* Tab 2: Document Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-all ${
                isDragging
                  ? 'border-[#0051d5] bg-[#eff4ff]'
                  : 'border-[#c5c5d3] bg-[#f8f9ff] hover:bg-[#eff4ff]/60'
              }`}
            >
              {isUploading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-[#0051d5] border-t-transparent animate-spin"></div>
                  <p className="text-sm font-bold text-[#00236f]">{uploadProgressText || 'Processing document...'}</p>
                  <p className="text-xs text-[#444651]">Validating file, extracting text clauses, and preparing storage...</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#00236f] mx-auto mb-3 border border-[#d5e3fc]">
                    <span className="material-symbols-outlined text-3xl">upload_file</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#00236f] mb-1">
                    Select or drag & drop your contract document
                  </h2>
                  <p className="text-xs sm:text-sm text-[#444651] max-w-lg mx-auto mb-4">
                    Supports <strong>PDF (.pdf)</strong>, Word documents (<strong>.docx</strong>), and Plain Text (<strong>.txt</strong>).
                    Parsed and stored securely on server with direct file retrieval.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-white border border-[#d5e3fc] rounded-md text-[11px] font-semibold text-[#00236f]">
                      📄 PDF text & OCR
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-[#d5e3fc] rounded-md text-[11px] font-semibold text-[#00236f]">
                      📝 Word .docx
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-[#d5e3fc] rounded-md text-[11px] font-semibold text-[#00236f]">
                      ⚖️ Max 15MB limit
                    </span>
                  </div>

                  {uploadError && (
                    <div className="mb-4 mx-auto max-w-md p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 text-left">
                      <span className="material-symbols-outlined text-rose-600 text-base shrink-0 mt-0.5">error</span>
                      <div className="flex-1">
                        <strong className="block font-semibold">Upload Error</strong>
                        <span>{uploadError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadError(null)}
                        className="text-rose-600 hover:text-rose-800 text-sm font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="file-upload-input"
                      className="inline-flex items-center gap-2 bg-[#00236f] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#0051d5] transition-colors cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-base">attach_file</span>
                      <span>Browse Files</span>
                    </label>
                    <input
                      id="file-upload-input"
                      type="file"
                      className="hidden"
                      accept=".txt,.doc,.docx,.pdf,application/pdf"
                      onChange={handleFileUpload}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Currently Active Loaded Document Card */}
            {uploadedDoc && (
              <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f1f5f9]">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                      <span className="material-symbols-outlined text-2xl">
                        {uploadedDoc.mimeType.includes('pdf') || uploadedDoc.fileName.endsWith('.pdf')
                          ? 'picture_as_pdf'
                          : 'description'}
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#0d1c2e] text-sm sm:text-base">
                          {uploadedDoc.fileName}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {uploadedDoc.mimeType.includes('pdf') || uploadedDoc.fileName.endsWith('.pdf')
                            ? 'PDF Document'
                            : 'Document'}
                        </span>
                      </div>
                      <p className="text-xs text-[#444651]">
                        Size: {(uploadedDoc.fileSize / 1024).toFixed(1)} KB
                        {uploadedDoc.pageCount ? ` • Pages: ${uploadedDoc.pageCount}` : ''}
                        {` • Words: ${uploadedDoc.wordCount}`}
                        {` • Uploaded: ${new Date(uploadedDoc.uploadedAt).toLocaleTimeString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={uploadedDoc.downloadUrl}
                      download={uploadedDoc.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] px-3.5 py-2 rounded-lg text-xs font-bold border border-[#d5e3fc] transition-colors"
                      title="Download and retrieve original uploaded file"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      <span>Retrieve File</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setActiveTab('paste')}
                      className="inline-flex items-center gap-1.5 bg-[#f8f9ff] text-[#444651] hover:text-[#0d1c2e] px-3 py-2 rounded-lg text-xs font-bold border border-[#c5c5d3] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      <span>Edit Text</span>
                    </button>
                  </div>
                </div>

                {/* Extracted Text Preview */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#00236f] uppercase tracking-wider">
                      Extracted Text Preview ({uploadedDoc.wordCount} words)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                      className="text-xs text-[#0051d5] hover:underline font-semibold cursor-pointer"
                    >
                      {showExtractedPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>

                  {showExtractedPreview && (
                    <div className="p-3 bg-[#f8f9ff] rounded-lg border border-[#e2e8f0] max-h-48 overflow-y-auto text-xs font-mono text-[#334155] whitespace-pre-wrap leading-relaxed">
                      {contractText || uploadedDoc.preview || 'No preview available.'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent & Stored Documents List */}
            {recentDocuments.length > 0 && (
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0051d5] text-lg">history_edu</span>
                    <h3 className="font-bold text-[#00236f] text-sm">
                      Stored Documents ({recentDocuments.length})
                    </h3>
                  </div>
                  <span className="text-xs text-[#444651]">
                    Click to load or retrieve original file
                  </span>
                </div>

                <div className="divide-y divide-[#f1f5f9]">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8f9ff] px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-lg text-[#0051d5] shrink-0">
                          {doc.mimeType.includes('pdf') || doc.fileName.endsWith('.pdf')
                            ? 'picture_as_pdf'
                            : 'description'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0d1c2e] truncate">{doc.fileName}</p>
                          <p className="text-[11px] text-[#444651]">
                            {(doc.fileSize / 1024).toFixed(1)} KB
                            {doc.pageCount ? ` • ${doc.pageCount} ${doc.pageCount === 1 ? 'page' : 'pages'}` : ''}
                            {` • ${doc.wordCount} words`}
                            {` • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleLoadStoredDocument(doc)}
                          className="px-2.5 py-1.5 rounded-md bg-[#eff4ff] text-[#00236f] text-xs font-semibold hover:bg-[#dce9ff] border border-[#d5e3fc] transition-colors cursor-pointer"
                        >
                          Load
                        </button>
                        <a
                          href={doc.downloadUrl}
                          download={doc.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-md bg-white text-[#444651] hover:text-[#00236f] text-xs font-semibold border border-[#c5c5d3] hover:border-[#00236f] transition-colors inline-flex items-center gap-1"
                          title="Download stored original document"
                        >
                          <span className="material-symbols-outlined text-xs">download</span>
                          <span>Retrieve</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteStoredDocument(doc.id, doc.fileName)}
                          className="p-1.5 rounded-md text-[#64748b] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete stored file"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit Actions Strip */}
        <div className="mt-5 pt-4 border-t border-[#f1f5f9] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#444651]">
            <div className="flex items-center gap-1.5 text-[#0d1c2e] font-medium">
              <span className="material-symbols-outlined text-sm text-[#0051d5]">lock</span>
              <span><strong>Confidential & Secure:</strong> Audited locally with on-demand retrieval</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#0d1c2e] font-medium">
              <span className="material-symbols-outlined text-sm text-[#0051d5]">account_balance</span>
              <span>Benchmarked against Indian Contract Act & statutory baselines</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {contractText && (
              <button
                onClick={handleClear}
                type="button"
                className="px-4 py-2.5 rounded-lg bg-[#f1f5f9] text-[#444651] text-xs sm:text-sm font-semibold hover:bg-[#e2e8f0] transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              onClick={handleAnalyzeClick}
              disabled={isAuditing}
              type="button"
              className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-[#00236f] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#0051d5] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-base ${isAuditing ? 'animate-spin' : ''}`}>
                {isAuditing ? 'refresh' : 'auto_awesome'}
              </span>
              <span>{isAuditing ? auditStepMessage : 'Audit Clauses'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Results Workspace */}
      <section className="flex flex-col gap-6" id="results-section">
        {analysisResult ? (
          <>
            {/* Executive Summary Banner */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm border border-[#e2e8f0]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Fairness Score Radial Gauge */}
                <div className="lg:col-span-4 bg-[#eff4ff] rounded-xl p-4 sm:p-5 flex items-center gap-4 border border-[#d5e3fc]">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#d5e3fc]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className={score < 60 ? 'text-[#e11d48]' : score < 75 ? 'text-[#d97706]' : 'text-[#059669]'}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${score}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl sm:text-2xl font-bold text-[#00236f] leading-none">
                        {score}
                      </span>
                      <span className="text-[10px] sm:text-xs text-[#757682] font-semibold">/ 100</span>
                    </div>
                  </div>

                  <div>
                    <div
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold mb-1 ${
                        score < 60
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : score < 75
                          ? 'bg-[#ffdcc3] text-[#2f1500]'
                          : 'bg-[#dce9ff] text-[#00236f]'
                      }`}
                    >
                      {score < 60 ? 'Predatory / Needs Attention' : score < 75 ? 'Moderate Caution' : 'Fair Standard'}
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-[#00236f]">
                      Contract Fairness Score
                    </h2>
                    <p className="text-xs text-[#444651]">
                      {score < 60
                        ? 'Contains clauses heavily biased towards the issuing party.'
                        : 'Balanced draft with customary obligations under Indian law.'}
                    </p>
                  </div>
                </div>

                {/* Metric Badges */}
                <div className="lg:col-span-8 flex flex-col justify-between h-full gap-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="bg-[#eff4ff] p-3 rounded-xl text-center border border-[#d5e3fc]/60">
                      <span className="text-xs text-[#444651] font-semibold block mb-0.5">Total Clauses</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#00236f]">{analysisResult.totalClauses}</span>
                    </div>
                    <div className="bg-[#ffdad6]/50 p-3 rounded-xl text-center border border-[#ffdad6]">
                      <span className="text-xs text-[#93000a] font-semibold block mb-0.5">🚨 High Concern</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#ba1a1a]">{analysisResult.highConcern}</span>
                    </div>
                    <div className="bg-[#ffdcc3]/40 p-3 rounded-xl text-center border border-[#ffdcc3]">
                      <span className="text-xs text-[#653400] font-semibold block mb-0.5">⚠️ Worth Noting</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#653400]">{analysisResult.worthNoting}</span>
                    </div>
                    <div className="bg-[#dce9ff] p-3 rounded-xl text-center border border-[#dce9ff]">
                      <span className="text-xs text-[#00236f] font-semibold block mb-0.5">✅ Standard & Fair</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#00236f]">{analysisResult.standardFair}</span>
                    </div>
                  </div>

                  {/* Highlight Recommendation Box */}
                  <div className="bg-[#ffdcc3]/30 p-3.5 sm:p-4 rounded-xl flex items-start gap-2.5 border border-[#ffdcc3]/80">
                    <span className="material-symbols-outlined text-[#653400] shrink-0 mt-0.5 text-lg">
                      report_problem
                    </span>
                    <div className="text-xs sm:text-sm text-[#0d1c2e] leading-relaxed">
                      <strong className="font-bold text-[#653400]">Primary Action Required: </strong>
                      {analysisResult.primaryActionRequired}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-4 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 bg-[#eff4ff]/40 p-3 rounded-xl">
                <div className="flex items-center gap-1.5 text-[#444651] text-xs">
                  <span className="material-symbols-outlined text-sm text-[#0051d5]">verified</span>
                  <span>Benchmarked against Indian Contract Act 1872 & statutory baselines</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onNavigate('clause-checker')}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-[#cbd5e1] text-xs font-semibold text-[#0051d5] hover:bg-[#eff4ff] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">question_answer</span>
                    <span>Single Clause Explainer</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(analysisResult.emailBody);
                      setCopiedNegotiation(true);
                      setTimeout(() => setCopiedNegotiation(false), 2000);
                      onShowToast('Negotiation draft copied to clipboard!');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#00236f] text-white text-xs font-bold hover:bg-[#0051d5] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedNegotiation ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedNegotiation ? 'Copied Draft' : 'Copy Negotiation Draft'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Segmented Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex flex-wrap items-center gap-1.5 bg-[#eff4ff] p-1 rounded-xl border border-[#d5e3fc]">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-white text-[#00236f] shadow-xs'
                      : 'text-[#444651] hover:text-[#0d1c2e]'
                  }`}
                  type="button"
                >
                  All Key Clauses ({analysisResult.clauses.length})
                </button>

                <button
                  onClick={() => setActiveFilter('high')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'high'
                      ? 'bg-white text-[#ba1a1a] shadow-xs'
                      : 'text-[#ba1a1a] hover:bg-[#ffdad6]/40'
                  }`}
                  type="button"
                >
                  🚨 High Concern ({analysisResult.highConcern})
                </button>

                <button
                  onClick={() => setActiveFilter('warning')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'warning'
                      ? 'bg-white text-[#653400] shadow-xs'
                      : 'text-[#653400] hover:bg-[#ffdcc3]/40'
                  }`}
                  type="button"
                >
                  ⚠️ Worth Noting ({analysisResult.worthNoting})
                </button>

                <button
                  onClick={() => setActiveFilter('fair')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'fair'
                      ? 'bg-white text-[#00236f] shadow-xs'
                      : 'text-[#00236f] hover:bg-[#dce9ff]'
                  }`}
                  type="button"
                >
                  ✅ Standard & Fair ({analysisResult.standardFair})
                </button>
              </div>

              <div className="text-xs text-[#444651]">
                Displaying: <strong>{filteredClauses.length} evaluated sections</strong>
              </div>
            </div>

            {/* Detailed Clause Breakdown Cards Feed */}
            <div className="flex flex-col gap-4">
              {filteredClauses.map((clause) => {
                const isHigh = clause.severity === 'high';
                const isWarning = clause.severity === 'warning';

                return (
                  <article
                    key={clause.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2e8f0] transition-all hover:shadow-md"
                  >
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#f1f5f9]">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isHigh
                              ? 'bg-[#ffdad6] text-[#93000a]'
                              : isWarning
                              ? 'bg-[#ffdcc3] text-[#2f1500]'
                              : 'bg-[#dce9ff] text-[#00236f]'
                          }`}
                        >
                          {clause.id}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-[#0d1c2e]">
                            {clause.clauseNumber}: {clause.title}
                          </h3>
                          <p className="text-xs text-[#444651]">{clause.subject}</p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                          isHigh
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : isWarning
                            ? 'bg-[#ffdcc3] text-[#2f1500]'
                            : 'bg-[#dce9ff] text-[#00236f]'
                        }`}
                      >
                        <span>{clause.severityLabel}</span>
                      </span>
                    </div>

                    {/* Split text row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                      {/* Left: Original Contract Extract */}
                      <div className="lg:col-span-5 bg-[#eff4ff] rounded-xl p-4 border border-[#d5e3fc]/60">
                        <span className="text-[11px] uppercase tracking-wider text-[#444651] font-bold block mb-1.5">
                          Extracted Contract Text
                        </span>
                        <blockquote className="text-xs sm:text-sm text-[#444651] italic pl-2 border-l-2 border-[#0051d5]/40 leading-relaxed font-serif">
                          {clause.originalText}
                        </blockquote>
                      </div>

                      {/* Right: Plain Meaning */}
                      <div className="lg:col-span-7 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[#00236f] text-xs font-bold mb-1.5">
                            <span className="material-symbols-outlined text-base text-[#0051d5]">translate</span>
                            <span>What this actually means in plain English:</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#0d1c2e] mb-3 leading-relaxed">
                            {clause.plainMeaning}
                          </p>
                        </div>

                        {/* Statutory Context */}
                        <div className="inline-flex items-start gap-2 p-2.5 rounded-lg bg-[#eff4ff] text-[#00236f] text-xs border border-[#d5e3fc]">
                          <span className="material-symbols-outlined text-sm text-[#0051d5] shrink-0 mt-0.5">
                            account_balance
                          </span>
                          <span>
                            <strong>Indian Legal Context:</strong> {clause.statutoryContext}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Fix Action Strip */}
                    {clause.suggestedFix && (
                      <div className="bg-[#eff4ff]/70 p-3.5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-[#d5e3fc]/60">
                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                          <span className="material-symbols-outlined text-[#0051d5] shrink-0 mt-0.5 text-base">
                            lightbulb
                          </span>
                          <div>
                            <strong className="font-bold text-[#00236f]">Suggested Fix to Propose: </strong>
                            <span className="text-[#0d1c2e]">{clause.suggestedFix}</span>
                          </div>
                        </div>

                        {clause.counterRequestCopy && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(clause.counterRequestCopy!);
                              onShowToast(`Copied counter request for ${clause.clauseNumber}!`);
                            }}
                            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-white border border-[#cbd5e1] text-xs font-bold text-[#00236f] hover:bg-[#dce9ff] transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                          >
                            Copy Clause Request
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Negotiation Message Template */}
            <section className="mt-8 sm:mt-10 bg-[#eff4ff] rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm border border-[#d5e3fc]">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00236f]">mail</span>
                  <h3 className="text-base sm:text-lg font-bold text-[#00236f]">
                    Pre-formatted Negotiation Message (WhatsApp / Email)
                  </h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(analysisResult.emailBody);
                    onShowToast('Copied full negotiation message to clipboard!');
                  }}
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-[#cbd5e1] text-xs font-bold text-[#00236f] hover:bg-[#dce9ff] transition-colors shadow-2xs cursor-pointer"
                >
                  Copy Message
                </button>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl text-xs sm:text-sm text-[#0d1c2e] leading-relaxed shadow-inner border border-[#d5e3fc] whitespace-pre-line font-mono">
                {analysisResult.emailBody}
              </div>
            </section>
          </>
        ) : (
          /* Empty Initial State: Ready to Audit */
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#e2e8f0] text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#00236f] mx-auto mb-4 border border-[#d5e3fc]">
              <span className="material-symbols-outlined text-3xl text-[#0051d5]">document_scanner</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0d1c2e] mb-2">
              Ready to Audit Your Agreement
            </h2>
            <p className="text-xs sm:text-sm text-[#444651] max-w-lg mx-auto mb-6 leading-relaxed">
              Paste your agreement text above or select a reference template, then click <strong>Audit Clauses</strong> to receive an immediate clause-by-clause statutory fairness audit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-[#eff4ff]/60 border border-[#d5e3fc]/60">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0051d5] shadow-xs mb-2">
                  <span className="material-symbols-outlined text-lg">shield</span>
                </div>
                <h3 className="text-xs font-bold text-[#00236f] mb-1">Volatile In-Memory</h3>
                <p className="text-[11px] text-[#444651] leading-relaxed">
                  Your clauses exist in server memory only during evaluation and are immediately cleared.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#eff4ff]/60 border border-[#d5e3fc]/60">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0051d5] shadow-xs mb-2">
                  <span className="material-symbols-outlined text-lg">balance</span>
                </div>
                <h3 className="text-xs font-bold text-[#00236f] mb-1">Statutory Benchmarking</h3>
                <p className="text-[11px] text-[#444651] leading-relaxed">
                  Evaluated against the Indian Contract Act 1872, Model Tenancy Act, and labor protections.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#eff4ff]/60 border border-[#d5e3fc]/60">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0051d5] shadow-xs mb-2">
                  <span className="material-symbols-outlined text-lg">chat</span>
                </div>
                <h3 className="text-xs font-bold text-[#00236f] mb-1">Negotiation Scripts</h3>
                <p className="text-[11px] text-[#444651] leading-relaxed">
                  Generates diplomatic, ready-to-send counter-offers so you can negotiate with confidence.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

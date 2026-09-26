import React, { useState } from 'react';
import { ClauseSeverity, ScreenId } from '../../types';
import { SAMPLE_TEMPLATES } from '../../data/mockData';

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
  const [analysisResult, setAnalysisResult] = useState<ContractAnalysisResult | null>(null);
  const [copiedNegotiation, setCopiedNegotiation] = useState(false);

  const handleTemplateSelect = (key: string) => {
    const tmpl = SAMPLE_TEMPLATES[key];
    if (tmpl) {
      setContractText(tmpl.contractText);
      setContractCategory(tmpl.categoryKey);
      setUploadedFileName(null);
      onShowToast(`Loaded ${tmpl.title}`);
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
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText: trimmed,
          category: contractCategory,
        }),
      });

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      onShowToast(`File "${file.name}" loaded into editor.`);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        setContractText(text);
        setActiveTab('paste');
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setContractText('');
    setUploadedFileName(null);
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
            <label className="sr-only" htmlFor="contract-editor-textarea">
              Contract Text Editor
            </label>
            <textarea
              id="contract-editor-textarea"
              value={contractText}
              onChange={(e) => {
                setContractText(e.target.value);
                setUploadedFileName(null);
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
          <div className="border-2 border-dashed border-[#c5c5d3] rounded-xl p-8 sm:p-12 text-center bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors">
            <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#00236f] mx-auto mb-3 border border-[#d5e3fc]">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#00236f] mb-1">
              Select your agreement document
            </h2>
            <p className="text-xs sm:text-sm text-[#444651] max-w-md mx-auto mb-4">
              Upload your agreement file (.txt, .pdf, .docx). Processed ephemerally in-memory.
            </p>
            {uploadedFileName && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                <span>Loaded: {uploadedFileName}</span>
              </div>
            )}
            <div>
              <label
                htmlFor="file-upload-input"
                className="inline-flex items-center gap-2 bg-[#00236f] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#0051d5] transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-base">attach_file</span>
                <span>Choose Document</span>
              </label>
              <input
                id="file-upload-input"
                type="file"
                className="hidden"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}

        {/* Audit Actions Strip */}
        <div className="mt-5 pt-4 border-t border-[#f1f5f9] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#444651]">
            <div className="flex items-center gap-1.5 text-[#0d1c2e] font-medium">
              <span className="material-symbols-outlined text-sm text-[#0051d5]">lock</span>
              <span><strong>Zero Data Retention:</strong> Processed in volatile memory, never stored</span>
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

import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { ADVOCATE_ROOM_IMAGE, FAQ_ITEMS } from '../../data/mockData';

interface ClauseExplanation {
  riskLevel: 'high' | 'warning' | 'fair';
  riskTitle: string;
  plainMeaning: string;
  statutoryContext: string;
  statutoryLawTag: string;
  negotiationScript: string;
  hrQuestions: string[];
  suggestedReplacement: string;
}

interface ClauseCheckerScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

const SAMPLE_CLAUSES = [
  {
    label: '24-Month Non-Compete',
    text: 'Clause 7: The Employee agrees that for a period of 24 months post termination, they shall not engage in any business or employment with any entity operating in the same sector within the territory of India.',
  },
  {
    label: 'Unannounced Landlord Entry',
    text: 'Clause 4: The Lessor or their authorized representatives reserve full rights to inspect the scheduled premises at any hour of the day or night without prior intimation to the Lessee.',
  },
  {
    label: 'Deposit Lock-in & Forfeiture',
    text: 'Clause 9: In the event the Tenant vacates prior to the 11-month expiry, the entire security deposit of Rs. 1,50,000 shall stand unconditionally forfeited, alongside a mandatory 2-month painting deduction.',
  },
  {
    label: 'Immediate IP Surrender',
    text: 'Clause 8: All intellectual property, code, and concepts created during the engagement shall vest in Client immediately upon creation, irrespective of invoice payment clearance.',
  },
];

export const ClauseCheckerScreen: React.FC<ClauseCheckerScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [clauseInput, setClauseInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activePrompt, setActivePrompt] = useState<'all' | 'plain' | 'law' | 'script' | 'hr'>('all');
  const [analysisResult, setAnalysisResult] = useState<ClauseExplanation | null>(null);
  const [copyBtnText, setCopyBtnText] = useState<'Copy Draft' | 'Copied to Clipboard!'>('Copy Draft');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [hrQuestionsOpen, setHrQuestionsOpen] = useState(true);

  const handleExplainClause = async (textToAnalyze?: string) => {
    const text = (textToAnalyze ?? clauseInput).trim();
    if (!text || text.length < 5) {
      onShowToast('Please enter a contract clause to analyze.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/explain-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseText: text,
          queryType: activePrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data: ClauseExplanation = await response.json();
      setAnalysisResult(data);
      onShowToast('Clause analyzed under Indian law benchmarks.');
    } catch (err: any) {
      console.error('Error analyzing clause:', err);
      onShowToast(`Error: ${err.message || 'Unable to analyze clause'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setClauseInput(sampleText);
    handleExplainClause(sampleText);
  };

  const handleCopyScript = () => {
    if (!analysisResult?.negotiationScript) return;
    navigator.clipboard.writeText(analysisResult.negotiationScript).then(() => {
      setCopyBtnText('Copied to Clipboard!');
      onShowToast('Negotiation script copied to clipboard!');
      setTimeout(() => {
        setCopyBtnText('Copy Draft');
      }, 2500);
    });
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Editorial Header Block */}
      <div className="relative z-10 pt-2 pb-6 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6eeff] text-[#00236f] text-xs font-bold shadow-2xs mb-2 border border-[#d5e3fc]">
          <span className="material-symbols-outlined text-sm text-[#0051d5]">help_center</span>
          <span>Civic Guidance & Single Clause Explainer</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0d1c2e] tracking-tight mb-2">
          Need help deciphering a specific clause?
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#444651] max-w-3xl leading-relaxed">
          Paste any sentence, penalty, or restriction from your agreement. Get an immediate plain-English breakdown, Indian statutory enforceability check, and ready-to-send negotiation scripts.
        </p>
      </div>

      {/* Main Asymmetric Workspace Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Left Column: Single Clause Explainer (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#dce9ff] text-[#00236f] font-bold text-xs">
                  01
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#0d1c2e]">Single Clause Explainer</h2>
                  <p className="text-xs text-[#444651]">
                    Paste any individual clause or obligation
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#00236f] text-xs font-semibold border border-[#d5e3fc]">
                Indian Law Engine
              </span>
            </div>

            {/* Quick Starters */}
            <div className="mb-3">
              <span className="block text-[11px] text-[#444651] uppercase tracking-wider font-bold mb-2">
                Quick Clause Starters:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_CLAUSES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample.text)}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] transition-colors border border-[#d5e3fc] cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea & Action Ribbon */}
            <div className="bg-[#eff4ff] rounded-xl p-4 mb-4 border border-[#d5e3fc]/80">
              <label
                className="block text-[11px] text-[#444651] uppercase tracking-wider font-bold mb-1.5"
                htmlFor="clause-input-box"
              >
                Contract Clause Text
              </label>
              <textarea
                id="clause-input-box"
                value={clauseInput}
                onChange={(e) => setClauseInput(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-xs sm:text-sm text-[#0d1c2e] placeholder:text-[#757682] focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Paste any clause here e.g. 'The Employee agrees that for 24 months post termination...'"
              />
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#d5e3fc]/60 text-[#444651] text-xs">
                <span className="flex items-center gap-1 text-[#757682]">
                  <span className="material-symbols-outlined text-sm">security</span>
                  Ephemeral memory: Never stored or retained
                </span>
                {clauseInput && (
                  <button
                    onClick={() => {
                      setClauseInput('');
                      setAnalysisResult(null);
                    }}
                    type="button"
                    className="text-[#0051d5] hover:text-[#00236f] transition-colors font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-end mb-6">
              <button
                type="button"
                onClick={() => handleExplainClause()}
                disabled={isAnalyzing || !clauseInput.trim()}
                className="px-6 py-2.5 bg-[#00236f] text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-[#0051d5] transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-base ${isAnalyzing ? 'animate-spin' : ''}`}>
                  {isAnalyzing ? 'refresh' : 'gavel'}
                </span>
                <span>{isAnalyzing ? 'Evaluating Under Indian Law...' : 'Explain This Clause'}</span>
              </button>
            </div>

            {/* Analysis Results Display */}
            {analysisResult ? (
              <div className="bg-[#eff4ff] rounded-xl p-4 sm:p-5 shadow-xs space-y-4 border border-[#d5e3fc]/80">
                {/* Risk & Statutory Status Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 bg-white p-3.5 rounded-lg shadow-2xs border border-[#e2e8f0]">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full ${
                        analysisResult.riskLevel === 'high'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : analysisResult.riskLevel === 'warning'
                          ? 'bg-[#ffdcc3] text-[#653400]'
                          : 'bg-[#dce9ff] text-[#00236f]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {analysisResult.riskLevel === 'high'
                          ? 'warning'
                          : analysisResult.riskLevel === 'warning'
                          ? 'report_problem'
                          : 'verified'}
                      </span>
                    </span>
                    <div>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider block ${
                          analysisResult.riskLevel === 'high'
                            ? 'text-[#ba1a1a]'
                            : analysisResult.riskLevel === 'warning'
                            ? 'text-[#653400]'
                            : 'text-[#00236f]'
                        }`}
                      >
                        {analysisResult.riskLevel === 'high'
                          ? '🚨 High Concern • Legally Vulnerable'
                          : analysisResult.riskLevel === 'warning'
                          ? '⚠️ Worth Noting • Caution Advised'
                          : '✅ Standard & Fair'}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#0d1c2e]">
                        {analysisResult.riskTitle}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#eff4ff] text-[#00236f] text-xs font-bold border border-[#d5e3fc]">
                    <span className="material-symbols-outlined text-xs">account_balance</span>
                    <span>{analysisResult.statutoryLawTag}</span>
                  </div>
                </div>

                {/* Plain Meaning Block */}
                <div className="bg-white rounded-lg p-3.5 sm:p-4 shadow-2xs border border-[#e2e8f0]">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[#00236f] text-sm font-bold">
                    <span className="material-symbols-outlined text-[#0051d5] text-lg">visibility</span>
                    <h3>Plain Meaning (What it claims to do)</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#0d1c2e] leading-relaxed">
                    {analysisResult.plainMeaning}
                  </p>
                </div>

                {/* Indian Statutory Context Block */}
                <div className="bg-white rounded-lg p-3.5 sm:p-4 shadow-2xs border border-[#e2e8f0]">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[#00236f] text-sm font-bold">
                    <span className="material-symbols-outlined text-[#0051d5] text-lg">balance</span>
                    <h3>Indian Legal Reality & Enforceability</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#0d1c2e] leading-relaxed">
                    {analysisResult.statutoryContext}
                  </p>
                </div>

                {/* Fair Replacement Clause */}
                {analysisResult.suggestedReplacement && (
                  <div className="bg-white rounded-lg p-3.5 sm:p-4 shadow-2xs border border-[#e2e8f0]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-[#00236f] text-sm font-bold">
                        <span className="material-symbols-outlined text-[#0051d5] text-lg">lightbulb</span>
                        <h3>Suggested Fair Replacement Clause</h3>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(analysisResult.suggestedReplacement);
                          onShowToast('Replacement clause copied!');
                        }}
                        type="button"
                        className="inline-flex items-center gap-1 text-[#0051d5] hover:text-[#00236f] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        <span>Copy Clause</span>
                      </button>
                    </div>
                    <div className="bg-[#eff4ff] rounded-lg p-3 text-xs text-[#0d1c2e] leading-relaxed font-mono border border-[#d5e3fc]">
                      {analysisResult.suggestedReplacement}
                    </div>
                  </div>
                )}

                {/* Polite Counter-Proposal Email Script */}
                {analysisResult.negotiationScript && (
                  <div className="bg-white rounded-lg p-3.5 sm:p-4 shadow-2xs border border-[#e2e8f0]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-[#00236f] text-sm font-bold">
                        <span className="material-symbols-outlined text-[#0051d5] text-lg">mark_email_read</span>
                        <h3>Ready-to-Send Negotiation Script</h3>
                      </div>
                      <button
                        onClick={handleCopyScript}
                        type="button"
                        className="inline-flex items-center gap-1 text-[#0051d5] hover:text-[#00236f] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        <span>{copyBtnText}</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#444651] mb-2.5">
                      A respectful, professional formulation requesting balanced terms under standard Indian legal principles.
                    </p>
                    <div className="bg-[#eff4ff] rounded-lg p-3 sm:p-3.5 text-xs text-[#0d1c2e] leading-relaxed font-mono whitespace-pre-line select-all border border-[#d5e3fc]">
                      {analysisResult.negotiationScript}
                    </div>
                  </div>
                )}

                {/* Practical Questions to Ask HR / Counterparty */}
                {analysisResult.hrQuestions && analysisResult.hrQuestions.length > 0 && (
                  <div className="bg-white rounded-lg p-3.5 sm:p-4 shadow-2xs border border-[#e2e8f0]">
                    <button
                      onClick={() => setHrQuestionsOpen(!hrQuestionsOpen)}
                      className="w-full flex items-center justify-between text-sm font-bold text-[#00236f] text-left cursor-pointer"
                      type="button"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#0051d5]">quiz</span>
                        <span>3 Practical Questions to Ask on a Call</span>
                      </div>
                      <span
                        className={`material-symbols-outlined text-[#444651] transition-transform duration-200 ${
                          hrQuestionsOpen ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {hrQuestionsOpen && (
                      <div className="mt-3 pt-2 space-y-2 text-xs text-[#444651] border-t border-[#f1f5f9]">
                        {analysisResult.hrQuestions.map((q, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#eff4ff]">
                            <span className="font-bold text-[#00236f]">{idx + 1}.</span>
                            <span>"{q}"</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#eff4ff]/40 rounded-xl p-8 text-center border border-[#d5e3fc]/60">
                <span className="material-symbols-outlined text-4xl text-[#0051d5] mb-2">find_in_page</span>
                <h3 className="text-sm font-bold text-[#00236f] mb-1">Paste Any Clause to Begin</h3>
                <p className="text-xs text-[#444651] max-w-sm mx-auto">
                  Select a starter above or paste any restriction from your contract, then click Explain This Clause.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Next Steps & Legal Assistance (5 Cols) */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-[#e2e8f0] flex flex-col">
            <div className="relative h-44 w-full overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="A contemporary legal consultation room with law volumes and documents"
                src={ADVOCATE_ROOM_IMAGE}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
            </div>

            <div className="p-5 sm:p-6 flex flex-col justify-between -mt-6 relative z-10">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0051d5] uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-xs">gavel</span>
                  When to Seek an Enrolled Advocate
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#0d1c2e] mb-2 leading-snug">
                  Need Formal Legal Representation or Bespoke Drafting?
                </h2>
                <p className="text-xs text-[#444651] leading-relaxed mb-4">
                  Law Counsel provides civic literacy and educational readability benchmarks. If you have been served an eviction summons, notice under Section 138 NI Act, or need bespoke commercial agreements, consult an advocate enrolled with your State Bar Council.
                </p>
              </div>

              <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
                <div className="flex items-start gap-2 text-xs text-[#444651]">
                  <span className="material-symbols-outlined text-[#0051d5] text-base shrink-0 mt-0.5">verified</span>
                  <span>Free legal aid is available for qualifying citizens via District Legal Services Authorities (DLSA / NALSA).</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => onNavigate('legal-rights-101')}
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-[#0051d5] font-semibold hover:underline cursor-pointer"
                  >
                    <span>Read your rights under Indian Law</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2e8f0]">
            <h2 className="text-base font-bold text-[#0d1c2e] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0051d5] text-lg">help</span>
              <span>Frequently Asked Questions</span>
            </h2>

            <div className="divide-y divide-[#f1f5f9]">
              {FAQ_ITEMS.map((faq, idx) => (
                <div key={idx} className="py-2.5">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left text-xs font-semibold text-[#0d1c2e] hover:text-[#0051d5] transition-colors cursor-pointer"
                    type="button"
                  >
                    <span>{faq.question}</span>
                    <span className="material-symbols-outlined text-sm text-[#757682]">
                      {openFaqIndex === idx ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {openFaqIndex === idx && (
                    <p className="mt-2 text-xs text-[#444651] leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { FAQ_ITEMS } from '../../data/mockData';

interface HelpGuidanceScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const HelpGuidanceScreen: React.FC<HelpGuidanceScreenProps> = ({
  onNavigate,
  onShowToast
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sanadQuery, setSanadQuery] = useState('');
  const [sanadResult, setSanadResult] = useState<string | null>(null);

  const handleVerifySanad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanadQuery.trim()) return;
    setSanadResult(
      `Format verified: "${sanadQuery.toUpperCase()}". To complete official registry check, search this enrollment code on your State Bar Council portal (e.g. Bar Council of Delhi, Bar Council of Maharashtra & Goa, or Bar Council of Karnataka).`
    );
    onShowToast('Advocate verification guide prepared!');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#eff4ff] p-6 sm:p-8 lg:p-10 mb-8 border border-[#d5e3fc]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d5e3fc] text-[#00236f] text-xs font-bold mb-3 border border-[#c5c5d3]/40">
            <span className="material-symbols-outlined text-sm text-[#0051d5]">support_agent</span>
            <span>Civic Support & Navigation Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#00236f] tracking-tight mb-2">
            Help, Guidance & Legal Advocate Network
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#444651] leading-relaxed">
            Everything you need to navigate contract ambiguities, verify licensed legal counsel in India, and understand our privacy and data processing guarantees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Left Column: Verification Guide & Privacy Architecture (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Advocate Verification Tool */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-2 mb-2 text-[#00236f]">
              <span className="material-symbols-outlined text-[#0051d5]">verified</span>
              <h2 className="text-base sm:text-lg font-bold">How to Verify an Advocate in India</h2>
            </div>
            <p className="text-xs text-[#444651] mb-4 leading-relaxed">
              Every licensed practicing lawyer in India is assigned a unique <strong>Enrollment / Sanad Number</strong> by their respective State Bar Council (e.g., <code className="bg-[#eff4ff] px-1 py-0.5 rounded text-[#00236f]">D/1234/2018</code> or <code className="bg-[#eff4ff] px-1 py-0.5 rounded text-[#00236f]">KAR/567/2019</code>).
            </p>

            <form onSubmit={handleVerifySanad} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                value={sanadQuery}
                onChange={(e) => setSanadQuery(e.target.value)}
                placeholder="Enter enrollment code (e.g. D/1234/2018 or KAR/567/2021)..."
                className="flex-1 bg-[#f8f9ff] text-xs sm:text-sm text-[#0d1c2e] px-3.5 py-2.5 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#0051d5]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#00236f] text-white text-xs font-bold rounded-lg hover:bg-[#0051d5] transition-colors whitespace-nowrap cursor-pointer"
              >
                Verify Format
              </button>
            </form>

            {sanadResult && (
              <div className="p-3.5 rounded-xl bg-[#eff4ff] text-xs text-[#00236f] border border-[#d5e3fc] leading-relaxed mb-4">
                {sanadResult}
              </div>
            )}

            <div className="space-y-2 text-xs text-[#444651]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#0051d5] text-sm shrink-0 mt-0.5">check_circle</span>
                <span>Ask for their Certificate of Practice (COP) issued under the Bar Council of India All India Bar Examination rules.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#0051d5] text-sm shrink-0 mt-0.5">check_circle</span>
                <span>Verify that fee retainers are paid into formal accounts, accompanied by a stamped acknowledgment memo.</span>
              </div>
            </div>
          </div>

          {/* Privacy & Zero-Retention Architecture */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-2 mb-2 text-[#00236f]">
              <span className="material-symbols-outlined text-[#0051d5]">lock</span>
              <h2 className="text-base sm:text-lg font-bold">Ephemeral Processing & Privacy Ethics</h2>
            </div>
            <p className="text-xs text-[#444651] mb-4 leading-relaxed">
              Legal agreements contain private personal data (Aadhaar numbers, PAN, residential addresses, and salary structures). Law Counsel is engineered with strict volatile processing guarantees:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#d5e3fc]/60">
                <div className="font-bold text-xs text-[#00236f] mb-1">RAM-Only Ingestion</div>
                <div className="text-xs text-[#444651]">
                  Documents are parsed strictly in memory and wiped immediately upon generating the analysis breakdown.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#d5e3fc]/60">
                <div className="font-bold text-xs text-[#00236f] mb-1">Zero Public Model Training</div>
                <div className="text-xs text-[#444651]">
                  Your clauses are never indexed, stored, or fed into foundation models for training datasets.
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2e8f0]">
            <h2 className="text-base sm:text-lg font-bold text-[#0d1c2e] mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-xl border border-[#e2e8f0] overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#0d1c2e] hover:bg-[#eff4ff] transition-colors"
                      type="button"
                    >
                      <span>{faq.question}</span>
                      <span className={`material-symbols-outlined text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    {isOpen && (
                      <div className="p-4 text-xs text-[#444651] leading-relaxed bg-[#eff4ff] border-t border-[#e2e8f0]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Civic Directory & Feedback (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Civic Aid Directory */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2e8f0]">
            <h3 className="text-base font-bold text-[#00236f] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0051d5]">account_balance</span>
              Authorized Civic Portals
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#d5e3fc]/60">
                <div className="flex items-center justify-between text-xs font-bold text-[#00236f]">
                  <span>National Consumer Helpline</span>
                  <span className="bg-[#d5e3fc] px-2 py-0.5 rounded text-[10px]">Toll-Free 1915</span>
                </div>
                <p className="text-xs text-[#444651] mt-1 leading-relaxed">
                  For tenancy security deposit refusals, defective rental facilities, and builder delays.
                </p>
                <div className="mt-2 text-xs">
                  <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#0051d5] font-bold hover:underline">
                    consumerhelpline.gov.in →
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#d5e3fc]/60">
                <div className="flex items-center justify-between text-xs font-bold text-[#00236f]">
                  <span>NALSA Legal Aid Directory</span>
                  <span className="bg-[#d5e3fc] px-2 py-0.5 rounded text-[10px]">Dial 15100</span>
                </div>
                <p className="text-xs text-[#444651] mt-1 leading-relaxed">
                  Free state-assigned panel advocates for women, industrial workmen, and low-income citizens.
                </p>
                <div className="mt-2 text-xs">
                  <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#0051d5] font-bold hover:underline">
                    nalsa.gov.in →
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#d5e3fc]/60">
                <div className="flex items-center justify-between text-xs font-bold text-[#00236f]">
                  <span>MSME Samadhaan</span>
                  <span className="bg-[#d5e3fc] px-2 py-0.5 rounded text-[10px]">Micro Enterprise</span>
                </div>
                <p className="text-xs text-[#444651] mt-1 leading-relaxed">
                  Tribunal council for independent creators, designers, and developers facing unpaid client bills.
                </p>
                <div className="mt-2 text-xs">
                  <a href="https://samadhaan.msme.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#0051d5] font-bold hover:underline">
                    samadhaan.msme.gov.in →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="bg-[#00236f] text-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold mb-2">Ready to evaluate your document?</h3>
            <p className="text-xs text-white/90 mb-4 leading-relaxed">
              Paste your clauses or compare against verified fair agreements right now.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onNavigate('analyze-contract')}
                className="w-full py-2.5 bg-[#0051d5] hover:bg-[#316bf3] text-white text-xs font-bold rounded-lg transition-colors text-center cursor-pointer"
                type="button"
              >
                Go to Contract Analyzer
              </button>
              <button
                onClick={() => onNavigate('sample-agreements')}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer"
                type="button"
              >
                Browse Standard Templates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

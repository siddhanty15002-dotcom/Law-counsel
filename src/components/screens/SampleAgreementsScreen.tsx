import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { BENCHMARK_ITEMS, SAMPLE_TEMPLATES } from '../../data/mockData';

interface SampleAgreementsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const SampleAgreementsScreen: React.FC<SampleAgreementsScreenProps> = ({
  onNavigate,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBenchmarkTab, setActiveBenchmarkTab] = useState<'rent' | 'noncompete' | 'ip'>('rent');
  const [copiedClause, setCopiedClause] = useState(false);

  const templates = [
    {
      id: 'tenancy-1',
      title: 'Standard 11-Month Residential Rent Agreement',
      category: 'tenancy',
      tag: 'Tenant-Fair',
      subtag: 'Model Tenancy Act Baseline',
      status: 'Statutory Standard',
      icon: 'real_estate_agent',
      desc: 'Applicable for Karnataka, Maharashtra, Delhi NCR & major metropolitan tenancies. Eliminates predatory clauses commonly inserted in broker drafts.',
      bullets: [
        { label: 'Deposit Protection', text: 'Recommends max 2–3 months deposit (curbing 10-month lock-ins) with mandatory 7-day bank refund clause.' },
        { label: 'Notice Period', text: 'Symmetric 1-month mutual notice with no forfeit of remaining term without cause.' },
        { label: 'Fair Painting Deduction', text: 'Caps wear-and-tear deductions to verified painter invoices or maximum 1 month rent equivalent.' },
        { label: 'Maintenance Transparency', text: 'Explicit division between structural owner repairs vs everyday tenant usage costs.' }
      ],
      filename: 'Residential_11_Month_Lease_India_Standard.txt',
      benchmarkType: 'rent' as const
    },
    {
      id: 'tech-1',
      title: 'Freelance Design & Development Agreement (India)',
      category: 'tech',
      tag: 'Freelancer-Protected',
      subtag: 'Clear IP Terms',
      status: 'Statutory Standard',
      icon: 'terminal',
      desc: 'Structured specifically for Indian independent software developers, UI/UX designers, and digital creative consultants working with domestic or overseas clients.',
      bullets: [
        { label: 'Milestone Shield', text: 'Non-refundable upfront retainer before sprint commencement to prevent unpaid scoping work.' },
        { label: 'IP Release Condition', text: 'Copyright transfers to client strictly upon clearance of the 100% final invoice payment.' },
        { label: 'Capped Liability', text: 'Total legal liability is expressly capped at the total fee value received for the applicable statement of work.' },
        { label: 'Scope Creep Shield', text: 'Clear cap of 2 iterative review rounds per milestone; extra hours charged at stated hourly rate.' }
      ],
      filename: 'Freelance_Tech_Agreement_India_Standard.txt',
      benchmarkType: 'ip' as const
    },
    {
      id: 'employment-1',
      title: 'Software Engineer Offer Letter & IP Assignment',
      category: 'employment',
      tag: 'Employee-Friendly',
      subtag: 'Sec 27 Compliant',
      status: 'Statutory Standard',
      icon: 'badge',
      desc: 'A standard employment agreement template that protects employee career mobility while respecting legitimate company confidential trade secrets.',
      bullets: [
        { label: 'Reasonable Probation', text: 'Fair 30-day notice during probation period, graduating to 60-day notice post-confirmation with buy-out clarity.' },
        { label: 'Section 27 Harmony', text: 'Replaces unenforceable post-employment non-compete clauses with lawful non-solicitation guidelines.' },
        { label: 'Prior Inventions Exclusion', text: 'Dedicated schedule allowing engineers to declare preexisting personal open source or side-projects.' },
        { label: 'PF & Gratuity Breakdown', text: 'Explicit statutory itemization aligning with Payment of Gratuity Act and EPFO deductions.' }
      ],
      filename: 'Tech_Employment_Offer_India_Standard.txt',
      benchmarkType: 'noncompete' as const
    },
    {
      id: 'service-1',
      title: 'Independent Contractor Non-Disclosure Agreement (Mutual)',
      category: 'service',
      tag: 'Balanced Mutual',
      subtag: 'Standard Terms',
      status: 'Statutory Standard',
      icon: 'handshake',
      desc: 'A truly bilateral non-disclosure agreement ensuring both parties are equally held to reciprocal standards of privacy and proprietary data handling.',
      bullets: [
        { label: '2-Year Sunset Clause', text: 'Confidentiality obligations expire after 24 months, rejecting one-sided \'perpetual liability\' clauses.' },
        { label: 'Clear Exclusions', text: 'Explicit safe harbors for information already public, independently developed, or lawfully disclosed by third parties.' },
        { label: 'Reciprocal Obligations', text: 'Disclosing party is bound by identical duties if sensitive contractor methods are shared.' },
        { label: 'Indian Jurisdiction', text: 'Arbitration venue governed by the Indian Arbitration & Conciliation Act in the contractor\'s resident city.' }
      ],
      filename: 'Mutual_NDA_India_Template_Standard.txt',
      benchmarkType: 'ip' as const
    }
  ];

  const filteredTemplates = templates.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      tmpl.title.toLowerCase().includes(term) ||
      tmpl.desc.toLowerCase().includes(term) ||
      tmpl.bullets.some((b) => b.label.toLowerCase().includes(term) || b.text.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  const activeBenchmark = BENCHMARK_ITEMS.find((b) => b.key === activeBenchmarkTab) || BENCHMARK_ITEMS[0];

  const handleCopyFairClause = () => {
    navigator.clipboard.writeText(activeBenchmark.fairText).then(() => {
      setCopiedClause(true);
      onShowToast('Fair Standard Clause copied to clipboard!');
      setTimeout(() => setCopiedClause(false), 2500);
    });
  };

  const handleDownloadDraft = (tmpl: typeof templates[0]) => {
    onShowToast(`Downloading standard template: ${tmpl.title}`);
    const templateTextMap: Record<string, string> = {
      'tenancy-1': SAMPLE_TEMPLATES.rental?.contractText || '',
      'tech-1': SAMPLE_TEMPLATES.freelance?.contractText || '',
      'employment-1': SAMPLE_TEMPLATES.job?.contractText || '',
      'service-1': SAMPLE_TEMPLATES.nda?.contractText || '',
    };
    const agreementBody = templateTextMap[tmpl.id] || '';

    const content = `================================================================================
LAW COUNSEL (INDIA) • STANDARD FAIR CONTRACT TEMPLATE
Title: ${tmpl.title}
Status: ${tmpl.status}
Tag: ${tmpl.tag} (${tmpl.subtag})
================================================================================

STATUTORY PRINCIPLES & GOVERNING LAW:
This standard template incorporates balanced protections aligned with:
- The Indian Contract Act, 1872 (Fair pre-estimated damages under Section 74; Free trade mobility under Section 27)
- The Model Tenancy Act (Quiet enjoyment, 24-hour entry notice, 7-day deposit refund)
- The MSMED Act, 2006 (Section 15 payment caps for independent contractors)
- The Indian Copyright Act, 1957 (Conditioning copyright assignment on full invoice clearance)

KEY CLAUSES INCLUDED:
${tmpl.bullets.map((b, i) => `${i + 1}. [${b.label}]: ${b.text}`).join('\n')}

DESCRIPTION & SCOPE:
${tmpl.desc}

================================================================================
COMPLETE AGREEMENT CLAUSES & STANDARD WORDING:
================================================================================

${agreementBody}

================================================================================
To execute, print on appropriate State non-judicial e-stamp paper and sign in the presence
of two witnesses. Consult an enrolled advocate with your State Bar Council for custom terms.
================================================================================
`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = tmpl.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const scrollToBenchmark = (type: 'rent' | 'noncompete' | 'ip') => {
    setActiveBenchmarkTab(type);
    const el = document.getElementById('benchmark-tool-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Header Banner */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#eff4ff] shadow-sm px-6 sm:px-8 py-8 sm:py-10 mb-8 border border-[#d5e3fc]">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#dbe1ff] opacity-40 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#d5e3fc] opacity-70 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-[#00236f] shadow-2xs mb-4 border border-[#cbd5e1]/40">
            <span className="material-symbols-outlined text-[#0051d5] text-base">verified</span>
            <span className="text-[11px] font-bold tracking-wide uppercase">
              Educational Reference Library • India
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#00236f] tracking-tight mb-2.5">
            Verified Indian Contract Templates & Clause Guides
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#444651] max-w-2xl mb-6 leading-relaxed">
            Compare your lease or offer letter against fair, balanced example agreements that reflect Indian statutory standards (Transfer of Property Act, Indian Contract Act, Model Tenancy Act).
          </p>

          {/* Search Box */}
          <div className="w-full max-w-3xl relative">
            <div className="flex items-center bg-white rounded-xl shadow-md p-1.5 border border-[#cbd5e1] focus-within:ring-2 focus-within:ring-[#0051d5]">
              <div className="pl-3 pr-2 flex items-center text-[#0051d5]">
                <span className="material-symbols-outlined text-2xl">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by agreement type, state, or clause (e.g. 11-month rent, probation, freelance)..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#0d1c2e] placeholder:text-[#757682] focus:outline-none py-2 px-1"
              />
              <button
                type="button"
                className="hidden sm:inline-flex items-center justify-center bg-[#00236f] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#0051d5] transition-colors shrink-0 cursor-pointer"
              >
                Find Templates
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-[#444651]">
              <span className="text-[#757682]">Popular checks:</span>
              <button
                type="button"
                onClick={() => setSearchQuery('11-month')}
                className="underline decoration-[#0051d5] underline-offset-2 hover:text-[#00236f] font-semibold cursor-pointer"
              >
                11-Month Lease
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setSearchQuery('Section 27')}
                className="underline decoration-[#0051d5] underline-offset-2 hover:text-[#00236f] font-semibold cursor-pointer"
              >
                Sec 27 Non-Compete
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setSearchQuery('Security Deposit')}
                className="underline decoration-[#0051d5] underline-offset-2 hover:text-[#00236f] font-semibold cursor-pointer"
              >
                Security Deposit Refund
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & State Notice */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full lg:w-auto">
          {[
            { id: 'all', label: `All Templates (${templates.length})` },
            { id: 'tenancy', label: '🏠 Tenancy & Rental' },
            { id: 'employment', label: '💼 Employment & Internships' },
            { id: 'tech', label: '💻 Tech & Freelancing' },
            { id: 'service', label: '🤝 Service & Consulting' },
            { id: 'loans', label: '💰 Loans & Promissory Notes' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'bg-white text-[#444651] hover:bg-[#dce9ff] border border-[#cbd5e1]/40'
              }`}
              type="button"
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-[#444651] text-xs font-semibold">
          <span className="material-symbols-outlined text-sm text-[#0051d5]">tune</span>
          <span>Showing standard Indian state formats: KA, MH, DL, TN, TS</span>
        </div>
      </div>

      {/* Template Cards Grid or Empty State */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#e2e8f0] text-center mb-10 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#00236f] mx-auto mb-3 border border-[#d5e3fc]">
            <span className="material-symbols-outlined text-3xl">folder_off</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#0d1c2e] mb-1">
            No templates found in this category
          </h3>
          <p className="text-xs sm:text-sm text-[#444651] max-w-md mx-auto mb-4 leading-relaxed">
            {selectedCategory === 'loans'
              ? 'Loan agreement and promissory note templates are currently being reviewed for statutory compliance.'
              : 'No templates match your active filter or search keywords.'}
          </p>
          {/* TODO: Add verified promissory note and loan agreement templates vetted under the Negotiable Instruments Act */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#00236f] text-white text-xs font-bold rounded-lg hover:bg-[#0051d5] transition-colors cursor-pointer"
          >
            Reset Filters & View All ({templates.length})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {filteredTemplates.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 border border-[#e2e8f0] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-[#dce9ff] text-[#00236f] font-bold">
                      <span className="material-symbols-outlined text-xs text-[#0051d5]">verified_user</span>
                      {item.tag}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-[#dce1ff] text-[#00164e] font-bold">
                      <span className="material-symbols-outlined text-xs">account_balance</span>
                      {item.subtag}
                    </span>
                  </div>
                  <span className="text-[#757682] text-[11px] font-semibold">{item.status}</span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#00236f] shrink-0 border border-[#d5e3fc]">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0d1c2e]">
                    {item.title}
                  </h2>
                </div>

                <p className="text-xs text-[#444651] mb-4 leading-relaxed">
                  {item.desc}
                </p>

                <div className="bg-[#eff4ff] rounded-xl p-3.5 sm:p-4 mb-4 space-y-2 text-xs text-[#0d1c2e] border border-[#d5e3fc]/60">
                  {item.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#0051d5] text-sm shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span>
                        <strong>{b.label}: </strong> {b.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => scrollToBenchmark(item.benchmarkType)}
                  className="inline-flex items-center justify-center gap-1 text-xs font-bold text-[#0051d5] hover:text-[#00236f] transition-colors py-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">compare_arrows</span>
                  <span>View Fair Clauses</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('analyze-contract')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 bg-[#eff4ff] text-xs font-bold text-[#00236f] px-3.5 py-2 rounded-lg hover:bg-[#dce9ff] transition-colors border border-[#d5e3fc] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    <span>Compare with My Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadDraft(item)}
                    title="Download Educational Reference Draft"
                    className="inline-flex items-center justify-center gap-1 bg-[#00236f] text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-[#0051d5] transition-colors shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Draft (.txt)</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Clause Benchmark Tool Section */}
      <section
        id="benchmark-tool-section"
        className="w-full bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-5 sm:p-6 lg:p-8 mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-[#0051d5] text-[11px] font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-base">rule</span>
              <span>Live Clause Benchmark</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#00236f]">
              Clause Comparison Benchmark Tool
            </h2>
            <p className="text-xs sm:text-sm text-[#444651]">
              See how standard, court-tested clauses differ word-for-word from unbalanced or predatory clauses found in everyday Indian paperwork.
            </p>
          </div>

          {/* Benchmark Tabs */}
          <div className="flex items-center gap-1.5 bg-[#eff4ff] p-1 rounded-xl shrink-0 border border-[#d5e3fc]">
            {BENCHMARK_ITEMS.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => setActiveBenchmarkTab(b.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeBenchmarkTab === b.key
                    ? 'bg-white text-[#00236f] shadow-xs'
                    : 'text-[#444651] hover:text-[#0d1c2e]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Box */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Predatory Side */}
          <div className="bg-[#ffdad6]/25 rounded-2xl p-5 sm:p-6 flex flex-col justify-between border border-[#ffdad6]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[#ffdad6] text-[#93000a] font-bold">
                  <span className="material-symbols-outlined text-xs">warning</span>
                  Example Predatory / One-Sided Clause
                </span>
                <span className="text-[11px] text-[#757682] font-semibold">Common in unverified drafts</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-[#93000a] mb-2">
                {activeBenchmark.predatoryTitle}
              </h3>

              <div className="bg-white rounded-xl p-4 text-xs sm:text-sm text-[#0d1c2e] mb-4 shadow-2xs border border-[#ffdad6]/60 leading-relaxed font-serif">
                <p className="italic text-[#444651]">{activeBenchmark.predatoryText}</p>
              </div>

              <div className="space-y-2 text-xs text-[#ba1a1a] mb-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">cancel</span>
                  <span>{activeBenchmark.predatoryRisk1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">cancel</span>
                  <span>{activeBenchmark.predatoryRisk2}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#ffdad6]/60">
              <div className="inline-flex items-center gap-1 text-[11px] text-[#757682] font-semibold">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>Verdict: High financial & legal exposure</span>
              </div>
            </div>
          </div>

          {/* Fair Standard Side */}
          <div className="bg-[#eff4ff] rounded-2xl p-5 sm:p-6 flex flex-col justify-between border border-[#d5e3fc]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[#d5e3fc] text-[#00236f] font-bold">
                  <span className="material-symbols-outlined text-xs text-[#0051d5]">verified</span>
                  Law Counsel Fair Benchmark
                </span>
                <span className="text-[11px] text-[#0051d5] font-bold">Model Tenancy Act Baseline</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-[#00236f] mb-2">
                {activeBenchmark.fairTitle}
              </h3>

              <div className="bg-white rounded-xl p-4 text-xs sm:text-sm text-[#0d1c2e] mb-4 shadow-2xs border border-[#d5e3fc] leading-relaxed">
                <p className="text-[#0d1c2e]">{activeBenchmark.fairText}</p>
              </div>

              <div className="space-y-2 text-xs text-[#444651] mb-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#0051d5] text-sm shrink-0 mt-0.5">check_circle</span>
                  <span>{activeBenchmark.fairBenefit1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#0051d5] text-sm shrink-0 mt-0.5">check_circle</span>
                  <span>{activeBenchmark.fairBenefit2}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#d5e3fc] flex items-center justify-between">
              <button
                type="button"
                onClick={handleCopyFairClause}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0051d5] hover:text-[#00236f] transition-colors py-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedClause ? 'check' : 'content_copy'}
                </span>
                <span>{copiedClause ? 'Copied to Clipboard!' : 'Copy Fair Clause'}</span>
              </button>
              <span className="text-[11px] text-[#757682] font-semibold">Ready for copy-paste</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statutory Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#0051d5] mb-4 border border-[#d5e3fc]">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <h3 className="text-base font-bold text-[#0d1c2e] mb-1.5">Model Tenancy Act 2021</h3>
            <p className="text-xs text-[#444651] leading-relaxed mb-4">
              India's Model Tenancy Act recommends a ceiling of 2 months' rent for residential security deposits. While state adoption varies, our templates default to these consumer-friendly limits.
            </p>
          </div>
          <button
            onClick={() => onNavigate('legal-rights-101')}
            className="flex items-center gap-1 text-[#0051d5] text-xs font-bold hover:underline cursor-pointer"
            type="button"
          >
            <span>Learn about your state's rent rules</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#0051d5] mb-4 border border-[#d5e3fc]">
              <span className="material-symbols-outlined text-2xl">balance</span>
            </div>
            <h3 className="text-base font-bold text-[#0d1c2e] mb-1.5">Section 27 Contract Act</h3>
            <p className="text-xs text-[#444651] leading-relaxed mb-4">
              Under Section 27 of the Indian Contract Act, 1872, any agreement restraining an individual from exercising a lawful profession or trade is void. We help identify toothless non-compete clauses.
            </p>
          </div>
          <button
            onClick={() => onNavigate('legal-rights-101')}
            className="flex items-center gap-1 text-[#0051d5] text-xs font-bold hover:underline cursor-pointer"
            type="button"
          >
            <span>Read Supreme Court rulings on Section 27</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#0051d5] mb-4 border border-[#d5e3fc]">
              <span className="material-symbols-outlined text-2xl">draw</span>
            </div>
            <h3 className="text-base font-bold text-[#0d1c2e] mb-1.5">Stamp Duty & E-Registration</h3>
            <p className="text-xs text-[#444651] leading-relaxed mb-4">
              Rental agreements over 11 months require mandatory sub-registrar registration. Our templates explain e-stamping values for Karnataka, Maharashtra, Delhi, and Tamil Nadu.
            </p>
          </div>
          <button
            onClick={() => onNavigate('legal-rights-101')}
            className="flex items-center gap-1 text-[#0051d5] text-xs font-bold hover:underline cursor-pointer"
            type="button"
          >
            <span>View state stamp paper requirements</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Need Customized Clause Banner */}
      <div className="w-full bg-[#dce9ff] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border border-[#c5c5d3]/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0051d5] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-2xl">contact_support</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#00236f]">
              Need a customized clause for your agreement?
            </h3>
            <p className="text-xs sm:text-sm text-[#444651]">
              Upload your existing draft in PDF or Word to highlight one-sided phrasing and generate polite counter-offer language.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('analyze-contract')}
          type="button"
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#00236f] text-white text-xs font-bold px-6 py-3 rounded-lg hover:bg-[#0051d5] transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">upload_file</span>
          <span>Analyze My Contract Now</span>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="w-full bg-[#eff4ff] rounded-xl p-4 text-[#444651] flex items-start gap-3 mb-4 border border-[#d5e3fc]">
        <span className="material-symbols-outlined text-[#0051d5] text-xl shrink-0 mt-0.5">policy</span>
        <div className="text-xs leading-relaxed">
          <strong className="font-semibold text-[#0d1c2e]">Legal Information Disclaimer: </strong>
          All contract templates and benchmark clause comparisons provided by Law Counsel are crafted for general educational, civic literacy, and reference purposes under prevailing Indian legal standards. While verified for balanced fairness, local state amendments (such as varying Rent Control Acts or Stamp Paper Rules) may apply to your jurisdiction. These materials do not constitute formal attorney-client representation or statutory certification.
        </div>
      </div>
    </div>
  );
};

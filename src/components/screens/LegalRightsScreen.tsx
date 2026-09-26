import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { APARTMENT_KEYS_IMAGE, MYTH_ITEMS } from '../../data/mockData';

interface LegalRightsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const LegalRightsScreen: React.FC<LegalRightsScreenProps> = ({
  onNavigate,
  onShowToast
}) => {
  const [openMyths, setOpenMyths] = useState<Record<string, boolean>>({
    'myth-1': true,
    'myth-2': false,
    'myth-3': false
  });

  const toggleMyth = (id: string) => {
    setOpenMyths((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#00236f] text-white p-6 sm:p-8 md:p-10 shadow-md mb-8 border border-[#1e3a8a]">
        <div className="absolute -right-20 -bottom-24 w-96 h-96 rounded-full bg-[#0051d5] opacity-20 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-[#1e3a8a] opacity-30 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#d5e3fc] text-[#00236f] text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-sm">menu_book</span>
            <span>Citizens Legal Literacy Initiative</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
            Everyday Legal Rights in India, Explained in Plain English
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#eaf1ff] opacity-90 max-w-2xl mb-6 leading-relaxed">
            Bite-sized knowledge to help you negotiate confidently before signing leases, job offers, or freelance gigs. No convoluted legalese, just enforceable statutory facts.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-[#1e3a8a] text-[#90a8ff] px-3.5 py-1.5 rounded-lg border border-[#90a8ff]/20">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Indian Contract Act, 1872</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1e3a8a] text-[#90a8ff] px-3.5 py-1.5 rounded-lg border border-[#90a8ff]/20">
              <span className="material-symbols-outlined text-sm">balance</span>
              <span>MSMED Act, 2006</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1e3a8a] text-[#90a8ff] px-3.5 py-1.5 rounded-lg border border-[#90a8ff]/20">
              <span className="material-symbols-outlined text-sm">home_work</span>
              <span>Model Tenancy Act Reference</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Foundational Modules + Myth Busters Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Left Column: 4 Modules (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#0051d5] font-bold">
                Foundational Modules
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0d1c2e] tracking-tight">
                Core Rights Every Indian Must Know
              </h2>
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-[#00236f] bg-[#dce9ff] px-3 py-1 rounded-full">
              4 Essential Pillars
            </span>
          </div>

          {/* Module 1: Tenancy */}
          <article className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#e2e8f0] hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center border border-[#d5e3fc]">
                  <span className="material-symbols-outlined text-2xl">apartment</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0051d5]">
                    Module 01 • Tenancy & Rent
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0d1c2e]">
                    The Truth About 11-Month Rental Agreements
                  </h3>
                </div>
              </div>
              <span className="self-start md:self-auto px-3 py-1 rounded-full bg-[#dbe1ff] text-[#00174b] text-[11px] font-bold">
                Registration Act, 1908 • Sec 17
              </span>
            </div>

            {/* Photo preview */}
            <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden mb-4 shadow-inner">
              <img
                className="w-full h-full object-cover"
                alt="A modern warm Indian apartment living room with keys resting on an agreement paper"
                src={APARTMENT_KEYS_IMAGE}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00236f]/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs sm:text-sm font-semibold text-white">
                  Landlord-Tenant Power Dynamic: What is actually binding
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
              <div className="p-3.5 rounded-xl bg-[#eff4ff] flex flex-col justify-between border border-[#d5e3fc]/60">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#00236f] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-[#0051d5]">timelapse</span>
                    Why 11 Months?
                  </h4>
                  <p className="text-xs text-[#444651] leading-relaxed">
                    Leases of 12+ months legally mandate compulsory registration and stamp duty under Section 17 of the Registration Act. 11-month deals avoid this registry fee.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#d5e3fc]/60 text-[11px] text-[#00236f] font-bold">
                  Tip: Still sign on adequate Stamp Paper!
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eff4ff] flex flex-col justify-between border border-[#d5e3fc]/60">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#00236f] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-[#0051d5]">payments</span>
                    Deposit Extortion
                  </h4>
                  <p className="text-xs text-[#444651] leading-relaxed">
                    Bengaluru/Mumbai demand 10–12 months deposit, but the Draft Model Tenancy Act recommends a ceiling of max 2 months for residential properties.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#d5e3fc]/60 text-[11px] text-[#00236f] font-bold">
                  Leverage: Cite market standard caps
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eff4ff] flex flex-col justify-between border border-[#d5e3fc]/60">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#00236f] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-[#0051d5]">lock</span>
                    Illegal Lockouts
                  </h4>
                  <p className="text-xs text-[#444651] leading-relaxed">
                    A landlord cannot physically lock you out, disconnect water or power, or throw belongings without a formal legal court eviction order.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#d5e3fc]/60 text-[11px] text-[#ba1a1a] font-bold">
                  Disconnection is a punishable offence
                </div>
              </div>
            </div>

            <div className="bg-[#eff4ff] p-3.5 rounded-xl flex items-start gap-2.5 border border-[#d5e3fc]">
              <span className="material-symbols-outlined text-[#0051d5] text-lg shrink-0 mt-0.5">lightbulb</span>
              <div className="text-xs text-[#0d1c2e] leading-relaxed">
                <strong className="font-bold text-[#00236f]">Negotiation script: </strong>
                "We agree on the rent. However, standard statutory practices in major metros cap security deposits at 2 to 3 months. Can we align with standard residential convention to expedite signing?"
              </div>
            </div>
          </article>

          {/* Module 2: Workplace */}
          <article className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#e2e8f0] hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center border border-[#d5e3fc]">
                  <span className="material-symbols-outlined text-2xl">badge</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0051d5]">
                    Module 02 • Workplace Rights
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0d1c2e]">
                    Employment Bonds & Non-Compete Traps
                  </h3>
                </div>
              </div>
              <span className="self-start md:self-auto px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold">
                Sec 27 Contract Act: Void by Law
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#eff4ff] mb-4 border border-[#d5e3fc]/60">
              <h4 className="text-xs sm:text-sm font-bold text-[#00236f] mb-1.5">
                The Big Myth: "You cannot join our competitor for 12 months"
              </h4>
              <p className="text-xs sm:text-sm text-[#444651] leading-relaxed mb-3">
                Under <strong>Section 27 of the Indian Contract Act, 1872</strong>, any agreement that restrains anyone from exercising a lawful profession, trade, or business is <em>void to that extent</em>. Post-termination non-competes in India are consistently struck down by High Courts and the Supreme Court (Percept D'Mark v. Zaheer Khan).
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#00236f] font-semibold">
                <span className="bg-[#d5e3fc] px-2.5 py-0.5 rounded">Freedom of Livelihood</span>
                <span className="bg-[#d5e3fc] px-2.5 py-0.5 rounded">Article 19(1)(g) of Constitution</span>
                <span className="bg-[#d5e3fc] px-2.5 py-0.5 rounded">Trade Secret Non-Disclosure is Valid</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#d5e3fc]/60">
                <div className="flex items-center gap-1.5 text-[#ba1a1a] text-xs sm:text-sm font-bold mb-1.5">
                  <span className="material-symbols-outlined text-base">dangerous</span>
                  Punitive Training Bonds
                </div>
                <p className="text-xs text-[#444651] leading-relaxed mb-2">
                  If an employer makes you sign a 2-lakh bond for 2 years of service, Indian courts only permit recovery of <strong>actual verifiable expenditures</strong> incurred on specialized external training, not punitive or liquidated damages to enforce servitude.
                </p>
                <span className="text-[11px] text-[#0d1c2e] font-bold">Requirement: Firm must show training bills.</span>
              </div>

              <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#d5e3fc]/60">
                <div className="flex items-center gap-1.5 text-[#0051d5] text-xs sm:text-sm font-bold mb-1.5">
                  <span className="material-symbols-outlined text-base">receipt_long</span>
                  Notice Period & Experience Letters
                </div>
                <p className="text-xs text-[#444651] leading-relaxed mb-2">
                  Employers cannot withhold relieving letters or legitimate experience certificates as blackmail for notice buyouts if proper written resignation was submitted according to contract guidelines.
                </p>
                <span className="text-[11px] text-[#0d1c2e] font-bold">Remedy: Legal notice via an advocate clears 90% of delays.</span>
              </div>
            </div>
          </article>

          {/* Module 3: Gig & Freelance */}
          <article className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#e2e8f0] hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center border border-[#d5e3fc]">
                  <span className="material-symbols-outlined text-2xl">terminal</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0051d5]">
                    Module 03 • Gig & Freelance Shield
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0d1c2e]">
                    Freelance Invoicing & MSME Samadhaan Protection
                  </h3>
                </div>
              </div>
              <span className="self-start md:self-auto px-3 py-1 rounded-full bg-[#dce9ff] text-[#00236f] text-[11px] font-bold">
                MSMED Act • 45-Day Payment Rule
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#444651] mb-4 leading-relaxed">
              Most solo developers, designers, copywriters, and consultants in India don't realize they can register for a <strong>Free Udyam Registration</strong> in 10 minutes. Doing so transforms you into a registered Micro-enterprise with immense statutory backup.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col justify-between border border-[#d5e3fc]/60">
                <div>
                  <div className="flex items-center gap-1.5 text-[#00236f] text-xs sm:text-sm font-bold mb-1.5">
                    <span className="material-symbols-outlined text-[#0051d5]">schedule</span>
                    Statutory 45-Day Deadline
                  </div>
                  <p className="text-xs text-[#444651] leading-relaxed">
                    Under Section 15 of the MSMED Act, clients must pay you within the agreed period or within 45 days max. Even if your contract specifies 90 days, the statutory ceiling overrules it.
                  </p>
                </div>
                <div className="mt-3 p-2 bg-[#d5e3fc] rounded text-[#0d1c2e] text-[11px] font-bold">
                  Compound Interest: 3x RBI Bank Rate for every late day!
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col justify-between border border-[#d5e3fc]/60">
                <div>
                  <div className="flex items-center gap-1.5 text-[#00236f] text-xs sm:text-sm font-bold mb-1.5">
                    <span className="material-symbols-outlined text-[#0051d5]">history_edu</span>
                    Scope Creep & Revisions Cap
                  </div>
                  <p className="text-xs text-[#444651] leading-relaxed">
                    Without a clause explicitly stipulating "Up to 2 rounds of review; additional rounds billed at Rs. X/hour", clients can legally argue the deliverable was unfulfilled or incomplete.
                  </p>
                </div>
                <div className="mt-3 p-2 bg-[#d5e3fc] rounded text-[#0d1c2e] text-[11px] font-bold">
                  Protective: IP transfers only AFTER final invoice cleared.
                </div>
              </div>
            </div>

            <div className="bg-[#dce9ff] p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap border border-[#c5c5d3]/50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00236f] text-2xl">security</span>
                <div>
                  <div className="text-xs font-bold text-[#00236f]">MSME Samadhaan Facilitation Council</div>
                  <div className="text-xs text-[#444651]">
                    Online government tribunal to recover unpaid freelance dues without high court fees.
                  </div>
                </div>
              </div>
              <a
                className="px-3.5 py-1.5 bg-[#00236f] text-white rounded-lg text-xs font-bold hover:bg-[#0051d5] transition-colors inline-flex items-center gap-1"
                href="https://samadhaan.msme.gov.in"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>Learn Portal</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>
          </article>

          {/* Module 4: Dispute Clauses */}
          <article className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#e2e8f0] hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center border border-[#d5e3fc]">
                <span className="material-symbols-outlined text-2xl">distance</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0051d5]">
                  Module 04 • Dispute Clauses
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#0d1c2e]">
                  Arbitration & Jurisdiction Traps
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#d5e3fc]/60">
                <div className="flex items-center gap-1.5 text-[#ba1a1a] text-xs sm:text-sm font-bold mb-1.5">
                  <span className="material-symbols-outlined text-base">location_off</span>
                  1,500 km Distant Jurisdiction
                </div>
                <p className="text-xs text-[#444651] leading-relaxed">
                  You live and work in Pune, but the client or landlord inserts: <em>"Courts in New Delhi shall have exclusive jurisdiction."</em> If a dispute of Rs. 40,000 arises, the cost of booking flights and hiring local counsel in Delhi makes legal recourse practically impossible.
                </p>
              </div>

              <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#d5e3fc]/60">
                <div className="flex items-center gap-1.5 text-[#00236f] text-xs sm:text-sm font-bold mb-1.5">
                  <span className="material-symbols-outlined text-base">gavel</span>
                  Costly Private Arbitration Clauses
                </div>
                <p className="text-xs text-[#444651] leading-relaxed">
                  Arbitration is great for corporations, but hiring a sole private arbitrator can cost Rs. 50,000 to Rs. 2,00,000 per sitting. In small freelance contracts, stipulate <strong>negotiation and small-causes mediation</strong> first.
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* Right Column: Myth Busters & Helplines (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Myth Buster Flashcards */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-2 text-[#00236f] text-base font-bold mb-1">
              <span className="material-symbols-outlined text-[#0051d5]">quiz</span>
              Myth-Buster Flashcards
            </div>
            <p className="text-xs text-[#444651] mb-4">
              Click any card to flip from widespread Indian misconceptions to enforceable legal reality.
            </p>

            <div className="space-y-3">
              {MYTH_ITEMS.map((item) => {
                const isOpen = openMyths[item.id] || false;
                return (
                  <div
                    key={item.id}
                    className="cursor-pointer p-4 rounded-xl bg-[#eff4ff] transition-all border border-[#d5e3fc]/80 hover:bg-[#dce9ff]/40"
                    onClick={() => toggleMyth(item.id)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[#ba1a1a] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Myth #{item.id.replace('myth-', '')}: {item.category}
                      </span>
                      <span
                        className={`material-symbols-outlined text-sm text-[#444651] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-semibold text-[#0d1c2e] leading-snug">
                      {item.myth}
                    </div>

                    {isOpen && (
                      <div className="pt-2.5 mt-2.5 border-t border-[#d5e3fc] text-xs text-[#0d1c2e] leading-relaxed animate-in fade-in duration-200">
                        <div className="font-bold text-[#0051d5] flex items-center gap-1 mb-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Fact Busted:
                        </div>
                        {item.fact}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* When to Hire an Advocate */}
          <div className="bg-[#eff4ff] p-5 sm:p-6 rounded-2xl shadow-sm border border-[#d5e3fc]">
            <div className="flex items-center gap-2 text-[#00236f] text-base font-bold mb-1">
              <span className="material-symbols-outlined text-[#0051d5]">gavel</span>
              When to Hire an Advocate
            </div>
            <p className="text-xs text-[#444651] mb-4">
              Law Counsel demystifies terms, but some situations strictly demand a registered Indian High Court advocate.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-[#e2e8f0]">
                <span className="material-symbols-outlined text-[#ba1a1a] text-base shrink-0 mt-0.5">
                  priority_high
                </span>
                <div className="text-xs text-[#0d1c2e] leading-relaxed">
                  <strong className="text-[#00236f] font-bold">Formal Legal Notices Received: </strong>
                  If you receive a Section 138 (Cheque Bounce) or court summon, respond strictly via an advocate within statutory time limits (typically 15–30 days).
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-[#e2e8f0]">
                <span className="material-symbols-outlined text-[#ba1a1a] text-base shrink-0 mt-0.5">
                  priority_high
                </span>
                <div className="text-xs text-[#0d1c2e] leading-relaxed">
                  <strong className="text-[#00236f] font-bold">Real Estate Purchase (Title Deeds): </strong>
                  Never rely solely on AI for 30-year chain deed searches, encumbrance verification, or RERA registry checks.
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-[#e2e8f0]">
                <span className="material-symbols-outlined text-[#ba1a1a] text-base shrink-0 mt-0.5">
                  priority_high
                </span>
                <div className="text-xs text-[#0d1c2e] leading-relaxed">
                  <strong className="text-[#00236f] font-bold">Criminal Indemnity Clauses: </strong>
                  Any contract imposing personal criminal liability or indemnification without liability caps.
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-[#e2e8f0]">
                <span className="material-symbols-outlined text-[#ba1a1a] text-base shrink-0 mt-0.5">
                  priority_high
                </span>
                <div className="text-xs text-[#0d1c2e] leading-relaxed">
                  <strong className="text-[#00236f] font-bold">High Value Equity / Co-Founder Deals: </strong>
                  Shareholder Agreements (SHA) with liquidation preference waterfalls and reverse-vesting schedules.
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#dce9ff] text-[#00236f] flex items-center justify-between">
              <div className="text-xs font-bold">Need a vetted lawyer?</div>
              <button
                type="button"
                onClick={() => onShowToast('Connecting with State Bar Council verified panel advocates...')}
                className="px-3.5 py-1.5 bg-[#00236f] text-white rounded-lg text-xs font-bold hover:bg-[#0051d5] transition-colors cursor-pointer"
              >
                Find Legal Aid
              </button>
            </div>
          </div>

          {/* Official Civic Helplines */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#e2e8f0]">
            <h4 className="text-sm font-bold text-[#00236f] mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0051d5] text-base">support_agent</span>
              Official Civic Helplines
            </h4>
            <p className="text-xs text-[#444651] mb-3">Free legal guidance authorized by the Government of India.</p>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#eff4ff] border border-[#d5e3fc]/60">
                <span className="text-[#444651]">National Consumer Helpline (NCH):</span>
                <a href="tel:1915" className="text-[#00236f] font-bold hover:underline">1915</a>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#eff4ff] border border-[#d5e3fc]/60">
                <span className="text-[#444651]">NALSA (Free Legal Aid):</span>
                <a href="tel:15100" className="text-[#00236f] font-bold hover:underline">15100</a>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#eff4ff] border border-[#d5e3fc]/60">
                <span className="text-[#444651]">Cyber Fraud Helpline:</span>
                <a href="tel:1930" className="text-[#00236f] font-bold hover:underline">1930</a>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#eff4ff] border border-[#d5e3fc]/60">
                <span className="text-[#444651]">Tele-Law (Dept. of Justice):</span>
                <a href="https://tele-law.in" target="_blank" rel="noopener noreferrer" className="text-[#0051d5] font-bold hover:underline">
                  tele-law.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="w-full bg-[#dce9ff] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mb-8 border border-[#c5c5d3]/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#00236f] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-2xl">document_scanner</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#00236f] mb-0.5">
              Have a document you are about to sign?
            </h3>
            <p className="text-xs sm:text-sm text-[#444651]">
              Upload any PDF, agreement scan, or screenshot. We highlight tricky clauses in under 15 seconds.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('analyze-contract')}
          type="button"
          className="w-full md:w-auto px-6 py-3 bg-[#0051d5] text-white rounded-lg text-xs font-bold tracking-wide hover:bg-[#00236f] transition-all text-center shrink-0 shadow-md cursor-pointer"
        >
          Scan Agreement Now
        </button>
      </div>

      {/* Bottom Legal Disclaimer */}
      <div className="bg-[#eff4ff] p-4 rounded-xl text-center max-w-4xl mx-auto border border-[#d5e3fc]">
        <div className="flex items-center justify-center gap-1.5 text-[#444651] text-xs mb-1">
          <span className="material-symbols-outlined text-sm text-[#0051d5]">info</span>
          <span>Legal Information • Not Legal Counsel</span>
        </div>
        <p className="text-[11px] text-[#444651] opacity-90 leading-relaxed">
          Law Counsel is an informational literacy platform. Insights provided on this page summarize general principles of Indian contract and tenancy jurisprudence for educational awareness. Contract laws vary by state amendments (e.g., Maharashtra Rent Control Act vs. Karnataka Rent Control Act). For actionable litigation representation or individualized legal advice, consult an advocate enrolled with the Bar Council of India.
        </p>
      </div>
    </div>
  );
};

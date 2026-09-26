import React from 'react';
import { ScreenId } from '../types';

interface FooterProps {
  onNavigate: (screen: ScreenId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#eff4ff] mt-auto py-10 md:py-12 border-t border-[#d5e3fc]/80 shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-[#00236f] tracking-tight">Law Counsel</span>
            </div>
            <p className="text-xs md:text-sm text-[#444651] leading-relaxed">
              Demystifying legal paperwork for Indian tenants, employees, creators, and freelancers with plain-English clause breakdown and statutory benchmarking.
            </p>
          </div>

          {/* Col 2: Jurisdictional Focus */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider">
              Jurisdictional Focus
            </h4>
            <ul className="space-y-1.5 text-xs text-[#444651]">
              <li className="hover:text-[#00236f] cursor-pointer" onClick={() => onNavigate('sample-agreements')}>
                11-Month Rental Agreements
              </li>
              <li className="hover:text-[#00236f] cursor-pointer" onClick={() => onNavigate('legal-rights-101')}>
                Non-Compete Enforceability (Sec 27)
              </li>
              <li className="hover:text-[#00236f] cursor-pointer" onClick={() => onNavigate('legal-rights-101')}>
                Probation & Notice Periods
              </li>
              <li className="hover:text-[#00236f] cursor-pointer" onClick={() => onNavigate('sample-agreements')}>
                Freelance Retainer IP Terms
              </li>
            </ul>
          </div>

          {/* Col 3: Privacy & Data Ethics */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider">
              Privacy & Data Ethics
            </h4>
            <p className="text-xs text-[#444651] leading-relaxed">
              Uploaded contracts are processed ephemerally in volatile memory, never used to train public models, and never sold or shared with landlords or employers.
            </p>
          </div>

          {/* Col 4: Indian Helplines */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider">
              Indian Helplines & Support
            </h4>
            <ul className="space-y-1.5 text-xs text-[#444651]">
              <li>
                National Consumer Helpline: <strong className="font-semibold text-[#0d1c2e]">1915</strong>
              </li>
              <li>
                NALSA Legal Aid Helpline: <strong className="font-semibold text-[#0d1c2e]">15100</strong>
              </li>
              <li>
                Cyber Fraud Emergency: <strong className="font-semibold text-[#0d1c2e]">1930</strong>
              </li>
              <li>
                Consumer Forum Guidance:{' '}
                <a
                  href="https://edakhil.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0051d5] hover:underline"
                >
                  edakhil.nic.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#d5e3fc] flex flex-col md:flex-row items-center justify-between text-xs text-[#444651] gap-3">
          <p>© 2024–2026 Law Counsel India. Created for civic empowerment. Built for educational and literacy assistance.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('help-and-guidance')}
              className="hover:text-[#0d1c2e] transition-colors cursor-pointer"
              type="button"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigate('help-and-guidance')}
              className="hover:text-[#0d1c2e] transition-colors cursor-pointer"
              type="button"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('help-and-guidance')}
              className="hover:text-[#0d1c2e] transition-colors cursor-pointer"
              type="button"
            >
              Advocate Referral Network
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

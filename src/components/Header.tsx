import React, { useState } from 'react';
import { ScreenId } from '../types';
import { LOGO_URL } from '../data/mockData';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onShowToast
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [logoSrc, setLogoSrc] = useState<string>(LOGO_URL);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch('/api/upload-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileBase64: base64,
              mimeType: file.type,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            const newUrl = `${data.url || '/logo.jpg'}?t=${Date.now()}`;
            setLogoSrc(newUrl);
            onShowToast('Brand logo updated and saved directly to public/logo.jpg!');
          } else {
            onShowToast(data.error || 'Failed to update logo.');
          }
        } catch (err: any) {
          onShowToast('Error saving logo image file.');
        } finally {
          setIsUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingLogo(false);
    }
  };

  const navItems: { id: ScreenId; label: string }[] = [
    { id: 'analyze-contract', label: 'Analyze Contract' },
    { id: 'clause-checker', label: 'Clause Checker' },
    { id: 'sample-agreements', label: 'Sample Agreements' },
    { id: 'legal-rights-101', label: 'Legal Rights 101' },
    { id: 'help-and-guidance', label: 'Help & Guidance' }
  ];

  const handleLangToggle = (targetLang: 'EN' | 'HI') => {
    if (targetLang === 'HI') {
      onShowToast('हिंदी संस्करण जल्द ही आ रहा है (Hindi translations rolling out in beta!)');
    }
    setLang(targetLang);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f8f9ff]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Top Banner Notice */}
      <div className="bg-[#dce9ff] py-1 px-4 sm:px-8 border-b border-[#c5c5d3]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-semibold text-[#444651]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-sm text-[#0051d5] shrink-0">gavel</span>
            <span className="truncate">
              <strong className="font-semibold text-[#0d1c2e]">Not Legal Advice:</strong> Law Counsel explains terms in plain English to help you spot red flags. For disputes or binding commitments, consult a licensed advocate.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[#444651] shrink-0 ml-4">
            <span>Indian Contract Act, 1872 • Consumer Awareness Aid</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="h-16 md:h-20 max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
          />
          <div className="relative group shrink-0">
            <button
              onClick={() => onNavigate('analyze-contract')}
              className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none cursor-pointer min-w-0"
              type="button"
            >
              <div className="relative shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-slate-900/5 shadow-xs transition-transform duration-200 group-hover:scale-105">
                <img
                  alt="Law Counsel Logo"
                  className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 aspect-square shrink-0 object-contain p-0.5"
                  src={logoSrc}
                  width="44"
                  height="44"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (logoSrc !== '/logo.png') {
                      setLogoSrc('/logo.png');
                    }
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-base sm:text-lg md:text-xl text-[#00236f] tracking-tight truncate">
                    Law Counsel
                  </span>
                  <span className="inline-flex bg-[#d5e3fc] text-[#00236f] text-[9px] sm:text-[10px] md:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                    Clause Checker • India
                  </span>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload / Replace brand logo file (saves directly as public/logo.jpg)"
              className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-slate-50 text-slate-700 rounded-full p-1 shadow-md border border-slate-200 cursor-pointer flex items-center justify-center text-[10px]"
            >
              <span className="material-symbols-outlined text-xs">upload</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#eff4ff] rounded-xl border border-[#d5e3fc]/60">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                type="button"
                className={`px-3.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1e3a8a] text-white shadow-sm'
                    : 'text-[#444651] hover:text-[#0d1c2e] hover:bg-[#dce9ff]/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Account */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Security Badge */}
          <div className="hidden xl:flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#c5c5d3]/30 shadow-xs text-[#0d1c2e] text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[#0051d5] text-sm">verified_user</span>
            <span>Ephemeral Processing</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#eff4ff] rounded-lg p-0.5 border border-[#d5e3fc]">
            <button
              onClick={() => handleLangToggle('EN')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                lang === 'EN'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-[#444651] hover:text-[#0d1c2e]'
              }`}
              type="button"
            >
              EN
            </button>
            <button
              onClick={() => handleLangToggle('HI')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                lang === 'HI'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-[#444651] opacity-75 hover:opacity-100'
              }`}
              title="हिंदी (Beta)"
              type="button"
            >
              हिं
            </button>
          </div>

          {/* User Account / Sign In State Placeholder */}
          {/* TODO: Connect real user authentication (Firebase Auth / Google Sign-In) before production deployment */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onShowToast('Account authentication in development.')}
              title="User Account / Sign-in"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#eff4ff] border border-[#d5e3fc] flex items-center justify-center text-[#00236f] hover:bg-[#dce9ff] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">person</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#00236f] hover:bg-[#eff4ff] rounded-lg transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
            type="button"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#dce9ff] shadow-lg animate-in slide-in-from-top duration-200">
          <div className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#1e3a8a] text-white'
                      : 'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0d1c2e]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                </button>
              );
            })}
            <div className="pt-3 border-t border-[#eff4ff] flex items-center justify-between text-xs text-[#444651] px-2">
              <span className="flex items-center gap-1 text-[#0051d5]">
                <span className="material-symbols-outlined text-sm">lock</span>
                Ephemeral In-Memory Sandbox
              </span>
              <span className="text-[#757682] font-semibold">Civic Aid</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

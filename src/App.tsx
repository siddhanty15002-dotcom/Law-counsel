import React, { useState } from 'react';
import { ScreenId } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { AnalyzeContractScreen } from './components/screens/AnalyzeContractScreen';
import { ClauseCheckerScreen } from './components/screens/ClauseCheckerScreen';
import { SampleAgreementsScreen } from './components/screens/SampleAgreementsScreen';
import { LegalRightsScreen } from './components/screens/LegalRightsScreen';
import { HelpGuidanceScreen } from './components/screens/HelpGuidanceScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('analyze-contract');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e] flex flex-col font-sans antialiased">
      {/* Fixed Navigation Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onShowToast={showToast}
      />

      {/* Main Content Area */}
      <main className="w-full pt-20 md:pt-24 flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-8">
        {currentScreen === 'analyze-contract' && (
          <AnalyzeContractScreen
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'clause-checker' && (
          <ClauseCheckerScreen
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'sample-agreements' && (
          <SampleAgreementsScreen
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'legal-rights-101' && (
          <LegalRightsScreen
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'help-and-guidance' && (
          <HelpGuidanceScreen
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Toast Notification Container */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

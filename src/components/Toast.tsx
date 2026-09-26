import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-2 bg-[#00236f] text-white px-4 py-3 rounded-xl shadow-lg border border-[#316bf3]/30 text-sm font-medium">
        <span className="material-symbols-outlined text-[#316bf3] text-lg">check_circle</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white/60 hover:text-white transition-colors"
          type="button"
          aria-label="Dismiss notification"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};

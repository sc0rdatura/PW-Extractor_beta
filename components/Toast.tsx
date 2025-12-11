import React from 'react';
import { useStore } from '../store';
import { Check } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="bg-slate-800 border border-slate-700 text-emerald-400 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3">
        <div className="bg-emerald-400/10 p-1 rounded-full">
            <Check size={16} strokeWidth={3} />
        </div>
        <span className="font-medium text-sm text-slate-200">{toastMessage}</span>
      </div>
    </div>
  );
};

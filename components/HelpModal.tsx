import React, { useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-50 dark:bg-slate-950 p-6 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 dark:bg-blue-500/10 p-2 rounded-lg">
                <HelpCircle className="text-blue-600 dark:text-blue-400" size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Quick Reference Guide</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Keyboard shortcuts & usage tips</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Getting Started Section */}
            <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Getting Started</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><strong>Upload PDF:</strong> Drop Production Weekly PDF or click to upload</li>
                <li><strong>Set Issue Date:</strong> Enter the PDF issue date (DD/MM/YYYY format)</li>
                <li><strong>Add Projects:</strong> Paste project list with agent markers
                <div className="ml-6 mt-1 text-xs">
                    Format: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">"Project Name" (Agent Initials)</code>
                </div>
                </li>
                <li><strong>Click "Run Extraction":</strong> Wait for AI processing (20-30 seconds)</li>
            </ol>
            </section>

            {/* Keyboard Shortcuts Section */}
            <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Keyboard Shortcuts</h3>
            
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Navigate the Grid</h4>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400 ml-4">
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Arrow Keys</code> → Move between cells</li>
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Tab</code> → Move to next cell (or next badge in multi-item cells)</li>
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Shift+Tab</code> → Move to previous cell/badge</li>
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Enter</code> → Copy focused cell or badge</li>
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Escape</code> → Clear focus</li>
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Double-click row</code> → Clear focus</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Copy Data</h4>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400 ml-4">
                <li><strong>Click any cell</strong> → Focus + copy immediately</li>
                <li><strong>Click any badge</strong> → Copy badge text</li>
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Ctrl/Cmd+Click company</code> → Open company details modal</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Company Details Modal</h4>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400 ml-4">
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Tab</code> → Cycle through contact fields</li>
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Shift+Tab</code> → Cycle backward</li>
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Enter</code> → Copy focused field</li>
                <li><strong>Click field</strong> → Copy field value</li>
                <li><code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Escape</code> → Close modal</li>
                </ul>
            </div>
            </section>

            {/* Visual Cues Section */}
            <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Visual Cues</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p><strong>Cell Focus:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Blue background = Cell is focused</li>
                <li>Blue ring on badge = Badge is focused in multi-item cell</li>
                </ul>
                <p className="mt-3"><strong>Badge Types:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                <li><span className="text-blue-600 dark:text-blue-400">Blue badges</span> → Companies (Ctrl+Click for details)</li>
                <li><span className="text-purple-600 dark:text-purple-400">Purple badges</span> → Directors</li>
                <li><span className="text-emerald-600 dark:text-emerald-400">Emerald badges</span> → Producers</li>
                <li>Grey badges → Cities, Countries</li>
                </ul>
            </div>
            </section>

            {/* Tips Section */}
            <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tips & Tricks</h3>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>✅ <strong>Use keyboard for speed:</strong> Navigate with arrows, copy with Enter</li>
                <li>✅ <strong>Tab through badges:</strong> Quickly copy specific companies/directors</li>
                <li>✅ <strong>Test Data button:</strong> Purple button loads fake projects for testing</li>
                <li>✅ <strong>History sidebar:</strong> Restore previous imports from left panel</li>
                <li>✅ <strong>Dark mode:</strong> Toggle with sun/moon icon (top right)</li>
            </ul>
            </section>

            {/* Troubleshooting Section */}
            <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Need Help?</h3>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li><strong>Keyboard not working?</strong> Click any cell to refocus the grid</li>
                <li><strong>Modal stuck?</strong> Press Escape to close</li>
                <li><strong>Extraction failed?</strong> Check console (F12) for errors</li>
            </ul>
            </section>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-950/50 p-4 border-t border-gray-200 dark:border-slate-800 text-center shrink-0">
            <button onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors">
                Close Guide
            </button>
        </div>
      </div>
    </div>
  );
};
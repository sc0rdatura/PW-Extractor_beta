import React, { useState } from 'react';
import { useStore } from './store';
import { IngestZone } from './components/IngestZone';
import { DataGrid } from './components/DataGrid';
import { Toast } from './components/Toast';
import { TSVModal } from './components/TSVModal';
import { Sidebar } from './components/Sidebar';
import { Grid, Download, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const { projects, theme, toggleTheme } = useStore();
  const [tsvOpen, setTsvOpen] = useState(false);

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 ${theme}`}>
      
      {/* Sidebar - Session History */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Bar - Fixed */}
        <header className="h-14 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <Grid size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">PW Extractor</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Theme Toggle */}
             <button 
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
             >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>

              {projects.length > 0 && (
                   <button 
                      onClick={() => setTsvOpen(true)}
                      className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm"
                   >
                      <Download size={14} />
                      <span>View Raw TSV</span>
                   </button>
              )}
          </div>
        </header>

        {/* Scrollable Content Area - Unified */}
        <div className="flex-1 min-h-0 relative">
          <DataGrid>
            <IngestZone />
          </DataGrid>
        </div>

      </div>

      {/* Modals & Overlays */}
      <TSVModal isOpen={tsvOpen} onClose={() => setTsvOpen(false)} />
      <Toast />

    </div>
  );
};

export default App;
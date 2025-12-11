import React, { useMemo } from 'react';
import { useStore } from '../store';
import { X, Copy, FileSpreadsheet } from 'lucide-react';
import { ProjectData } from '../types';

interface TSVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TSVModal: React.FC<TSVModalProps> = ({ isOpen, onClose }) => {
  const { projects, showToast } = useStore();

  const tsvContent = useMemo(() => {
    if (projects.length === 0) return '';
    
    // Header
    const headers = [
      'Issue Date', 'Project Name', 'Primary Agent', 'Secondary Agents', 'Type', 'Status',
      'Start Date', 'Primary Company', 'Additional Companies', 'City Locations', 'Country Locations',
      'Distributor', 'Director', 'Producers', 'Showrunner', 'Search URL'
    ].join('\t');

    // Rows
    const rows = projects.map((p: ProjectData) => {
      return [
        p.issueDate,
        p.projectName,
        p.primaryAgent,
        p.secondaryAgents,
        p.type,
        p.status,
        p.startDate,
        p.primaryCompany,
        (p.additionalCompanies || []).join('; '),
        (p.cityLocations || []).join('; '),
        (p.countryLocations || []).join('/ '),
        p.distributor,
        (p.director || []).join('; '),
        (p.producers || []).join('; '),
        (p.showrunner || []).join('; '),
        p.searchUrl
      ].map(field => (field || '').replace(/\t/g, ' ')).join('\t'); // Remove tabs from content to prevent breaking TSV
    }).join('\n');

    return `${headers}\n${rows}`;
  }, [projects]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tsvContent);
    showToast("Full TSV dataset copied!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-[80vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-scale-up">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950 rounded-t-2xl">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-500/10 p-2 rounded-lg">
                <FileSpreadsheet className="text-emerald-500" size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-100">Export Raw TSV</h2>
                <p className="text-sm text-slate-400">Ready for Excel / Google Sheets</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-0 relative">
            <textarea 
                readOnly
                value={tsvContent}
                className="w-full h-full bg-slate-900 text-xs font-mono text-slate-300 p-6 resize-none outline-none focus:bg-slate-800/50 transition-colors"
                spellCheck={false}
            />
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex justify-end">
            <button 
                onClick={handleCopy}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
                <Copy size={18} />
                <span>Copy to Clipboard</span>
            </button>
        </div>

      </div>
    </div>
  );
};

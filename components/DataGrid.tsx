import React, { useState } from 'react';
import { useStore } from '../store';
import { CompanyModal } from './CompanyModal';
import { getAgentFullName } from '../utils/agentMapping';

export const DataGrid: React.FC = () => {
  const { projects, contacts, showToast, isProcessing } = useStore();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [focusedRow, setFocusedRow] = useState<number | null>(null);

// Keyboard navigation (row-based)
React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (projects.length === 0) return;

    const numRows = projects.length;

    // If no row focused, focus first row on arrow key
    if (focusedRow === null) {
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        setFocusedRow(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedRow(Math.max(0, focusedRow - 1));
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedRow(Math.min(numRows - 1, focusedRow + 1));
        break;

      case 'Enter':
        e.preventDefault();
        // Copy project name of focused row
        const project = projects[focusedRow];
        navigator.clipboard.writeText(project.projectName);
        showToast(`Copied: ${project.projectName}`);
        break;

      case 'Escape':
        e.preventDefault();
        setFocusedRow(null);
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [focusedRow, projects, showToast]);



React.useEffect(() => {
  if (focusedRow !== null) {
    const tableRows = document.querySelectorAll('tbody tr');
    const focusedElement = tableRows[focusedRow];
    if (focusedElement) {
      focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}, [focusedRow]);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Copied!");
  };

  const openCompany = (e: React.MouseEvent, name: string) => {
    e.stopPropagation(); // Prevent cell copy
    setSelectedCompany(name);
  };

  if (!projects.length) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-600">
        <p>No data extracted yet.</p>
    </div>
  );

    <div onClick={() => setFocusedRow(null)} className="flex-1 overflow-hidden p-4 bg-gray-50 dark:bg-slate-950 flex flex-col">
    </div>
  
  return (
    
    <div className="flex-1 overflow-hidden p-4 bg-gray-50 dark:bg-slate-950 flex flex-col">
      <CompanyModal 
        isOpen={!!selectedCompany} 
        companyName={selectedCompany || ''} 
        onClose={() => setSelectedCompany(null)} 
      />

      <div className={`overflow-x-auto w-full border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-950 transition-opacity ${
  isProcessing ? 'pointer-events-none opacity-50' : ''
}`}>
        <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-100 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
            <tr>
              <HeaderCell title="Issue Date" />
              <HeaderCell title="Project Name" />
              <HeaderCell title="Primary Agent" />
              <HeaderCell title="Secondary Agents" />
              <HeaderCell title="Type" />
              <HeaderCell title="Status" />
              <HeaderCell title="Start Date" />
              <HeaderCell title="Primary Co." />
              <HeaderCell title="Add. Companies" />
              <HeaderCell title="City" />
              <HeaderCell title="Country" />
              <HeaderCell title="Distributor" />
              <HeaderCell title="Director" />
              <HeaderCell title="Producers" />
              <HeaderCell title="Search URL" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {projects.map((row, rowIdx) => (
  <tr 
    key={rowIdx} 
    onClick={() => setFocusedRow(rowIdx)}
    className={`transition-colors group cursor-pointer ${
      focusedRow === rowIdx 
        ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400' 
        : 'hover:bg-blue-50 dark:hover:bg-slate-900/50'
    }`}
  >
                {/* 1. Issue Date */}
                <Cell text={row.issueDate} onCopy={() => handleCopy(row.issueDate)} />
                
                {/* 2. Project Name */}
                <Cell text={row.projectName} onCopy={() => handleCopy(row.projectName)} bold />
                
                {/* 3. Primary Agent */}
<Cell text={getAgentFullName(row.primaryAgent)} onCopy={() => handleCopy(row.primaryAgent)} />
                
                {/* 4. Secondary Agents */}
<Cell 
  text={row.secondaryAgents ? row.secondaryAgents.split(';').map(a => getAgentFullName(a.trim())).join('; ') : ''} 
  onCopy={() => handleCopy(row.secondaryAgents)} 
/>
                
                {/* 5. Type */}
                <td className="p-3 border-r border-gray-200 dark:border-slate-800/50 text-slate-500 dark:text-slate-400">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold border ${
                        row.type?.toLowerCase().includes('film') 
                        ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' 
                        : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                    }`}>
                        {row.type}
                    </span>
                </td>

                {/* 6. Status */}
                <Cell text={row.status} onCopy={() => handleCopy(row.status)} />

                {/* 7. Start Date */}
                <Cell text={row.startDate} onCopy={() => handleCopy(row.startDate)} />

                {/* 8. Primary Company - Interactive */}
                <td className="p-3 border-r border-gray-200 dark:border-slate-800/50">
                   {row.primaryCompany ? (
                      <button 
                          onClick={(e) => openCompany(e, row.primaryCompany)}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded text-xs font-medium transition-colors"
                      >
                          {row.primaryCompany}
                      </button>
                   ) : <span className="text-slate-400">-</span>}
                </td>

                {/* 9. Additional Companies - Interactive Array */}
                <td className="p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs">
  <div className="flex gap-1 flex-wrap">
                      {row.additionalCompanies && row.additionalCompanies.length > 0 ? row.additionalCompanies.map((co, i) => (
                           <button 
                              key={i}
                              onClick={(e) => openCompany(e, co)}
                              className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded text-xs whitespace-nowrap"
                          >
                              {co}
                          </button>
                      )) : <span className="text-slate-400">-</span>}
                   </div>
                </td>

                {/* 10. City - Interactive Badges */}
                <td className="p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                        {row.cityLocations && row.cityLocations.length > 0 ? row.cityLocations.map((city, i) => (
                            <span 
                                key={i} 
                                onClick={() => handleCopy(city)}
                                className="cursor-pointer px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                {city}
                            </span>
                        )) : <span className="text-slate-400">-</span>}
                    </div>
                </td>

                {/* 11. Country - Interactive Badges */}
                <td className="p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                        {row.countryLocations && row.countryLocations.length > 0 ? row.countryLocations.map((country, i) => (
                            <span 
                                key={i} 
                                onClick={() => handleCopy(country)}
                                className="cursor-pointer px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                {country}
                            </span>
                        )) : <span className="text-slate-400">-</span>}
                    </div>
                </td>

                {/* 12. Distributor */}
                <Cell text={row.distributor} onCopy={() => handleCopy(row.distributor)} />

               {/* 13. Director */}
<td className="p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs">
  <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-wrap">
    {row.director && row.director.length > 0 ? row.director.map((director, i) => (
      <span 
        key={i} 
        onClick={() => handleCopy(director)}
        className="cursor-pointer px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/20 transition-colors whitespace-nowrap font-medium"
      >
        {director}
      </span>
    )) : <span className="text-slate-400">-</span>}
  </div>
</td>

                {/* 14. Producers */}
<td className="p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs">
  <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-wrap">
    {row.producers && row.producers.length > 0 ? row.producers.map((producer, i) => (
      <span 
        key={i} 
        onClick={() => handleCopy(producer)}
        className="cursor-pointer px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors whitespace-nowrap font-medium"
      >
        {producer}
      </span>
    )) : <span className="text-slate-400">-</span>}
  </div>
</td>

                {/* 15. Search URL */}
                <Cell text={row.searchUrl} onCopy={() => handleCopy(row.searchUrl)} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HeaderCell: React.FC<{ title: string }> = ({ title }) => (
  <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-800 border-r border-gray-200 dark:border-slate-800/50 bg-gray-100 dark:bg-slate-900">
    {title}
  </th>
);

const Cell: React.FC<{ text: string, onCopy: () => void, bold?: boolean }> = ({ text, onCopy, bold }) => (
  <td 
    onClick={onCopy}
    className={`
        px-4 py-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer select-none 
        ${bold ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-600 dark:text-slate-400'} 
        hover:bg-blue-50 dark:hover:bg-blue-500/5 hover:text-blue-600 dark:hover:text-blue-300 transition-colors
    `}
  >
    <div className="flex items-center justify-between group-hover/cell:text-blue-200">
        <span className="truncate max-w-[200px]">{text || '-'}</span>
    </div>
  </td>
);
import React, { useState } from 'react';
import { useStore } from '../store';
import { CompanyModal } from './CompanyModal';
import { getAgentFullName } from '../utils/agentMapping';
import { ProjectData } from '../types';

export const DataGrid: React.FC = () => {
  const { projects, contacts, showToast, isProcessing } = useStore();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [focusedCell, setFocusedCell] = useState<{ 
  row: number; 
  col: number; 
  subIndex?: number; 
} | null>(null);

  // Keyboard navigation (cell-based)
  // Keyboard navigation (cell-based)
React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle modal-specific keys first
    if (selectedCompany) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedCompany(null);
        return;
      }
      // Block ALL other keys when modal is open (including Tab and arrows)
      e.preventDefault();
      return;
    }
    
    // Grid navigation (only runs when modal is closed)
    if (projects.length === 0) return;

    const numRows = projects.length;
    const numCols = 15;

    // If no cell focused, focus first cell on arrow key
    if (focusedCell === null) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setFocusedCell({ row: 0, col: 0 });
      }
      return;
    }

    const { row, col } = focusedCell;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) {
          setFocusedCell({ row: row - 1, col });
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (row < numRows - 1) {
          setFocusedCell({ row: row + 1, col });
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) {
          setFocusedCell({ row, col: col - 1 });
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (col < numCols - 1) {
          setFocusedCell({ row, col: col + 1 });
        }
        break;

      case 'Tab':
  e.preventDefault();
  const project = projects[row];
  const subIndex = focusedCell.subIndex || 0;
  
  if (e.shiftKey) {
    // Shift+Tab: Move left (simplified - no sub-item support)
    if (col > 0) {
      setFocusedCell({ row, col: col - 1 });
    } else if (row > 0) {
      setFocusedCell({ row: row - 1, col: numCols - 1 });
    }
  } else {
    // Tab: Check if we're in a multi-item cell
    let movedToSubItem = false;
    
    // Additional Companies (col 8)
    if (col === 8 && project.additionalCompanies && project.additionalCompanies.length > 1) {
      if (subIndex < project.additionalCompanies.length - 1) {
        setFocusedCell({ row, col, subIndex: subIndex + 1 });
        movedToSubItem = true;
      }
    }
    // Directors (col 12)
    else if (col === 12 && project.director && project.director.length > 1) {
      if (subIndex < project.director.length - 1) {
        setFocusedCell({ row, col, subIndex: subIndex + 1 });
        movedToSubItem = true;
      }
    }
    // Producers (col 13)
    else if (col === 13 && project.producers && project.producers.length > 1) {
      if (subIndex < project.producers.length - 1) {
        setFocusedCell({ row, col, subIndex: subIndex + 1 });
        movedToSubItem = true;
      }
    }
    
    // If we didn't move to a sub-item, move to next cell
    if (!movedToSubItem) {
      if (col < numCols - 1) {
        setFocusedCell({ row, col: col + 1 });
      } else if (row < numRows - 1) {
        setFocusedCell({ row: row + 1, col: 0 });
      }
    }
  }
  break;

  
  case 'Enter':
  e.preventDefault();
  const projectData = projects[row];
  
  // Handle sub-items in multi-badge cells first
  if (focusedCell.subIndex !== undefined) {
    if (col === 8 && projectData.additionalCompanies) {
      const company = projectData.additionalCompanies[focusedCell.subIndex];
      if (e.ctrlKey || e.metaKey) {
        setSelectedCompany(company);
      } else {
        navigator.clipboard.writeText(company);
        showToast("Copied!");
      }
      break;
    } else if (col === 12 && projectData.director) {
      navigator.clipboard.writeText(projectData.director[focusedCell.subIndex]);
      showToast("Copied!");
      break;
    } else if (col === 13 && projectData.producers) {
      navigator.clipboard.writeText(projectData.producers[focusedCell.subIndex]);
      showToast("Copied!");
      break;
    }
  }
  
  // Regular cell handling
  const cellValue = getCellValue(projectData, col);
  
  // Special handling for company cells
  if (col === 7 && projectData.primaryCompany) {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+Enter: Open modal only
      setSelectedCompany(projectData.primaryCompany);
    } else {
      // Enter: Copy only
      navigator.clipboard.writeText(projectData.primaryCompany);
      showToast("Copied!");
    }
  } else if (cellValue) {
    navigator.clipboard.writeText(cellValue);
    showToast("Copied!");
  }
  break;

      case 'Escape':
        e.preventDefault();
        setFocusedCell(null);
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [focusedCell, projects, showToast, selectedCompany]);

  // Auto-scroll focused cell into view
  React.useEffect(() => {
    if (focusedCell !== null) {
      const cells = document.querySelectorAll('tbody tr td');
      const cellIndex = focusedCell.row * 15 + focusedCell.col;
      const focusedElement = cells[cellIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [focusedCell]);

  // Helper to get cell value by column index
  const getCellValue = (project: ProjectData, colIndex: number): string => {
    switch (colIndex) {
      case 0: return project.issueDate;
      case 1: return project.projectName;
      case 2: return getAgentFullName(project.primaryAgent);
      case 3: return project.secondaryAgents ? project.secondaryAgents.split(';').map(a => getAgentFullName(a.trim())).join('; ') : '';
      case 4: return project.type;
      case 5: return project.status;
      case 6: return project.startDate || '';
      case 7: return project.primaryCompany;
      case 8: return (project.additionalCompanies || []).join('; ');
      case 9: return (project.cityLocations || []).join('; ');
      case 10: return (project.countryLocations || []).join('; ');
      case 11: return project.distributor || '';
      case 12: return (project.director || []).join('; ');
      case 13: return (project.producers || []).join('; ');
      case 14: return project.searchUrl;
      default: return '';
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Copied!");
  };

  const openCompany = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setSelectedCompany(name);
  };

  const isCellFocused = (rowIdx: number, colIdx: number) => {
    return focusedCell?.row === rowIdx && focusedCell?.col === colIdx;
  };

  if (!projects.length) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-600">
      <p>No data extracted yet.</p>
    </div>
  );

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
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800" style={{ padding: '2px 0' }}>
            {projects.map((row, rowIdx) => (
              <tr 
  key={rowIdx} 
  onDoubleClick={() => setFocusedCell(null)}
  className={`transition-colors group ${
    focusedCell?.row === rowIdx
      ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 dark:ring-blue-400'
      : rowIdx % 2 === 0
        ? 'bg-white dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-900/50'
        : 'bg-gray-50/50 dark:bg-slate-900/20 hover:bg-blue-50 dark:hover:bg-slate-900/50'
  }`}
>
                {/* 1. Issue Date */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 0 })}
                  className={`px-4 py-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer select-none text-slate-600 dark:text-slate-400 transition-colors ${
                    isCellFocused(rowIdx, 0)
  ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{row.issueDate || '-'}</span>
                </td>

                {/* 2. Project Name */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 1 })}
                  className={`px-4 py-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer select-none text-slate-900 dark:text-slate-100 font-medium transition-colors ${
                    isCellFocused(rowIdx, 1)
  ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{row.projectName || '-'}</span>
                </td>

                {/* 3. Primary Agent */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 2 })}
                  className={`px-4 py-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer select-none text-slate-600 dark:text-slate-400 transition-colors ${
                    isCellFocused(rowIdx, 2)
  ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{getAgentFullName(row.primaryAgent) || '-'}</span>
                </td>

                {/* 4. Secondary Agents */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 3 })}
                  className={`px-4 py-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer select-none text-slate-600 dark:text-slate-400 transition-colors ${
                    isCellFocused(rowIdx, 3)
  ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <span className="truncate max-w-[200px]">
                    {row.secondaryAgents ? row.secondaryAgents.split(';').map(a => getAgentFullName(a.trim())).join('; ') : '-'}
                  </span>
                </td>

                {/* 5. Type */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 4 })}
                  className={`p-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer transition-colors ${
                    isCellFocused(rowIdx, 4)
  ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold border ${
                    row.type?.toLowerCase().includes('film') 
                      ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' 
                      : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  }`}>
                    {row.type}
                  </span>
                </td>

                {/* 6. Status */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 5 })}
                  className={`px-4 py-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer select-none text-slate-600 dark:text-slate-400 transition-colors ${
                    isCellFocused(rowIdx, 5)
                        ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{row.status || '-'}</span>
                </td>

                {/* 7. Start Date */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 6 })}
                  className={`px-4 py-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer select-none text-slate-600 dark:text-slate-400 transition-colors ${
                    isCellFocused(rowIdx, 6)
                      ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{row.startDate || '-'}</span>
                </td>

                {/* 8. Primary Company */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 7 })}
                  className={`p-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer transition-colors ${
                    isCellFocused(rowIdx, 7)
                      ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  {row.primaryCompany ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openCompany(e, row.primaryCompany);
                      }}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded text-xs font-medium transition-colors"
                    >
                      {row.primaryCompany}
                    </button>
                  ) : <span className="text-slate-400">-</span>}
                </td>

                {/* 9. Additional Companies */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 8 })}
                  className={`p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs cursor-pointer transition-colors ${
                    isCellFocused(rowIdx, 8)
                      ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <div className="flex gap-1 flex-wrap">
                    {row.additionalCompanies && row.additionalCompanies.length > 0 ? row.additionalCompanies.map((co, i) => (
                      <button 
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          openCompany(e, co);
                        }}
                        className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded text-xs whitespace-nowrap"
                      >
                        {co}
                      </button>
                    )) : <span className="text-slate-400">-</span>}
                  </div>
                </td>

                {/* 10. City */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 9 })}
                  className={`p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs cursor-pointer transition-colors ${
                    isCellFocused(rowIdx, 9)
                      ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <div className="flex flex-wrap gap-1">
                    {row.cityLocations && row.cityLocations.length > 0 ? row.cityLocations.map((city, i) => (
                      <span 
                        key={i} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(city);
                        }}
                        className="cursor-pointer px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        {city}
                      </span>
                    )) : <span className="text-slate-400">-</span>}
                  </div>
                </td>

                {/* 11. Country */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 10 })}
                  className={`p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs cursor-pointer transition-colors ${
                    isCellFocused(rowIdx, 10)
                      ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <div className="flex flex-wrap gap-1">
                    {row.countryLocations && row.countryLocations.length > 0 ? row.countryLocations.map((country, i) => (
                      <span 
                        key={i} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(country);
                        }}
                        className="cursor-pointer px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        {country}
                      </span>
                    )) : <span className="text-slate-400">-</span>}
                  </div>
                </td>

                {/* 12. Distributor */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 11 })}
                  className={`px-4 py-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer select-none text-slate-600 dark:text-slate-400 transition-colors ${
                    isCellFocused(rowIdx, 11)
                      ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{row.distributor || '-'}</span>
                </td>

                {/* 13. Director */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 12 })}
                  className={`p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs cursor-pointer transition-colors ${
                    isCellFocused(rowIdx, 12)
                      ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <div className="flex gap-1 flex-wrap">
                    {row.director && row.director.length > 0 ? row.director.map((director, i) => (
                      <span 
                        key={i} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(director);
                        }}
                        className="cursor-pointer px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/20 transition-colors whitespace-nowrap font-medium active:scale-95"
                      >
                        {director}
                      </span>
                    )) : <span className="text-slate-400">-</span>}
                  </div>
                </td>

                {/* 14. Producers */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 13 })}
                  className={`p-3 border-r border-gray-200 dark:border-slate-800/50 max-w-xs cursor-pointer transition-colors ${
                    isCellFocused(rowIdx, 13)
                      ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <div className="flex gap-1 flex-wrap">
                    {row.producers && row.producers.length > 0 ? row.producers.map((producer, i) => (
                      <span 
                        key={i} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(producer);
                        }}
                        className="cursor-pointer px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors whitespace-nowrap font-medium active:scale-95"
                      >
                        {producer}
                      </span>
                    )) : <span className="text-slate-400">-</span>}
                  </div>
                </td>

                {/* 15. Search URL */}
                <td
                  onClick={() => setFocusedCell({ row: rowIdx, col: 14 })}
                  className={`px-4 py-3 border-r border-gray-200 dark:border-slate-800/50 cursor-pointer select-none text-slate-600 dark:text-slate-400 transition-colors ${
                    isCellFocused(rowIdx, 14)
                      ? 'bg-blue-100/50 dark:bg-blue-800/30'
  : 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{row.searchUrl || '-'}</span>
                </td>
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
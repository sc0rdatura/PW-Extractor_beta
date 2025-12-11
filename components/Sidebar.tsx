import React, { useState } from 'react';
import { useStore } from '../store';
import { History, ChevronLeft, ChevronRight, Database, Clock } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { history, restoreFromHistory } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={`
        bg-gray-50 dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 flex flex-col
        ${collapsed ? 'w-14' : 'w-64'}
      `}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-800 shrink-0">
        {!collapsed && (
          <span className="font-semibold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <History size={14} /> History
          </span>
        )}
        <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded text-slate-500 transition-colors"
        >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {history.length === 0 && !collapsed && (
            <div className="p-4 text-center text-slate-500 text-xs">
                No recent batches
            </div>
        )}
        
        {history.map((batch) => (
            <button
                key={batch.id}
                onClick={() => restoreFromHistory(batch.id)}
                className={`
                    w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-900 border-b border-transparent hover:border-gray-200 dark:hover:border-slate-800 transition-all group
                    ${collapsed ? 'flex justify-center' : ''}
                `}
                title={`Restores ${batch.projects.length} projects from ${batch.issueDate}`}
            >
                {collapsed ? (
                    <div className="relative">
                        <Database size={18} className="text-slate-400 group-hover:text-blue-500" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{batch.issueDate}</span>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                {batch.projects.length} Items
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                             <Clock size={10} />
                             {new Date(batch.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                )}
            </button>
        ))}
      </div>
    </div>
  );
};
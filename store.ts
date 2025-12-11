import { create } from 'zustand';
import { AppState, ImportBatch } from './types';

// Helper to load history safely
const loadHistory = (): ImportBatch[] => {
  try {
    const item = localStorage.getItem('gridline_history');
    return item ? JSON.parse(item) : [];
  } catch (e) {
    return [];
  }
};

const saveHistory = (history: ImportBatch[]) => {
  try {
    localStorage.setItem('gridline_history', JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
};

export const useStore = create<AppState>((set, get) => ({
  pdfText: '',
  setPdfText: (text) => set({ pdfText: text }),

  targetList: '',
  setTargetList: (list) => set({ targetList: list }),

  issueDate: new Date().toISOString().split('T')[0],
  setIssueDate: (date) => set({ issueDate: date }),

  isProcessing: false,
  setIsProcessing: (status) => set({ isProcessing: status }),

  processingStage: '',
  setProcessingStage: (stage) => set({ processingStage: stage }),

  projects: [],
  setProjects: (data) => set({ projects: data }),

  contacts: {},
  setContacts: (data) => set({ contacts: data }),

  history: loadHistory(),
  addToHistory: (batch) => {
    const current = get().history;
    // Keep last 5
    const updated = [batch, ...current].slice(0, 5);
    saveHistory(updated);
    set({ history: updated });
  },
  restoreFromHistory: (id) => {
    const batch = get().history.find(h => h.id === id);
    if (batch) {
      set({
        projects: batch.projects,
        contacts: batch.contacts,
        issueDate: batch.issueDate,
        targetList: batch.targetList,
        // We do not restore pdfText to save storage/complexity
      });
      get().showToast("Session restored from history");
    }
  },

  theme: 'dark',
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toastMessage: null,
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 1500);
  },
}));
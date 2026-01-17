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

const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
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

  theme: getSystemTheme(),
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

// Test data generator (for development)
export const generateTestData = () => {
  const agents = ['HD', 'ZH', 'AV', 'DN'];
  const companies = ['Warner Bros', 'Netflix', 'Amazon MGM Studios', 'Apple Studios', 'A24'];
  const types = ['Film', 'TV'];
  const statuses = ['Pre-Production', 'Filming', 'Active Development'];
  const cities = ['London', 'Los Angeles', 'New York', 'Toronto', 'Sydney'];
  const countries = ['United Kingdom', 'United States', 'Canada', 'Australia'];
  const directors = ['Christopher Nolan', 'Greta Gerwig', 'Denis Villeneuve', 'Ava DuVernay'];
  const producers = ['Emma Thomas', 'Amy Pascal', 'Kevin Feige', 'Kathleen Kennedy'];

  const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const randomItems = (arr: any[], count: number) => 
    Array.from({length: count}, () => randomItem(arr));

  const projects = Array.from({length: 20}, (_, i) => ({
    issueDate: '09/01/2026',
    projectName: `Test Project ${i + 1}`,
    primaryAgent: randomItem(agents),
    secondaryAgents: Math.random() > 0.5 ? randomItem(agents) : '',
    type: randomItem(types),
    status: randomItem(statuses),
    startDate: `0${Math.floor(Math.random() * 9) + 1}/03/2026`,
    primaryCompany: randomItem(companies),
    additionalCompanies: randomItems(companies, 2),
    cityLocations: randomItems(cities, 2),
    countryLocations: randomItems(countries, 1),
    distributor: Math.random() > 0.5 ? randomItem(companies) : '',
    director: randomItems(directors, 1),
    producers: randomItems(producers, 3),
    searchUrl: `https://www.google.com/search?q=Test+Project+${i + 1}`
  }));

  const contacts = {
    'Warner Bros': {
      company_type: 'Studio',
      website: 'https://warnerbros.com',
      region: 'North America',
      contact_name: 'John Smith',
      city: 'Burbank',
      address: '4000 Warner Blvd.',
      postcode: '91522',
      country: 'United States',
      phone: '818-954-6000',
      email: 'info@warnerbros.com'
    },
    'Netflix': {
      company_type: 'Network',
      website: 'https://netflix.com',
      region: 'North America',
      contact_name: null,
      city: 'Los Angeles',
      address: '5808 Sunset Blvd.',
      postcode: '90028',
      country: 'United States',
      phone: '310-734-2900',
      email: 'contact@netflix.com'
    },
    'A24': {
      company_type: 'Production House',
      website: 'https://a24films.com',
      region: 'North America',
      contact_name: null,
      city: 'New York',
      address: '31 W 27th St',
      postcode: '10001',
      country: 'United States',
      phone: null,
      email: null
    }
  };

  return { projects, contacts };
};
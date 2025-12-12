export interface ProjectData {
  issueDate: string;
  projectName: string;
  primaryAgent: string;
  secondaryAgents: string; // Semicolon separated string per new prompt
  type: string;
  status: string;
  startDate: string;
  primaryCompany: string;
  additionalCompanies: string[];
  cityLocations: string[];
  countryLocations: string[];
  distributor: string;
  director: string[];
  producers: string[];
  searchUrl: string;
}

export interface ContactDetails {
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface ContactDictionary {
  [companyName: string]: ContactDetails;
}

export interface ImportBatch {
  id: string;
  timestamp: number;
  issueDate: string;
  projects: ProjectData[];
  contacts: ContactDictionary;
  targetList: string;
}

export interface AppState {
  pdfText: string;
  setPdfText: (text: string) => void;
  
  targetList: string;
  setTargetList: (list: string) => void;
  
  issueDate: string;
  setIssueDate: (date: string) => void;
  
  isProcessing: boolean;
  setIsProcessing: (status: boolean) => void;
  
  processingStage: string;
  setProcessingStage: (stage: string) => void;

  projects: ProjectData[];
  setProjects: (data: ProjectData[]) => void;
  
  contacts: ContactDictionary;
  setContacts: (data: ContactDictionary) => void;

  history: ImportBatch[];
  addToHistory: (batch: ImportBatch) => void;
  restoreFromHistory: (id: string) => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}
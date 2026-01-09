import React, { useCallback, useState } from 'react';
import { useStore } from '../store';
import { extractTextFromPdf } from '../services/pdfService';
import { UploadCloud, FileText, Calendar, List, Play, Loader2 } from 'lucide-react';
import { runProjectExtraction, runContactIndexing } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid'; // Just assuming we can generate simple IDs or use date

export const IngestZone: React.FC = () => {
  const { 
    pdfText, setPdfText, 
    targetList, setTargetList, 
    issueDate, setIssueDate,
    setIsProcessing, setProcessingStage,
    setProjects, setContacts,
    addToHistory,
    isProcessing, processingStage
  } = useStore();

  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setFileName(file.name);
        try {
            const text = await extractTextFromPdf(file);
            setPdfText(text);
        } catch (err) {
            console.error(err);
            alert("Failed to parse PDF. Ensure PDF.js is loaded.");
        }
      }
    }
  };

  const handleAnalyze = async () => {
    if (!pdfText) return;

    setIsProcessing(true);
    
    try {
        // Parallel Processing
        setProcessingStage("Initializing Neural Engines...");
        
        let extractedProjects = [];
        let extractedContacts = {};

        const p1Promise = (async () => {
            setProcessingStage("Extracting Projects...");
            const data = await runProjectExtraction(pdfText, targetList, issueDate);
            setProjects(data);
            extractedProjects = data;
            return data;
        })();

        const p2Promise = (async () => {
            // Slight delay so stage update is visible or handled
            const contacts = await runContactIndexing(pdfText, targetList);
            setContacts(contacts);
            extractedContacts = contacts;
            return contacts;
        })();

        await Promise.all([p1Promise, p2Promise]);

        // Save to History
        addToHistory({
            id: Date.now().toString(),
            timestamp: Date.now(),
            issueDate,
            projects: extractedProjects,
            contacts: extractedContacts,
            targetList
        });
        
    } catch (err) {
        console.error(err);
        alert("AI Processing Failed. Check console.");
    } finally {
        setIsProcessing(false);
        setProcessingStage("");
    }
  };

  const isReady = pdfText.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-6 shadow-sm z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PDF Uploader */}
        <div className="lg:col-span-3">
         <label 
  className={`
    flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors
    ${fileName 
      ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-500/5' 
      : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900'}
  `}
  onDragOver={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
  onDragEnter={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
  onDrop={async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type === 'application/pdf') {
      setFileName(files[0].name);
      try {
        const text = await extractTextFromPdf(files[0]);
        setPdfText(text);
      } catch (err) {
        console.error(err);
        alert("Failed to parse PDF. Ensure PDF.js is loaded.");
      }
    } else {
      alert("Please drop a PDF file");
    }
  }}
>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {fileName ? (
                <>
                  <FileText className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate max-w-[200px]">{fileName}</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Drop PDF Issue</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600">or click to upload</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
          </label>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
           {/* Date & Target List */}
           <div className="flex space-x-4">
                <div className="w-1/3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={12} /> Issue Date
                    </label>
                    <input 
                        type="date" 
                        value={issueDate} 
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none" 
                    />
                </div>
                <div className="w-2/3">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <List size={12} /> Target Context (Projects/Companies)
                    </label>
                    <textarea 
                        value={targetList}
                        onChange={(e) => setTargetList(e.target.value)}
                        placeholder="Paste specific projects to guide AI (Optional)..."
                        className="w-full h-[88px] bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none resize-none placeholder-slate-400 dark:placeholder-slate-600"
                    />
                </div>
           </div>
        </div>

        {/* Action Button */}
        <div className="lg:col-span-3 flex items-center justify-center">
            <button 
                onClick={handleAnalyze}
                disabled={!isReady || isProcessing}
                className={`
                    w-full h-full max-h-40 rounded-xl font-bold text-lg shadow-lg flex flex-col items-center justify-center transition-all
                    ${isReady && !isProcessing 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white transform hover:scale-[1.02]' 
                        : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'}
                `}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin w-8 h-8 mb-2" />
                        <span className="text-sm font-normal animate-pulse">{processingStage}</span>
                    </>
                ) : (
                    <>
                        <Play className="w-8 h-8 mb-2 fill-current" />
                        <span>Run Extraction</span>
                    </>
                )}
            </button>
        </div>

      </div>
    </div>
  );
};
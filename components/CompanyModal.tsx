import React from 'react';
import { useStore } from '../store';
import { X, MapPin, Phone, Mail, Globe, Building2 } from 'lucide-react';

interface CompanyModalProps {
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ companyName, isOpen, onClose }) => {
  const { contacts, showToast } = useStore();

  if (!isOpen) return null;

  // Simple fuzzy find logic
  const findContact = (name: string) => {
    const key = Object.keys(contacts).find(k => 
        k.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(k.toLowerCase())
    );
    return key ? contacts[key] : null;
  };

  const details = findContact(companyName);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 flex justify-between items-start border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="text-blue-500" size={20} />
                {companyName}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Contact Intelligence</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {details ? (
            <>
              <ContactRow 
                icon={<MapPin size={18} />} 
                label="Address" 
                value={details.address} 
                onCopy={() => copyToClipboard(details.address)} 
              />
              <ContactRow 
                icon={<Phone size={18} />} 
                label="Phone" 
                value={details.phone} 
                onCopy={() => copyToClipboard(details.phone)} 
              />
              <ContactRow 
                icon={<Mail size={18} />} 
                label="Email" 
                value={details.email} 
                onCopy={() => copyToClipboard(details.email)} 
              />
              <ContactRow 
                icon={<Globe size={18} />} 
                label="Website" 
                value={details.website} 
                onCopy={() => copyToClipboard(details.website)} 
              />
            </>
          ) : (
            <div className="py-8 text-center">
                <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-4">
                    <Building2 className="text-slate-600 w-10 h-10" />
                </div>
                <p className="text-slate-400">No structured contact data found for this entity.</p>
            </div>
          )}
        </div>

        <div className="bg-slate-950/50 p-4 border-t border-slate-800 text-center">
            <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-300">Close Panel</button>
        </div>
      </div>
    </div>
  );
};

const ContactRow: React.FC<{ icon: React.ReactNode, label: string, value: string, onCopy: () => void }> = ({ icon, label, value, onCopy }) => (
  <button 
    onClick={onCopy}
    className="w-full flex items-center group hover:bg-slate-800/50 p-3 rounded-lg transition-colors border border-transparent hover:border-slate-700 text-left"
  >
    <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors border border-slate-800">
      {icon}
    </div>
    <div className="ml-4 flex-1 overflow-hidden">
      <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
      <p className="text-sm text-slate-200 truncate">{value || 'N/A'}</p>
    </div>
    <div className="opacity-0 group-hover:opacity-100 text-xs text-blue-500 font-medium transition-opacity">
        Copy
    </div>
  </button>
);

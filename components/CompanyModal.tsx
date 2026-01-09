import React from 'react';
import { useStore } from '../store';
import { X, MapPin, Phone, Mail, Globe, Building2, User, Home } from 'lucide-react';

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
  console.log('🔍 Looking for company:', name);
  console.log('📦 Available contacts:', Object.keys(contacts));
  
  const key = Object.keys(contacts).find(k => 
    k.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(k.toLowerCase())
  );
  
  console.log('✅ Found key:', key);
  console.log('📋 Contact details:', key ? contacts[key] : null);
  
  return key ? contacts[key] : null;
};


const details = findContact(companyName);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  };

return (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" 
    onClick={onClose}
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    }}
    tabIndex={-1}
  >
      <div 
  className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-up"
  onClick={(e) => e.stopPropagation()}
>
        
        {/* Header */}
        <div className="bg-slate-950 p-6 flex justify-between items-start border-b border-slate-800">
          <div>
            <h3 
  onClick={() => copyToClipboard(companyName)}
  className="text-xl font-bold text-slate-100 flex items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors"
>
  <Building2 className="text-blue-500" size={20} />
  {companyName}
</h3>
            <p className="text-sm text-slate-500 mt-1">Company Details</p>
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
      icon={<Building2 size={18} />} 
      label="Company Type" 
      value={details.company_type} 
      onCopy={() => copyToClipboard(details.company_type)} 
    />
    <ContactRow 
      icon={<Globe size={18} />} 
      label="Website" 
      value={details.website} 
      onCopy={() => copyToClipboard(details.website)} 
    />
    <ContactRow 
      icon={<MapPin size={18} />} 
      label="Region" 
      value={details.region} 
      onCopy={() => copyToClipboard(details.region)} 
    />
    <ContactRow 
      icon={<User size={18} />} 
      label="Contact Name" 
      value={details.contact_name} 
      onCopy={() => copyToClipboard(details.contact_name)} 
    />
    <ContactRow 
      icon={<MapPin size={18} />} 
      label="City" 
      value={details.city} 
      onCopy={() => copyToClipboard(details.city)} 
    />
    <ContactRow 
      icon={<Home size={18} />} 
      label="Address" 
      value={details.address} 
      onCopy={() => copyToClipboard(details.address)} 
    />
    <ContactRow 
      icon={<MapPin size={18} />} 
      label="Postcode" 
      value={details.postcode} 
      onCopy={() => copyToClipboard(details.postcode)} 
    />
    <ContactRow 
      icon={<Globe size={18} />} 
      label="Country" 
      value={details.country} 
      onCopy={() => copyToClipboard(details.country)} 
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

const ContactRow: React.FC<{ icon: React.ReactNode, label: string, value: string, onCopy: () => void }> = ({ icon, label, value, onCopy }) => {
  const isNA = !value || value === 'N/A' || value === 'null';
  
  return (
    <button 
      onClick={isNA ? undefined : onCopy}
      disabled={isNA}
      className={`w-full flex items-center group p-3 rounded-lg transition-colors border text-left ${
        isNA 
          ? 'opacity-40 cursor-not-allowed border-transparent' 
          : 'hover:bg-slate-800/50 border-transparent hover:border-slate-700 cursor-pointer'
      }`}
    >
      <div className={`w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 ${
        isNA ? 'text-slate-600' : 'text-slate-400 group-hover:text-blue-400'
      } transition-colors`}>
        {icon}
      </div>
      <div className="ml-4 flex-1 overflow-hidden">
        <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
        <p className={`text-sm truncate ${isNA ? 'text-slate-600 italic' : 'text-slate-200'}`}>
          {value || 'N/A'}
        </p>
      </div>
      {!isNA && (
        <div className="opacity-0 group-hover:opacity-100 text-xs text-blue-500 font-medium transition-opacity">
          Copy
        </div>
      )}
    </button>
  );
};

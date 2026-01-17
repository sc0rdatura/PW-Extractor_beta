import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store';
import { X, MapPin, Phone, Mail, Globe, Building2, User, Home } from 'lucide-react';

interface CompanyModalProps {
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ companyName, isOpen, onClose }) => {
  const { contacts, showToast } = useStore();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(null);
    }
  }, [isOpen, companyName]);

  // Logic moved before conditional return to satisfy Rules of Hooks
  const findContact = (name: string) => {
    if (!name) return null;
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

  // Define fields configuration
  const fields = useMemo(() => {
    if (!details) return [];
    return [
      { key: 'company_type', label: 'Company Type', value: details.company_type, icon: <Building2 size={18} /> },
      { key: 'website', label: 'Website', value: details.website, icon: <Globe size={18} /> },
      { key: 'region', label: 'Region', value: details.region, icon: <MapPin size={18} /> },
      { key: 'contact_name', label: 'Contact Name', value: details.contact_name, icon: <User size={18} /> },
      { key: 'city', label: 'City', value: details.city, icon: <MapPin size={18} /> },
      { key: 'address', label: 'Address', value: details.address, icon: <Home size={18} /> },
      { key: 'postcode', label: 'Postcode', value: details.postcode, icon: <MapPin size={18} /> },
      { key: 'country', label: 'Country', value: details.country, icon: <Globe size={18} /> },
      { key: 'phone', label: 'Phone', value: details.phone, icon: <Phone size={18} /> },
      { key: 'email', label: 'Email', value: details.email, icon: <Mail size={18} /> },
    ];
  }, [details]);

  // Identify which fields are interactable (not null/N/A) for cycling
  const interactableIndices = useMemo(() => {
    return fields
      .map((f, i) => {
        const isNA = !f.value || f.value === 'N/A' || f.value === 'null';
        return isNA ? -1 : i;
      })
      .filter(i => i !== -1);
  }, [fields]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab Cycle
      if (e.key === 'Tab') {
        e.preventDefault();
        
        if (interactableIndices.length === 0) return;

        setFocusedIndex(current => {
          if (current === null) {
            // Initial focus
            return e.shiftKey ? interactableIndices[interactableIndices.length - 1] : interactableIndices[0];
          }

          const currentPos = interactableIndices.indexOf(current);
          if (currentPos === -1) return interactableIndices[0]; // Fallback safety

          let nextPos;
          if (e.shiftKey) {
            nextPos = currentPos - 1;
            if (nextPos < 0) nextPos = interactableIndices.length - 1;
          } else {
            nextPos = currentPos + 1;
            if (nextPos >= interactableIndices.length) nextPos = 0;
          }

          return interactableIndices[nextPos];
        });
      }

      // Enter Selection
      if (e.key === 'Enter') {
        if (focusedIndex !== null) {
          e.preventDefault(); // Stop any default button behavior
          const field = fields[focusedIndex];
          if (field && field.value) {
            copyToClipboard(field.value);
          }
        }
      }
      
      // Arrow keys are left to default (scrolling)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, interactableIndices, fields, focusedIndex]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex !== null && rowRefs.current[focusedIndex]) {
      rowRefs.current[focusedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [focusedIndex]);

  // Early return must happen AFTER all hooks to prevent Error #310
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      tabIndex={-1}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gray-50 dark:bg-slate-950 p-6 relative flex items-center justify-center border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="text-center px-8">
            <h3 
              onClick={() => copyToClipboard(companyName)}
              className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Building2 className="text-blue-500 shrink-0" size={20} />
              <span className="truncate">{companyName}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Company Details</p>
          </div>
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 scroll-smooth">
          {details ? (
            fields.map((field, index) => (
              <ContactRow 
                key={field.key}
                ref={(el) => { rowRefs.current[index] = el; }}
                icon={field.icon}
                label={field.label}
                value={field.value}
                onCopy={() => copyToClipboard(field.value || '')}
                isFocused={focusedIndex === index}
                onFocus={() => setFocusedIndex(index)}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-slate-800/50 mb-4">
                <Building2 className="text-slate-400 dark:text-slate-600 w-10 h-10" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">No structured contact data found for this entity.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-slate-950/50 p-4 border-t border-gray-200 dark:border-slate-800 text-center shrink-0">
            <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Close Panel</button>
        </div>
      </div>
    </div>
  );
};

const ContactRow = React.forwardRef<HTMLButtonElement, { 
  icon: React.ReactNode, 
  label: string, 
  value: string | null | undefined, 
  onCopy: () => void,
  isFocused?: boolean,
  onFocus?: () => void
}>(({ icon, label, value, onCopy, isFocused, onFocus }, ref) => {
  const isNA = !value || value === 'N/A' || value === 'null';
  
  return (
    <button 
      ref={ref}
      onClick={() => {
        if (!isNA) {
          if (onFocus) onFocus();
          onCopy();
        }
      }}
      disabled={isNA}
      tabIndex={-1} // Handled manually by window listener
      className={`w-full flex items-center group p-3 rounded-lg transition-colors border text-left ${
        isNA 
          ? 'opacity-40 cursor-not-allowed border-transparent' 
          : isFocused
            ? 'bg-blue-50 dark:bg-slate-800/50 border-blue-200 dark:border-slate-700 cursor-pointer'
            : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 border-transparent hover:border-gray-200 dark:hover:border-slate-700 cursor-pointer'
      }`}
    >
      <div className={`w-10 h-10 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border border-gray-200 dark:border-slate-800 ${
        isNA ? 'text-slate-400 dark:text-slate-600' : 'text-slate-400 group-hover:text-blue-500'
      } transition-colors`}>
        {icon}
      </div>
      <div className="ml-4 flex-1 overflow-hidden">
        <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
        <p className={`text-sm truncate ${isNA ? 'text-slate-400 dark:text-slate-600 italic' : 'text-slate-900 dark:text-slate-200'}`}>
          {value || 'N/A'}
        </p>
      </div>
      {!isNA && (
        <div className={`text-xs text-blue-500 font-medium transition-opacity ${
          isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          Copy
        </div>
      )}
    </button>
  );
});

ContactRow.displayName = 'ContactRow';
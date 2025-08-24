
import React, { useState, createContext, useContext, ReactNode } from 'react';

type AccordionContextType = {
  activeItem: string | string[] | null;
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
};

const AccordionContext = createContext<AccordionContextType | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion provider');
  }
  return context;
};

interface AccordionProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ children, type = 'single', collapsible = true, defaultValue, className }) => {
  const [activeItem, setActiveItem] = useState<string | string[] | null>(defaultValue || (type === 'multiple' ? [] : null));

  const toggleItem = (value: string) => {
    if (type === 'single') {
      setActiveItem(prev => (prev === value && collapsible ? null : value));
    } else {
      setActiveItem(prev => {
        const prevArr = Array.isArray(prev) ? prev : [];
        return prevArr.includes(value) ? prevArr.filter(item => item !== value) : [...prevArr, value];
      });
    }
  };

  return (
    <AccordionContext.Provider value={{ activeItem, toggleItem, type }}>
      <div className={`border rounded-md ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  children: ReactNode;
  value: string;
  title: ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ children, value, title }) => {
  const { activeItem, toggleItem } = useAccordion();
  const isActive = Array.isArray(activeItem) ? activeItem.includes(value) : activeItem === value;

  return (
    <div className="border-b last:border-b-0 dark:border-gray-700">
      <button
        onClick={() => toggleItem(value)}
        className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform transform ${isActive ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isActive && <div className="bg-white dark:bg-gray-800">{children}</div>}
    </div>
  );
};

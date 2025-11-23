import React from 'react';

interface OptionCardProps {
  text: string;
  selected: boolean;
  correct?: boolean | null; // null = unsubmitted, true = correct, false = incorrect
  onClick: () => void;
  shortcut?: number;
  disabled?: boolean;
  className?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({ 
  text, 
  selected, 
  correct, 
  onClick, 
  shortcut,
  disabled,
  className = ''
}) => {
  let styles = "w-full p-4 rounded-xl border-2 border-b-4 text-slate-700 font-medium text-lg cursor-pointer transition-all active:translate-y-[2px] active:border-b-2 flex items-center justify-between";
  
  if (disabled) {
     styles += " opacity-60 cursor-not-allowed";
  }

  if (selected) {
    if (correct === true) {
      styles += " bg-lime-100 border-lime-500 text-lime-700";
    } else if (correct === false) {
      styles += " bg-red-100 border-red-500 text-red-700";
    } else {
      styles += " bg-sky-100 border-sky-400 text-sky-600";
    }
  } else {
    styles += " bg-white border-slate-200 hover:bg-slate-50";
  }

  return (
    <div onClick={disabled ? undefined : onClick} className={`${styles} ${className}`}>
      <span>{text}</span>
      {shortcut && <span className="text-xs border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 hidden md:inline-block">{shortcut}</span>}
    </div>
  );
};
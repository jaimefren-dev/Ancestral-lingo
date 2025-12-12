import React from 'react';

interface OptionCardProps {
  text: string;
  selected: boolean;
  correct?: boolean | null; // null = unsubmitted, true = correct, false = incorrect
  onClick: () => void;
  shortcut?: number;
  disabled?: boolean;
  className?: string;
  onPlayAudio?: () => void;
  AudioIcon?: React.ElementType;
}

export const OptionCard: React.FC<OptionCardProps> = ({ 
  text, 
  selected, 
  correct, 
  onClick, 
  shortcut,
  disabled,
  className = '',
  onPlayAudio,
  AudioIcon
}) => {
  let styles = "w-full p-4 rounded-2xl border-2 border-b-4 text-slate-700 font-bold text-lg cursor-pointer transition-all active:translate-y-[2px] active:border-b-2 flex items-center justify-between group relative overflow-hidden";
  
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
      {/* Main Text */}
      <span className="flex-1 pr-4">{text}</span>
      
      {/* Actions Container */}
      <div className="flex items-center gap-3 pl-3 border-l border-black/5">
        {onPlayAudio && AudioIcon && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio();
            }}
            disabled={disabled}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all
              ${selected 
                ? 'bg-white/20 hover:bg-white/40 text-current' 
                : 'bg-slate-100 hover:bg-sky-100 text-slate-400 hover:text-sky-500'
              }
            `}
            title="Escuchar pronunciación"
          >
            <AudioIcon className="w-5 h-5" />
          </button>
        )}
        
        {shortcut && (
          <span className={`
            hidden md:flex w-7 h-7 items-center justify-center text-xs font-bold rounded-lg border-b-2
            ${selected 
               ? 'border-current opacity-60' 
               : 'bg-white border-slate-200 text-slate-300'
            }
          `}>
            {shortcut}
          </span>
        )}
      </div>
    </div>
  );
};
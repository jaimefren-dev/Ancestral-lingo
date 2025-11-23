import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  fullWidth?: boolean;
  colorClass?: string; // Optional override for dynamic colors
  borderColorClass?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  colorClass,
  borderColorClass,
  className = '',
  ...props 
}) => {
  let baseStyles = "font-bold text-sm uppercase tracking-widest py-3 px-6 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all duration-150 flex items-center justify-center gap-2";
  
  let variantStyles = "";
  
  if (variant === 'primary') {
    // Default blue if not overridden
    const bg = colorClass || "bg-sky-500 hover:bg-sky-400";
    const border = borderColorClass || "border-sky-700";
    variantStyles = `${bg} ${border} text-white`;
  } else if (variant === 'secondary') {
    variantStyles = "bg-lime-500 border-lime-700 text-white hover:bg-lime-400";
  } else if (variant === 'danger') {
    variantStyles = "bg-red-500 border-red-700 text-white hover:bg-red-400";
  } else if (variant === 'outline') {
    variantStyles = "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 active:border-b-0";
  } else if (variant === 'ghost') {
    variantStyles = "bg-transparent border-transparent text-slate-500 hover:bg-slate-100 active:translate-y-0 active:border-b-0";
  }

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${widthStyle} ${className} disabled:opacity-50 disabled:pointer-events-none`}
      {...props}
    >
      {children}
    </button>
  );
};
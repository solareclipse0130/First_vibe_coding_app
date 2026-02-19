import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  // Holographic base styles
  const baseStyles = "px-6 py-2 rounded font-mono uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border relative overflow-hidden backdrop-blur-sm group";
  
  const variants = {
    primary: "border-cyan-500 text-cyan-400 bg-cyan-950/30 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:text-cyan-200 hover:border-cyan-300",
    secondary: "border-slate-600 text-slate-400 bg-slate-900/50 hover:border-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
    danger: "border-red-500 text-red-400 bg-red-950/30 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:text-red-200",
    success: "border-emerald-500 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:text-emerald-200",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : children}
    </button>
  );
};
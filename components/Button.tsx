import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'magic';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-8 py-3 rounded-xl font-display font-bold text-2xl tracking-wide transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md";
  
  const variants = {
    primary: "bg-fabula-accent text-fabula-primary hover:bg-[#7ebcb0] border-2 border-fabula-primary",
    secondary: "bg-fabula-secondary text-white hover:bg-[#e08a82] border-2 border-fabula-secondary",
    magic: "bg-fabula-primary text-white border-2 border-fabula-accent hover:bg-[#0b6b63] animate-pulse hover:animate-none"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
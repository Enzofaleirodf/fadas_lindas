
import React from 'react';

interface CuteGermProps {
  type?: 1 | 2 | 3 | 4; // 1: Spiky (Pink), 2: Antenna (Green), 3: Blob (Purple), 4: Pear (Orange)
  size?: number;
  className?: string;
  color?: string; // Optional override
}

export const CuteGerm: React.FC<CuteGermProps> = ({ type = 1, size = 60, className = '', color }) => {
  
  const renderGermContent = () => {
    switch (type) {
      case 1: // ROSA ESPINHOSO
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md animate-pulse-slow">
            {/* Corpo Cheio de Pontas */}
            <path 
              d="M50 15 L55 25 L65 20 L65 30 L75 30 L70 40 L80 45 L70 50 L80 55 L70 60 L75 70 L65 70 L65 80 L55 75 L50 85 L45 75 L35 80 L35 70 L25 70 L30 60 L20 55 L30 50 L20 45 L30 40 L25 30 L35 30 L35 20 L45 25 Z" 
              fill={color || "#EC4899"} 
              stroke="#BE185D" 
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Olhos Grandes Assimétricos */}
            <circle cx="40" cy="45" r="10" fill="white" stroke="black" strokeWidth="1"/>
            <circle cx="40" cy="45" r="4" fill="black" />
            
            <circle cx="65" cy="40" r="7" fill="white" stroke="black" strokeWidth="1"/>
            <circle cx="65" cy="40" r="2" fill="black" />
            
            {/* Boca Zigzag */}
            <polyline points="35,65 45,60 55,65 65,60" fill="none" stroke="black" strokeWidth="2" />
          </svg>
        );

      case 2: // VERDE COM ANTENAS (VÍRUS)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md animate-float">
            {/* Antenas */}
            <line x1="50" y1="50" x2="50" y2="10" stroke="#15803D" strokeWidth="4" />
            <circle cx="50" cy="10" r="4" fill="#15803D" />
            
            <line x1="50" y1="50" x2="90" y2="50" stroke="#15803D" strokeWidth="4" />
            <circle cx="90" cy="50" r="4" fill="#15803D" />
            
            <line x1="50" y1="50" x2="10" y2="50" stroke="#15803D" strokeWidth="4" />
            <circle cx="10" cy="50" r="4" fill="#15803D" />
            
            <line x1="50" y1="50" x2="20" y2="20" stroke="#15803D" strokeWidth="4" />
            <circle cx="20" cy="20" r="4" fill="#15803D" />
            
            <line x1="50" y1="50" x2="80" y2="80" stroke="#15803D" strokeWidth="4" />
            <circle cx="80" cy="80" r="4" fill="#15803D" />
             
            <line x1="50" y1="50" x2="20" y2="80" stroke="#15803D" strokeWidth="4" />
            <circle cx="20" cy="80" r="4" fill="#15803D" />
            
            <line x1="50" y1="50" x2="80" y2="20" stroke="#15803D" strokeWidth="4" />
            <circle cx="80" cy="20" r="4" fill="#15803D" />

            {/* Corpo Redondo */}
            <circle cx="50" cy="50" r="30" fill={color || "#22C55E"} stroke="#15803D" strokeWidth="2" />
            
            {/* Rosto Bravo */}
            <path d="M35 40 L45 50 L35 60" fill="none" stroke="black" strokeWidth="2" />
            <path d="M65 40 L55 50 L65 60" fill="none" stroke="black" strokeWidth="2" />
            <path d="M40 65 Q50 55 60 65" fill="none" stroke="black" strokeWidth="2" />
          </svg>
        );

      case 3: // ROXO AMOEBA (GELECA)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md animate-pulse">
            {/* Corpo Irregular */}
            <path 
              d="M30 20 Q50 5 70 20 T90 50 Q95 70 75 90 T30 85 Q10 70 15 50 T30 20 Z" 
              fill={color || "#9333EA"} 
              stroke="#6B21A8" 
              strokeWidth="2"
            />
            {/* Verrugas */}
            <circle cx="25" cy="35" r="3" fill="#D8B4FE" opacity="0.6"/>
            <circle cx="75" cy="70" r="4" fill="#D8B4FE" opacity="0.6"/>
            <circle cx="80" cy="40" r="2" fill="#D8B4FE" opacity="0.6"/>

            {/* Olhos Juntos e Bravos */}
            <path d="M35 35 L50 45" stroke="black" strokeWidth="2" />
            <path d="M65 35 L50 45" stroke="black" strokeWidth="2" />
            
            <circle cx="42" cy="50" r="6" fill="white" />
            <circle cx="42" cy="50" r="2" fill="black" />
            
            <circle cx="58" cy="50" r="6" fill="white" />
            <circle cx="58" cy="50" r="2" fill="black" />
            
            {/* Boca com Dente */}
            <path d="M40 70 Q50 75 60 70" fill="none" stroke="black" strokeWidth="2" />
            <rect x="45" y="71" width="4" height="4" fill="white" />
          </svg>
        );

      case 4: // LARANJA GORDINHO (PERA)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md animate-bounce">
             {/* Corpo Pera */}
             <path 
               d="M50 15 C35 15 30 35 30 45 C20 55 20 85 50 85 C80 85 80 55 70 45 C70 35 65 15 50 15 Z" 
               fill={color || "#F97316"} 
               stroke="#C2410C" 
               strokeWidth="2"
             />
             {/* Bolinhas Laterais */}
             <circle cx="25" cy="55" r="5" fill="#C2410C" />
             <circle cx="75" cy="55" r="5" fill="#C2410C" />
             <circle cx="25" cy="70" r="4" fill="#C2410C" />
             <circle cx="75" cy="70" r="4" fill="#C2410C" />

             {/* Olhão Único (Monstro) ou Dois? Vamos fazer 2 vesgos */}
             <circle cx="40" cy="40" r="12" fill="white" stroke="black" strokeWidth="1"/>
             <circle cx="42" cy="40" r="4" fill="black" />
             
             <circle cx="60" cy="35" r="8" fill="white" stroke="black" strokeWidth="1"/>
             <circle cx="58" cy="35" r="3" fill="black" />

             {/* Boca Preta Grande */}
             <path d="M35 60 Q50 75 65 60 Z" fill="black" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {renderGermContent()}
    </div>
  );
};

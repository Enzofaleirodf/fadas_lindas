
import React, { useEffect, useState } from 'react';
import { CursorMode } from '../types';

interface CustomCursorProps {
  mode: CursorMode;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ mode }) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    if (mediaQuery.matches) {
      setIsTouchDevice(true);
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    const mouseDown = () => setIsClicking(true);
    const mouseUp = () => setIsClicking(false);

    // Remove cursor padrão se não for touch
    const style = document.createElement('style');
    style.innerHTML = '* { cursor: none !important; }';
    document.head.appendChild(style);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    return () => {
      document.head.removeChild(style);
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mouseup', mouseUp);
    };
  }, []);

  if (isTouchDevice || mode === CursorMode.HIDDEN) return null;

  return (
    <div 
      className="fixed pointer-events-none z-[9999]"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`
      }}
    >
      {mode === CursorMode.LASER ? (
        // --- MIRA LASER (Apenas Fase 1) ---
        <div className="relative -ml-8 -mt-8 w-16 h-16 flex items-center justify-center">
             {/* Círculo Externo */}
             <div className={`absolute inset-0 border-2 border-cyan-400 rounded-full opacity-80 ${isClicking ? 'scale-75' : 'scale-100'} transition-transform duration-100`}></div>
             {/* Mira em Cruz */}
             <div className="absolute w-full h-[1px] bg-cyan-400"></div>
             <div className="absolute h-full w-[1px] bg-cyan-400"></div>
             {/* Ponto Central */}
             <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#22d3ee]"></div>
        </div>
      ) : (
        // --- MODO NORMAL (Seta -> Dente no Clique) ---
        <>
          {isClicking ? (
             // DENTE (Só aparece segurando o clique)
             <div 
                className="transition-transform duration-150 scale-90"
                style={{ marginLeft: '-20px', marginTop: '-20px' }} 
            >
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
                    <path 
                      d="M12 12C12 5 18 2 25 2C32 2 38 5 38 12C38 19 36 22 34 28L32 38C31.5 41 29 42 28 40L25 32L22 40C21 42 18.5 41 18 38L16 28C14 22 12 19 12 12Z"
                      fill="#2DD4BF" 
                      stroke="white" 
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    <path d="M36 6L37 9L40 10L37 11L36 14L35 11L32 10L35 9L36 6Z" fill="#FEF08A" stroke="none" />
                </svg>
            </div>
          ) : (
            // SETA (Padrão)
            <div 
                className="transition-transform duration-100"
                style={{ marginLeft: '-2px', marginTop: '-2px' }} 
            >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                    <path 
                      d="M6 4L16 34L22 22L34 16L6 4Z" 
                      fill="#2DD4BF" 
                      stroke="white" 
                      strokeWidth="3" 
                      strokeLinejoin="round"
                    />
                </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Ultra Dark Mode Enforcer - Ensures perfect dark mode experience
// This component forces dark mode for the premium demo

import { useEffect } from 'react';

const UltraDarkMode: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
    document.body.classList.add('ultra-dark');
    
    // Set dark color scheme
    document.documentElement.style.colorScheme = 'dark';
    
    // Override any light mode styles
    const style = document.createElement('style');
    style.textContent = `
      * {
        color-scheme: dark !important;
      }
      
      body {
        background: #050508 !important;
        color: #f0f0f0 !important;
      }
      
      .bg-white {
        background: rgba(10, 10, 15, 0.9) !important;
      }
      
      .text-black {
        color: #f0f0f0 !important;
      }
      
      .text-gray-900 {
        color: #f0f0f0 !important;
      }
      
      .bg-gray-100 {
        background: rgba(15, 15, 25, 0.8) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <>{children}</>;
};

export default UltraDarkMode;

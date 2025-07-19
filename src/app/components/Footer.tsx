import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-5">
      <p className="text-sm text-white/60">
        © 2025 Minu. All rights reserved. • 
        <a 
          href="https://docs.google.com/document/d/e/2PACX-1vRZwRFA1qncJ_axuzl2DjtGR3oH1YIdcwrOxLApZnPgNVcfibHnHRVsKD1fHEmEEC6SKbZ3Jgc4MZBD/pub" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white/60 hover:text-white/80 transition-colors duration-200 underline ml-1"
        >
          개인정보처리방침
        </a>
      </p>
    </footer>
  );
}; 
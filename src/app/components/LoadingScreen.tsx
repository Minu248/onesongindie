import React from "react";
import { TOAST_MESSAGES } from "@/config/constants";

export const LoadingScreen: React.FC = () => (
  <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4">
    <div className="flex flex-col items-center justify-center">
      <div className="w-64 h-64 md:w-[512px] md:h-[512px] mb-8">
        <img 
          src="/LP-vinyl.png" 
          alt="LP판" 
          className="w-full h-full animate-spin-slow"
        />
      </div>
      <div className="text-white text-lg font-medium text-center">
        {TOAST_MESSAGES.FINDING_MUSIC}
      </div>
    </div>
  </main>
); 
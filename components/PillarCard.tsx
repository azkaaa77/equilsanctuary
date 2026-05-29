'use client';

import React from 'react';

export const PillarCard = ({ 
  title, 
  description, 
  className = "",
  category = "Equilibrium",
  status = "Active"
}: { 
  title: string; 
  description: string; 
  className?: string;
  category?: string;
  status?: string;
}) => {
  return (
    <div
      className={`group relative crystal-glass rounded-[60px] p-12 md:p-14 h-full flex flex-col justify-between transition-all duration-500 overflow-hidden ${className}`}
    >
      {/* Organic Detail Decoration */}
      <div className="absolute top-12 right-12 w-12 h-12 text-equil-onyx/10">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="45" opacity="0.5" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="status-label !opacity-100 !text-equil-mint">
            {category}
          </span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-equil-mint" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-equil-onyx/40">{status}</span>
          </div>
        </div>

        <div>
          <h3 className="text-4xl md:text-5xl font-display font-black tracking-tightest mb-6 leading-[0.9] text-equil-onyx group-hover:text-equil-mint transition-colors">
            {title}
          </h3>
          <p className="text-equil-onyx/60 text-base md:text-lg max-w-[90%] leading-relaxed font-sans font-medium">
            {description}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-12">
        <div className="flex items-center gap-4">
          <span className="text-equil-onyx/40 text-[9px] font-black uppercase tracking-[0.3em]">EXPLORE PATH</span>
          <div className="w-8 h-[1px] bg-equil-onyx/20" />
        </div>
        
        <div className="w-10 h-10 rounded-full border border-equil-onyx/10 flex items-center justify-center">
            <div className="w-1 h-1 bg-equil-onyx rounded-full" />
        </div>
      </div>
      
      {/* Sunlight Yellow Bloom - Very subtle hover accent */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-equil-sunlight/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

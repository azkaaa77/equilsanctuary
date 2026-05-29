// /components/home/Philosophy.tsx
'use client';

import React from 'react';
import { motion } from 'motion/react';
import { EqliMascot } from '@/components/mascot/EqliMascot';

export const Philosophy = () => {
  return (
    <section className="py-60 px-[8%] bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-20 items-center">
        
        {/* Left Column - Large Editorial Text */}
        <div className="md:col-span-1 border-l border-equil-onyx/10 h-full hidden md:block" />
        
        <div className="md:col-span-7 flex flex-col gap-16">
          <span className="status-label">MANIFES EQUIL</span>
          
          <h2 className="text-4xl md:text-6xl font-display font-black leading-tight uppercase">
            Hidup bukan tentang <span className="text-equil-mint">bertahan</span>, tapi tentang <span className="text-equil-mint">berkembang</span> dalam ketenangan.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <p className="text-equil-onyx/60 font-sans text-sm leading-relaxed">
              Kami percaya bahwa kesuksesan finansial tanpa kesehatan mental adalah kehampaan. Dan kesehatan mental tanpa arah karier adalah kebingungan.
            </p>
            <p className="text-equil-onyx/60 font-sans text-sm leading-relaxed">
              EQUIL hadir sebagai jembatan — sebuah sanctuary digital yang membantu Anda merancang hidup dengan niat, bukan kebetulan.
            </p>
          </div>
        </div>

        {/* Right Column - Mascot Interaction */}
        <div className="md:col-span-4 flex justify-center items-center relative">
           <div className="absolute inset-0 bg-equil-sage/20 rounded-full blur-3xl -z-10" />
           <EqliMascot size={280} />
        </div>
      </div>
      
      {/* Decorative Text Watermark */}
      <div className="absolute -bottom-20 -left-20 text-[20vw] font-display font-black text-equil-onyx/[0.02] uppercase pointer-events-none select-none">
        ZENITUDE
      </div>
    </section>
  );
};

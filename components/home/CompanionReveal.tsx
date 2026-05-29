// /components/home/CompanionReveal.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EqliMascot } from '@/components/mascot/EqliMascot';
import { useLanguage } from '@/components/providers/language-provider';

gsap.registerPlugin(ScrollTrigger);

export const CompanionReveal = () => {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);

  const content = {
    id: {
      label: "PENDAMPINGMU",
      title: "Kenalan dengan <span class='text-equil-mint'>EQLI</span>. Sahabat Yang Mengerti Jeda.",
      desc: "EQLI hanya berkedip saat Anda bernapas. Dia tidak memberi instruksi, dia memberikan ruang untuk Anda menjadi diri sendiri."
    },
    en: {
      label: "YOUR COMPANION",
      title: "Meet <span class='text-equil-mint'>EQLI</span>. The Friend Who Understands Pauses.",
      desc: "EQLI only blinks when you breathe. He doesn't give instructions, he provides space for you to be yourself."
    }
  };

  const active = content[language as keyof typeof content];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll Reveal
      gsap.fromTo(
        '.reveal-item',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );

      // Breathing Ring 1
      gsap.to(ring1Ref.current, {
        scale: 1.15,
        opacity: 0.1,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Breathing Ring 2
      gsap.fromTo(
        ring2Ref.current,
        { scale: 1.1, opacity: 0.1 },
        {
          scale: 1,
          opacity: 0.2,
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 lg:py-40 px-[6%] bg-equil-paper flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-equil-mint/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col items-center gap-12 relative z-10">
        <span className="reveal-item status-label !text-equil-onyx/50">{active.label}</span>
        
        <h2 className="reveal-item text-4xl md:text-7xl font-display font-black text-center text-equil-onyx uppercase max-w-4xl leading-[0.9] tracking-tighter" dangerouslySetInnerHTML={{ __html: active.title }} />

        <div className="reveal-item relative mt-20">
          {/* Breathing Circle Effect */}
          <div
            ref={ring1Ref}
            className="absolute inset-[-50%] rounded-full border border-equil-mint/30 opacity-30 pointer-events-none"
          />
          <div
            ref={ring2Ref}
            className="absolute inset-[-80%] rounded-full border border-equil-mint/20 opacity-10 pointer-events-none"
          />
          
          <div className="relative bg-equil-onyx/5 backdrop-blur-3xl rounded-full p-12 border border-equil-onyx/10">
             <EqliMascot size={250} />
          </div>
        </div>

        <p className="reveal-item mt-20 text-equil-onyx/60 font-sans text-center max-w-lg leading-relaxed text-sm">
          {active.desc}
        </p>
      </div>
    </section>
  );
};

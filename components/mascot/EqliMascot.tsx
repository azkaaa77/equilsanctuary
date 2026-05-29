// /components/mascot/EqliMascot.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import { useMascot } from "@/hooks/use-mascot";

interface EqliMascotProps {
  size?: number;
  className?: string;
}

export const EqliMascot = ({ size = 200, className }: EqliMascotProps) => {
  const { isBlinking } = useMascot();

  // Morphing paths for the blob
  const paths = [
    "M100,20 C140,20 180,60 180,100 C180,140 140,180 100,180 C60,180 20,140 20,100 C20,60 60,20 100,20 Z",
    "M100,30 C150,30 170,70 170,110 C170,150 130,170 100,170 C70,170 30,150 30,110 C30,70 50,30 100,30 Z",
    "M100,25 C135,25 185,55 185,105 C185,155 135,175 100,175 C65,175 15,155 15,105 C15,55 65,25 100,25 Z",
  ];

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Blob Body */}
        <motion.path
          animate={{ d: paths }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          fill="var(--color-equil-sage)"
          stroke="var(--color-equil-forest)"
          strokeWidth="1"
          fillOpacity="0.8"
        />

        {/* Eyes */}
        <g
          stroke="var(--color-equil-forest)"
          strokeWidth="2"
          fill="var(--color-equil-forest)"
        >
          {/* Left Eye */}
          {!isBlinking ? (
            <circle cx="75" cy="90" r="3" />
          ) : (
            <line x1="72" y1="90" x2="78" y2="90" strokeLinecap="round" />
          )}

          {/* Right Eye */}
          {!isBlinking ? (
            <circle cx="125" cy="90" r="3" />
          ) : (
            <line x1="122" y1="90" x2="128" y2="90" strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  );
};

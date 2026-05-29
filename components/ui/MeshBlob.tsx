// /components/ui/MeshBlob.tsx
'use client';

import React from 'react';
import { motion } from 'motion/react';

interface MeshBlobProps {
  color?: string;
  className?: string;
}

export const MeshBlob = ({ color = 'var(--color-equil-mint)', className }: MeshBlobProps) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 0.9, 1.1, 1],
        x: [0, 50, -30, 20, 0],
        y: [0, -40, 60, -20, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
      style={{
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: `radial-gradient(circle at center, ${color}33 0%, ${color}00 70%)`,
        filter: 'blur(80px)',
        position: 'absolute',
        zIndex: -1,
      }}
    />
  );
};

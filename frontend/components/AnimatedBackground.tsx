'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);

  useEffect(() => {
    const particleCount = 30;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--bondi-blue), transparent)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute top-2/3 right-1/4 w-80 h-80 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--verdigris), transparent)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, -80, 80, 0],
          y: [0, 80, -80, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--bondi-blue) 1px, transparent 1px),
            linear-gradient(90deg, var(--bondi-blue) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

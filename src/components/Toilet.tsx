import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PooTypeConfig, PooType } from '../types';
import { SOUNDS } from '../constants';

interface ToiletProps {
  selectedPoo: PooTypeConfig | null;
  isFlushing: boolean;
  onFlushComplete: () => void;
  onHandleClick: (isHoly: boolean) => void;
}

export const Toilet: React.FC<ToiletProps> = ({
  selectedPoo,
  isFlushing,
  onFlushComplete,
  onHandleClick,
}) => {
  const splashAudio = useRef<HTMLAudioElement | null>(null);
  const flushAudio = useRef<HTMLAudioElement | null>(null);
  const holyAudio = useRef<HTMLAudioElement | null>(null);
  const rainbowAudio = useRef<HTMLAudioElement | null>(null);
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [wasHolyFlush, setWasHolyFlush] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    splashAudio.current = new Audio(SOUNDS.SPLASH);
    flushAudio.current = new Audio(SOUNDS.FLUSH);
    holyAudio.current = new Audio(SOUNDS.HOLY);
    rainbowAudio.current = new Audio(SOUNDS.RAINBOW);
    clickAudio.current = new Audio(SOUNDS.CLICK);
    
    [splashAudio, flushAudio, holyAudio, rainbowAudio, clickAudio].forEach(ref => {
      if (ref.current) {
        ref.current.load();
        ref.current.volume = 0.7;
      }
    });
  }, []);

  const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>, volume = 0.7) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  // Trigger splash when a new poo is selected
  useEffect(() => {
    if (selectedPoo && !isFlushing) {
      // The drop animation takes about 350-400ms to "hit" the water
      const timer = setTimeout(() => {
        playSound(splashAudio, 0.7);
      }, 380);
      
      if (selectedPoo.id === PooType.RAINBOW) {
        playSound(rainbowAudio, 0.8);
      }
      
      return () => clearTimeout(timer);
    }
  }, [selectedPoo, isFlushing, playSound]);

  // Trigger flush sound and handle completion timing
  useEffect(() => {
    if (isFlushing) {
      if (wasHolyFlush) {
        playSound(holyAudio, 1.0); // Max volume for holy
      }
      // Small delay for the flush sound to match the handle movement
      const soundTimer = setTimeout(() => playSound(flushAudio, 0.9), 100);
      
      // Animation duration: 2s for standard, 5s for holy
      const duration = wasHolyFlush ? 5000 : 2000;
      
      // We want the vortex to finish slightly before the state resets
      // to allow a "settle" moment
      const completeTimer = setTimeout(() => {
        onFlushComplete();
      }, duration);

      return () => {
        clearTimeout(soundTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isFlushing, wasHolyFlush, playSound, onFlushComplete]);

  const handleMouseDown = () => {
    if (isFlushing || !selectedPoo) return;
    playSound(clickAudio, 0.5);
    hasTriggeredRef.current = false;
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setWasHolyFlush(true);
      onHandleClick(true);
      hasTriggeredRef.current = true;
    }, 1500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (!isFlushing && selectedPoo && !hasTriggeredRef.current) {
      // This was a short press
      setWasHolyFlush(false);
      onHandleClick(false);
    }
    
    setIsLongPressing(false);
  };

  // Reset all local interactive states when flush is done
  useEffect(() => {
    if (!isFlushing) {
      setWasHolyFlush(false);
      setIsLongPressing(false);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  }, [isFlushing]);

  return (
    <div className="relative w-72 h-96 perspective-1200 flex items-center justify-center">
      {/* 3D Toilet Container */}
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ 
          rotateX: isFlushing ? [15, 25, 15] : 15,
          rotateY: (isLongPressing || (isFlushing && wasHolyFlush)) ? [ -12, 0, 12, -12] : -12,
          scale: isFlushing ? (wasHolyFlush ? [1, 1.1, 1] : [1, 0.98, 1]) : 1,
          y: (isLongPressing || (isFlushing && wasHolyFlush)) ? [0, -15, 0] : 0
        }}
        transition={{ 
          duration: isLongPressing ? 0.2 : 0.6, 
          repeat: isFlushing ? Infinity : 0,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        {/* Tank - 3D Box */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 h-36 preserve-3d">
          {/* Front */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-b-4 border-slate-200 shadow-lg z-20 flex flex-col items-center pt-4">
             <div className="w-16 h-1.5 bg-slate-200 rounded-full opacity-40" />
          </div>
          {/* Top */}
          <div className="absolute -top-1.5 left-0 w-full h-6 bg-slate-50 rounded-t-3xl border-b border-slate-200 transform -rotateX-90 origin-bottom" />
          {/* Side Right */}
          <div className="absolute top-0 -right-1.5 w-3 h-full bg-slate-200 rounded-r-2xl transform rotateY-90 origin-left" />
          
          {/* Handle */}
          <motion.button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            disabled={isFlushing || !selectedPoo}
            whileTap={{ rotate: 60, scale: 0.8 }}
            className={`absolute top-8 right-4 w-10 h-4 rounded-full border-2 shadow-md cursor-pointer transition-all duration-300 z-30 ${
              (isLongPressing || (isFlushing && wasHolyFlush)) 
                ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.6)]' 
                : 'bg-gradient-to-br from-slate-200 to-slate-300 border-slate-400'
            } ${isFlushing || !selectedPoo ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-500 rounded-full border border-slate-300" />
          </motion.button>
          
          {/* Holy Glow */}
          <AnimatePresence>
            {(isLongPressing || (isFlushing && wasHolyFlush)) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.3, 0.7, 0.3], 
                  scale: [1.3, 1.8, 1.3] 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-0 bg-yellow-200/50 blur-3xl rounded-full -z-10"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Bowl Base - 3D Rounded Shape */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-56 preserve-3d">
          {/* Main Bowl Body */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-200 rounded-[45%_45%_50%_50%] shadow-2xl border-b-8 border-slate-300" />
          
          {/* Rim - Refined for no lid look */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[105%] h-14 bg-slate-50 rounded-full border-4 border-slate-100 shadow-md z-10 flex items-center justify-center overflow-hidden">
            <div className="w-[95%] h-[90%] bg-gradient-to-b from-slate-100 to-white rounded-full border border-slate-200/50 shadow-inner" />
          </div>

          {/* Interior Basin */}
          <div className="absolute top-2 left-4 right-4 bottom-6 bg-slate-50 rounded-full border-2 border-slate-200/50 overflow-hidden z-20 shadow-inner">
            {/* Water Basin */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                backgroundColor: (isLongPressing || (isFlushing && wasHolyFlush))
                  ? 'rgba(254, 249, 195, 0.95)' 
                  : isFlushing 
                    ? 'rgba(186, 230, 253, 0.9)' 
                    : 'rgba(224, 242, 254, 0.7)'
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Bubbles */}
              {!isFlushing && (
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [-10, -30, -10],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 3 + i, 
                        repeat: Infinity, 
                        delay: i * 0.5 
                      }}
                      className="absolute w-3 h-3 bg-white rounded-full blur-[1px]"
                      style={{ 
                        left: `${20 + i * 15}%`, 
                        top: `${40 + (i % 3) * 10}%` 
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Rainbow Celebration Effect */}
              <AnimatePresence>
                {selectedPoo?.id === PooType.RAINBOW && !isFlushing && (
                  <motion.div className="absolute inset-0 pointer-events-none z-30">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0, x: 0, opacity: 0, scale: 0 }}
                        animate={{ 
                          y: -150 - Math.random() * 150, 
                          x: (Math.random() - 0.5) * 220,
                          opacity: [0, 1, 0],
                          scale: [0, 2, 0],
                          rotate: Math.random() * 720
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          delay: i * 0.1,
                          ease: "easeOut"
                        }}
                        className="absolute left-1/2 top-1/2 text-3xl"
                      >
                        {['✨', '💖', '🌟', '🌈', '💎', '🦄', '🍭'][i % 7]}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Vortex Animation */}
              <AnimatePresence>
                {isFlushing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0], 
                      scale: wasHolyFlush ? [0, 4, 4, 0] : [0, 2.5, 2.5, 0], 
                      rotate: wasHolyFlush ? 4320 : 1440 
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={`absolute w-40 h-40 border-[12px] rounded-full z-40 ${
                      wasHolyFlush ? 'border-yellow-300/70 border-t-white shadow-[0_0_40px_rgba(234,179,8,0.5)]' : 'border-blue-200/50 border-t-blue-400/70'
                    }`}
                    transition={{ 
                      duration: wasHolyFlush ? 5 : 2, 
                      ease: "easeInOut",
                      times: [0, 0.1, 0.9, 1]
                    }}
                  />
                )}
              </AnimatePresence>

              {/* The Poo */}
              <AnimatePresence mode="wait">
                {selectedPoo && (
                  <motion.div
                    key={selectedPoo.id}
                    initial={{ y: -400, opacity: 0, scale: 0.1, rotate: -60 }}
                    animate={isFlushing ? {
                      rotate: wasHolyFlush ? 3600 : 1080,
                      scale: 0,
                      opacity: 0,
                      y: 150,
                      transition: { duration: 0.8, ease: "anticipate" }
                    } : {
                      y: 0,
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                      transition: { 
                        type: "spring", 
                        damping: 10, 
                        stiffness: 150,
                        mass: 0.6
                      }
                    }}
                    className="text-8xl z-30 drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)] relative"
                  >
                    {selectedPoo.icon}
                    
                    {/* Splash Visual */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={!isFlushing ? { 
                        scale: [0, 2.5, 0], 
                        opacity: [0, 1, 0] 
                      } : {}}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="absolute inset-0 bg-blue-300/50 rounded-full blur-2xl -z-10"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Water Surface Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-10" />
            </motion.div>
          </div>
        </div>
        
        {/* Shadow / Floor Reflection */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-slate-900/10 rounded-full blur-xl" />
      </motion.div>
    </div>
  );
};

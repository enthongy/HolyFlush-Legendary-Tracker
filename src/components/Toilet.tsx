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
  const [isImpacted, setIsImpacted] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);
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
      // The drop animation takes about 150-200ms to "hit" the water with current spring settings
      const timer = setTimeout(() => {
        playSound(splashAudio, 0.8);
        setIsImpacted(true);
        setRippleKey(prev => prev + 1);
        setTimeout(() => setIsImpacted(false), 150);
      }, 0);
      
      if (selectedPoo.id === PooType.RAINBOW) {
        playSound(rainbowAudio, 0.8);
      }
      
      return () => clearTimeout(timer);
    }
  }, [selectedPoo, isFlushing, playSound]);

  // Trigger flush sound and handle completion timing
  useEffect(() => {
    if (isFlushing) {
      const mainAudio = wasHolyFlush ? holyAudio.current : flushAudio.current;
      
      if (mainAudio) {
        const handleEnded = () => {
          onFlushComplete();
        };
        mainAudio.addEventListener('ended', handleEnded);
        
        // Play sounds immediately
        if (wasHolyFlush) {
          playSound(holyAudio, 1.0);
        }
        playSound(flushAudio, 0.9);

        return () => {
          mainAudio.removeEventListener('ended', handleEnded);
          // Ensure sounds stop if component unmounts or state changes unexpectedly
          if (flushAudio.current) {
            flushAudio.current.pause();
            flushAudio.current.currentTime = 0;
          }
          if (holyAudio.current) {
            holyAudio.current.pause();
            holyAudio.current.currentTime = 0;
          }
        };
      } else {
        // Fallback if audio not available
        const duration = wasHolyFlush ? 12000 : 7000;
        const completeTimer = setTimeout(onFlushComplete, duration);
        return () => clearTimeout(completeTimer);
      }
    }
  }, [isFlushing, wasHolyFlush, playSound, onFlushComplete]);

  const handleMouseDown = () => {
    if (isFlushing || !selectedPoo) return;
    playSound(clickAudio, 0.5);
    
    // Subtle haptic feedback on initial touch
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    hasTriggeredRef.current = false;
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setWasHolyFlush(true);
      onHandleClick(true);
      hasTriggeredRef.current = true;
      
      // Stronger haptic feedback when holy flush is triggered
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
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
          rotateX: isFlushing ? [15, 25, 15] : (isImpacted ? 17 : 15),
          rotateY: (isLongPressing || (isFlushing && wasHolyFlush)) ? [ -12, 0, 12, -12] : -12,
          scale: isFlushing ? (wasHolyFlush ? [1, 1.1, 1] : [1, 0.98, 1]) : (isImpacted ? 0.99 : 1),
          y: (isLongPressing || (isFlushing && wasHolyFlush)) ? [0, -15, 0] : 0
        }}
        transition={isFlushing ? { 
          duration: isLongPressing ? 0.2 : 0.6, 
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        } : {
          type: "spring",
          damping: 20,
          stiffness: 80,
          mass: 1
        }}
      >
        {/* Tank - 3D Box */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 h-40 preserve-3d">
          {/* Front */}
          <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-2xl border-b-4 border-slate-200 shadow-lg z-20 flex flex-col items-center pt-4">
             <div className="w-16 h-1.5 bg-slate-100 rounded-full opacity-40" />
          </div>
          {/* Top */}
          <div className="absolute -top-2 left-0 w-full h-8 bg-white rounded-t-3xl border-b border-slate-200 transform -rotateX-90 origin-bottom flex items-center justify-center">
            {/* Top Button */}
            <div className="w-12 h-12 bg-slate-100 rounded-full border-2 border-slate-200 shadow-inner flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full border border-slate-200 shadow-sm" />
            </div>
          </div>
          {/* Side Left */}
          <div className="absolute top-0 -left-1.5 w-3 h-full bg-slate-100 rounded-l-2xl transform rotateY-90 origin-right" />
          
          {/* Handle (Moved to Left) */}
          <div className="absolute top-12 -left-10 w-12 h-12 preserve-3d z-30">
            <motion.button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              disabled={isFlushing || !selectedPoo}
              whileTap={{ rotate: 45, scale: 0.9 }}
              className={`w-full h-full rounded-full border-4 shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center ${
                (isLongPressing || (isFlushing && wasHolyFlush)) 
                  ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.6)]' 
                  : 'bg-gradient-to-br from-slate-200 to-slate-300 border-slate-400'
              } ${isFlushing || !selectedPoo ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-5 h-5 bg-slate-500 rounded-full border border-slate-300 shadow-inner" />
            </motion.button>
            {/* Handle Stem */}
            <div className="absolute top-1/2 left-[80%] -translate-y-1/2 w-6 h-3 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full -z-10 shadow-sm" />
          </div>
          
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-60 preserve-3d">
          {/* Main Bowl Body */}
          <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-100 rounded-[45%_45%_50%_50%] shadow-2xl border-b-8 border-slate-200" />
          
          {/* Rim - Refined for no lid look */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[105%] h-18 bg-white rounded-full border-4 border-slate-50 shadow-md z-10 flex items-center justify-center overflow-hidden">
            <div className="w-[95%] h-[92%] bg-gradient-to-b from-slate-50 to-white rounded-full border border-slate-100 shadow-inner" />
          </div>

          {/* Interior Basin */}
          <div className="absolute top-0 left-4 right-4 bottom-8 bg-white rounded-full border-2 border-slate-100 overflow-hidden z-20 shadow-inner">
            {/* Water Basin */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                backgroundColor: (isLongPressing || (isFlushing && wasHolyFlush))
                  ? 'rgba(254, 249, 195, 0.95)' 
                  : isFlushing 
                    ? 'rgba(186, 230, 253, 0.9)' 
                    : 'rgba(186, 242, 255, 0.7)'
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Selection Ripple */}
              <AnimatePresence>
                {!isFlushing && (
                  <motion.div
                    key={rippleKey}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 2, opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute w-32 h-32 border-2 border-white/40 rounded-full pointer-events-none"
                  />
                )}
              </AnimatePresence>

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

              {/* Enhanced Vortex Animation */}
              <AnimatePresence>
                {isFlushing && (
                  <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    {/* Main Vortex Rings */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={`ring-${i}`}
                        initial={{ opacity: 0, scale: 0, rotate: 0 }}
                        animate={{ 
                          opacity: 0.8, 
                          scale: wasHolyFlush ? 3.5 + i * 0.5 : 2.2 + i * 0.3, 
                          rotate: 360 * (i % 2 === 0 ? 1 : -1)
                        }}
                        exit={{ opacity: 0, scale: 0, transition: { duration: 0.8 } }}
                        transition={{ 
                          opacity: { duration: 0.5 },
                          scale: { duration: 0.8, ease: "backOut" },
                          rotate: { 
                            duration: wasHolyFlush ? 1.5 : 2.5, 
                            repeat: Infinity, 
                            ease: "linear" 
                          }
                        }}
                        className={`absolute w-40 h-40 border-[10px] rounded-full ${
                          wasHolyFlush 
                            ? 'border-yellow-300/60 border-t-white shadow-[0_0_40px_rgba(234,179,8,0.4)]' 
                            : 'border-blue-200/40 border-t-blue-400/60'
                        }`}
                        style={{ borderStyle: i % 2 === 0 ? 'solid' : 'dashed' }}
                      />
                    ))}

                    {/* Swirling Particles (Bubbles/Foam/Gold) */}
                    {[...Array(wasHolyFlush ? 40 : 20)].map((_, i) => (
                      <motion.div
                        key={`particle-${i}`}
                        initial={{ opacity: 0, scale: 0, rotate: Math.random() * 360 }}
                        animate={{ 
                          opacity: 1,
                          scale: Math.random() * 1.2 + 0.5,
                          rotate: (Math.random() > 0.5 ? 360 : -360) + (Math.random() * 360),
                        }}
                        exit={{ opacity: 0, scale: 0, transition: { duration: 0.5 } }}
                        transition={{ 
                          opacity: { duration: 0.3 },
                          scale: { duration: 0.5 },
                          rotate: { 
                            duration: (wasHolyFlush ? 2 : 3) + Math.random() * 1, 
                            repeat: Infinity, 
                            ease: "linear" 
                          },
                          delay: Math.random() * 0.5
                        }}
                        className="absolute w-full h-full"
                      >
                        <div 
                          className={`absolute rounded-full ${
                            wasHolyFlush 
                              ? 'bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]' 
                              : 'bg-white/80 shadow-sm'
                          }`}
                          style={{
                            width: wasHolyFlush ? Math.random() * 8 + 3 : Math.random() * 5 + 2,
                            height: wasHolyFlush ? Math.random() * 8 + 3 : Math.random() * 5 + 2,
                            left: `${50 + (Math.random() * 35 + 5)}%`,
                            top: `${50 + (Math.random() * 10 - 5)}%`,
                            filter: wasHolyFlush ? 'none' : 'blur(0.5px)'
                          }}
                        />
                      </motion.div>
                    ))}

                    {/* Center Suction Effect */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className={`absolute w-12 h-12 rounded-full blur-xl ${
                        wasHolyFlush ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}
                    />
                  </div>
                )}
              </AnimatePresence>

              {/* The Poo */}
              <AnimatePresence>
                {selectedPoo && (
                  <motion.div
                    key={selectedPoo.id}
                    initial={{ y: -400, opacity: 0, scale: 0.1, rotate: -60 }}
                    animate={isFlushing ? {
                      rotate: wasHolyFlush ? 8640 : 5040,
                      scale: 0,
                      opacity: 0,
                      y: 150,
                      transition: { duration: wasHolyFlush ? 2.5 : 1.8, ease: "anticipate" }
                    } : {
                      y: 0,
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                      transition: { 
                        type: "spring", 
                        damping: 15, 
                        stiffness: 300,
                        mass: 0.4
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
                      transition={{ delay: 0.15, duration: 0.6 }}
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

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PooTypeConfig, PooType, FlushRank } from '../types';
import { SOUNDS } from '../constants';

interface ToiletProps {
  selectedPoo: PooTypeConfig | null;
  isFlushing: boolean;
  flushRank: FlushRank;
  onFlushComplete: () => void;
  onHandleClick: (rank: FlushRank) => void;
}

export const Toilet: React.FC<ToiletProps> = ({
  selectedPoo,
  isFlushing,
  flushRank,
  onFlushComplete,
  onHandleClick,
}) => {
  const splashAudio = useRef<HTMLAudioElement | null>(null);
  const flushAudio = useRef<HTMLAudioElement | null>(null);
  const holyAudio = useRef<HTMLAudioElement | null>(null);
  const rainbowAudio = useRef<HTMLAudioElement | null>(null);
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  const rankUpAudio = useRef<HTMLAudioElement | null>(null);
  
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [currentRank, setCurrentRank] = useState<FlushRank>(FlushRank.NORMAL);
  const [activeFlushRank, setActiveFlushRank] = useState<FlushRank>(FlushRank.NORMAL);
  const [isImpacted, setIsImpacted] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  const getRankStyles = (rank: FlushRank) => {
    switch (rank) {
      case FlushRank.LEGENDARY:
        return {
          handle: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-pink-600 shadow-[0_0_30px_rgba(236,72,153,0.6)]',
          vortex: 'border-pink-300/60 border-t-white shadow-[0_0_50px_rgba(236,72,153,0.5)]',
          particle: 'bg-gradient-to-br from-pink-200 to-purple-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]',
          basin: 'rgba(253, 242, 248, 0.95)',
          glow: 'bg-pink-200/50',
          intensity: 1.5
        };
      case FlushRank.DIVINE:
        return {
          handle: 'bg-gradient-to-br from-yellow-400 to-orange-500 border-orange-600 shadow-[0_0_25px_rgba(245,158,11,0.6)]',
          vortex: 'border-yellow-300/70 border-t-white shadow-[0_0_45px_rgba(245,158,11,0.5)]',
          particle: 'bg-gradient-to-br from-yellow-200 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]',
          basin: 'rgba(255, 251, 235, 0.95)',
          glow: 'bg-orange-200/50',
          intensity: 1.2
        };
      case FlushRank.HOLY:
        return {
          handle: 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.6)]',
          vortex: 'border-yellow-300/60 border-t-white shadow-[0_0_40px_rgba(234,179,8,0.4)]',
          particle: 'bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]',
          basin: 'rgba(254, 249, 195, 0.95)',
          glow: 'bg-yellow-200/50',
          intensity: 1.0
        };
      case FlushRank.BLESSED:
        return {
          handle: 'bg-gradient-to-br from-blue-300 to-blue-500 border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
          vortex: 'border-blue-300/50 border-t-white shadow-[0_0_30px_rgba(59,130,246,0.3)]',
          particle: 'bg-gradient-to-br from-blue-100 to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
          basin: 'rgba(239, 246, 255, 0.95)',
          glow: 'bg-blue-200/50',
          intensity: 0.8
        };
      default:
        return {
          handle: 'bg-gradient-to-br from-slate-200 to-slate-300 border-slate-400',
          vortex: 'border-blue-200/40 border-t-blue-400/60',
          particle: 'bg-white/80 shadow-sm',
          basin: 'rgba(186, 230, 253, 0.9)',
          glow: 'bg-transparent',
          intensity: 0.6
        };
    }
  };

  const targetRank = isFlushing ? activeFlushRank : currentRank;
  const rankStyles = getRankStyles(targetRank);
  const isEnhanced = targetRank !== FlushRank.NORMAL;
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    splashAudio.current = new Audio(SOUNDS.SPLASH);
    flushAudio.current = new Audio(SOUNDS.FLUSH);
    holyAudio.current = new Audio(SOUNDS.HOLY);
    rainbowAudio.current = new Audio(SOUNDS.RAINBOW);
    clickAudio.current = new Audio(SOUNDS.CLICK);
    rankUpAudio.current = new Audio(SOUNDS.RANK_UP);
    
    [splashAudio, flushAudio, holyAudio, rainbowAudio, clickAudio, rankUpAudio].forEach(ref => {
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
        
        // Subtle haptic feedback on impact
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(15);
        }
        
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
      const isEnhanced = activeFlushRank !== FlushRank.NORMAL;
      const mainAudio = isEnhanced ? holyAudio.current : flushAudio.current;
      
      if (mainAudio) {
        const handleEnded = () => {
          onFlushComplete();
        };
        mainAudio.addEventListener('ended', handleEnded);
        
        // Play sounds immediately
        if (isEnhanced) {
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
        const duration = isEnhanced ? 12000 : 7000;
        const completeTimer = setTimeout(onFlushComplete, duration);
        return () => clearTimeout(completeTimer);
      }
    }
  }, [isFlushing, activeFlushRank, playSound, onFlushComplete]);

  const handleMouseDown = () => {
    if (isFlushing || !selectedPoo) return;
    playSound(clickAudio, 0.5);
    
    // Subtle haptic feedback on initial touch
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    hasTriggeredRef.current = false;
    startTimeRef.current = Date.now();
    setCurrentRank(FlushRank.NORMAL);
    let lastEmittedRank = FlushRank.NORMAL;
    
    // Start a continuous check for rank
    const checkRank = () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      let newRank = FlushRank.NORMAL;
      if (elapsed >= 4000) newRank = FlushRank.LEGENDARY;
      else if (elapsed >= 3000) newRank = FlushRank.DIVINE;
      else if (elapsed >= 2000) newRank = FlushRank.HOLY;
      else if (elapsed >= 1000) newRank = FlushRank.BLESSED;
      
      if (newRank !== lastEmittedRank) {
        lastEmittedRank = newRank;
        setCurrentRank(newRank);
        
        if (newRank !== FlushRank.NORMAL) {
          setIsLongPressing(true);
          playSound(rankUpAudio, 0.4);
          
          // Vibrate on each rank up
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(20);
          }
        }
      }
      
      if (!hasTriggeredRef.current) {
        longPressTimer.current = setTimeout(checkRank, 100);
      }
    };
    
    checkRank();
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (!isFlushing && selectedPoo && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const elapsed = Date.now() - startTimeRef.current;
      
      let finalRank = FlushRank.NORMAL;
      if (elapsed >= 4000) finalRank = FlushRank.LEGENDARY;
      else if (elapsed >= 3000) finalRank = FlushRank.DIVINE;
      else if (elapsed >= 2000) finalRank = FlushRank.HOLY;
      else if (elapsed >= 1000) finalRank = FlushRank.BLESSED;

      setActiveFlushRank(finalRank);
      onHandleClick(finalRank);
    }
    
    setIsLongPressing(false);
  };

  // Reset all local interactive states when flush is done
  useEffect(() => {
    if (!isFlushing) {
      setActiveFlushRank(FlushRank.NORMAL);
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
          rotateY: (isLongPressing || (isFlushing && isEnhanced)) ? [ -12, 0, 12, -12] : -12,
          scale: isFlushing ? (isEnhanced ? [1, 1.1, 1] : [1, 0.98, 1]) : (isImpacted ? 0.99 : 1),
          y: (isLongPressing || (isFlushing && isEnhanced)) ? [0, -15, 0] : 0
        }}
        transition={isFlushing || isLongPressing ? { 
          duration: isLongPressing ? 0.4 : 0.6, 
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
          <div className="absolute top-6 -left-10 w-12 h-12 preserve-3d z-30">
            <motion.button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              disabled={isFlushing || !selectedPoo}
              whileTap={{ rotate: 45, scale: 0.9 }}
              className={`w-full h-full rounded-full border-4 shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center ${
                (isLongPressing || (isFlushing && isEnhanced)) 
                  ? rankStyles.handle
                  : 'bg-gradient-to-br from-slate-200 to-slate-300 border-slate-400'
              } ${isFlushing || !selectedPoo ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-5 h-5 bg-slate-500 rounded-full border border-slate-300 shadow-inner" />
              
              {/* Rank Indicator */}
              <AnimatePresence>
                {isLongPressing && !isFlushing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                    animate={{ opacity: 1, y: -50, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute whitespace-nowrap bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl border border-white/20"
                  >
                    {currentRank}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            {/* Handle Stem */}
            <div className="absolute top-1/2 left-[80%] -translate-y-1/2 w-6 h-3 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full -z-10 shadow-sm" />
          </div>
          
          {/* Holy Glow */}
          <AnimatePresence>
            {(isLongPressing || (isFlushing && isEnhanced)) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.3, 0.7, 0.3], 
                  scale: [1.3, 1.8, 1.3] 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className={`absolute inset-0 blur-3xl rounded-full -z-10 ${rankStyles.glow}`}
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
                backgroundColor: (isLongPressing || (isFlushing && isEnhanced))
                  ? rankStyles.basin 
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
                          scale: isEnhanced ? (2.5 + rankStyles.intensity * 1.0) + i * 0.5 : 2.2 + i * 0.3, 
                          rotate: 360 * (i % 2 === 0 ? 1 : -1)
                        }}
                        exit={{ opacity: 0, scale: 0, transition: { duration: 0.8 } }}
                        transition={{ 
                          opacity: { duration: 0.5 },
                          scale: { duration: 1.5, ease: "easeOut" },
                          rotate: { 
                            duration: isEnhanced ? 1.2 / rankStyles.intensity : 2.0, 
                            repeat: Infinity, 
                            ease: "linear" 
                          }
                        }}
                        className={`absolute w-40 h-40 border-[10px] rounded-full ${
                          isEnhanced 
                            ? rankStyles.vortex
                            : 'border-blue-200/40 border-t-blue-400/60'
                        }`}
                        style={{ borderStyle: i % 2 === 0 ? 'solid' : 'dashed' }}
                      />
                    ))}

                    {/* Swirling Particles (Bubbles/Foam/Gold) */}
                    {[...Array(isEnhanced ? Math.floor(20 + Math.pow(rankStyles.intensity, 2) * 50) : 20)].map((_, i) => (
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
                            duration: ((isEnhanced ? 2 : 3) / rankStyles.intensity) + Math.random() * 1, 
                            repeat: Infinity, 
                            ease: "linear" 
                          },
                          delay: Math.random() * 0.5
                        }}
                        className="absolute w-full h-full"
                      >
                        <div 
                          className={`absolute rounded-full ${
                            isEnhanced 
                              ? rankStyles.particle
                              : 'bg-white/80 shadow-sm'
                          }`}
                          style={{
                            width: isEnhanced ? Math.random() * 8 + 3 : Math.random() * 5 + 2,
                            height: isEnhanced ? Math.random() * 8 + 3 : Math.random() * 5 + 2,
                            left: `${50 + (Math.random() * 35 + 5)}%`,
                            top: `${50 + (Math.random() * 10 - 5)}%`,
                            filter: isEnhanced ? 'none' : 'blur(0.5px)'
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
                        isEnhanced ? (targetRank === FlushRank.LEGENDARY ? 'bg-pink-400' : 'bg-yellow-400') : 'bg-blue-400'
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
                      rotate: isEnhanced ? 14400 * rankStyles.intensity : 7200,
                      scale: 0,
                      opacity: 0,
                      y: 150,
                      transition: { duration: isEnhanced ? 6.5 : 4.0, ease: "anticipate" }
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

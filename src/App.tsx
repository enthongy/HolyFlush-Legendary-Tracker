/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Info, CheckCircle2, Share2, Trophy, Droplets } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Toilet } from './components/Toilet';
import { ClassificationBar } from './components/ClassificationBar';
import { Calendar } from './components/Calendar';
import { CustomizePoo } from './components/CustomizePoo';
import { PooTypeConfig, PooLogEntry, FlushRank } from './types';
import { POO_TYPES, SOUNDS } from './constants';

export default function App() {
  const [selectedPoo, setSelectedPoo] = useState<PooTypeConfig | null>(null);
  const [isFlushing, setIsFlushing] = useState(false);
  const [history, setHistory] = useState<PooLogEntry[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPoo, setLastPoo] = useState<PooTypeConfig | null>(null);
  const [lastRank, setLastRank] = useState<FlushRank>(FlushRank.NORMAL);
  const [lastNote, setLastNote] = useState<string | undefined>(undefined);
  const [customEmojis, setCustomEmojis] = useState<Record<string, string>>({});
  const [currentNote, setCurrentNote] = useState('');

  const [isHolyFlush, setIsHolyFlush] = useState(false);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5; // Set volume to 50%
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load history and custom emojis from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('poolog_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }

    const savedEmojis = localStorage.getItem('poolog_custom_emojis');
    if (savedEmojis) {
      try {
        setCustomEmojis(JSON.parse(savedEmojis));
      } catch (e) {
        console.error('Failed to parse custom emojis', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('poolog_history', JSON.stringify(history));
  }, [history]);

  // Save custom emojis to localStorage
  useEffect(() => {
    localStorage.setItem('poolog_custom_emojis', JSON.stringify(customEmojis));
  }, [customEmojis]);

  const currentPooTypes = POO_TYPES.map(type => ({
    ...type,
    icon: customEmojis[type.id] || type.icon
  }));

  const handleFlush = (rank: FlushRank) => {
    if (!selectedPoo || isFlushing) return;
    setLastRank(rank);
    setIsHolyFlush(rank !== FlushRank.NORMAL);
    setIsFlushing(true);
  };

  // Auto-reset safety: Ensure toilet returns to default state after 10 seconds
  useEffect(() => {
    if (isFlushing) {
      const timer = setTimeout(() => {
        if (isFlushing) {
          setIsFlushing(false);
          setIsHolyFlush(false);
          setSelectedPoo(null);
        }
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isFlushing]);

  const playSuccessSound = () => {
    if (audioRef.current) {
      audioRef.current.src = SOUNDS.SUCCESS;
      audioRef.current.play().catch(error => {
        console.log('Audio playback failed:', error);
        // Fallback for browsers that block autoplay
        if (error.name === 'NotAllowedError') {
          console.log('Browser blocked autoplay - waiting for user interaction');
        }
      });
    }
  };

  const onFlushComplete = () => {
    if (!selectedPoo) return;

    setLastPoo(selectedPoo);
    const noteToSave = currentNote.trim() || undefined;
    setLastNote(noteToSave);
    const newEntry: PooLogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: selectedPoo.id,
      rank: lastRank,
      notes: noteToSave,
    };

    setHistory(prev => [...prev, newEntry]);
    setIsFlushing(false);
    setIsHolyFlush(false);
    setSelectedPoo(null);
    setCurrentNote('');
    setShowSuccess(true);
    
    // Play success sound when confetti starts
    playSuccessSound();
    
    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Clear any existing timer
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    
    // Success message stays for 8 seconds for a better "page" feel
    successTimerRef.current = setTimeout(() => setShowSuccess(false), 8000);
  };

  const undoLastFlush = () => {
    if (history.length === 0) return;
    setHistory(prev => prev.slice(0, -1));
    setShowSuccess(false);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
  };

  const updateLogEntry = (id: string, updates: Partial<PooLogEntry>) => {
    setHistory(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const deleteLogEntry = (id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  };

  const handleShare = async () => {
    if (!lastPoo) return;
    
    const rankLabel = lastRank === FlushRank.NORMAL ? 'Solid' : lastRank;
    const messages = [
      `🚨 BREAKING: A ${rankLabel} ${lastPoo.icon} ${lastPoo.label} has been successfully deployed! 🚽✨`,
      `I just made history with a ${rankLabel} ${lastPoo.icon} ${lastPoo.label}. My toilet will never be the same. 💩🏆`,
      `Mission Accomplished: The ${rankLabel} ${lastPoo.icon} ${lastPoo.label} has reached its final destination. 🚀🌊`,
      `Just dropped a ${rankLabel} ${lastPoo.icon} ${lastPoo.label}. Feeling 5lbs lighter and 100% more legendary. 💪🚽`,
      `The annals of history now contain one more ${rankLabel} ${lastPoo.icon} ${lastPoo.label}. You're welcome, world. 🌍💩`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const shareData = {
      title: 'Legendary Flush!',
      text: randomMessage,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        // Subtle feedback instead of alert
        const btn = document.getElementById('share-btn');
        if (btn) {
          const originalText = btn.innerHTML;
          btn.innerHTML = 'COPIED! 💩';
          setTimeout(() => { btn.innerHTML = originalText; }, 2000);
        }
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <motion.div 
      animate={isFlushing ? { x: isHolyFlush ? [0, -6, 6, -6, 6, 0] : [0, -2, 2, -2, 2, 0] } : { x: 0 }}
      transition={isFlushing ? { 
        duration: 0.1, 
        repeat: Infinity 
      } : { 
        type: "spring", 
        damping: 10, 
        stiffness: 100 
      }}
      className="relative min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden bg-gradient-to-b from-sky-50 to-white"
    >
      {/* Background Decor - Floating Bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -1000],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{ 
              duration: 15 + Math.random() * 10, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "linear"
            }}
            className="absolute bottom-0 w-12 h-12 bg-blue-200/20 rounded-full blur-sm"
            style={{ left: `${i * 15}%` }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between z-10 px-1">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => !isFlushing && setIsCustomizeOpen(true)}
          className={`flex items-center gap-3 sm:gap-4 cursor-pointer group ${isFlushing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden border border-slate-50 group-hover:scale-110 transition-transform">
            <img 
              src="/favicon.svg" 
              alt="HolyFlush Icon" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-blue-500 transition-colors">HolyFlush</h1>
            <p className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 sm:mt-1.5 opacity-80">Legendary Tracker</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <button 
            onClick={() => !isFlushing && setIsCalendarOpen(true)}
            disabled={isFlushing}
            className={`w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-110 active:scale-95 border border-slate-50 ${isFlushing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700" />
          </button>
        </motion.div>
      </header>

      {/* Main Content: The Toilet */}
      <main className="flex-1 flex flex-col items-center justify-center w-full relative -mt-4 sm:-mt-8">
        <div className="relative scale-90 sm:scale-100 transition-transform">
          <Toilet 
            selectedPoo={selectedPoo}
            isFlushing={isFlushing}
            flushRank={lastRank}
            onFlushComplete={onFlushComplete}
            onHandleClick={handleFlush}
          />
          
          {/* Hint Overlay */}
          <AnimatePresence>
            {!selectedPoo && !isFlushing && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -bottom-8 sm:-bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 backdrop-blur-md px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-slate-600 shadow-xl flex items-center gap-2 border border-white"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Choose your legendary specimen!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer: Classification Bar & Flush Action */}
      <footer className="w-full max-w-md flex flex-col items-center gap-5 sm:gap-7 z-10 pb-12 sm:pb-16 px-4">
        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: -50, opacity: 0 }}
                className="w-full max-w-sm bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
              >
                <div className="relative p-8 flex flex-col items-center text-center gap-6">
                  {/* Celebration Icon */}
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200"
                  >
                    <Trophy className="w-12 h-12 text-white" />
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight uppercase">
                      {lastRank === FlushRank.NORMAL ? 'Solid' : lastRank}<br />FLUSH!
                    </h2>
                    <p className="text-slate-500 font-medium text-sm">
                      Your log has been safely archived in the annals of history.
                    </p>
                    {lastNote && (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic">
                        "{lastNote}"
                      </div>
                    )}
                  </div>

                  {/* Stats / Info */}
                  <div className="w-full grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Logs</div>
                      <div className="text-xl font-black text-slate-700">{history.length}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</div>
                      <div className="text-xl font-black text-slate-700">🔥 1</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full flex flex-col gap-3 pt-2">
                    <motion.button
                      onClick={() => setShowSuccess(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 active:scale-95 transition-all"
                    >
                      CONTINUE
                    </motion.button>
                    
                    <div className="flex gap-2">
                      <motion.button
                        onClick={undoLastFlush}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                      >
                        <span className="text-blue-500">↩</span> UNDO
                      </motion.button>
                      <motion.button
                        id="share-btn"
                        onClick={handleShare}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                      >
                        <Share2 className="w-3 h-3 text-emerald-500" /> SHARE
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex flex-col gap-4 sm:gap-6">
          <div className="bg-white/30 backdrop-blur-md p-2 sm:p-3 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60">
            <ClassificationBar 
              onSelect={setSelectedPoo} 
              selectedId={selectedPoo?.id}
              pooTypes={currentPooTypes}
              isFlushing={isFlushing}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <input
              type="text"
              placeholder="Add a note (e.g., 'Feeling bloated', 'Spicy food yesterday')"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              disabled={isFlushing}
              className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all text-sm"
            />
          </motion.div>
          
          <motion.button
            disabled={!selectedPoo || isFlushing}
            onClick={() => handleFlush(FlushRank.NORMAL)}
            whileHover={selectedPoo && !isFlushing ? { scale: 1.02, y: -2 } : {}}
            whileTap={selectedPoo && !isFlushing ? { scale: 0.95 } : {}}
            className={`w-full py-6 sm:py-8 rounded-[2rem] sm:rounded-[2.5rem] font-black text-2xl sm:text-3xl shadow-2xl transition-all flex items-center justify-center gap-4 ${
              selectedPoo && !isFlushing
                ? 'bg-gradient-to-r from-[#FF7E5F] to-[#FEB47B] text-white shadow-[0_15px_35px_rgba(255,126,95,0.5)]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isFlushing ? (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-white/30 border-t-white rounded-full"
                />
                <span className="animate-pulse text-lg sm:text-xl">FLUSHING...</span>
              </div>
            ) : (
              <>
                FLUSH!
              </>
            )}
          </motion.button>
        </div>
      </footer>

      {/* Calendar Overlay */}
      <Calendar 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        history={history}
        onUpdate={updateLogEntry}
        onDelete={deleteLogEntry}
      />

      {/* Customize Overlay */}
      <AnimatePresence>
        {isCustomizeOpen && (
          <CustomizePoo 
            onBack={() => setIsCustomizeOpen(false)}
            customEmojis={customEmojis}
            onSave={(newEmojis) => {
              setCustomEmojis(newEmojis);
              // If currently selected poo emoji changed, update it
              if (selectedPoo) {
                const updated = currentPooTypes.find(t => t.id === selectedPoo.id);
                if (updated) setSelectedPoo(updated);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="fixed top-20 -left-20 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Info, CheckCircle2 } from 'lucide-react';
import { Toilet } from './components/Toilet';
import { ClassificationBar } from './components/ClassificationBar';
import { Calendar } from './components/Calendar';
import { PooTypeConfig, PooLogEntry } from './types';

export default function App() {
  const [selectedPoo, setSelectedPoo] = useState<PooTypeConfig | null>(null);
  const [isFlushing, setIsFlushing] = useState(false);
  const [history, setHistory] = useState<PooLogEntry[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [isHolyFlush, setIsHolyFlush] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('poolog_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('poolog_history', JSON.stringify(history));
  }, [history]);

  const handleFlush = (isHoly: boolean) => {
    if (!selectedPoo || isFlushing) return;
    setIsHolyFlush(isHoly);
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
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isFlushing]);

  const onFlushComplete = () => {
    if (!selectedPoo) return;

    const newEntry: PooLogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: selectedPoo.id,
    };

    setHistory(prev => [...prev, newEntry]);
    setIsFlushing(false);
    setIsHolyFlush(false);
    setSelectedPoo(null);
    setShowSuccess(true);
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <motion.div 
      animate={isFlushing ? { x: isHolyFlush ? [0, -6, 6, -6, 6, 0] : [0, -2, 2, -2, 2, 0] } : {}}
      transition={{ duration: 0.1, repeat: isFlushing ? Infinity : 0 }}
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
          className="flex items-center gap-3 sm:gap-4"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex items-center justify-center text-2xl sm:text-3xl border border-slate-50">
            <span className="filter drop-shadow-sm">🚽</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none">HolyFlush</h1>
            <p className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 sm:mt-1.5 opacity-80">Legendary Tracker</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-110 active:scale-95 border border-slate-50"
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
                Pick your poo type!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer: Classification Bar & Flush Action */}
      <footer className="w-full max-w-md flex flex-col items-center gap-4 sm:gap-6 z-10 pb-4 sm:pb-6">
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-3xl shadow-2xl flex items-center gap-3 sm:gap-4 font-black text-base sm:text-lg border-b-4 border-emerald-600"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              LEGENDARY FLUSH!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex flex-col gap-4 sm:gap-6">
          <div className="bg-white/30 backdrop-blur-md p-2 sm:p-3 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60">
            <ClassificationBar 
              onSelect={setSelectedPoo} 
              selectedId={selectedPoo?.id} 
            />
          </div>
          
          <motion.button
            disabled={!selectedPoo || isFlushing}
            onClick={() => handleFlush(false)}
            whileHover={selectedPoo && !isFlushing ? { scale: 1.02, y: -2 } : {}}
            whileTap={selectedPoo && !isFlushing ? { scale: 0.95 } : {}}
            className={`w-full py-5 sm:py-6 rounded-full font-black text-xl sm:text-2xl shadow-2xl transition-all flex items-center justify-center gap-4 ${
              selectedPoo && !isFlushing
                ? 'bg-gradient-to-r from-[#FF7E5F] to-[#FEB47B] text-white shadow-[0_10px_25px_rgba(255,126,95,0.4)]'
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
      />

      {/* Background Decor */}
      <div className="fixed top-20 -left-20 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}

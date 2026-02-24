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
      className="relative min-h-screen flex flex-col items-center justify-between p-6 overflow-hidden bg-gradient-to-b from-sky-50 to-white"
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
      <header className="w-full max-w-md flex items-center justify-between z-10">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl border-b-4 border-slate-100">
            🚽
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">HolyFlush</h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Legendary Tracker</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-2"
        >
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-110 active:scale-95 border-b-4 border-slate-100"
          >
            <CalendarIcon className="w-6 h-6 text-slate-600" />
          </button>
        </motion.div>
      </header>

      {/* Main Content: The Toilet */}
      <main className="flex-1 flex flex-col items-center justify-center w-full relative">
        <div className="relative">
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
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/80 backdrop-blur-md px-6 py-3 rounded-full text-sm font-bold text-slate-600 shadow-lg flex items-center gap-2 border border-white"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Pick your poo type!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer: Classification Bar & Flush Action */}
      <footer className="w-full max-w-md flex flex-col items-center gap-8 z-10 pb-4">
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 font-black text-lg border-b-4 border-emerald-600"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              LEGENDARY FLUSH!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex flex-col gap-6">
          <div className="bg-white/40 backdrop-blur-sm p-2 rounded-[2.5rem] shadow-inner border border-white/50">
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
            className={`w-full py-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-4 border-b-8 ${
              selectedPoo && !isFlushing
                ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white border-blue-700 shadow-blue-200'
                : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
            }`}
          >
            {isFlushing ? (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full"
                />
                <span className="animate-pulse">FLUSHING...</span>
              </div>
            ) : (
              <>
                FLUSH IT!
                <span className="text-3xl filter drop-shadow-md">🌊</span>
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

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PooLogEntry } from '../types';
import { POO_TYPES } from '../constants';

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
  history: PooLogEntry[];
}

export const Calendar: React.FC<CalendarProps> = ({ isOpen, onClose, history }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getLogsForDay = (day: number) => {
    return history.filter(entry => {
      const date = new Date(entry.timestamp);
      return (
        date.getDate() === day &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">History</h2>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all active:scale-90"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-6 bg-slate-50 p-2 rounded-2xl">
                <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="text-sm font-black text-slate-700 uppercase tracking-widest">
                  {monthName} {year}
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const logs = getLogsForDay(day);
                  const isToday = 
                    day === new Date().getDate() && 
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();

                  return (
                    <motion.div 
                      key={day} 
                      whileHover={{ scale: 1.05 }}
                      className={`aspect-square relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                        isToday ? 'border-blue-400 bg-blue-50/50 shadow-sm' : 'border-slate-50 bg-white'
                      }`}
                    >
                      <span className={`text-[10px] font-black mb-1 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                        {day}
                      </span>
                      <div className="flex flex-wrap justify-center gap-0.5 px-1">
                        {logs.slice(0, 4).map((log, idx) => {
                          const type = POO_TYPES.find(t => t.id === log.type);
                          return (
                            <span key={log.id} className="text-[10px] filter drop-shadow-sm" title={type?.label}>
                              {type?.icon}
                            </span>
                          );
                        })}
                        {logs.length > 4 && (
                          <span className="text-[8px] text-blue-500 font-black">+{logs.length - 4}</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <span className="text-4xl opacity-20">🧻</span>
                    <p className="text-slate-400 text-xs font-bold italic">No logs yet. Go flush something!</p>
                  </div>
                ) : (
                  history.slice().reverse().map(entry => {
                    const type = POO_TYPES.find(t => t.id === entry.type);
                    return (
                      <motion.div 
                        key={entry.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl filter drop-shadow-sm">{type?.icon}</span>
                          <div>
                            <div className="text-sm font-black text-slate-700">{type?.label}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(entry.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

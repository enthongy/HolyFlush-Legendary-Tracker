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
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());
  const activityListRef = React.useRef<HTMLDivElement>(null);

  // Scroll to activity list when a date is selected
  React.useEffect(() => {
    if (selectedDate && activityListRef.current) {
      activityListRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedDate]);

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

  const getLogsForDay = (day: number, month: number, year: number) => {
    return history.filter(entry => {
      const date = new Date(entry.timestamp);
      return (
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year
      );
    });
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const selectedLogs = selectedDate 
    ? getLogsForDay(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear())
    : [];

  const displayedLogs = selectedDate 
    ? selectedLogs.slice().reverse() 
    : history.slice().reverse().slice(0, 15);

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
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Persistent Header - Always at the top */}
            <div className="px-6 pt-6 pb-2 bg-white z-20 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">History</h2>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all active:scale-90"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Calendar Section */}
              <div className="p-6 pt-4">
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
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={`${day}-${i}`} className="text-center text-[10px] font-black text-slate-300 uppercase py-2">
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
                    const logs = getLogsForDay(day, currentDate.getMonth(), currentDate.getFullYear());
                    const isToday = 
                      day === new Date().getDate() && 
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear();
                    
                    const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isSelected = selectedDate && isSameDay(selectedDate, thisDate);

                    return (
                      <motion.button 
                        key={day} 
                        onClick={() => setSelectedDate(thisDate)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={isSelected ? { 
                          scale: [1, 1.08, 1],
                          boxShadow: [
                            "0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)",
                            "0 25px 50px -12px rgba(59, 130, 246, 0.5), 0 0 20px 5px rgba(59, 130, 246, 0.3)",
                            "0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)"
                          ]
                        } : { scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
                        transition={isSelected ? { 
                          scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                          boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                        } : {}}
                        className={`aspect-square relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 z-10' 
                            : isToday 
                              ? 'border-blue-200 bg-blue-50/30' 
                              : 'border-slate-50 bg-white hover:border-slate-200'
                        }`}
                      >
                        <span className={`text-[10px] font-black mb-1 ${isSelected || isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                          {day}
                        </span>
                        <div className="flex flex-wrap justify-center gap-0.5 px-1">
                          {logs.slice(0, 4).map((log) => {
                            const type = POO_TYPES.find(t => t.id === log.type);
                            return (
                              <span key={log.id} className="text-[10px] filter drop-shadow-sm">
                                {type?.icon}
                              </span>
                            );
                          })}
                          {logs.length > 4 && (
                            <span className="text-[8px] text-blue-500 font-black">+{logs.length - 4}</span>
                          )}
                        </div>
                        {isSelected && (
                          <motion.div 
                            layoutId="selected-dot"
                            className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Activity List Section */}
              <div ref={activityListRef} className="bg-slate-50 p-6 border-t border-slate-100 min-h-[300px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {selectedDate 
                      ? `Activity for ${selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` 
                      : 'Recent Activity'}
                  </h3>
                  {selectedDate && (
                    <button 
                      onClick={() => setSelectedDate(null)}
                      className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {displayedLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <span className="text-4xl opacity-20">🧻</span>
                      <p className="text-slate-400 text-xs font-bold italic">
                        {selectedDate ? 'No logs for this day.' : 'No logs yet. Go flush something!'}
                      </p>
                    </div>
                  ) : (
                    displayedLogs.map(entry => {
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
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-black text-slate-700">{type?.label}</div>
                                {entry.rank && entry.rank !== 'NORMAL' && (
                                  <span className="text-[8px] font-black bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter">
                                    {entry.rank}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {!selectedDate && ` • ${new Date(entry.timestamp).toLocaleDateString()}`}
                              </div>
                              {entry.notes && (
                                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                                  "{entry.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

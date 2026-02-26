import React from 'react';
import { motion } from 'motion/react';
import { POO_TYPES } from '../constants';
import { PooTypeConfig } from '../types';

interface ClassificationBarProps {
  onSelect: (type: PooTypeConfig) => void;
  selectedId?: string;
  pooTypes: PooTypeConfig[];
  isFlushing?: boolean;
}

export const ClassificationBar: React.FC<ClassificationBarProps> = ({ onSelect, selectedId, pooTypes, isFlushing }) => {
  return (
    <div className="w-full">
      <div className="flex overflow-x-auto py-2 px-1 gap-4 no-scrollbar snap-x">
        {pooTypes.map((type) => (
          <motion.button
            key={type.id}
            whileHover={!isFlushing ? { scale: 1.05, y: -2 } : {}}
            whileTap={!isFlushing ? { scale: 0.9 } : {}}
            onClick={() => !isFlushing && onSelect(type)}
            disabled={isFlushing}
            className={`flex-shrink-0 w-28 flex flex-col items-center p-4 rounded-[2.5rem] transition-all snap-center ${
              selectedId === type.id 
                ? 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-2 ring-blue-400/20' 
                : 'bg-white/60 hover:bg-white shadow-sm'
            } ${isFlushing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <motion.div 
              animate={selectedId === type.id ? { 
                scale: [1, 1.2, 1], 
                rotate: [0, 10, -10, 0],
                y: [0, -4, 0]
              } : {}}
              transition={{ duration: 0.5 }}
              className="text-4xl mb-3 filter drop-shadow-sm"
            >
              {type.icon}
            </motion.div>
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">
              {type.subLabel}
            </span>
            <span className="text-[12px] font-black text-slate-800 truncate w-full text-center">
              {type.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

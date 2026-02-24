import React from 'react';
import { motion } from 'motion/react';
import { POO_TYPES } from '../constants';
import { PooTypeConfig } from '../types';

interface ClassificationBarProps {
  onSelect: (type: PooTypeConfig) => void;
  selectedId?: string;
}

export const ClassificationBar: React.FC<ClassificationBarProps> = ({ onSelect, selectedId }) => {
  return (
    <div className="w-full">
      <div className="flex overflow-x-auto py-2 px-1 gap-4 no-scrollbar snap-x">
        {POO_TYPES.map((type) => (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(type)}
            className={`flex-shrink-0 w-24 flex flex-col items-center p-4 rounded-[2rem] transition-all snap-center border-b-4 ${
              selectedId === type.id 
                ? type.id === 'RAINBOW' 
                  ? 'bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-400 shadow-lg shadow-yellow-100'
                  : 'bg-gradient-to-b from-blue-50 to-blue-100 border-blue-400 shadow-md' 
                : 'bg-white border-slate-100 hover:bg-slate-50'
            }`}
          >
            <motion.div 
              animate={selectedId === type.id ? { 
                scale: [1, 1.25, 1], 
                rotate: [0, 15, -15, 0],
                y: [0, -5, 0]
              } : {}}
              transition={{ duration: 0.5 }}
              className="text-4xl mb-2 filter drop-shadow-sm"
            >
              {type.icon}
            </motion.div>
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-0.5">
              {type.subLabel}
            </span>
            <span className="text-[11px] font-black text-slate-700 truncate w-full text-center">
              {type.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

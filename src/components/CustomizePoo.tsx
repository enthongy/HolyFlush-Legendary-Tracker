import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { POO_TYPES } from '../constants';
import { PooTypeConfig, PooType } from '../types';

interface CustomizePooProps {
  onBack: () => void;
  customEmojis: Record<string, string>;
  onSave: (newCustomEmojis: Record<string, string>) => void;
}

const EMOJI_OPTIONS = [
  // Classic & Variants (Most common)
  '💩', '💨', '💦', '💧', '💤', '💫', '💥', '💢', '💭', '💬',
  
  // Food-themed (Popular choices)
  '🍫', '🍩', '🍪', '🍌', '🥔', '🥜', '🌰', '🥑', '🍠', '🥕',
  '🥦', '🌽', '🍄', '🥨', '🥯', '🍞', '🥐', '🥖', '🍕', '🍔',
  '🌭', '🥪', '🍣', '🍛', '🍜', '🍝', '🍲', '🍥', '🥟', '🥠',
  
  // Nature & Elements
  '🌲', '🌳', '🌴', '🌵', '🌿', '🍂', '🍁', '🪨', '🪵', '🌱',
  '🔥', '💧', '🌊', '❄️', '⛄', '☄️', '🌋', '🏔️', '⛰️', '🗻',
  '🌟', '⭐', '☀️', '🌈', '☁️', '🌪️', '🌀', '💨', '🌫️', '⚡',
  
  // Objects & Things
  '🧸', '🎈', '🎁', '💎', '💰', '💣', '🧨', '🧿', '🔮', '⚗️',
  '🧪', '🧫', '🧬', '🦠', '🔬', '🔭', '💊', '💉', '🩸', '🩹',
  '📦', '📀', '💿', '🧷', '🧹', '🧺', '🧻', '🚽', '🧼', '🪥',
  
  // Fantasy & Fun
  '✨', '🪄', '🔮', '🎭', '🎪', '🎨', '🎯', '🎲', '♟️', '🎰',
  '🧩', '🪀', '🪁', '🧸', '🪆', '🎮', '🕹️', '🎴', '🃏', '🎲',
  
  // Slime/Monster themed
  '👾', '🤖', '👻', '💀', '☠️', '👽', '🧌', '🧟', '🧛', '🧝',
  
  // Abstract/Artistic
  '🎨', '🖌️', '🖍️', '✏️', '🖊️', '🖋️', '✒️', '🖌️', '🎭', '🎪',
  
  // Weather/Effects
  '🌪️', '🌈', '☔', '⛈️', '🌨️', '🌩️', '🌫️', '💨', '🌀', '🌊',
  
  // Cute animals (as options)
  '🐻', '🐼', '🐨', '🦊', '🐝', '🦋', '🐌', '🐞', '🪲', '🦎',
  '🐙', '🦑', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🪼',
  
  // Emoji faces
  '😊', '😂', '🤣', '😍', '🥰', '😘', '😎', '🤔', '🤨', '😐',
  '😑', '😶', '🫥', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔',
  
  // Poop-related humor
  '💩', '🚽', '🧻', '🚿', '🛁', '🧼', '🫧', '💦', '💨', '🤢',
  '🤮', '🥴', '🤒', '🤧', '😷', '🫡', '🫠', '🥹', '🫣', '🫢',
  
  // Mystical
  '🔮', '🪄', '✨', '🌟', '⭐', '🌠', '🌌', '🛸', '👾', '🤖',
  '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '🧌', '🦄', '🐉',
  
  // Foods that resemble shapes
  '🥨', '🥯', '🥖', '🥐', '🥨', '🥞', '🧇', '🥓', '🥩', '🍗',
  '🍖', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🥘', '🍲', '🥣',
  
  // Candy/Sweets
  '🍬', '🍭', '🍮', '🍯', '🍰', '🧁', '🥧', '🍦', '🍧', '🍨',
  '🍩', '🍪', '🎂', '🧈', '🍫', '🍬', '🍭', '🍮', '🍯', '🧉',
  
  // Nature textures
  '🪨', '🪵', '🌿', '🍂', '🍁', '🌾', '🌺', '🌸', '🌼', '🌻',
  
  // Elements (repeated from above for completeness)
  '💧', '💦', '🔥', '❄️', '🌊', '💨', '⚡', '🌪️', '🌈', '☄️',
  
  // Fun additions
  '🪩', '🪅', '🪆', '🪀', '🪁', '🪄', '🪔', '🪕', '🪖', '🪗',
  '🪘', '🪙', '🪚', '🪛', '🪜', '🪝', '🪞', '🪟', '🪠', '🪡',
  '🪢', '🪣', '🪤', '🪥', '🪦', '🪧', '🪨', '🪩', '🪪', '🪫',
  
  // Common favorites
  '🤍', '🖤', '💙', '💚', '💛', '🧡', '💜', '❤️', '💔', '❤️‍🔥',
  '💯', '🔟', '🆗', '🆒', '🆕', '🆙', '🆓', '🆖', '🆘', '❓'
];

export const CustomizePoo: React.FC<CustomizePooProps> = ({ onBack, customEmojis, onSave }) => {
  const [localCustomEmojis, setLocalCustomEmojis] = useState<Record<string, string>>(customEmojis);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(POO_TYPES[0].id);

  const handleEmojiSelect = (emoji: string) => {
    if (selectedTypeId) {
      setLocalCustomEmojis(prev => ({
        ...prev,
        [selectedTypeId]: emoji
      }));
    }
  };

  const handleReset = () => {
    setLocalCustomEmojis({});
  };

  const handleSave = () => {
    onSave(localCustomEmojis);
    onBack();
  };

  const filteredPooTypes = POO_TYPES.filter(t => t.id !== PooType.RAINBOW);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed inset-0 z-[200] bg-slate-50 flex flex-col"
    >
{/* Header */}
<header className="w-full bg-white p-6 sm:p-8 flex items-center justify-between mt-8 sm:mt-12">
  <button 
    onClick={onBack}
    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors"
  >
    <ArrowLeft className="w-6 h-6 text-slate-600" />
  </button>
  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Customize Specimen</h2>
  <div className="w-10" /> {/* Spacer */}
</header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
        {/* Type Selection */}
        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Select Type to Edit</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {filteredPooTypes.map((type) => {
              const currentEmoji = localCustomEmojis[type.id] || type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedTypeId(type.id)}
                  className={`flex-shrink-0 w-24 p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedTypeId === type.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-white bg-white shadow-sm'
                  }`}
                >
                  <span className="text-3xl">{currentEmoji}</span>
                  <span className="text-[10px] font-black text-slate-800 uppercase truncate w-full text-center">
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Emoji Picker */}
        <section className="flex-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Choose New Emoji</h3>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
            {Array.from(new Set(EMOJI_OPTIONS)).map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="aspect-square flex items-center justify-center text-3xl bg-white rounded-2xl shadow-sm hover:shadow-md hover:scale-110 transition-all border border-slate-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Actions */}
      <footer className="p-4 sm:p-6 bg-white border-t border-slate-100 flex gap-4">
        <button
          onClick={handleReset}
          className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> RESET
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
        >
          <Save className="w-4 h-4" /> SAVE CHANGES
        </button>
      </footer>
    </motion.div>
  );
};

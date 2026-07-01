import { useState, KeyboardEvent } from 'react';
import { Utensils, X } from 'lucide-react';
import { PathHex } from '../types';

interface PathProps {
  hexes: PathHex[];
  onChange: (hexes: PathHex[]) => void;
}

export function Path({ hexes, onChange }: PathProps) {
  const [input, setInput] = useState('');

  const addHex = () => {
    const val = input.trim();
    if (!val) return;
    onChange([...hexes, { hex: val, foodConsumed: false }]);
    setInput('');
  };

  const removeHex = (index: number) => {
    const updated = hexes.filter((_, i) => i !== index);
    onChange(updated);
  };

  const toggleFoodConsumed = (index: number) => {
    const updated = hexes.map((item, i) =>
      i === index ? { ...item, foodConsumed: !item.foodConsumed } : item,
    );
    onChange(updated);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addHex();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3 min-h-8">
        {hexes.length === 0 && (
          <span className="text-gray-400 dark:text-zinc-500 text-sm italic">No hexes visited yet</span>
        )}
        {hexes.map((item, i) => (
          <div
            key={i}
            className="inline-flex flex-col items-center gap-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-sm font-mono px-2 py-1 rounded"
          >
            <div className="inline-flex items-center gap-1">
              {i > 0 && (
                <span className="text-emerald-400 dark:text-emerald-600 select-none mr-0.5">→</span>
              )}
              {item.hex}
              <button
                onClick={() => removeHex(i)}
                className="ml-1 text-emerald-500 dark:text-emerald-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label={`Remove hex ${item.hex}`}
              >
                <X size={12} />
              </button>
            </div>
            <button
              onClick={() => toggleFoodConsumed(i)}
              aria-pressed={item.foodConsumed}
              aria-label={`Toggle food consumed at hex ${item.hex}`}
              title="Food consumed"
              className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${
                item.foodConsumed
                  ? 'bg-amber-500 border-amber-600 text-white'
                  : 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-400 dark:text-zinc-500'
              }`}
            >
              <Utensils size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hex number"
          className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-100 text-sm rounded px-3 py-1.5 w-44 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          onClick={addHex}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors"
        >
          Add
        </button>
        {hexes.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 text-sm px-2 py-1.5 rounded transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

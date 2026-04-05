import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface PathProps {
  hexes: string[];
  onChange: (hexes: string[]) => void;
}

export function Path({ hexes, onChange }: PathProps) {
  const [input, setInput] = useState('');

  const addHex = () => {
    const val = input.trim();
    if (!val) return;
    onChange([...hexes, val]);
    setInput('');
  };

  const removeHex = (index: number) => {
    const updated = hexes.filter((_, i) => i !== index);
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
        {hexes.map((hex, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-sm font-mono px-2 py-0.5 rounded"
          >
            {i > 0 && (
              <span className="text-emerald-400 dark:text-emerald-600 select-none mr-0.5">→</span>
            )}
            {hex}
            <button
              onClick={() => removeHex(i)}
              className="ml-1 text-emerald-500 dark:text-emerald-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              aria-label={`Remove hex ${hex}`}
            >
              <X size={12} />
            </button>
          </span>
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

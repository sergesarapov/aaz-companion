import React from 'react';

interface SurgeWarningsProps {
  filled: number;
  setFilled: (filled: number) => void;
}

export const SurgeWarnings: React.FC<SurgeWarningsProps> = ({ filled, setFilled }) => {
  const total = 12;

  const getFilledStyle = (index: number): string => {
    if (index < 4) return 'bg-green-500 border-green-600 text-white hover:bg-green-400';
    if (index < 8) return 'bg-yellow-500 border-yellow-600 text-white hover:bg-yellow-400';
    return 'bg-red-500 border-red-600 text-white hover:bg-red-400';
  };

  const handleClick = (index: number): void => {
    if (index + 1 === filled) {
      setFilled(filled - 1);
    } else {
      setFilled(index + 1);
    }
  };

  return (
    <div className="dark:bg-zinc-900 bg-gray-100/80 p-4 rounded mt-4 mb-4">
      <h2 className="text-lg font-bold mb-2 dark:text-white text-gray-800">
        Surge Warnings ({filled}/{total})
      </h2>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`w-10 h-10 rounded border-2 font-bold transition-colors ${
              i < filled
                ? getFilledStyle(i)
                : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

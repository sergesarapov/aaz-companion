import React, { useState, useEffect, useRef } from 'react';

export const DarkModeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Only persist after user interaction, not on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
    window.dispatchEvent(new Event('theme-change'));
  }, [isDarkMode]);

  const toggleDarkMode = (): void => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
    >
      <span className="mr-2 text-sm">
        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
      </span>
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
};

import { useNavigate } from 'react-router-dom';
import React, { useRef } from 'react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createNewZone = (): void => {
    const slug = Math.random().toString(36).substring(2, 10); // Generate a random slug
    navigate(`/zone/${slug}`);
  };

  const handleLoadZone = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const slugMatch = file.name.match(/^aaz-(.+?)-backup/);
    if (!slugMatch) {
      alert(
        'Could not determine zone slug from file name.\n' +
          'Please make sure the file is named like: aaz-<slug>-backup.json',
      );
      return;
    }
    const slug = slugMatch[1];

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          alert('Invalid file format.');
          return;
        }
        const data: Record<string, string> = JSON.parse(result);
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        navigate(`/zone/${slug}`);
      } catch {
        alert('Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={createNewZone}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
      >
        Enter a new zone
      </button>
      <label className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors">
        Load existing zone
        <input
          type="file"
          accept=".json"
          onChange={handleLoadZone}
          ref={fileInputRef}
          className="hidden"
        />
      </label>
    </div>
  );
};

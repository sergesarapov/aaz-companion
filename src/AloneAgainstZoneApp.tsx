import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OperativeCard } from './components/OperativeCard';
import HexGrid from './components/HexGrid';
import { SurgeWarnings } from './components/SurgeWarnings';
import { EncounterCard } from './components/EncounterCard';
import { LogEntry } from './components/LogEntry';
import { FloatingDice } from './components/FloatingDice';
import { DiceRoller } from './components/DiceRoller';
import { Path } from './components/Path';
import { ulid } from 'ulid';
import { Character, Encounter, LogEntryType, Position } from './types';
import { type HexGridState, INIT_COLS, INIT_ROWS } from './components/HexGrid';

const AdventureLogInput = memo(({ onAdd }: { onAdd: (text: string) => void }) => {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim() !== '') {
      onAdd(text);
      setText('');
    }
  };

  return (
    <div className="mb-4">
      <textarea
        className="dark:bg-gray-800 dark:text-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        rows={3}
        placeholder="Enter a new log entry..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleAdd}
      >
        Add Log Entry
      </button>
    </div>
  );
});

export const AloneAgainstZoneApp: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) throw new Error('Slug parameter is required');

  const savedOperativePosition = localStorage.getItem(`aaz-operative-position-${slug}`);
  const savedOperativeData = localStorage.getItem(`aaz-operative-${slug}`);
  const savedEncounters = localStorage.getItem(`aaz-encounters-${slug}`);
  const savedLogEntries = localStorage.getItem(`aaz-log-entries-${slug}`);
  const savedSurgeWarnings = localStorage.getItem(`aaz-surge-warnings-${slug}`);
  const savedHexGrid = localStorage.getItem(`aaz-hexgrid-${slug}`);
  const savedPath = localStorage.getItem(`aaz-path-${slug}`);

  const [operativePosition, setOperativePosition] = useState<Position | null>(
    savedOperativePosition ? JSON.parse(savedOperativePosition) : null,
  );
  const [operative, setOperative] = useState<Character>(
    savedOperativeData
      ? (() => {
          const char = JSON.parse(savedOperativeData) as Character;
          return {
            ...char,
            money: +char.money,
            attack: +char.attack,
            defense: +char.defense,
            fullLife: +char.fullLife,
            currentLife: +char.currentLife,
            fullRadResistance: +char.fullRadResistance,
            currentRadResistance: +char.currentRadResistance,
          };
        })()
      : {
          name: 'Operative',
          echo: 'Echo',
          money: 0,
          xp: 0,
          food: 0,
          attack: 0,
          defense: 0,
          fullLife: 0,
          currentLife: 0,
          fullRadResistance: 0,
          currentRadResistance: 0,
          equipment: [],
          skills: [],
          weapons: [],
          notes: '',
          id: ulid(),
          key: `aaz-operative-${slug}`,
        },
  );

  const [encounters, setEncounters] = useState<Encounter[]>(
    savedEncounters ? JSON.parse(savedEncounters) : [],
  );

  const [expandedEncounterIndex, setExpandedEncounterIndex] = useState<number | null>(null);

  const [logEntries, setLogEntries] = useState<LogEntryType[]>(
    savedLogEntries ? JSON.parse(savedLogEntries) : [],
  );

  const [surgeWarnings, setSurgeWarnings] = useState<number>(
    savedSurgeWarnings ? JSON.parse(savedSurgeWarnings) : 0,
  );
  const [pathHexes, setPathHexes] = useState<string[]>(
    savedPath ? JSON.parse(savedPath) : [],
  );

  const [hexState, setHexState] = useState<HexGridState>(() => {
    if (savedHexGrid) {
      const parsed = JSON.parse(savedHexGrid);
      return { cells: new Map(parsed.cells), cols: parsed.cols, rows: parsed.rows, westExpansions: parsed.westExpansions ?? 0 };
    }
    return { cells: new Map(), cols: INIT_COLS, rows: INIT_ROWS, westExpansions: 0 };
  });
  useEffect(() => {
    if (savedOperativeData) {
      const char = JSON.parse(savedOperativeData) as Character;
      setOperative({
        ...char,
        money: +char.money,
        attack: +char.attack,
        defense: +char.defense,
        fullLife: +char.fullLife,
        currentLife: +char.currentLife,
        fullRadResistance: +char.fullRadResistance,
        currentRadResistance: +char.currentRadResistance,
      });
    }
    if (savedEncounters) setEncounters(JSON.parse(savedEncounters));
    if (savedLogEntries) setLogEntries(JSON.parse(savedLogEntries));
    if (savedOperativePosition) setOperativePosition(JSON.parse(savedOperativePosition));
  }, [slug]);

  useEffect(() => {
    localStorage.setItem(`aaz-operative-${slug}`, JSON.stringify(operative));
  }, [operative, slug]);

  useEffect(() => {
    localStorage.setItem(`aaz-encounters-${slug}`, JSON.stringify(encounters));
  }, [encounters, slug]);

  useEffect(() => {
    localStorage.setItem(`aaz-log-entries-${slug}`, JSON.stringify(logEntries));
  }, [logEntries, slug]);

  useEffect(() => {
    localStorage.setItem(`aaz-operative-position-${slug}`, JSON.stringify(operativePosition));
  }, [operativePosition, slug]);

  useEffect(() => {
    localStorage.setItem(`aaz-surge-warnings-${slug}`, JSON.stringify(surgeWarnings));
  }, [surgeWarnings, slug]);

  useEffect(() => {
    localStorage.setItem(`aaz-path-${slug}`, JSON.stringify(pathHexes));
  }, [pathHexes, slug]);

  useEffect(() => {
    localStorage.setItem(`aaz-hexgrid-${slug}`, JSON.stringify({
      cells: Array.from(hexState.cells.entries()),
      cols: hexState.cols,
      rows: hexState.rows,
      westExpansions: hexState.westExpansions,
    }));
  }, [hexState, slug]);

  const addNewEncounter = (): void => {
    const nextNumber = encounters.length + 1;
    const newEncounter: Encounter = {
      name: `Encounter #${nextNumber}`,
      level: 1,
      count: 1,
      attacksPerRound: 1,
      notes: '',
    };
    const updated = [...encounters, newEncounter];
    setEncounters(updated);
    setExpandedEncounterIndex(updated.length - 1);
  };

  const addLogEntry = useCallback((text: string): void => {
    const newEntry: LogEntryType = {
      id: Date.now(),
      text,
      timestamp: new Date().toISOString(),
    };
    setLogEntries((prevEntries) => [newEntry, ...prevEntries]);
  }, []);

  const updateLogEntry = useCallback((updatedEntry: LogEntryType): void => {
    setLogEntries((prevEntries) =>
      prevEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)),
    );
  }, []);

  const deleteLogEntry = useCallback((id: number): void => {
    setLogEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
  }, []);

  const handleOperativePosition = useCallback((pos: Position): void => {
    setOperativePosition(pos);
  }, []);

  const handleSetOperative = useCallback((newOperative: Character) => {
    setOperative({
      ...newOperative,
      id: newOperative.id ? newOperative.id : ulid(),
      key: newOperative.key ? newOperative.key : `aaz-operative-${slug}`,
    });
  }, [slug]);

  const navigate = useNavigate();

  return (
    <>
      <p className="mb-4">
        Bookmark this address to return to your zone later:{' '}
        <code>
          /zone/<b>{slug}</b>
        </code>
      </p>
      <p className="mb-4">
        You can also save your progress to a file and load it later - even on another browser.
      </p>
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
          onClick={() => navigate('/')}
        >
          Home
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          onClick={() => {
            const keys = Object.keys(localStorage).filter((key) => key.includes(slug));
            const data: Record<string, string | null> = {};
            keys.forEach((key) => {
              data[key] = localStorage.getItem(key);
            });
            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `aaz-${slug}-backup.json`;
            link.click();
          }}
        >
          Save Progress
        </button>
      </div>
      <div className="dark:bg-zinc-900 bg-gray-100/80  p-4 space-y-2 rounded">
        <h2 className="text-lg font-bold mb-4 dark:text-white text-gray-800">Zone Exploration</h2>
        <DiceRoller title="Exploration (2d6)" d="2d6" />
        <DiceRoller title="Terrain and feature (d6)" d="d6" />
        <DiceRoller title="Encounter / Items table (d6)" d="d6" />
        <DiceRoller title="Encounter / Items type (d66)" d="d66" />
        <DiceRoller title="Encounter / Items type (d6)" d="d6" />
        <DiceRoller title="Encounter / Items type (2d6)" d="2d6" />
      </div>
      <SurgeWarnings filled={surgeWarnings} setFilled={setSurgeWarnings} />
      <HexGrid
        hexState={hexState} setHexState={setHexState}
        position={operativePosition} onPositionUpdate={handleOperativePosition}
      />
      <h2 className="text-xl font-bold mt-6 mb-2">Path</h2>
      <Path hexes={pathHexes} onChange={setPathHexes} />
      <h2 className="text-xl font-bold mt-6 mb-2">Operative</h2>
      <OperativeCard
        key={operative.id}
        operative={operative}
        setOperative={handleSetOperative}
      />
      <h2 className="text-xl font-bold mt-6 mb-2">Encounters</h2>
      <div>
        <button
          className="mb-4 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
          onClick={addNewEncounter}
        >
          + New Encounter
        </button>
      </div>
      <div className="flex flex-col-reverse">
        {encounters.map((encounter, index) => (
          <EncounterCard
            key={index}
            counter={index + 1}
            encounter={encounter}
            isExpanded={expandedEncounterIndex === index}
            onExpand={() => setExpandedEncounterIndex((prev) => (prev === index ? null : index))}
            setEncounter={(newEncounter: Encounter) => {
              const updated = [...encounters];
              updated[index] = newEncounter;
              setEncounters(updated);
            }}
          />
        ))}
      </div>
      <h2 className="text-xl font-bold mt-6 mb-2">Adventure Log</h2>
      <AdventureLogInput onAdd={addLogEntry} />
      <div>
        {logEntries.map((entry) => (
          <LogEntry
            key={entry.id}
            entry={entry}
            updateEntry={updateLogEntry}
            deleteEntry={deleteLogEntry}
          />
        ))}
      </div>
      <FloatingDice />
    </>
  );
};

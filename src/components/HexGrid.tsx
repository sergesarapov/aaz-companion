import { useState, useCallback, useRef, useLayoutEffect, useEffect, type ReactNode } from 'react';
import {
  Route,
  TrainFront,
  Zap,
  Milestone,
  Waves,
  Droplets,
  TreePine,
  Moon,
  Ban,
  Factory,
  Lock,
  Shield,
  Landmark,
  Pickaxe,
  Building2,
  Atom,
  Plane,
  Car,
  House,
  Tent,
  ShieldCheck,
  Package,
  Skull,
  Bomb,
  Radiation,
  Crosshair,
  Footprints,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { FaHelicopter } from 'react-icons/fa';

// --- Types ---

interface Terrain {
  id: string;
  name: string;
  fill: string;
  stroke: string;
}

interface Feature {
  id: string;
  name: string;
}

export interface HexCell {
  terrain: number; // index into TERRAINS
  features: number[]; // indices into FEATURES

  label: string;
  sectorNumber?: string;
  notes?: string;
  scavengeAttempts?: number;
  echoSectors?: number;
}

export interface HexGridState {
  cells: Map<string, HexCell>;
  cols: number;
  rows: number;
  westExpansions: number;
}

type ToolId = 'position' | 'erase' | 'select';

interface Tool {
  id: ToolId;
  label: string;
}

interface ScrollOffset {
  dx: number;
  dy: number;
}

// --- Theme Hook ---

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return document.documentElement.classList.contains('dark');
  });
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('theme-change', sync);
    return () => window.removeEventListener('theme-change', sync);
  }, []);
  return isDark;
}

// --- Constants ---

const S = 36;
const R3 = Math.sqrt(3);
const COL_W = S * 1.5;
const ROW_H = S * R3;

export const INIT_COLS = 17;
export const INIT_ROWS = 7;

// Base terrains - dark mode
const DARK_TERRAINS: Terrain[] = [
  { id: 'unknown', name: 'Unknown', fill: '#0a0d0a', stroke: '#1a1f1a' },
  { id: 'road', name: 'Road', fill: '#3a3530', stroke: '#252220' },
  { id: 'railway', name: 'Railway', fill: '#2a2520', stroke: '#1a1510' },
  { id: 'powerline', name: 'Power Line', fill: '#2a3a30', stroke: '#1a2520' },
  { id: 'bridge', name: 'Bridge', fill: '#3a3a2a', stroke: '#252520' },
  { id: 'marsh', name: 'Marsh', fill: '#2a3628', stroke: '#1a241a' },
  { id: 'lake', name: 'Lake', fill: '#1a3040', stroke: '#0e2030' },
  { id: 'woods', name: 'Woods', fill: '#1e3320', stroke: '#0f1f12' },
  { id: 'lunar', name: 'Lunar Wasteland', fill: '#2a2828', stroke: '#1a1818' },
  { id: 'impassable', name: 'Impassable', fill: '#1a1a1a', stroke: '#3a0000' },
  { id: 'industrial', name: 'Industrial Structure', fill: '#2a2a30', stroke: '#1a1a20' },
  { id: 'classified', name: 'Classified Facility', fill: '#1a2030', stroke: '#0e1420' },
  { id: 'military', name: 'Military Installation', fill: '#2a3020', stroke: '#1a2010' },
  { id: 'village', name: 'Village', fill: '#3a3028', stroke: '#2a2018' },
  { id: 'underground', name: 'Underground Structure', fill: '#20202a', stroke: '#10101a' },
  { id: 'building', name: 'Other Building', fill: '#30302a', stroke: '#20201a' },
  { id: 'anomaly', name: 'Anomaly', fill: '#2a1a30', stroke: '#1a0a20' },
  { id: 'plane', name: 'Plane', fill: '#2a2a2a', stroke: '#1a1a1a' },
  { id: 'helicopter', name: 'Helicopter', fill: '#2a2a2a', stroke: '#1a1a1a' },
  { id: 'car', name: 'Car', fill: '#2a2a2a', stroke: '#1a1a1a' },
];

// Base terrains - light mode
const LIGHT_TERRAINS: Terrain[] = [
  { id: 'unknown', name: 'Unknown', fill: '#d0d4d0', stroke: '#a8b0a8' },
  { id: 'road', name: 'Road', fill: '#c8b898', stroke: '#9a8870' },
  { id: 'railway', name: 'Railway', fill: '#b8b0a0', stroke: '#887860' },
  { id: 'powerline', name: 'Power Line', fill: '#b0c8b8', stroke: '#88a090' },
  { id: 'bridge', name: 'Bridge', fill: '#c8c8b0', stroke: '#a0a088' },
  { id: 'marsh', name: 'Marsh', fill: '#9ab88a', stroke: '#78a068' },
  { id: 'lake', name: 'Lake', fill: '#7ab0d0', stroke: '#5888a8' },
  { id: 'woods', name: 'Woods', fill: '#6a9a60', stroke: '#4a7840' },
  { id: 'lunar', name: 'Lunar Wasteland', fill: '#b0a8a8', stroke: '#887880' },
  { id: 'impassable', name: 'Impassable', fill: '#888888', stroke: '#b00000' },
  { id: 'industrial', name: 'Industrial Structure', fill: '#a0a0b0', stroke: '#787888' },
  { id: 'classified', name: 'Classified Facility', fill: '#8898b0', stroke: '#607088' },
  { id: 'military', name: 'Military Installation', fill: '#a0b088', stroke: '#788860' },
  { id: 'village', name: 'Village', fill: '#c8b898', stroke: '#a09070' },
  { id: 'underground', name: 'Underground Structure', fill: '#9898a8', stroke: '#707080' },
  { id: 'building', name: 'Other Building', fill: '#b0b0a0', stroke: '#888878' },
  { id: 'anomaly', name: 'Anomaly', fill: '#b898c0', stroke: '#907098' },
  { id: 'plane', name: 'Plane', fill: '#a8a8a8', stroke: '#808080' },
  { id: 'helicopter', name: 'Helicopter', fill: '#a8a8a8', stroke: '#808080' },
  { id: 'car', name: 'Car', fill: '#a8a8a8', stroke: '#808080' },
];

// Point of interest / structure features that can overlay
const FEATURES: Feature[] = [
  { id: 'safehouse', name: 'Safehouse' },
  { id: 'camp', name: 'Stalkers Camp' },
  { id: 'refuge', name: 'Refuge' },
  { id: 'cache', name: 'Hidden Cache' },
  { id: 'foes', name: 'Foes' },
  { id: 'minefield', name: 'Minefield' },
  { id: 'toxic', name: 'Toxic Area' },
  { id: 'military_zone', name: 'Military Zone' },
  { id: 'hidden_path', name: 'Hidden Path' },
];

const ICON_S = 22;

function lucideIcon(Icon: LucideIcon, size = ICON_S): ReactNode {
  const half = size / 2;
  return <Icon size={size} x={-half} y={-half} />;
}

function faIcon(
  Icon: React.ComponentType<React.SVGAttributes<SVGElement> & { size?: number }>,
  size = ICON_S,
): ReactNode {
  const half = size / 2;
  return <Icon size={size} x={-half} y={-half} />;
}

const TERRAIN_ICONS: Record<string, ReactNode> = {
  road: lucideIcon(Route),
  railway: lucideIcon(TrainFront),
  powerline: lucideIcon(Zap),
  bridge: lucideIcon(Milestone),
  marsh: lucideIcon(Waves),
  lake: lucideIcon(Droplets),
  woods: lucideIcon(TreePine),
  lunar: lucideIcon(Moon),
  impassable: lucideIcon(Ban),
  industrial: lucideIcon(Factory),
  classified: lucideIcon(Lock),
  military: lucideIcon(Shield),
  village: lucideIcon(Landmark),
  underground: lucideIcon(Pickaxe),
  building: lucideIcon(Building2),
  anomaly: lucideIcon(Atom),
  plane: lucideIcon(Plane),
  helicopter: faIcon(FaHelicopter),
  car: lucideIcon(Car),
};

const FEATURE_ICONS: Record<string, ReactNode> = {
  safehouse: lucideIcon(House, 16),
  camp: lucideIcon(Tent, 16),
  refuge: lucideIcon(ShieldCheck, 16),
  cache: lucideIcon(Package, 16),
  foes: lucideIcon(Skull, 16),
  minefield: lucideIcon(Bomb, 16),
  toxic: lucideIcon(Radiation, 16),
  military_zone: lucideIcon(Crosshair, 16),
  hidden_path: lucideIcon(Footprints, 16),
};

// --- Geometry helpers ---

function hexCenter(col: number, row: number, westExpansions: number = 0): [number, number] {
  const adjustedCol = col + (westExpansions % 2);
  return [S + col * COL_W, S * R3 * 0.5 + row * ROW_H + (adjustedCol % 2 ? ROW_H * 0.5 : 0)];
}

function hexPoints(cx: number, cy: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(cx + S * Math.cos(a)).toFixed(1)},${(cy + S * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

const cellKey = (c: number, r: number): string => `${c},${r}`;
const EMPTY_CELL: HexCell = {
  terrain: 0,
  features: [],
  label: '',
  scavengeAttempts: 0,
  echoSectors: 0,
};

const initCells = (): Map<string, HexCell> => new Map();

const TOOLS: Tool[] = [
  { id: 'select', label: 'Select' },
  { id: 'position', label: 'Position' },
  { id: 'erase', label: 'Erase' },
];

const TOOL_HINTS: Record<ToolId, string> = {
  select: 'Click to view and edit hex properties',
  position: 'Click to set your position',
  erase: 'Click or drag to erase hexes',
};

// --- Expand button ---

interface ExpandBtnProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

function ExpandBtn({ onClick, children, className = '' }: ExpandBtnProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center justify-center gap-1',
        'text-xs font-medium text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-900 border border-dashed border-gray-300 dark:border-zinc-700',
        'hover:bg-emerald-950 hover:border-emerald-700 hover:text-emerald-400',
        'active:scale-95 transition-all cursor-pointer select-none',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// --- Hex Property Modal ---

interface HexModalProps {
  isOpen: boolean;
  col: number;
  row: number;
  cell: HexCell;
  onClose: () => void;
  onUpdate: (cell: HexCell) => void;
  terrains: Terrain[];
}

function HexModal({ isOpen, col, row, cell, onClose, onUpdate, terrains }: HexModalProps) {
  const [terrain, setTerrain] = useState<number>(cell.terrain);
  const [features, setFeatures] = useState<number[]>(cell.features);
  const [label, setLabel] = useState<string>(cell.label);
  const [notes, setNotes] = useState<string>(cell.notes || '');
  const [scavengeAttempts, setScavengeAttempts] = useState<string>(
    String(cell.scavengeAttempts || ''),
  );
  const [echoSectors, setEchoSectors] = useState<string>(String(cell.echoSectors || ''));
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!featuresOpen) return;
    const handler = (e: MouseEvent) => {
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [featuresOpen]);

  // Sync state with cell prop when modal opens
  useLayoutEffect(() => {
    if (isOpen) {
      setTerrain(cell.terrain);
      setFeatures(cell.features);
      setLabel(cell.label);
      setNotes(cell.notes || '');
      setScavengeAttempts(String(cell.scavengeAttempts || ''));
      setEchoSectors(String(cell.echoSectors || ''));
    }
  }, [isOpen, cell]);

  const handleSave = () => {
    onUpdate({
      ...cell,
      terrain,
      features,
      label,
      notes,
      scavengeAttempts: +scavengeAttempts || 0,
      echoSectors: +echoSectors || 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-emerald-400 mb-4">
          Hex Properties ({col},{row})
        </h2>

        {/* Terrain */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Terrain</label>
          <select
            value={terrain}
            onChange={(e) => setTerrain(parseInt(e.target.value))}
            className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-100 text-sm rounded px-2 py-1"
          >
            {terrains.map((t, i) => (
              <option key={i} value={i}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Features */}
        <div className="mb-4" ref={featuresRef}>
          <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Features</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFeaturesOpen((o) => !o)}
              className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-100 text-sm rounded px-2 py-1 text-left flex items-center justify-between"
            >
              <span className="truncate">
                {features.length === 0 ? 'None' : features.map((i) => FEATURES[i].name).join(', ')}
              </span>
              <ChevronDown className="w-4 h-4 shrink-0 ml-1" />
            </button>
            {featuresOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded shadow-lg max-h-48 overflow-y-auto">
                {FEATURES.map((f, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={features.includes(i)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFeatures([...features, i]);
                        } else {
                          setFeatures(features.filter((fIdx) => fIdx !== i));
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {f.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Label */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Number</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-100 text-sm rounded px-2 py-1"
            placeholder="Hex number"
          />
        </div>

        {/* Echo Sector */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Echo Sector</label>
          <input
            type="number"
            min="0"
            value={echoSectors}
            onChange={(e) => setEchoSectors(e.target.value)}
            placeholder="0"
            className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-100 text-sm rounded px-2 py-1"
          />
        </div>

        {/* Scavenge Attempts */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">
            Scavenge Attempts
          </label>
          <input
            type="number"
            min="0"
            value={scavengeAttempts}
            onChange={(e) => setScavengeAttempts(e.target.value)}
            className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-100 text-sm rounded px-2 py-1"
            placeholder="0"
          />
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-100 text-sm rounded px-2 py-1 h-20 resize-none"
            placeholder="Additional notes"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-zinc-800 border border-gray-400 dark:border-zinc-600 text-gray-600 dark:text-zinc-300 rounded hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-emerald-950 border border-emerald-700 text-emerald-300 rounded hover:bg-emerald-900 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export interface HexGridProps {
  hexState: HexGridState;
  setHexState: React.Dispatch<React.SetStateAction<HexGridState>>;
  position?: { row: number; col: number } | null;
  onPositionUpdate?: (pos: { row: number; col: number }) => void;
}

// --- Main component ---

export default function HexGrid({
  hexState,
  setHexState,
  position,
  onPositionUpdate,
}: HexGridProps) {
  const isDark = useDarkMode();
  const TERRAINS = isDark ? DARK_TERRAINS : LIGHT_TERRAINS;

  const { cells, cols, rows, westExpansions } = hexState;
  const setCells = (updater: React.SetStateAction<Map<string, HexCell>>) =>
    setHexState((prev) => ({
      ...prev,
      cells: typeof updater === 'function' ? updater(prev.cells) : updater,
    }));
  const setCols = (updater: number | ((prev: number) => number)) =>
    setHexState((prev) => ({
      ...prev,
      cols: typeof updater === 'function' ? updater(prev.cols) : updater,
    }));
  const setRows = (updater: number | ((prev: number) => number)) =>
    setHexState((prev) => ({
      ...prev,
      rows: typeof updater === 'function' ? updater(prev.rows) : updater,
    }));
  const setWestExpansions = (updater: number | ((prev: number) => number)) =>
    setHexState((prev) => ({
      ...prev,
      westExpansions: typeof updater === 'function' ? updater(prev.westExpansions) : updater,
    }));
  const [tool, setTool] = useState<ToolId>('select');
  const [hovered, setHovered] = useState<[number, number] | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [showHexModal, setShowHexModal] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef<ScrollOffset | null>(null);

  // Touch interaction refs
  const touchStartRef = useRef<{ col: number; row: number; x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ col: number; row: number; time: number } | null>(null);
  const touchHandledRef = useRef(false);

  useLayoutEffect(() => {
    if (pendingScroll.current && scrollRef.current) {
      scrollRef.current.scrollLeft += pendingScroll.current.dx;
      scrollRef.current.scrollTop += pendingScroll.current.dy;
      pendingScroll.current = null;
    }
  });

  const getCell = (c: number, r: number): HexCell => cells.get(cellKey(c, r)) ?? EMPTY_CELL;

  const applyTool = useCallback(
    (col: number, row: number) => {
      const k = cellKey(col, row);
      setCells((prev) => {
        const next = new Map(prev);
        if (tool === 'erase') {
          next.delete(k);
        }
        return next;
      });
    },
    [tool],
  );

  function handleHexDown(col: number, row: number) {
    if (tool === 'select') {
      setSelectedCell([col, row]);
      setShowHexModal(true);
    } else if (tool === 'position') {
      onPositionUpdate?.({ row, col });
    } else {
      applyTool(col, row);
    }
  }

  function handleHexEnter(col: number, row: number) {
    setHovered([col, row]);
  }

  function handleTouchStart(col: number, row: number, e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStartRef.current = { col, row, x: touch.clientX, y: touch.clientY };

    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null;
      touchStartRef.current = null;
      touchHandledRef.current = true;
      handleHexDown(col, row);
    }, 500);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      touchStartRef.current = null;
    }
  }

  function handleTouchEnd(col: number, row: number, e: React.TouchEvent) {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) return;
    touchStartRef.current = null;

    e.preventDefault(); // prevent subsequent mouse events

    const now = Date.now();
    const last = lastTapRef.current;

    if (last && last.col === col && last.row === row && now - last.time < 300) {
      // Double tap → invoke tool action
      lastTapRef.current = null;
      touchHandledRef.current = true;
      handleHexDown(col, row);
    } else {
      // Single tap → hover effect only
      lastTapRef.current = { col, row, time: now };
      touchHandledRef.current = true;
      setHovered([col, row]);
    }
  }

  function expandEast() {
    setCols((c) => c + 1);
  }

  function expandWest() {
    setCells((prev) => {
      const next = new Map<string, HexCell>();
      for (const [key, val] of prev) {
        const [c, r] = key.split(',').map(Number);
        next.set(cellKey(c + 1, r), val);
      }
      return next;
    });
    setCols((c) => c + 1);
    setWestExpansions((w) => w + 1);
    if (hovered) setHovered([hovered[0] + 1, hovered[1]]);
    if (position) onPositionUpdate?.({ col: position.col + 1, row: position.row });
    pendingScroll.current = { dx: Math.round(COL_W), dy: 0 };
  }

  function expandNorth() {
    setCells((prev) => {
      const next = new Map<string, HexCell>();
      for (const [key, val] of prev) {
        const [c, r] = key.split(',').map(Number);
        next.set(cellKey(c, r + 1), val);
      }
      return next;
    });
    setRows((r) => r + 1);
    if (hovered) setHovered([hovered[0], hovered[1] + 1]);
    if (position) onPositionUpdate?.({ col: position.col, row: position.row + 1 });
    pendingScroll.current = { dx: 0, dy: Math.round(ROW_H) };
  }

  function expandSouth() {
    setRows((r) => r + 1);
  }

  const svgW = COL_W * cols + S * 0.5 + 4;
  const svgH = ROW_H * rows + ROW_H * 0.5 + 4;

  const hCell = hovered ? getCell(hovered[0], hovered[1]) : null;
  const hTerrain = hCell ? TERRAINS[hCell.terrain] : null;

  return (
    <div
      className="flex flex-col font-sans bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded overflow-hidden"
      style={{ height: 600 }}
      onMouseLeave={() => {
        setHovered(null);
      }}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-zinc-800 flex-wrap bg-gray-100/80 dark:bg-zinc-900/80 shrink-0">
        <div className="flex gap-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={[
                'px-3 py-1 text-xs rounded-md border cursor-pointer transition-colors',
                tool === t.id
                  ? 'bg-gray-200 dark:bg-zinc-800 border-gray-400 dark:border-zinc-600 text-gray-800 dark:text-zinc-200 font-medium shadow-sm'
                  : 'bg-transparent border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 hover:text-gray-600 dark:hover:text-zinc-300',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map layout */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* North expand */}
        <ExpandBtn
          onClick={expandNorth}
          className="w-full py-1.5 rounded-none border-x-0 border-t-0 border-b"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 9V3M3 6l3-3 3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Expand North
        </ExpandBtn>

        {/* Middle row: west | map | east */}
        <div className="flex flex-1 min-h-0">
          {/* West expand */}
          <ExpandBtn
            onClick={expandWest}
            className="shrink-0 border-y-0 border-l-0 border-r flex-col px-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M9 6H3M6 3l-3 3 3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Expand West
            </span>
          </ExpandBtn>

          {/* Scrollable map area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto min-w-0"
            style={{ scrollBehavior: 'auto' }}
          >
            <svg
              width={svgW}
              height={svgH}
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="block"
              style={{ cursor: 'pointer', display: 'block' }}
              onMouseLeave={() => setHovered(null)}
              onTouchMove={handleTouchMove}
            >
              <rect width={svgW} height={svgH} fill={isDark ? '#080a08' : '#eaeeea'} />

              {Array.from({ length: cols }, (_, c) =>
                Array.from({ length: rows }, (_, r) => {
                  const [cx, cy] = hexCenter(c, r, westExpansions);
                  const cell = getCell(c, r);
                  const terrain = TERRAINS[cell.terrain];
                  const isHov = hovered?.[0] === c && hovered?.[1] === r;
                  const isPosition = position?.col === c && position?.row === r;
                  const pts = hexPoints(cx, cy);
                  const icon = TERRAIN_ICONS[terrain.id];

                  return (
                    <g
                      key={`${c}-${r}`}
                      onMouseDown={() => {
                        if (touchHandledRef.current) {
                          touchHandledRef.current = false;
                          return;
                        }
                        handleHexDown(c, r);
                      }}
                      onMouseEnter={() => handleHexEnter(c, r)}
                      onTouchStart={(e) => handleTouchStart(c, r, e)}
                      onTouchEnd={(e) => handleTouchEnd(c, r, e)}
                    >
                      {/* Hex base */}
                      <polygon
                        points={pts}
                        fill={terrain.fill}
                        stroke={isHov ? '#34d399' : isDark ? '#4a5a4a' : terrain.stroke}
                        strokeWidth={isHov ? 2 : 0.8}
                      />

                      {/* Label text */}
                      {cell.label && (
                        <text
                          x={cx}
                          y={cy + S * 0.64}
                          textAnchor="middle"
                          fontSize={11}
                          fill="currentColor"
                          className="select-none pointer-events-none text-gray-800 dark:text-gray-100"
                        >
                          {cell.label}
                        </text>
                      )}

                      {/* Terrain icon */}
                      {cell.terrain > 0 && icon && (
                        <g
                          transform={`translate(${cx},${cy})`}
                          className="pointer-events-none text-gray-800 dark:text-gray-100"
                        >
                          {icon}
                        </g>
                      )}

                      {/* Hover highlight */}
                      {isHov && (
                        <polygon
                          points={pts}
                          fill="rgba(52,211,153,0.08)"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Features icons at top */}
                      {cell.features.length > 0 && (
                        <g
                          transform={`translate(${cx},${cy - S * 0.54})`}
                          className="pointer-events-none text-gray-800 dark:text-gray-100"
                        >
                          {cell.features.map((featureIdx) => {
                            const feature = FEATURES[featureIdx];
                            const icon = FEATURE_ICONS[feature.id];
                            return <g key={feature.id}>{icon}</g>;
                          })}
                        </g>
                      )}

                      {/* Character position indicator */}
                      {isPosition && (
                        <g className="pointer-events-none">
                          <circle
                            cx={cx}
                            cy={cy}
                            r={S * 0.35}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="2"
                          />
                          <circle cx={cx} cy={cy} r={S * 0.15} fill="#fbbf24" />
                        </g>
                      )}

                      {/* Scavenge attempts dots */}
                      {(cell.scavengeAttempts ?? 0) > 0 && (
                        <g className="pointer-events-none text-gray-800 dark:text-gray-100">
                          {Array.from({ length: cell.scavengeAttempts ?? 0 }).map((_, i) => {
                            const dotRadius = 2;
                            const spacing = 6;
                            const attempts = cell.scavengeAttempts ?? 0;
                            const totalHeight = (attempts - 1) * spacing;
                            const startY = cy - totalHeight / 2;
                            return (
                              <circle
                                key={`scavenge-${i}`}
                                cx={cx + S * 0.42}
                                cy={startY + i * spacing}
                                r={dotRadius}
                                fill="currentColor"
                                className="pointer-events-none"
                              />
                            );
                          })}
                        </g>
                      )}

                      {/* Echo sectors circle */}
                      {(cell.echoSectors ?? 0) > 0 && (
                        <g className="pointer-events-none text-gray-800 dark:text-gray-100">
                          <circle
                            cx={cx - S * 0.55}
                            cy={cy}
                            r={S * 0.22}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          />
                          <text
                            x={cx - S * 0.55}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={S * 0.22}
                            fill="currentColor"
                            fontWeight="bold"
                          >
                            {cell.echoSectors}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                }),
              )}
            </svg>
          </div>

          {/* East expand */}
          <ExpandBtn
            onClick={expandEast}
            className="shrink-0 border-y-0 border-r-0 border-l flex-col px-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 6h6M6 3l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ writingMode: 'vertical-rl' }}>Expand East</span>
          </ExpandBtn>
        </div>

        {/* South expand */}
        <ExpandBtn
          onClick={expandSouth}
          className="w-full py-1.5 rounded-none border-x-0 border-b-0 border-t"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 3V9M3 6l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Expand South
        </ExpandBtn>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-500 bg-gray-100/80 dark:bg-zinc-900/80 shrink-0 flex-wrap">
        {hovered ? (
          <>
            <span className="font-medium text-gray-700 dark:text-zinc-300 tabular-nums">
              {hovered[0]},{hovered[1]}
            </span>
            <span className="text-gray-600 dark:text-zinc-400">{hTerrain?.name}</span>
            {hCell?.features.length ? (
              <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                {hCell.features.map((f) => FEATURES[f].name).join(', ')}
              </span>
            ) : null}
            {hCell?.label && (
              <span className="text-emerald-600 dark:text-emerald-400 italic">{hCell.label}</span>
            )}
            {(hCell?.scavengeAttempts ?? 0) > 0 && hCell && (
              <span className="text-amber-600 dark:text-amber-400">
                {hCell.scavengeAttempts} scavenge{' '}
                {hCell.scavengeAttempts === 1 ? 'attempt' : 'attempts'}
              </span>
            )}
            {(hCell?.echoSectors ?? 0) > 0 && hCell && (
              <span className="text-indigo-600 dark:text-indigo-400">
                {hCell.echoSectors} echo {hCell.echoSectors === 1 ? 'sector' : 'sectors'}
              </span>
            )}
          </>
        ) : (
          <span className="italic">{TOOL_HINTS[tool]}</span>
        )}

        <span className="ml-auto tabular-nums text-gray-500 dark:text-zinc-500 shrink-0">
          {cols}&times;{rows}
        </span>

        <button
          onClick={() => {
            setCells(initCells());
            setCols(INIT_COLS);
            setRows(INIT_ROWS);
            setWestExpansions(0);
          }}
          className="px-2 py-0.5 text-xs text-gray-500 dark:text-zinc-500 border border-gray-300 dark:border-zinc-700 rounded hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 cursor-pointer transition-colors shrink-0"
        >
          Reset
        </button>
      </div>

      {/* Hex property modal */}
      {selectedCell && (
        <HexModal
          isOpen={showHexModal}
          col={selectedCell[0]}
          row={selectedCell[1]}
          cell={getCell(selectedCell[0], selectedCell[1])}
          onClose={() => setShowHexModal(false)}
          onUpdate={(updatedCell) => {
            const k = cellKey(selectedCell[0], selectedCell[1]);
            setCells((prev) => {
              const next = new Map(prev);
              next.set(k, updatedCell);
              return next;
            });
          }}
          terrains={TERRAINS}
        />
      )}
    </div>
  );
}

export interface Character {
  name: string;
  echo: string;
  money: number;
  xp: number;
  food: number;
  attack: number;
  defense: number;
  fullLife: number;
  currentLife: number;
  fullRadResistance: number;
  currentRadResistance: number;
  equipment: string[];
  skills: string[];
  weapons: {
    name: string;
    ammo: number;
    rusted: boolean;
  }[];
  notes: string;
  id: string;
  key: string;
  avatarUrl?: string;
}

export interface Encounter {
  name: string;
  level: number;
  count: number;
  attacksPerRound: number;
  notes: string;
}

export interface LogEntryType {
  id: number;
  text: string;
  timestamp: string;
}

export interface Position {
  row: number;
  col: number;
}

export interface PathHex {
  hex: string;
  foodConsumed: boolean;
}

export type DoorOrientation = 'top' | 'bottom' | 'left' | 'right';
export type TerrainValue = 'forest' | 'mountain' | 'water' | 'bridge';

export interface CellObject {
  door?: DoorOrientation | null;
  encounter?: number | null;
  terrain?: TerrainValue | null;
}

export type CellValue = boolean | CellObject;
export type Grid = CellValue[][];

export interface Room {
  width: number;
  height: number;
  cells: [number, number][];
}

export interface PlacedRoom {
  x: number;
  y: number;
  room: Room;
}

export interface LocalStorageValue {
  key: string;
  value: string;
}

export type DiceType = 'd6' | 'd66' | '2d6' | '3d6';

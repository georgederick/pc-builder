export type Category =
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'ssd'
  | 'hdd'
  | 'psu'
  | 'case'
  | 'cooler'
  | 'fan';

export interface CpuSpecs {
  socket: string;
  generation: string;
  cores: number;
  threads: number;
  coreLayout?: string;
  baseClock: number;
  boostClock: number;
  cache: number;
  tdp: number;
  maxPower: number;
  igpu: string | null;
  memoryTypes: string[];
  memorySpeed: Record<string, number>;
  includesCooler: boolean;
  biosChipsets?: string[];
}

export interface MotherboardSpecs {
  socket: string;
  chipset: string;
  formFactor: string;
  memoryType: string;
  memorySlots: number;
  maxMemory: number;
  m2Slots?: number;
  m2Gen?: number;
  sataPorts?: number;
  wifi: boolean;
}

export interface RamSpecs {
  type: string;
  capacity: number;
  modules: number;
  speed: number;
  latency: number;
}

export interface GpuSpecs {
  maker: string;
  chip: string;
  vram: number;
  vramType: string;
  length?: number;
  tdp: number;
  recommendedPsu: number;
  power8pin: number;
  power16pin: boolean;
  adapter8pin?: number;
}

export interface SsdSpecs {
  interface: string;
  gen?: number;
  formFactor: string;
  capacity: number;
  read: number;
  write: number;
}

export interface HddSpecs {
  capacity: number;
  rpm: number;
  cache: number;
  interface: string;
}

export interface PsuSpecs {
  wattage: number;
  efficiency: string;
  modular: string;
  pcie8pin?: number;
  pcie16pin: boolean;
}

export interface CaseSpecs {
  formFactors: string[];
  maxGpuLength?: number;
  maxCoolerHeight?: number;
  maxRadiator?: number;
  bays25?: number;
  bays35?: number;
  includedFans: number;
  fanSlots?: number;
  sidePanel: string;
}

export interface CoolerSpecs {
  type: 'air' | 'aio';
  sockets: string[];
  height?: number;
  radiator?: number;
  tdpRating?: number;
  fanSize: number;
}

export interface FanSpecs {
  size: number;
  minRpm: number;
  maxRpm: number;
  airflow: number;
  rgb: boolean;
  quantity: number;
}

export interface SpecsMap {
  cpu: CpuSpecs;
  motherboard: MotherboardSpecs;
  ram: RamSpecs;
  gpu: GpuSpecs;
  ssd: SsdSpecs;
  hdd: HddSpecs;
  psu: PsuSpecs;
  case: CaseSpecs;
  cooler: CoolerSpecs;
  fan: FanSpecs;
}

export interface BasePart<C extends Category> {
  id: string;
  category: C;
  brand: string;
  model: string;
  name: string;
  price: number;
  description: string;
  specs: SpecsMap[C];
}

export type Part<C extends Category = Category> = C extends Category ? BasePart<C> : never;

export interface SelectedItem {
  id: string;
  qty: number;
}

export type Selection = Partial<Record<Category, SelectedItem>>;

export interface SavedBuild {
  id: string;
  name: string;
  items: Selection;
  createdAt: number;
  updatedAt: number;
}

export type Status = 'ok' | 'warn' | 'error' | 'unknown';

export interface Check {
  id: string;
  title: string;
  status: Status;
  message: string;
  fix?: string;
  parts: Category[];
}

export type Overall = 'empty' | Status;

export interface Evaluation {
  checks: Check[];
  missing: Category[];
  overall: Overall;
  counts: Record<Status, number>;
}

export interface PowerEstimate {
  total: number;
  recommended: number;
  breakdown: { key: string; label: string; watts: number }[];
}

export interface ReadyBuild {
  id: string;
  tier: string;
  name: string;
  purpose: string;
  targets: string[];
  items: Partial<Record<Category, string | [string, number]>>;
}

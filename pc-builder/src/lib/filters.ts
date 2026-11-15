import { formatCapacity } from './format';
import { specRows } from './specs';
import type { Category, Part } from './types';

export interface Facet {
  key: string;
  label: string;
  values: (part: Part) => string[];
}

export interface SortOption {
  key: string;
  label: string;
  compare: (a: Part, b: Part) => number;
}

const f = (key: string, label: string, values: (part: Part) => (string | number)[]): Facet => ({
  key,
  label,
  values: (p) => values(p).map(String),
});

export const FACETS: Record<Category, Facet[]> = {
  cpu: [
    f('socket', 'Socket', (p) => (p.category === 'cpu' ? [p.specs.socket] : [])),
    f('memory', 'Tipo de memória', (p) => (p.category === 'cpu' ? p.specs.memoryTypes : [])),
    f('cores', 'Núcleos', (p) => (p.category === 'cpu' ? [`${p.specs.cores} núcleos`] : [])),
  ],
  motherboard: [
    f('socket', 'Socket', (p) => (p.category === 'motherboard' ? [p.specs.socket] : [])),
    f('memory', 'Tipo de memória', (p) => (p.category === 'motherboard' ? [p.specs.memoryType] : [])),
    f('form', 'Formato', (p) => (p.category === 'motherboard' ? [p.specs.formFactor] : [])),
    f('chipset', 'Chipset', (p) => (p.category === 'motherboard' ? [p.specs.chipset] : [])),
  ],
  ram: [
    f('type', 'Tipo de memória', (p) => (p.category === 'ram' ? [p.specs.type] : [])),
    f('cap', 'Capacidade', (p) => (p.category === 'ram' ? [`${p.specs.capacity} GB`] : [])),
    f('speed', 'Frequência', (p) => (p.category === 'ram' ? [`${p.specs.speed} MT/s`] : [])),
  ],
  gpu: [
    f('maker', 'Fabricante do chip', (p) => (p.category === 'gpu' ? [p.specs.maker] : [])),
    f('vram', 'VRAM', (p) => (p.category === 'gpu' ? [`${p.specs.vram} GB`] : [])),
  ],
  ssd: [
    f('iface', 'Interface', (p) => (p.category === 'ssd' ? [p.specs.interface] : [])),
    f('cap', 'Capacidade', (p) => (p.category === 'ssd' ? [formatCapacity(p.specs.capacity)] : [])),
  ],
  hdd: [f('cap', 'Capacidade', (p) => (p.category === 'hdd' ? [formatCapacity(p.specs.capacity)] : []))],
  psu: [
    f('watts', 'Potência', (p) => (p.category === 'psu' ? [`${p.specs.wattage} W`] : [])),
    f('eff', 'Certificação', (p) => (p.category === 'psu' ? [p.specs.efficiency] : [])),
  ],
  case: [f('form', 'Formato suportado', (p) => (p.category === 'case' ? p.specs.formFactors : []))],
  cooler: [
    f('type', 'Tipo', (p) => (p.category === 'cooler' ? [p.specs.type === 'aio' ? 'Water cooler' : 'Air cooler'] : [])),
    f('socket', 'Socket', (p) => (p.category === 'cooler' ? p.specs.sockets : [])),
  ],
  fan: [f('size', 'Tamanho', (p) => (p.category === 'fan' ? [`${p.specs.size} mm`] : []))],
};

const numeric = (part: Part, key: string): number => {
  const row = specRows(part).find((r) => r.key === key);
  return typeof row?.raw === 'number' ? row.raw : Number.NEGATIVE_INFINITY;
};

export function sortOptions(category: Category, sample: Part | undefined): SortOption[] {
  const base: SortOption[] = [
    { key: 'price-asc', label: 'Menor preço', compare: (a, b) => a.price - b.price },
    { key: 'price-desc', label: 'Maior preço', compare: (a, b) => b.price - a.price },
    { key: 'name', label: 'Nome (A-Z)', compare: (a, b) => a.name.localeCompare(b.name, 'pt-BR') },
  ];
  if (!sample || sample.category !== category) return base;
  const extra = specRows(sample)
    .filter((r) => typeof r.raw === 'number' && r.better)
    .map<SortOption>((r) => ({
      key: `spec-${r.key}`,
      label: `${r.label} (${r.better === 'low' ? 'menor' : 'maior'} primeiro)`,
      compare: (a, b) => (r.better === 'low' ? numeric(a, r.key) - numeric(b, r.key) : numeric(b, r.key) - numeric(a, r.key)),
    }));
  return [...base, ...extra];
}

export interface FilterState {
  query: string;
  brands: string[];
  min: number | null;
  max: number | null;
  facets: Record<string, string[]>;
  sort: string;
  onlyCompatible: boolean;
}

export const emptyFilters = (): FilterState => ({ query: '', brands: [], min: null, max: null, facets: {}, sort: 'price-asc', onlyCompatible: false });

export function applyFilters(parts: Part[], filters: FilterState, category: Category): Part[] {
  const q = filters.query.trim().toLowerCase();
  const facets = FACETS[category];
  const filtered = parts.filter((p) => {
    if (q && !`${p.name} ${p.brand} ${p.model} ${p.description}`.toLowerCase().includes(q)) return false;
    if (filters.brands.length > 0 && !filters.brands.includes(p.brand)) return false;
    if (filters.min !== null && p.price < filters.min) return false;
    if (filters.max !== null && p.price > filters.max) return false;
    return facets.every((facet) => {
      const chosen = filters.facets[facet.key];
      if (!chosen || chosen.length === 0) return true;
      return facet.values(p).some((v) => chosen.includes(v));
    });
  });
  const sorter = sortOptions(category, parts[0]).find((s) => s.key === filters.sort) ?? sortOptions(category, parts[0])[0];
  return [...filtered].sort(sorter.compare);
}

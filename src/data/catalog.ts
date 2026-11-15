import componentsJson from './components.json';
import buildsJson from './builds.json';
import type { Category, Part, ReadyBuild } from '@/lib/types';

export const PARTS = componentsJson as unknown as Part[];
export const READY_BUILDS = buildsJson as unknown as ReadyBuild[];

export const PARTS_BY_ID: Map<string, Part> = new Map(PARTS.map((p) => [p.id, p]));

export const partsOf = (category: Category): Part[] => PARTS.filter((p) => p.category === category);

export const BRANDS = Array.from(new Set(PARTS.map((p) => p.brand))).sort();

import { PARTS_BY_ID } from '@/data/catalog';
import type { Category, Part, PowerEstimate, Selection } from './types';

export function pick<C extends Category>(sel: Selection, category: C): { part: Part<C>; qty: number } | undefined {
  const item = sel[category];
  if (!item) return undefined;
  const part = PARTS_BY_ID.get(item.id);
  if (!part || part.category !== category) return undefined;
  return { part: part as Part<C>, qty: item.qty };
}

export function estimatePower(sel: Selection): PowerEstimate {
  const breakdown: PowerEstimate['breakdown'] = [];
  const cpu = pick(sel, 'cpu');
  const gpu = pick(sel, 'gpu');
  const board = pick(sel, 'motherboard');
  const ram = pick(sel, 'ram');
  const ssd = pick(sel, 'ssd');
  const hdd = pick(sel, 'hdd');
  const cooler = pick(sel, 'cooler');
  const fan = pick(sel, 'fan');

  if (cpu) breakdown.push({ key: 'cpu', label: 'Processador (pico)', watts: cpu.part.specs.maxPower });
  if (gpu) breakdown.push({ key: 'gpu', label: 'Placa de vídeo', watts: gpu.part.specs.tdp });
  if (board) breakdown.push({ key: 'motherboard', label: 'Placa-mãe e chipset', watts: 45 });
  if (ram) breakdown.push({ key: 'ram', label: 'Memória RAM', watts: 5 * ram.part.specs.modules * ram.qty });
  if (ssd) breakdown.push({ key: 'ssd', label: 'SSDs', watts: 5 * ssd.qty });
  if (hdd) breakdown.push({ key: 'hdd', label: 'HDDs', watts: 8 * hdd.qty });
  if (cooler) breakdown.push({ key: 'cooler', label: 'Cooler', watts: cooler.part.specs.type === 'aio' ? 15 : 5 });
  if (fan) breakdown.push({ key: 'fan', label: 'Ventoinhas', watts: Math.round(3 * fan.part.specs.quantity * fan.qty) });

  const total = breakdown.reduce((sum, b) => sum + b.watts, 0);
  const headroom = Math.ceil((total * 1.25) / 50) * 50;
  const recommended = total === 0 ? 0 : Math.max(headroom, gpu?.part.specs.recommendedPsu ?? 0);
  return { total, recommended, breakdown };
}

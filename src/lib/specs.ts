import { formatCapacity, formatNum } from './format';
import type { Category, Part } from './types';

export interface SpecRow {
  key: string;
  label: string;
  value: string;
  raw?: number | string | boolean | null;
  better?: 'high' | 'low';
}

const yes = (v: boolean) => (v ? 'Sim' : 'Não');

export function specRows(part: Part): SpecRow[] {
  switch (part.category) {
    case 'cpu': {
      const s = part.specs;
      return [
        { key: 'socket', label: 'Socket', value: s.socket, raw: s.socket },
        { key: 'generation', label: 'Geração', value: s.generation, raw: s.generation },
        { key: 'cores', label: 'Núcleos', value: s.coreLayout ? `${s.cores} (${s.coreLayout})` : `${s.cores}`, raw: s.cores, better: 'high' },
        { key: 'threads', label: 'Threads', value: `${s.threads}`, raw: s.threads, better: 'high' },
        { key: 'base', label: 'Clock base', value: `${formatNum(s.baseClock)} GHz`, raw: s.baseClock, better: 'high' },
        { key: 'boost', label: 'Clock máximo', value: `${formatNum(s.boostClock)} GHz`, raw: s.boostClock, better: 'high' },
        { key: 'cache', label: 'Cache L3', value: `${s.cache} MB`, raw: s.cache, better: 'high' },
        { key: 'tdp', label: 'TDP base', value: `${s.tdp} W`, raw: s.tdp, better: 'low' },
        { key: 'maxPower', label: 'Consumo máximo', value: `${s.maxPower} W`, raw: s.maxPower, better: 'low' },
        { key: 'memory', label: 'Memória suportada', value: s.memoryTypes.join(' / '), raw: s.memoryTypes.join(' / ') },
        { key: 'igpu', label: 'Vídeo integrado', value: s.igpu ?? 'Não', raw: s.igpu ?? 'Não' },
        { key: 'cooler', label: 'Cooler incluso', value: yes(s.includesCooler), raw: s.includesCooler },
      ];
    }
    case 'motherboard': {
      const s = part.specs;
      return [
        { key: 'socket', label: 'Socket', value: s.socket, raw: s.socket },
        { key: 'chipset', label: 'Chipset', value: s.chipset, raw: s.chipset },
        { key: 'form', label: 'Formato', value: s.formFactor, raw: s.formFactor },
        { key: 'memory', label: 'Memória', value: s.memoryType, raw: s.memoryType },
        { key: 'slots', label: 'Slots de RAM', value: `${s.memorySlots}`, raw: s.memorySlots, better: 'high' },
        { key: 'maxMem', label: 'RAM máxima', value: `${s.maxMemory} GB`, raw: s.maxMemory, better: 'high' },
        { key: 'm2', label: 'Slots M.2', value: s.m2Slots === undefined ? 'Não informado' : `${s.m2Slots}`, raw: s.m2Slots ?? null, better: 'high' },
        { key: 'm2gen', label: 'PCIe M.2 máx.', value: s.m2Gen === undefined ? 'Não informado' : `${s.m2Gen}.0`, raw: s.m2Gen ?? null, better: 'high' },
        { key: 'sata', label: 'Portas SATA', value: s.sataPorts === undefined ? 'Não informado' : `${s.sataPorts}`, raw: s.sataPorts ?? null, better: 'high' },
        { key: 'wifi', label: 'Wi-Fi integrado', value: yes(s.wifi), raw: s.wifi },
      ];
    }
    case 'ram': {
      const s = part.specs;
      return [
        { key: 'type', label: 'Tipo', value: s.type, raw: s.type },
        { key: 'cap', label: 'Capacidade total', value: `${s.capacity} GB`, raw: s.capacity, better: 'high' },
        { key: 'modules', label: 'Módulos', value: `${s.modules}x ${s.capacity / s.modules} GB`, raw: s.modules },
        { key: 'speed', label: 'Frequência', value: `${s.speed} MT/s`, raw: s.speed, better: 'high' },
        { key: 'cl', label: 'Latência CAS', value: `CL${s.latency}`, raw: s.latency, better: 'low' },
      ];
    }
    case 'gpu': {
      const s = part.specs;
      return [
        { key: 'maker', label: 'Fabricante do chip', value: s.maker, raw: s.maker },
        { key: 'chip', label: 'Chip', value: s.chip, raw: s.chip },
        { key: 'vram', label: 'VRAM', value: `${s.vram} GB ${s.vramType}`, raw: s.vram, better: 'high' },
        { key: 'length', label: 'Comprimento', value: s.length ? `${s.length} mm` : 'Varia por modelo', raw: s.length ?? null, better: 'low' },
        { key: 'tdp', label: 'Consumo (TGP)', value: `${s.tdp} W`, raw: s.tdp, better: 'low' },
        { key: 'psu', label: 'Fonte recomendada', value: `${s.recommendedPsu} W`, raw: s.recommendedPsu, better: 'low' },
        { key: 'power', label: 'Alimentação', value: s.power16pin ? `Conector 16 pinos (adaptador ${s.adapter8pin ?? '?'}x 8 pinos)` : s.power8pin > 0 ? `${s.power8pin}x 8 pinos` : 'Via slot PCIe', raw: s.power16pin ? '16 pinos' : `${s.power8pin}x 8 pinos` },
      ];
    }
    case 'ssd': {
      const s = part.specs;
      return [
        { key: 'interface', label: 'Interface', value: s.interface, raw: s.interface },
        { key: 'form', label: 'Formato', value: s.formFactor, raw: s.formFactor },
        { key: 'cap', label: 'Capacidade', value: formatCapacity(s.capacity), raw: s.capacity, better: 'high' },
        { key: 'read', label: 'Leitura', value: `${s.read.toLocaleString('pt-BR')} MB/s`, raw: s.read, better: 'high' },
        { key: 'write', label: 'Gravação', value: `${s.write.toLocaleString('pt-BR')} MB/s`, raw: s.write, better: 'high' },
      ];
    }
    case 'hdd': {
      const s = part.specs;
      return [
        { key: 'cap', label: 'Capacidade', value: formatCapacity(s.capacity), raw: s.capacity, better: 'high' },
        { key: 'rpm', label: 'Rotação', value: `${s.rpm} RPM`, raw: s.rpm, better: 'high' },
        { key: 'cache', label: 'Cache', value: `${s.cache} MB`, raw: s.cache, better: 'high' },
        { key: 'interface', label: 'Interface', value: s.interface, raw: s.interface },
      ];
    }
    case 'psu': {
      const s = part.specs;
      return [
        { key: 'watts', label: 'Potência', value: `${s.wattage} W`, raw: s.wattage, better: 'high' },
        { key: 'eff', label: 'Certificação', value: s.efficiency, raw: s.efficiency },
        { key: 'mod', label: 'Modularidade', value: s.modular, raw: s.modular },
        { key: 'pcie', label: 'Conectores PCIe 8 pinos', value: s.pcie8pin === undefined ? 'Não informado' : `${s.pcie8pin}`, raw: s.pcie8pin ?? null, better: 'high' },
        { key: '16pin', label: 'Conector 12VHPWR', value: yes(s.pcie16pin), raw: s.pcie16pin },
      ];
    }
    case 'case': {
      const s = part.specs;
      return [
        { key: 'ff', label: 'Formatos suportados', value: s.formFactors.join(', '), raw: s.formFactors.join(', ') },
        { key: 'gpu', label: 'GPU máxima', value: s.maxGpuLength ? `${s.maxGpuLength} mm` : 'Não informado', raw: s.maxGpuLength ?? null, better: 'high' },
        { key: 'cooler', label: 'Cooler máximo', value: s.maxCoolerHeight ? `${s.maxCoolerHeight} mm` : 'Não informado', raw: s.maxCoolerHeight ?? null, better: 'high' },
        { key: 'rad', label: 'Radiador máximo', value: s.maxRadiator ? `${s.maxRadiator} mm` : 'Não informado', raw: s.maxRadiator ?? null, better: 'high' },
        { key: 'b25', label: 'Baias 2,5"', value: s.bays25 === undefined ? 'Não informado' : `${s.bays25}`, raw: s.bays25 ?? null, better: 'high' },
        { key: 'b35', label: 'Baias 3,5"', value: s.bays35 === undefined ? 'Não informado' : `${s.bays35}`, raw: s.bays35 ?? null, better: 'high' },
        { key: 'fans', label: 'Ventoinhas inclusas', value: `${s.includedFans}`, raw: s.includedFans, better: 'high' },
        { key: 'panel', label: 'Painel lateral', value: s.sidePanel, raw: s.sidePanel },
      ];
    }
    case 'cooler': {
      const s = part.specs;
      return [
        { key: 'type', label: 'Tipo', value: s.type === 'aio' ? 'Water cooler (AIO)' : 'Air cooler', raw: s.type },
        { key: 'sockets', label: 'Sockets', value: s.sockets.join(', '), raw: s.sockets.join(', ') },
        { key: 'height', label: 'Altura', value: s.height ? `${s.height} mm` : 'Não se aplica', raw: s.height ?? null, better: 'low' },
        { key: 'rad', label: 'Radiador', value: s.radiator ? `${s.radiator} mm` : 'Não se aplica', raw: s.radiator ?? null, better: 'high' },
        { key: 'tdp', label: 'Capacidade térmica', value: s.tdpRating ? `${s.tdpRating} W` : 'Não informado', raw: s.tdpRating ?? null, better: 'high' },
        { key: 'fan', label: 'Ventoinha', value: `${s.fanSize} mm`, raw: s.fanSize },
      ];
    }
    case 'fan': {
      const s = part.specs;
      return [
        { key: 'size', label: 'Tamanho', value: `${s.size} mm`, raw: s.size },
        { key: 'qty', label: 'Unidades no pacote', value: `${s.quantity}`, raw: s.quantity, better: 'high' },
        { key: 'rpm', label: 'Rotação', value: `${s.minRpm}–${s.maxRpm} RPM`, raw: s.maxRpm, better: 'high' },
        { key: 'air', label: 'Fluxo de ar', value: `${formatNum(s.airflow)} CFM`, raw: s.airflow, better: 'high' },
        { key: 'rgb', label: 'Iluminação RGB', value: yes(s.rgb), raw: s.rgb },
      ];
    }
  }
}

export function highlights(part: Part): string[] {
  const rows = specRows(part);
  const pick = (keys: string[]) => keys.map((k) => rows.find((r) => r.key === k)).filter((r): r is SpecRow => !!r);
  const map: Record<Category, string[]> = {
    cpu: ['socket', 'cores', 'boost', 'tdp'],
    motherboard: ['socket', 'chipset', 'form', 'memory'],
    ram: ['type', 'cap', 'speed', 'cl'],
    gpu: ['vram', 'tdp', 'length'],
    ssd: ['cap', 'interface', 'read'],
    hdd: ['cap', 'rpm', 'cache'],
    psu: ['watts', 'eff', 'mod'],
    case: ['ff', 'gpu', 'cooler'],
    cooler: ['type', 'height', 'rad', 'tdp'],
    fan: ['size', 'qty', 'air'],
  };
  return pick(map[part.category])
    .filter((r) => r.raw !== null && r.value !== 'Não se aplica')
    .map((r) => `${r.label}: ${r.value}`);
}

export function powerOf(part: Part): number | null {
  switch (part.category) {
    case 'cpu':
      return part.specs.maxPower;
    case 'gpu':
      return part.specs.tdp;
    default:
      return null;
  }
}

export const performanceScore = (part: Part): number | null => {
  if (part.category === 'cpu') {
    const s = part.specs;
    return Math.round(s.threads * s.boostClock * 10 + s.cache);
  }
  if (part.category === 'gpu') {
    return null;
  }
  return null;
};

import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Gpu,
  HardDrive,
  Database,
  Zap,
  PcCase,
  Snowflake,
  Fan,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from './types';

export interface CategoryMeta {
  id: Category;
  label: string;
  plural: string;
  short: string;
  icon: LucideIcon;
  maxQty: number;
  hint: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'cpu', label: 'Processador', plural: 'Processadores', short: 'CPU', icon: Cpu, maxQty: 1, hint: 'O cérebro do PC. Define o socket da placa-mãe.' },
  { id: 'motherboard', label: 'Placa-mãe', plural: 'Placas-mãe', short: 'Placa-mãe', icon: CircuitBoard, maxQty: 1, hint: 'Conecta todas as peças. Socket, memória e formato importam.' },
  { id: 'ram', label: 'Memória RAM', plural: 'Memórias RAM', short: 'RAM', icon: MemoryStick, maxQty: 2, hint: 'Capacidade e frequência. O tipo (DDR4/DDR5) precisa casar com a placa.' },
  { id: 'gpu', label: 'Placa de vídeo', plural: 'Placas de vídeo', short: 'GPU', icon: Gpu, maxQty: 1, hint: 'Responsável pelos gráficos. Confira tamanho e conectores de energia.' },
  { id: 'ssd', label: 'Armazenamento SSD', plural: 'SSDs', short: 'SSD', icon: HardDrive, maxQty: 4, hint: 'Sistema e jogos. NVMe M.2 ou SATA 2.5".' },
  { id: 'hdd', label: 'Armazenamento HDD', plural: 'HDDs', short: 'HDD', icon: Database, maxQty: 4, hint: 'Capacidade barata para arquivos e backups.' },
  { id: 'psu', label: 'Fonte de alimentação', plural: 'Fontes', short: 'Fonte', icon: Zap, maxQty: 1, hint: 'Potência e conectores adequados protegem toda a montagem.' },
  { id: 'case', label: 'Gabinete', plural: 'Gabinetes', short: 'Gabinete', icon: PcCase, maxQty: 1, hint: 'Define o formato da placa, tamanho da GPU e do cooler.' },
  { id: 'cooler', label: 'Cooler de CPU', plural: 'Coolers de CPU', short: 'Cooler', icon: Snowflake, maxQty: 1, hint: 'Air cooler ou water cooler. Altura e socket precisam ser compatíveis.' },
  { id: 'fan', label: 'Ventoinhas adicionais', plural: 'Ventoinhas', short: 'Ventoinhas', icon: Fan, maxQty: 10, hint: 'Melhoram o fluxo de ar do gabinete.' },
];

export const CATEGORY_MAP: Record<Category, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<Category, CategoryMeta>;

export const isCategory = (value: string | null | undefined): value is Category =>
  !!value && value in CATEGORY_MAP;

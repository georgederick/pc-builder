import { PARTS_BY_ID } from '@/data/catalog';
import { CATEGORY_MAP, isCategory } from './categories';
import type { Category, SavedBuild, Selection } from './types';

const toBase64Url = (text: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(text)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const fromBase64Url = (text: string) => {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  return new TextDecoder().decode(Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)));
};

export function sanitizeSelection(raw: unknown): Selection {
  const result: Selection = {};
  if (!raw || typeof raw !== 'object') return result;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isCategory(key) || !value || typeof value !== 'object') continue;
    const { id, qty } = value as { id?: unknown; qty?: unknown };
    if (typeof id !== 'string') continue;
    const part = PARTS_BY_ID.get(id);
    if (!part || part.category !== key) continue;
    const max = CATEGORY_MAP[key].maxQty;
    const amount = typeof qty === 'number' && Number.isFinite(qty) ? Math.min(Math.max(Math.round(qty), 1), max) : 1;
    result[key] = { id, qty: amount };
  }
  return result;
}

export function encodeSelection(sel: Selection): string {
  const payload = Object.entries(sel)
    .filter(([, item]) => !!item)
    .map(([cat, item]) => `${cat}:${item!.id}:${item!.qty}`)
    .join('|');
  return toBase64Url(payload);
}

export function decodeSelection(token: string): Selection {
  try {
    const raw: Record<string, { id: string; qty: number }> = {};
    fromBase64Url(token)
      .split('|')
      .forEach((entry) => {
        const [cat, id, qty] = entry.split(':');
        if (cat && id) raw[cat] = { id, qty: Number(qty) || 1 };
      });
    return sanitizeSelection(raw);
  } catch {
    return {};
  }
}

export function buildShareUrl(sel: Selection, name?: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const query = new URLSearchParams({ b: encodeSelection(sel) });
  if (name) query.set('n', name);
  return `${base}#/shared?${query.toString()}`;
}

export interface ExportFile {
  app: 'pc-builder';
  version: 1;
  builds: Pick<SavedBuild, 'name' | 'items'>[];
}

export function exportBuilds(builds: SavedBuild[]): string {
  const file: ExportFile = {
    app: 'pc-builder',
    version: 1,
    builds: builds.map(({ name, items }) => ({ name, items })),
  };
  return JSON.stringify(file, null, 2);
}

export function parseImport(text: string): { name: string; items: Selection }[] {
  const data = JSON.parse(text) as Partial<ExportFile> & { name?: string; items?: unknown };
  const list = Array.isArray(data.builds) ? data.builds : data.items ? [{ name: data.name ?? 'Build importada', items: data.items }] : [];
  const parsed = list
    .map((b) => ({ name: String(b.name ?? 'Build importada').slice(0, 60), items: sanitizeSelection(b.items) }))
    .filter((b) => Object.keys(b.items).length > 0);
  if (parsed.length === 0) throw new Error('Arquivo inválido ou sem componentes reconhecidos.');
  return parsed;
}

export function downloadFile(filename: string, content: string, mime = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const selectionTotal = (sel: Selection): number =>
  (Object.entries(sel) as [Category, NonNullable<Selection[Category]>][]).reduce((sum, [, item]) => {
    const part = PARTS_BY_ID.get(item.id);
    return part ? sum + part.price * item.qty : sum;
  }, 0);

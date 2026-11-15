import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PARTS_BY_ID, READY_BUILDS } from '@/data/catalog';
import { CATEGORY_MAP } from '@/lib/categories';
import { sanitizeSelection } from '@/lib/share';
import { uid } from '@/lib/format';
import type { Category, SavedBuild, Selection } from '@/lib/types';

export type ToastKind = 'success' | 'info' | 'error';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface State {
  selection: Selection;
  buildName: string;
  activeId: string | null;
  saved: SavedBuild[];
  compare: Record<string, string[]>;
  toasts: Toast[];
  setPart: (category: Category, id: string) => void;
  setQty: (category: Category, qty: number) => void;
  removePart: (category: Category) => void;
  clearBuild: () => void;
  loadSelection: (items: Selection, name?: string, activeId?: string | null) => void;
  loadReady: (readyId: string) => void;
  setBuildName: (name: string) => void;
  saveCurrent: (name?: string) => void;
  saveAsNew: (name?: string) => void;
  loadSaved: (id: string) => void;
  duplicateSaved: (id: string) => void;
  renameSaved: (id: string, name: string) => void;
  deleteSaved: (id: string) => void;
  importBuilds: (list: { name: string; items: Selection }[]) => void;
  toggleCompare: (category: Category, id: string) => void;
  clearCompare: (category: Category) => void;
  notify: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      selection: {},
      buildName: 'Minha montagem',
      activeId: null,
      saved: [],
      compare: {},
      toasts: [],

      setPart: (category, id) => {
        const part = PARTS_BY_ID.get(id);
        if (!part || part.category !== category) return;
        const prev = get().selection[category];
        const qty = prev && prev.id === id ? prev.qty : 1;
        set((s) => ({ selection: { ...s.selection, [category]: { id, qty } } }));
        get().notify(prev && prev.id !== id ? `${part.name} substituiu o item anterior.` : `${part.name} adicionado à montagem.`);
      },

      setQty: (category, qty) =>
        set((s) => {
          const item = s.selection[category];
          if (!item) return s;
          const clamped = Math.min(Math.max(qty, 1), CATEGORY_MAP[category].maxQty);
          return { selection: { ...s.selection, [category]: { ...item, qty: clamped } } };
        }),

      removePart: (category) => {
        const item = get().selection[category];
        const part = item ? PARTS_BY_ID.get(item.id) : undefined;
        set((s) => {
          const next = { ...s.selection };
          delete next[category];
          return { selection: next };
        });
        if (part) get().notify(`${part.name} removido da montagem.`, 'info');
      },

      clearBuild: () => {
        set({ selection: {}, activeId: null, buildName: 'Minha montagem' });
        get().notify('Montagem limpa.', 'info');
      },

      loadSelection: (items, name, activeId = null) =>
        set({ selection: sanitizeSelection(items), buildName: name ?? 'Minha montagem', activeId }),

      loadReady: (readyId) => {
        const ready = READY_BUILDS.find((b) => b.id === readyId);
        if (!ready) return;
        const items: Selection = {};
        (Object.entries(ready.items) as [Category, string | [string, number]][]).forEach(([cat, value]) => {
          const [id, qty] = Array.isArray(value) ? value : [value, 1];
          items[cat] = { id, qty };
        });
        set({ selection: sanitizeSelection(items), buildName: ready.name, activeId: null });
        get().notify(`Build "${ready.name}" carregada. Você pode modificar qualquer componente.`);
      },

      setBuildName: (name) => set({ buildName: name }),

      saveCurrent: (name) => {
        const { selection, buildName, activeId, saved } = get();
        const finalName = (name ?? buildName).trim() || 'Minha montagem';
        const now = Date.now();
        const existing = activeId ? saved.find((b) => b.id === activeId) : undefined;
        if (existing) {
          set({
            buildName: finalName,
            saved: saved.map((b) => (b.id === existing.id ? { ...b, name: finalName, items: selection, updatedAt: now } : b)),
          });
          get().notify(`"${finalName}" atualizada.`);
        } else {
          const id = uid();
          set({ saved: [{ id, name: finalName, items: selection, createdAt: now, updatedAt: now }, ...saved], activeId: id, buildName: finalName });
          get().notify(`"${finalName}" salva no navegador.`);
        }
      },

      saveAsNew: (name) => {
        const { selection, buildName, saved } = get();
        const finalName = (name ?? buildName).trim() || 'Minha montagem';
        const now = Date.now();
        const id = uid();
        set({ saved: [{ id, name: finalName, items: selection, createdAt: now, updatedAt: now }, ...saved], activeId: id, buildName: finalName });
        get().notify(`"${finalName}" salva como nova configuração.`);
      },

      loadSaved: (id) => {
        const build = get().saved.find((b) => b.id === id);
        if (!build) return;
        set({ selection: sanitizeSelection(build.items), buildName: build.name, activeId: build.id });
        get().notify(`"${build.name}" carregada no configurador.`, 'info');
      },

      duplicateSaved: (id) => {
        const build = get().saved.find((b) => b.id === id);
        if (!build) return;
        const now = Date.now();
        set((s) => ({ saved: [{ ...build, id: uid(), name: `${build.name} (cópia)`, createdAt: now, updatedAt: now }, ...s.saved] }));
        get().notify(`"${build.name}" duplicada.`);
      },

      renameSaved: (id, name) => {
        const clean = name.trim();
        if (!clean) return;
        set((s) => ({
          saved: s.saved.map((b) => (b.id === id ? { ...b, name: clean, updatedAt: Date.now() } : b)),
          buildName: s.activeId === id ? clean : s.buildName,
        }));
      },

      deleteSaved: (id) => {
        const build = get().saved.find((b) => b.id === id);
        set((s) => ({ saved: s.saved.filter((b) => b.id !== id), activeId: s.activeId === id ? null : s.activeId }));
        if (build) get().notify(`"${build.name}" excluída.`, 'info');
      },

      importBuilds: (list) => {
        const now = Date.now();
        const created = list.map((b) => ({ id: uid(), name: b.name, items: b.items, createdAt: now, updatedAt: now }));
        set((s) => ({ saved: [...created, ...s.saved] }));
        get().notify(`${created.length} configuração(ões) importada(s).`);
      },

      toggleCompare: (category, id) =>
        set((s) => {
          const list = s.compare[category] ?? [];
          if (list.includes(id)) return { compare: { ...s.compare, [category]: list.filter((x) => x !== id) } };
          if (list.length >= 4) {
            queueMicrotask(() => get().notify('O comparador aceita até 4 componentes por categoria.', 'error'));
            return s;
          }
          return { compare: { ...s.compare, [category]: [...list, id] } };
        }),

      clearCompare: (category) => set((s) => ({ compare: { ...s.compare, [category]: [] } })),

      notify: (message, kind = 'success') => {
        const id = uid();
        set((s) => ({ toasts: [...s.toasts.slice(-3), { id, kind, message }] }));
        setTimeout(() => get().dismissToast(id), 3600);
      },

      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'pc-builder:v1',
      partialize: (s) => ({ selection: s.selection, buildName: s.buildName, activeId: s.activeId, saved: s.saved, compare: s.compare }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          selection: sanitizeSelection(p.selection),
          saved: (p.saved ?? []).map((b) => ({ ...b, items: sanitizeSelection(b.items) })),
          compare: Object.fromEntries(
            Object.entries(p.compare ?? {}).map(([k, v]) => [k, (v ?? []).filter((id) => PARTS_BY_ID.has(id))]),
          ),
        };
      },
    },
  ),
);

export const selectionCount = (sel: Selection): number => Object.keys(sel).length;

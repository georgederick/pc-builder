import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Scale, X } from 'lucide-react';
import PartImage from '@/components/PartImage';
import { EmptyState, PageHeader } from '@/components/ui';
import { partsOf, PARTS_BY_ID } from '@/data/catalog';
import { CATEGORIES, CATEGORY_MAP, isCategory } from '@/lib/categories';
import { formatBRL } from '@/lib/format';
import { specRows } from '@/lib/specs';
import type { Category, Part } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function Compare() {
  const location = useLocation();
  const stateCat = (location.state as { category?: string } | null)?.category;
  const compare = useStore((s) => s.compare);
  const toggle = useStore((s) => s.toggleCompare);
  const clear = useStore((s) => s.clearCompare);
  const setPart = useStore((s) => s.setPart);

  const firstWithItems = CATEGORIES.find((c) => (compare[c.id] ?? []).length > 0)?.id;
  const [active, setActive] = useState<Category>(isCategory(stateCat) ? stateCat : (firstWithItems ?? 'cpu'));
  const meta = CATEGORY_MAP[active];

  const ids = compare[active] ?? [];
  const parts = ids.map((id) => PARTS_BY_ID.get(id)).filter((p): p is Part => !!p);
  const available = useMemo(() => partsOf(active).filter((p) => !ids.includes(p.id)), [active, ids]);

  const matrix = useMemo(() => {
    if (parts.length === 0) return [];
    const rowsByPart = parts.map((p) => specRows(p));
    const priceRow = { key: 'price', label: 'Preço (ilustrativo)', better: 'low' as const };
    const base = rowsByPart[0].map((r) => ({ key: r.key, label: r.label, better: r.better }));
    return [priceRow, ...base].map((row) => {
      const cells = parts.map((p, i) => {
        if (row.key === 'price') return { value: formatBRL(p.price), raw: p.price as number | string | boolean | null };
        const found = rowsByPart[i].find((r) => r.key === row.key);
        return { value: found?.value ?? '—', raw: found?.raw ?? null };
      });
      const distinct = new Set(cells.map((c) => String(c.value))).size > 1;
      let bestIdx: number[] = [];
      if (distinct && row.better && parts.length >= 2) {
        const nums = cells.map((c) => (typeof c.raw === 'number' ? c.raw : null));
        if (nums.every((n) => n !== null)) {
          const target = row.better === 'high' ? Math.max(...(nums as number[])) : Math.min(...(nums as number[]));
          bestIdx = nums.map((n, i) => (n === target ? i : -1)).filter((i) => i >= 0);
        }
      }
      return { ...row, cells, distinct, bestIdx };
    });
  }, [parts]);

  const hasAny = CATEGORIES.some((c) => (compare[c.id] ?? []).length > 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Comparador"
        title="Compare componentes lado a lado"
        text="Selecione de 2 a 4 componentes da mesma categoria. As diferenças técnicas ficam destacadas, sem declarar um vencedor geral."
        actions={
          <Link to={`/builder/${active}`} className="btn-ghost">
            <Plus size={16} /> Escolher no catálogo
          </Link>
        }
      />

      <div className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-2">
        {CATEGORIES.map((c) => {
          const n = (compare[c.id] ?? []).length;
          return (
            <button key={c.id} className={`chip !px-3 !py-2 !text-sm shrink-0 ${active === c.id ? 'chip-active' : ''}`} onClick={() => setActive(c.id)}>
              <c.icon size={15} /> {c.short}
              {n > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{n}</span>}
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <select
          className="input !w-full sm:!w-96"
          value=""
          onChange={(e) => e.target.value && toggle(active, e.target.value)}
          aria-label="Adicionar componente ao comparador"
          disabled={ids.length >= 4}
        >
          <option value="">{ids.length >= 4 ? 'Limite de 4 componentes atingido' : `+ Adicionar ${meta.label.toLowerCase()} ao comparador`}</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {formatBRL(p.price)}
            </option>
          ))}
        </select>
        {ids.length > 0 && (
          <button className="btn-ghost" onClick={() => clear(active)}>
            <X size={15} /> Limpar categoria
          </button>
        )}
      </div>

      {!hasAny || parts.length === 0 ? (
        <EmptyState
          icon={<Scale size={26} />}
          title={`Nenhum item de ${meta.label.toLowerCase()} no comparador`}
          text="Use o seletor acima ou o botão de balança nos cards do configurador para adicionar componentes."
          action={
            <Link to={`/builder/${active}`} className="btn-primary">
              Abrir catálogo
            </Link>
          }
        />
      ) : parts.length === 1 ? (
        <div className="card border-dashed p-6 text-center text-sm text-steel-300">Adicione pelo menos mais um componente de {meta.label.toLowerCase()} para iniciar a comparação.</div>
      ) : null}

      {parts.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-44 bg-ink-800 p-4 text-left align-bottom">
                  <span className="label">Especificação</span>
                </th>
                {parts.map((p) => (
                  <th key={p.id} className="min-w-[200px] border-l border-ink-500/60 p-4 text-left align-top">
                    <div className="relative">
                      <button className="absolute right-0 top-0 z-10 rounded-lg bg-ink-900/80 p-1 text-steel-400 hover:text-white" onClick={() => toggle(active, p.id)} aria-label={`Remover ${p.name}`}>
                        <X size={14} />
                      </button>
                      <PartImage part={p} />
                      <p className="label mt-3 !text-[10px]">{p.brand}</p>
                      <p className="mt-0.5 font-semibold leading-snug">{p.model}</p>
                      <button className="btn-primary btn-sm mt-3" onClick={() => setPart(p.category, p.id)}>
                        Usar na montagem
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.key} className={row.distinct && parts.length > 1 ? 'bg-brand-500/[0.06]' : ''}>
                  <td className="sticky left-0 z-10 border-t border-ink-500/60 bg-ink-800 p-3.5 text-steel-400">
                    {row.label}
                    {row.distinct && parts.length > 1 && <span className="ml-2 text-[10px] uppercase tracking-wider text-brand-400">difere</span>}
                  </td>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={`border-l border-t border-ink-500/60 p-3.5 ${row.bestIdx.includes(i) ? 'font-semibold text-brand-200' : ''}`}>
                      {cell.value}
                      {row.bestIdx.includes(i) && <span className="ml-1.5 rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-medium text-brand-200">melhor valor</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {parts.length > 1 && (
        <p className="mt-4 text-xs leading-relaxed text-steel-500">
          "Melhor valor" indica apenas o melhor número em cada especificação isolada (ex.: mais núcleos, menor consumo). Isso não representa desempenho real nem define um vencedor
          geral: consulte benchmarks independentes para decidir.
        </p>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Layers, Scale, Search, SlidersHorizontal, X, PackageSearch } from 'lucide-react';
import PartCard from '@/components/PartCard';
import PartDetail from '@/components/PartDetail';
import SummaryPanel from '@/components/SummaryPanel';
import { EmptyState, Modal, StatusIcon, useDebounced } from '@/components/ui';
import { BRANDS, partsOf, PARTS_BY_ID } from '@/data/catalog';
import { CATEGORIES, CATEGORY_MAP, isCategory } from '@/lib/categories';
import { candidateStatus, evaluate } from '@/lib/compat';
import { applyFilters, emptyFilters, FACETS, sortOptions, type FilterState } from '@/lib/filters';
import { formatBRL } from '@/lib/format';
import type { Category, Part } from '@/lib/types';
import { useStore } from '@/store/useStore';

export default function Builder() {
  const { category } = useParams();
  const navigate = useNavigate();
  const selection = useStore((s) => s.selection);
  const setPart = useStore((s) => s.setPart);
  const compare = useStore((s) => s.compare);
  const toggleCompare = useStore((s) => s.toggleCompare);

  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Part | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const active: Category = isCategory(category) ? category : 'cpu';
  const meta = CATEGORY_MAP[active];
  const query = useDebounced(filters.query, 180);

  useEffect(() => {
    setFilters(emptyFilters());
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 220);
    return () => clearTimeout(t);
  }, [active]);

  const all = useMemo(() => partsOf(active), [active]);
  const options = useMemo(() => sortOptions(active, all[0]), [active, all]);
  const priceBounds = useMemo(() => {
    const prices = all.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [all]);

  const filtered = useMemo(() => applyFilters(all, { ...filters, query }, active), [all, filters, query, active]);
  const annotated = useMemo(
    () => filtered.map((p) => ({ part: p, ...candidateStatus(selection, active, p.id, selection[active]?.id === p.id ? selection[active]!.qty : 1) })),
    [filtered, selection, active],
  );
  const visible = filters.onlyCompatible ? annotated.filter((a) => a.status !== 'error') : annotated;

  const ev = useMemo(() => evaluate(selection), [selection]);
  const compareList = compare[active] ?? [];
  const activeFilterCount =
    filters.brands.length + Object.values(filters.facets).reduce((n, v) => n + v.length, 0) + (filters.min !== null ? 1 : 0) + (filters.max !== null ? 1 : 0) + (filters.onlyCompatible ? 1 : 0);

  if (category && !isCategory(category)) return <Navigate to="/builder" replace />;

  const toggleIn = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const brandsHere = BRANDS.filter((b) => all.some((p) => p.brand === b));

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <p className="label mb-2">Fabricante</p>
        <div className="flex flex-wrap gap-1.5">
          {brandsHere.map((b) => (
            <button key={b} className={`chip ${filters.brands.includes(b) ? 'chip-active' : ''}`} onClick={() => setFilters((f) => ({ ...f, brands: toggleIn(f.brands, b) }))}>
              {b}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label mb-2">Faixa de preço (R$)</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="input !py-2"
            type="number"
            min={0}
            placeholder={`Min ${priceBounds.min}`}
            value={filters.min ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, min: e.target.value === '' ? null : Number(e.target.value) }))}
            aria-label="Preço mínimo"
          />
          <input
            className="input !py-2"
            type="number"
            min={0}
            placeholder={`Max ${priceBounds.max}`}
            value={filters.max ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, max: e.target.value === '' ? null : Number(e.target.value) }))}
            aria-label="Preço máximo"
          />
        </div>
      </div>
      {FACETS[active].map((facet) => {
        const values = Array.from(new Set(all.flatMap((p) => facet.values(p)))).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
        if (values.length < 2) return null;
        return (
          <div key={facet.key}>
            <p className="label mb-2">{facet.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {values.map((v) => (
                <button
                  key={v}
                  className={`chip ${(filters.facets[facet.key] ?? []).includes(v) ? 'chip-active' : ''}`}
                  onClick={() => setFilters((f) => ({ ...f, facets: { ...f.facets, [facet.key]: toggleIn(f.facets[facet.key] ?? [], v) } }))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-ink-500 bg-ink-900 p-3 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-[#8f4dff]" checked={filters.onlyCompatible} onChange={(e) => setFilters((f) => ({ ...f, onlyCompatible: e.target.checked }))} />
        Ocultar incompatíveis com minha montagem
      </label>
      <button className="btn-ghost btn-sm w-full" onClick={() => setFilters((f) => ({ ...emptyFilters(), query: f.query, sort: f.sort }))} disabled={activeFilterCount === 0}>
        <X size={14} /> Limpar filtros
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <nav className="no-print -mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-2" aria-label="Categorias">
        {CATEGORIES.map((c, i) => {
          const picked = !!selection[c.id];
          const hasIssue = ev.checks.some((k) => k.parts.includes(c.id) && k.status === 'error');
          const isActive = c.id === active;
          return (
            <Link
              key={c.id}
              to={`/builder/${c.id}`}
              className={`group relative flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-all ${isActive ? 'border-brand-500 bg-brand-500/15 text-white shadow-glow' : 'border-ink-500 bg-ink-800/70 text-steel-300 hover:border-steel-500 hover:text-white'}`}
            >
              <span className="text-[10px] tabular-nums text-steel-500">{String(i + 1).padStart(2, '0')}</span>
              <c.icon size={16} className={isActive ? 'text-brand-300' : ''} />
              {c.short}
              {picked && (hasIssue ? <span className="text-white"><StatusIcon status="error" size={13} /></span> : <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />)}
            </Link>
          );
        })}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
                <meta.icon size={26} className="text-brand-400" /> {meta.plural}
              </h1>
              <p className="mt-1.5 max-w-xl text-sm text-steel-400">{meta.hint}</p>
            </div>
            {selection[active] && PARTS_BY_ID.get(selection[active]!.id) && (
              <div className="chip !px-3 !py-1.5 !text-xs !border-brand-500/50">
                Selecionado: <span className="font-semibold text-white">{PARTS_BY_ID.get(selection[active]!.id)!.model}</span>
              </div>
            )}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-500" />
              <input className="input !pl-10" placeholder={`Buscar em ${meta.plural.toLowerCase()}...`} value={filters.query} onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))} aria-label="Buscar" />
            </div>
            <select className="input !w-auto" value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))} aria-label="Ordenar">
              {options.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <button className="btn-ghost lg:hidden" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={16} /> Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
            <div className="card hidden h-fit p-4 xl:sticky xl:top-20 xl:block">
              <p className="label mb-4 flex items-center gap-1.5">
                <SlidersHorizontal size={13} /> Filtros
              </p>
              {filterPanel}
            </div>
            <div>
              <p className="mb-3 text-xs text-steel-400">
                {loading ? 'Carregando...' : `${visible.length} de ${all.length} produtos`} · preços ilustrativos
              </p>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="skeleton h-[360px]" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <EmptyState
                  icon={<PackageSearch size={26} />}
                  title="Nenhum produto encontrado"
                  text="Nenhum componente corresponde aos filtros atuais. Ajuste a busca ou limpe os filtros."
                  action={
                    <button className="btn-primary" onClick={() => setFilters(emptyFilters())}>
                      Limpar filtros
                    </button>
                  }
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {visible.map(({ part, status, checks }) => (
                    <PartCard
                      key={part.id}
                      part={part}
                      selected={selection[active]?.id === part.id}
                      hasOther={!!selection[active] && selection[active]!.id !== part.id}
                      status={checks.length ? status : null}
                      checks={checks}
                      comparing={compareList.includes(part.id)}
                      onSelect={() => setPart(active, part.id)}
                      onDetails={() => setDetail(part)}
                      onCompare={() => toggleCompare(active, part.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="hidden lg:block">
          <div className="sticky top-20 h-[calc(100vh-6.5rem)]">
            <SummaryPanel />
          </div>
        </div>
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-ink-500/70 bg-ink-950/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          {compareList.length >= 2 && (
            <button className="btn-ghost" onClick={() => navigate('/compare', { state: { category: active } })}>
              <Scale size={16} /> {compareList.length}
            </button>
          )}
          <button className="btn-primary flex-1" onClick={() => setSummaryOpen(true)}>
            <Layers size={16} /> Ver montagem · {formatBRL(Object.values(selection).reduce((s, i) => s + (PARTS_BY_ID.get(i.id)?.price ?? 0) * i.qty, 0))}
          </button>
        </div>
      </div>
      <div className="h-16 lg:hidden" />

      {compareList.length >= 2 && (
        <div className="no-print fixed bottom-20 left-1/2 z-40 hidden -translate-x-1/2 lg:block">
          <button className="btn-primary animate-pop" onClick={() => navigate('/compare', { state: { category: active } })}>
            <Scale size={16} /> Comparar {compareList.length} {meta.plural.toLowerCase()}
          </button>
        </div>
      )}

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros">
        {filterPanel}
        <button className="btn-primary mt-5 w-full" onClick={() => setFiltersOpen(false)}>
          Ver {visible.length} produtos
        </button>
      </Modal>
      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)} title="Resumo da montagem">
        <SummaryPanel onClose={() => setSummaryOpen(false)} />
      </Modal>
      <PartDetail part={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

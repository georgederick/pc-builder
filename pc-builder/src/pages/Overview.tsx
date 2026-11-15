import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, Cell, CartesianGrid, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip as RTooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { Layers, Wrench, Zap } from 'lucide-react';
import PartImage from '@/components/PartImage';
import { EmptyState, OverallBadge, PageHeader, StatusIcon } from '@/components/ui';
import { partsOf, PARTS_BY_ID } from '@/data/catalog';
import { CATEGORIES, CATEGORY_MAP } from '@/lib/categories';
import { evaluate, overallLabel } from '@/lib/compat';
import { formatBRL } from '@/lib/format';
import { estimatePower } from '@/lib/power';
import { selectionTotal } from '@/lib/share';
import { performanceScore, specRows } from '@/lib/specs';
import { useStore } from '@/store/useStore';

const SHADES = ['#d9c5ff', '#c2a0ff', '#a974ff', '#8f4dff', '#7a2ff0', '#6620cc', '#521ba3', '#b4b4c2', '#72727f', '#ffffff'];

const tooltipStyle = { background: '#0a0a0d', border: '1px solid #2e2e39', borderRadius: 12, color: '#fff', fontSize: 12 };

export default function Overview() {
  const selection = useStore((s) => s.selection);
  const buildName = useStore((s) => s.buildName);
  const ev = useMemo(() => evaluate(selection), [selection]);
  const power = useMemo(() => estimatePower(selection), [selection]);
  const total = selectionTotal(selection);

  const rows = CATEGORIES.filter((c) => selection[c.id]).map((c, i) => {
    const item = selection[c.id]!;
    const part = PARTS_BY_ID.get(item.id)!;
    return { meta: c, item, part, value: part.price * item.qty, color: SHADES[i % SHADES.length] };
  });

  const cpu = selection.cpu ? PARTS_BY_ID.get(selection.cpu.id) : undefined;
  const cpuPoints = useMemo(
    () =>
      partsOf('cpu')
        .map((p) => ({ name: p.model, price: p.price, perf: performanceScore(p) ?? 0, selected: p.id === cpu?.id }))
        .filter((p) => p.perf > 0),
    [cpu],
  );

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Build Overview" title="Visão geral da montagem" />
        <EmptyState
          icon={<Layers size={26} />}
          title="Sua montagem está vazia"
          text="Adicione componentes no configurador ou carregue uma Ready Build para ver gráficos, consumo e compatibilidade."
          action={
            <div className="flex gap-2">
              <Link to="/builder" className="btn-primary">
                <Wrench size={15} /> Abrir configurador
              </Link>
              <Link to="/ready-builds" className="btn-ghost">
                Ver Ready Builds
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Build Overview"
        title={buildName}
        text="Resumo visual, distribuição de custos, consumo energético e relatório completo de compatibilidade."
        actions={
          <>
            <Link to="/builder" className="btn-ghost">
              Editar montagem
            </Link>
            <Link to="/print" className="btn-primary">
              Versão imprimível
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="label">Total estimado</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{formatBRL(total)}</p>
          <p className="mt-1 text-xs text-steel-500">valores ilustrativos</p>
        </div>
        <div className="card p-5">
          <p className="label">Compatibilidade</p>
          <div className="mt-3">
            <OverallBadge overall={ev.overall} label={overallLabel(ev)} />
          </div>
          <p className="mt-2 text-xs text-steel-500">
            {ev.counts.ok} ok · {ev.counts.warn} atenção · {ev.counts.error} incompatível · {ev.counts.unknown} sem info
          </p>
        </div>
        <div className="card p-5">
          <p className="label flex items-center gap-1">
            <Zap size={12} /> Consumo estimado
          </p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{power.total} W</p>
          <p className="mt-1 text-xs text-steel-500">pico somado dos componentes</p>
        </div>
        <div className="card p-5">
          <p className="label">Fonte recomendada</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{power.recommended > 0 ? `${power.recommended} W+` : '—'}</p>
          <p className="mt-1 text-xs text-steel-500">com 25% de margem</p>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-1 text-lg font-semibold">Distribuição de preços</h2>
          <p className="mb-4 text-xs text-steel-500">Participação de cada categoria no valor total.</p>
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rows.map((r) => ({ name: r.meta.short, value: r.value }))} dataKey="value" innerRadius="58%" outerRadius="92%" paddingAngle={2} stroke="#0a0a0d" strokeWidth={2}>
                    {rows.map((r) => (
                      <Cell key={r.meta.id} fill={r.color} />
                    ))}
                  </Pie>
                  <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => formatBRL(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1.5 text-xs">
              {rows.map((r) => (
                <li key={r.meta.id} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} />
                  <span className="w-20 text-steel-300">{r.meta.short}</span>
                  <span className="tabular-nums text-steel-100">{Math.round((r.value / total) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-1 text-lg font-semibold">Consumo energético estimado</h2>
          <p className="mb-4 text-xs text-steel-500">Pico por componente (W). Estimativa baseada em TDP/TGP, não medição real.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={power.breakdown} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid stroke="#23232c" horizontal={false} />
                <XAxis type="number" stroke="#72727f" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="label" width={120} stroke="#9393a3" fontSize={11} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(143,77,255,.1)' }} formatter={(v: number) => `${v} W`} />
                <Bar dataKey="watts" fill="#8f4dff" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mb-6">
        <h2 className="mb-4 text-lg font-semibold">Componentes por categoria</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <div key={r.meta.id} className="card card-hover flex gap-4 p-4">
              <PartImage part={r.part} size="sm" className="!h-20 !w-20" />
              <div className="min-w-0 flex-1">
                <p className="label flex items-center gap-1.5 !text-[10px]">
                  <r.meta.icon size={12} /> {r.meta.label}
                  {r.item.qty > 1 && <span className="rounded bg-brand-500/25 px-1 text-brand-200">x{r.item.qty}</span>}
                </p>
                <p className="mt-1 truncate font-medium" title={r.part.name}>
                  {r.part.name}
                </p>
                <p className="mt-0.5 text-sm tabular-nums text-steel-300">{formatBRL(r.value)}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-steel-500">
                  {specRows(r.part)
                    .filter((s) => s.raw !== null)
                    .slice(0, 4)
                    .map((s) => `${s.label}: ${s.value}`)
                    .join(' · ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-6 p-5">
        <h2 className="mb-1 text-lg font-semibold">Preço x desempenho (processadores)</h2>
        {cpu ? (
          <>
            <p className="mb-4 text-xs text-steel-500">
              O índice usa threads x clock máximo + cache L3 apenas como referência relativa entre CPUs do catálogo. Não é benchmark e não considera arquitetura. Seu processador está em branco.
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid stroke="#23232c" />
                  <XAxis type="number" dataKey="price" name="Preço" stroke="#72727f" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                  <YAxis type="number" dataKey="perf" name="Índice" stroke="#72727f" fontSize={11} />
                  <ZAxis range={[70, 70]} />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} formatter={(v: number, n: string) => (n === 'Preço' ? formatBRL(v) : v)} labelFormatter={() => ''} />
                  <Scatter data={cpuPoints.filter((p) => !p.selected)} fill="#8f4dff" fillOpacity={0.7} />
                  <Scatter data={cpuPoints.filter((p) => p.selected)} fill="#ffffff" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-ink-500 p-4 text-sm text-steel-400">
            Selecione um processador para comparar preço e desempenho relativo. Não há dados suficientes para outras categorias, então nenhuma comparação é exibida para elas.
          </p>
        )}
      </section>

      <section className="card p-5">
        <h2 className="mb-1 text-lg font-semibold">Relatório de compatibilidade</h2>
        <p className="mb-4 text-xs text-steel-500">Cada verificação usa apenas dados do catálogo. Quando um dado não existe, o resultado é "Informação insuficiente".</p>
        {ev.missing.length > 0 && (
          <div className="mb-4 rounded-xl border border-dashed border-steel-500 p-3 text-sm text-steel-300">
            <span className="font-medium text-white">Montagem incompleta.</span> Faltam: {ev.missing.map((m) => CATEGORY_MAP[m].short).join(', ')}.
          </div>
        )}
        {ev.checks.length === 0 ? (
          <p className="text-sm text-steel-400">Adicione mais de um componente para iniciar as verificações.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {[...ev.checks]
              .sort((a, b) => ['error', 'warn', 'unknown', 'ok'].indexOf(a.status) - ['error', 'warn', 'unknown', 'ok'].indexOf(b.status))
              .map((c) => (
                <li key={c.id} className="flex gap-3 rounded-xl border border-ink-500/70 bg-ink-900/60 p-3.5 text-sm">
                  <span className={`mt-0.5 shrink-0 ${c.status === 'ok' ? 'text-brand-400' : 'text-white'}`}>
                    <StatusIcon status={c.status} size={18} />
                  </span>
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="mt-0.5 text-steel-300">{c.message}</p>
                    {c.fix && <p className="mt-1.5 text-brand-300">Como resolver: {c.fix}</p>}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}


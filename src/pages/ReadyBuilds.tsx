import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Flame, Gamepad2, Rocket, Sprout, Wrench, Zap, type LucideIcon } from 'lucide-react';
import PartImage from '@/components/PartImage';
import { OverallBadge, PageHeader } from '@/components/ui';
import { PARTS_BY_ID, READY_BUILDS } from '@/data/catalog';
import { CATEGORIES } from '@/lib/categories';
import { evaluate, overallLabel } from '@/lib/compat';
import { formatBRL } from '@/lib/format';
import { estimatePower } from '@/lib/power';
import { sanitizeSelection, selectionTotal } from '@/lib/share';
import type { Category, ReadyBuild, Selection } from '@/lib/types';
import { useStore } from '@/store/useStore';

const ICONS: Record<string, LucideIcon> = {
  'entry-level': Sprout,
  'budget-gamer': Gamepad2,
  'mid-range': Rocket,
  'high-performance': Flame,
  enthusiast: Crown,
};

export function readySelection(ready: ReadyBuild): Selection {
  const items: Selection = {};
  (Object.entries(ready.items) as [Category, string | [string, number]][]).forEach(([cat, value]) => {
    const [id, qty] = Array.isArray(value) ? value : [value, 1];
    items[cat] = { id, qty };
  });
  return sanitizeSelection(items);
}

export default function ReadyBuilds() {
  const loadReady = useStore((s) => s.loadReady);
  const navigate = useNavigate();

  const data = useMemo(
    () =>
      READY_BUILDS.map((b) => {
        const sel = readySelection(b);
        return { build: b, sel, total: selectionTotal(sel), ev: evaluate(sel), power: estimatePower(sel) };
      }),
    [],
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Ready Builds"
        title="Configurações prontas para começar"
        text="Escolha um ponto de partida, carregue no configurador e modifique qualquer componente. Os valores são estimativas ilustrativas, não cotações."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {data.map(({ build, sel, total, ev, power }, idx) => {
          const Icon = ICONS[build.id] ?? Wrench;
          return (
            <article key={build.id} className="card card-hover animate-fade-up flex flex-col p-5" style={{ animationDelay: `${idx * 70}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-brand-500/40 bg-brand-500/15 text-brand-300">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="label !text-brand-400">Tier {idx + 1} de {data.length}</p>
                    <h2 className="text-xl font-bold">{build.name}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold tabular-nums">{formatBRL(total)}</p>
                  <p className="text-[10px] text-steel-500">estimativa ilustrativa</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-steel-300">{build.purpose}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {build.targets.map((t) => (
                  <li key={t} className="chip !text-[11px]">
                    <Check size={11} className="text-brand-400" /> {t}
                  </li>
                ))}
              </ul>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {CATEGORIES.filter((c) => sel[c.id]).map((c) => {
                  const part = PARTS_BY_ID.get(sel[c.id]!.id)!;
                  return (
                    <li key={c.id} className="flex items-center gap-2.5 rounded-xl border border-ink-500/60 bg-ink-900/60 p-2">
                      <PartImage part={part} size="sm" className="!h-10 !w-10" />
                      <div className="min-w-0">
                        <p className="label !text-[9px]">{c.short}</p>
                        <p className="truncate text-xs font-medium" title={part.name}>
                          {part.model}
                          {sel[c.id]!.qty > 1 ? ` x${sel[c.id]!.qty}` : ''}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-500/70 pt-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-steel-400">
                  <OverallBadge overall={ev.overall} label={overallLabel(ev)} />
                  <span className="inline-flex items-center gap-1">
                    <Zap size={12} /> {power.total} W · fonte {power.recommended} W+
                  </span>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    loadReady(build.id);
                    navigate('/builder');
                  }}
                >
                  <Wrench size={15} /> Carregar no configurador
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

import { Check, Info, Plus, Repeat, Scale } from 'lucide-react';
import { highlights } from '@/lib/specs';
import { formatBRL } from '@/lib/format';
import type { Check as CheckItem, Part, Status } from '@/lib/types';
import PartImage from './PartImage';
import { StatusBadge, Tooltip } from './ui';

interface Props {
  part: Part;
  selected: boolean;
  hasOther: boolean;
  status: Status | null;
  checks: CheckItem[];
  comparing: boolean;
  onSelect: () => void;
  onDetails: () => void;
  onCompare: () => void;
}

export default function PartCard({ part, selected, hasOther, status, checks, comparing, onSelect, onDetails, onCompare }: Props) {
  const issue = checks.find((c) => c.status === 'error') ?? checks.find((c) => c.status === 'warn') ?? checks.find((c) => c.status === 'unknown');
  return (
    <article
      className={`card card-hover animate-fade-up flex flex-col p-3 ${selected ? 'border-brand-500 shadow-glow' : ''}`}
      style={{ animationDuration: '.4s' }}
    >
      <div className="relative">
        <PartImage part={part} />
        {selected && (
          <span className="animate-pop absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[10.5px] font-semibold text-white">
            <Check size={11} /> Na montagem
          </span>
        )}
      </div>
      <div className="mt-3 flex-1">
        <p className="label !text-[10px]">{part.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug">{part.model}</h3>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {highlights(part)
            .slice(0, 4)
            .map((h) => (
              <li key={h} className="rounded-md border border-ink-500/80 bg-ink-900 px-1.5 py-0.5 text-[10.5px] text-steel-300">
                {h}
              </li>
            ))}
        </ul>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold tabular-nums">{formatBRL(part.price)}</p>
          <p className="text-[10px] text-steel-500">valor ilustrativo</p>
        </div>
        {status && status !== 'ok' ? (
          <Tooltip text={issue?.message ?? ''}>
            <span tabIndex={0}>
              <StatusBadge status={status} small />
            </span>
          </Tooltip>
        ) : status === 'ok' && checks.length > 0 ? (
          <StatusBadge status="ok" small />
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
        <button className={selected ? 'btn-ghost btn-sm' : hasOther ? 'btn-ghost btn-sm !border-brand-500/60 !text-brand-200' : 'btn-primary btn-sm'} onClick={onSelect} disabled={selected}>
          {selected ? (
            <>
              <Check size={14} /> Adicionado
            </>
          ) : hasOther ? (
            <>
              <Repeat size={14} /> Substituir
            </>
          ) : (
            <>
              <Plus size={14} /> Adicionar
            </>
          )}
        </button>
        <Tooltip text={comparing ? 'Remover do comparador' : 'Adicionar ao comparador'}>
          <button className={`btn-ghost btn-sm !px-2.5 ${comparing ? '!border-brand-500 !bg-brand-500/20 !text-brand-200' : ''}`} onClick={onCompare} aria-pressed={comparing} aria-label="Comparar">
            <Scale size={14} />
          </button>
        </Tooltip>
        <Tooltip text="Ver detalhes e compatibilidade">
          <button className="btn-ghost btn-sm !px-2.5" onClick={onDetails} aria-label="Detalhes">
            <Info size={14} />
          </button>
        </Tooltip>
      </div>
    </article>
  );
}

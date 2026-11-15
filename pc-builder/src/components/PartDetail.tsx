import { Plus, Repeat, Scale } from 'lucide-react';
import { candidateStatus } from '@/lib/compat';
import { CATEGORY_MAP } from '@/lib/categories';
import { formatBRL } from '@/lib/format';
import { specRows } from '@/lib/specs';
import type { Part } from '@/lib/types';
import { useStore } from '@/store/useStore';
import PartImage from './PartImage';
import { Modal, StatusBadge, StatusIcon } from './ui';

export default function PartDetail({ part, onClose }: { part: Part | null; onClose: () => void }) {
  const selection = useStore((s) => s.selection);
  const setPart = useStore((s) => s.setPart);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const compare = useStore((s) => s.compare);

  if (!part) return <Modal open={false} onClose={onClose} title="" children={null} />;
  const meta = CATEGORY_MAP[part.category];
  const current = selection[part.category];
  const selected = current?.id === part.id;
  const { status, checks } = candidateStatus(selection, part.category, part.id, current?.id === part.id ? current.qty : 1);
  const relevant = checks.filter((c) => !(c.status === 'ok' && c.parts.length === 0));
  const inCompare = (compare[part.category] ?? []).includes(part.id);

  return (
    <Modal open onClose={onClose} title={part.name} wide>
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <PartImage part={part} size="lg" />
          <div>
            <p className="font-display text-3xl font-bold tabular-nums">{formatBRL(part.price)}</p>
            <p className="mt-1 text-xs text-steel-500">Valor ilustrativo e editável, não representa cotação atualizada.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              className={selected ? 'btn-ghost' : 'btn-primary'}
              disabled={selected}
              onClick={() => {
                setPart(part.category, part.id);
                onClose();
              }}
            >
              {selected ? 'Já está na montagem' : current ? (<><Repeat size={15} /> Substituir na montagem</>) : (<><Plus size={15} /> Adicionar à montagem</>)}
            </button>
            <button className="btn-ghost" onClick={() => toggleCompare(part.category, part.id)}>
              <Scale size={15} /> {inCompare ? 'Remover do comparador' : 'Adicionar ao comparador'}
            </button>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="chip">{meta.label}</span>
              <span className="chip">{part.brand}</span>
              <span className="chip">Modelo: {part.model}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-steel-300">{part.description}</p>
            <p className="mt-2 text-xs text-steel-500">Disponibilidade: não verificada (nenhuma fonte de estoque confiável é consultada).</p>
          </div>
          <div>
            <p className="label mb-2">Especificações técnicas</p>
            <dl className="divide-y divide-ink-500/60 overflow-hidden rounded-xl border border-ink-500/70 text-sm">
              {specRows(part).map((r) => (
                <div key={r.key} className="grid grid-cols-[150px_1fr] gap-3 px-3 py-2 odd:bg-ink-900/60">
                  <dt className="text-steel-400">{r.label}</dt>
                  <dd className="text-white">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="label">Compatibilidade com sua montagem</p>
              {relevant.length > 0 && <StatusBadge status={status} small />}
            </div>
            {relevant.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ink-500 p-3 text-sm text-steel-400">
                Ainda não há peças relacionadas na montagem para validar. Adicione outros componentes para ver as verificações.
              </p>
            ) : (
              <ul className="space-y-2">
                {relevant.map((c) => (
                  <li key={c.id} className="flex gap-3 rounded-xl border border-ink-500/70 bg-ink-900/60 p-3 text-sm">
                    <span className={c.status === 'ok' ? 'text-brand-400' : 'text-white'}>
                      <StatusIcon status={c.status} />
                    </span>
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="mt-0.5 text-steel-300">{c.message}</p>
                      {c.fix && <p className="mt-1 text-brand-300">Como resolver: {c.fix}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

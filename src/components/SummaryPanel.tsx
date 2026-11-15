import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Minus, Plus, Printer, Save, Share2, Trash2, Repeat, Zap, Layers } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { evaluate, overallLabel } from '@/lib/compat';
import { estimatePower } from '@/lib/power';
import { formatBRL } from '@/lib/format';
import { buildShareUrl, selectionTotal } from '@/lib/share';
import { PARTS_BY_ID } from '@/data/catalog';
import { useStore } from '@/store/useStore';
import PartImage from './PartImage';
import { ConfirmDialog, OverallBadge, StatusIcon } from './ui';

export default function SummaryPanel({ onClose }: { onClose?: () => void }) {
  const selection = useStore((s) => s.selection);
  const buildName = useStore((s) => s.buildName);
  const activeId = useStore((s) => s.activeId);
  const setBuildName = useStore((s) => s.setBuildName);
  const setQty = useStore((s) => s.setQty);
  const removePart = useStore((s) => s.removePart);
  const clearBuild = useStore((s) => s.clearBuild);
  const saveCurrent = useStore((s) => s.saveCurrent);
  const saveAsNew = useStore((s) => s.saveAsNew);
  const notify = useStore((s) => s.notify);
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);

  const ev = useMemo(() => evaluate(selection), [selection]);
  const power = useMemo(() => estimatePower(selection), [selection]);
  const total = selectionTotal(selection);
  const entries = CATEGORIES.filter((c) => selection[c.id]);
  const units = entries.reduce((sum, c) => sum + (selection[c.id]?.qty ?? 0), 0);
  const issues = ev.checks.filter((c) => c.status !== 'ok');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(selection, buildName));
      notify('Link da montagem copiado para a área de transferência.');
    } catch {
      notify('Não foi possível copiar automaticamente. Copie o link na página Minhas builds.', 'error');
    }
  };

  return (
    <aside className="card flex max-h-full flex-col overflow-hidden" aria-label="Resumo da montagem">
      <div className="border-b border-ink-500/70 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="label flex items-center gap-1.5">
            <Layers size={13} /> Sua montagem
          </p>
          <OverallBadge overall={ev.overall} label={overallLabel(ev)} />
        </div>
        <input
          className="input mt-3 !py-2 font-medium"
          value={buildName}
          onChange={(e) => setBuildName(e.target.value)}
          maxLength={60}
          aria-label="Nome da montagem"
        />
      </div>

      <div className="min-h-[120px] flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-steel-400">
            <p className="font-medium text-steel-200">Nenhum componente ainda</p>
            <p className="mt-1">Escolha uma categoria e adicione sua primeira peça.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {entries.map((c) => {
              const item = selection[c.id]!;
              const part = PARTS_BY_ID.get(item.id);
              if (!part) return null;
              const hasIssue = ev.checks.some((k) => k.parts.includes(c.id) && k.status === 'error');
              return (
                <li key={c.id} className="group animate-pop flex items-center gap-3 rounded-xl p-2 transition hover:bg-ink-700/60">
                  <PartImage part={part} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="label !text-[9.5px]">{c.short}</p>
                    <p className="truncate text-[13px] font-medium" title={part.name}>
                      {part.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-steel-400">
                      <span>{formatBRL(part.price * item.qty)}</span>
                      {hasIssue && <StatusIcon status="error" size={12} />}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {c.maxQty > 1 && (
                      <div className="flex items-center gap-1 rounded-lg border border-ink-500 bg-ink-900 text-xs">
                        <button className="p-1 hover:text-brand-300 disabled:opacity-30" onClick={() => setQty(c.id, item.qty - 1)} disabled={item.qty <= 1} aria-label="Diminuir">
                          <Minus size={12} />
                        </button>
                        <span className="w-4 text-center tabular-nums">{item.qty}</span>
                        <button className="p-1 hover:text-brand-300 disabled:opacity-30" onClick={() => setQty(c.id, item.qty + 1)} disabled={item.qty >= c.maxQty} aria-label="Aumentar">
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-0.5 opacity-70 transition group-hover:opacity-100">
                      <Link to={`/builder/${c.id}`} onClick={onClose} className="rounded-md p-1 text-steel-400 hover:bg-ink-600 hover:text-white" aria-label={`Substituir ${c.short}`} title="Substituir">
                        <Repeat size={13} />
                      </Link>
                      <button onClick={() => removePart(c.id)} className="rounded-md p-1 text-steel-400 hover:bg-ink-600 hover:text-white" aria-label={`Remover ${c.short}`} title="Remover">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t border-ink-500/70 p-4">
        {issues.length > 0 && (
          <ul className="max-h-24 space-y-1 overflow-y-auto text-xs">
            {issues.slice(0, 4).map((c) => (
              <li key={c.id} className="flex gap-2 text-steel-300">
                <span className="mt-0.5 shrink-0 text-white">
                  <StatusIcon status={c.status} size={12} />
                </span>
                <span>{c.title}</span>
              </li>
            ))}
            {issues.length > 4 && <li className="text-steel-500">+ {issues.length - 4} alertas no Build Overview</li>}
          </ul>
        )}
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <dt className="text-steel-400">Componentes</dt>
          <dd className="text-right tabular-nums">{units} un.</dd>
          <dt className="flex items-center gap-1 text-steel-400">
            <Zap size={11} /> Consumo estimado
          </dt>
          <dd className="text-right tabular-nums">{power.total} W</dd>
          <dt className="text-steel-400">Fonte recomendada</dt>
          <dd className="text-right tabular-nums">{power.recommended > 0 ? `${power.recommended} W+` : '—'}</dd>
        </dl>
        <div className="flex items-end justify-between border-t border-ink-500/70 pt-3">
          <div>
            <p className="label">Total estimado</p>
            <p className="text-[10px] text-steel-500">Valores ilustrativos</p>
          </div>
          <p key={total} className="animate-pop font-display text-2xl font-bold tabular-nums">
            {formatBRL(total)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-primary btn-sm" disabled={entries.length === 0} onClick={() => saveCurrent()}>
            <Save size={14} /> {activeId ? 'Atualizar' : 'Salvar'}
          </button>
          <button className="btn-ghost btn-sm" disabled={entries.length === 0} onClick={() => saveAsNew()}>
            <Copy size={14} /> Salvar como nova
          </button>
          <button className="btn-ghost btn-sm" disabled={entries.length === 0} onClick={copyLink}>
            <Share2 size={14} /> Compartilhar
          </button>
          <button className="btn-ghost btn-sm" disabled={entries.length === 0} onClick={() => navigate('/print')}>
            <Printer size={14} /> Imprimir
          </button>
        </div>
        <div className="flex items-center justify-between text-xs">
          <Link to="/overview" onClick={onClose} className="text-brand-300 hover:underline">
            Abrir Build Overview
          </Link>
          <button className="text-steel-400 hover:text-white disabled:opacity-30" disabled={entries.length === 0} onClick={() => setConfirmClear(true)}>
            Limpar tudo
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmClear}
        title="Limpar montagem?"
        message="Todos os componentes selecionados serão removidos do configurador. Configurações já salvas não são afetadas."
        confirmLabel="Limpar"
        onConfirm={clearBuild}
        onCancel={() => setConfirmClear(false)}
      />
    </aside>
  );
}

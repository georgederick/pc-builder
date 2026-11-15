import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Link2Off, Save, Wrench } from 'lucide-react';
import PartImage from '@/components/PartImage';
import { EmptyState, OverallBadge, PageHeader, StatusIcon } from '@/components/ui';
import { PARTS_BY_ID } from '@/data/catalog';
import { CATEGORIES } from '@/lib/categories';
import { evaluate, overallLabel } from '@/lib/compat';
import { formatBRL } from '@/lib/format';
import { estimatePower } from '@/lib/power';
import { decodeSelection, selectionTotal } from '@/lib/share';
import { useStore } from '@/store/useStore';

export default function Shared() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const loadSelection = useStore((s) => s.loadSelection);
  const saveAsNew = useStore((s) => s.saveAsNew);
  const token = params.get('b') ?? '';
  const name = (params.get('n') ?? 'Build compartilhada').slice(0, 60);

  const sel = useMemo(() => decodeSelection(token), [token]);
  const ev = useMemo(() => evaluate(sel), [sel]);
  const power = useMemo(() => estimatePower(sel), [sel]);
  const entries = CATEGORIES.filter((c) => sel[c.id]);

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <EmptyState
          icon={<Link2Off size={26} />}
          title="Link inválido ou vazio"
          text="Não foi possível ler nenhum componente deste link. Ele pode estar incompleto ou ter sido gerado com uma versão incompatível do catálogo."
          action={
            <Link to="/builder" className="btn-primary">
              Iniciar nova montagem
            </Link>
          }
        />
      </div>
    );
  }

  const open = () => {
    loadSelection(sel, name);
    navigate('/builder');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Build compartilhada"
        title={name}
        text="Esta configuração foi aberta a partir de um link. Carregue no configurador para editar ou salve uma cópia no seu navegador."
        actions={
          <>
            <button
              className="btn-ghost"
              onClick={() => {
                loadSelection(sel, name);
                saveAsNew(name);
              }}
            >
              <Save size={16} /> Salvar cópia
            </button>
            <button className="btn-primary" onClick={open}>
              <Wrench size={16} /> Abrir no configurador
            </button>
          </>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <OverallBadge overall={ev.overall} label={overallLabel(ev)} />
        <span className="text-sm text-steel-300">{power.total} W estimados · fonte {power.recommended} W+</span>
        <span className="ml-auto font-display text-2xl font-bold tabular-nums">{formatBRL(selectionTotal(sel))}</span>
      </div>
      <ul className="space-y-2">
        {entries.map((c) => {
          const part = PARTS_BY_ID.get(sel[c.id]!.id)!;
          const bad = ev.checks.some((k) => k.parts.includes(c.id) && k.status === 'error');
          return (
            <li key={c.id} className="card flex items-center gap-4 p-3">
              <PartImage part={part} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="label !text-[10px]">{c.label}</p>
                <p className="truncate font-medium">
                  {part.name}
                  {sel[c.id]!.qty > 1 ? ` x${sel[c.id]!.qty}` : ''}
                </p>
              </div>
              {bad && <StatusIcon status="error" />}
              <p className="tabular-nums text-steel-200">{formatBRL(part.price * sel[c.id]!.qty)}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

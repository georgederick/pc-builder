import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { LogoMark } from '@/components/ui';
import { PARTS_BY_ID } from '@/data/catalog';
import { CATEGORIES } from '@/lib/categories';
import { evaluate, overallLabel, statusLabel } from '@/lib/compat';
import { formatBRL } from '@/lib/format';
import { estimatePower } from '@/lib/power';
import { selectionTotal } from '@/lib/share';
import { specRows } from '@/lib/specs';
import { SITE } from '@/config/site';
import { useStore } from '@/store/useStore';

export default function PrintView() {
  const selection = useStore((s) => s.selection);
  const name = useStore((s) => s.buildName);
  const ev = useMemo(() => evaluate(selection), [selection]);
  const power = useMemo(() => estimatePower(selection), [selection]);
  const entries = CATEGORIES.filter((c) => selection[c.id]);

  return (
    <div className="min-h-screen bg-white p-6 text-black sm:p-10" style={{ backgroundImage: 'none' }}>
      <style>{`body{background:#fff !important;background-image:none !important}`}</style>
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <Link to="/builder" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#6620cc] px-4 py-2 text-sm font-medium text-white hover:bg-[#521ba3]">
          <Printer size={16} /> Imprimir / salvar PDF
        </button>
      </div>
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <LogoMark size={44} />
            <div>
              <p className="text-xl font-bold leading-none">PC Builder</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-neutral-500">{SITE.slogan}</p>
            </div>
          </div>
          <p className="text-xs text-neutral-500">{new Date().toLocaleDateString('pt-BR')}</p>
        </header>
        <h1 className="mt-6 text-3xl font-bold">{name}</h1>
        {entries.length === 0 ? (
          <p className="mt-6 text-neutral-600">Nenhum componente selecionado.</p>
        ) : (
          <>
            <table className="mt-6 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-black text-left text-xs uppercase tracking-wider text-neutral-500">
                  <th className="py-2">Categoria</th>
                  <th>Componente</th>
                  <th className="text-right">Qtd.</th>
                  <th className="text-right">Preço (ilustrativo)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((c) => {
                  const part = PARTS_BY_ID.get(selection[c.id]!.id)!;
                  const qty = selection[c.id]!.qty;
                  return (
                    <tr key={c.id} className="break-inside-avoid border-b border-neutral-200 align-top">
                      <td className="py-2.5 pr-3 font-medium">{c.label}</td>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium">{part.name}</p>
                        <p className="mt-0.5 text-[11px] text-neutral-500">
                          {specRows(part)
                            .filter((s) => s.raw !== null)
                            .slice(0, 5)
                            .map((s) => `${s.label}: ${s.value}`)
                            .join(' · ')}
                        </p>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{qty}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatBRL(part.price * qty)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right font-semibold">
                    Total estimado
                  </td>
                  <td className="pt-4 text-right text-lg font-bold tabular-nums">{formatBRL(selectionTotal(selection))}</td>
                </tr>
              </tfoot>
            </table>

            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-300 p-3">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Compatibilidade</p>
                <p className="mt-1 font-semibold">{overallLabel(ev)}</p>
              </div>
              <div className="rounded-xl border border-neutral-300 p-3">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Consumo estimado</p>
                <p className="mt-1 font-semibold">{power.total} W</p>
              </div>
              <div className="rounded-xl border border-neutral-300 p-3">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Fonte recomendada</p>
                <p className="mt-1 font-semibold">{power.recommended > 0 ? `${power.recommended} W ou mais` : '—'}</p>
              </div>
            </section>

            {ev.checks.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-2 text-lg font-semibold">Verificações de compatibilidade</h2>
                <ul className="space-y-1.5 text-sm">
                  {ev.checks.map((c) => (
                    <li key={c.id} className="break-inside-avoid">
                      <span className="mr-2 inline-block w-36 text-xs font-semibold uppercase tracking-wide">{statusLabel(c.status)}</span>
                      {c.message}
                      {c.fix ? ` Como resolver: ${c.fix}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
        <footer className="mt-10 border-t border-neutral-300 pt-3 text-[11px] leading-relaxed text-neutral-500">
          Preços são valores ilustrativos e não representam cotações atualizadas. As verificações de compatibilidade usam somente os dados do catálogo; confirme sempre nas fichas
          oficiais dos fabricantes antes de comprar. Gerado por PC Builder — Created by {SITE.creator}.
        </footer>
      </div>
    </div>
  );
}

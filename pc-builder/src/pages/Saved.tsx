import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Download, FolderOpen, Link2, Pencil, Printer, Trash2, Upload, Wrench } from 'lucide-react';
import { ConfirmDialog, EmptyState, Modal, PageHeader } from '@/components/ui';
import { PARTS_BY_ID } from '@/data/catalog';
import { evaluate, overallLabel } from '@/lib/compat';
import { OverallBadge } from '@/components/ui';
import { formatBRL, formatDate } from '@/lib/format';
import { buildShareUrl, downloadFile, exportBuilds, parseImport, selectionTotal } from '@/lib/share';
import { slugify } from '@/lib/format';
import type { SavedBuild } from '@/lib/types';
import { useStore } from '@/store/useStore';

export default function Saved() {
  const saved = useStore((s) => s.saved);
  const loadSaved = useStore((s) => s.loadSaved);
  const duplicateSaved = useStore((s) => s.duplicateSaved);
  const renameSaved = useStore((s) => s.renameSaved);
  const deleteSaved = useStore((s) => s.deleteSaved);
  const importBuilds = useStore((s) => s.importBuilds);
  const notify = useStore((s) => s.notify);
  const loadSelection = useStore((s) => s.loadSelection);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [renaming, setRenaming] = useState<SavedBuild | null>(null);
  const [newName, setNewName] = useState('');
  const [deleting, setDeleting] = useState<SavedBuild | null>(null);

  const open = (b: SavedBuild, to: string) => {
    loadSaved(b.id);
    navigate(to);
  };

  const copyLink = async (b: SavedBuild) => {
    const url = buildShareUrl(b.items, b.name);
    try {
      await navigator.clipboard.writeText(url);
      notify('Link de compartilhamento copiado.');
    } catch {
      window.prompt('Copie o link da montagem:', url);
    }
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      importBuilds(parseImport(await file.text()));
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Não foi possível importar o arquivo.', 'error');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Minhas builds"
        title="Configurações salvas"
        text="Tudo fica salvo apenas neste navegador (LocalStorage). Exporte em JSON para fazer backup ou levar para outro dispositivo."
        actions={
          <>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
            <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Importar JSON
            </button>
            <button className="btn-ghost" disabled={saved.length === 0} onClick={() => downloadFile('pc-builder-builds.json', exportBuilds(saved))}>
              <Download size={16} /> Exportar tudo
            </button>
          </>
        }
      />

      {saved.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={26} />}
          title="Nenhuma configuração salva"
          text="Monte seu PC e clique em Salvar no resumo da montagem, ou importe um arquivo JSON exportado anteriormente."
          action={
            <Link to="/builder" className="btn-primary">
              <Wrench size={15} /> Iniciar montagem
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4">
          {saved.map((b) => {
            const ev = evaluate(b.items);
            const parts = Object.values(b.items)
              .map((i) => PARTS_BY_ID.get(i.id))
              .filter(Boolean);
            return (
              <li key={b.id} className="card card-hover animate-fade-up p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{b.name}</h2>
                    <p className="mt-1 text-xs text-steel-500">
                      Atualizada em {formatDate(b.updatedAt)} · {parts.length} componentes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold tabular-nums">{formatBRL(selectionTotal(b.items))}</p>
                    <OverallBadge overall={ev.overall} label={overallLabel(ev)} />
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs text-steel-400">{parts.map((p) => p!.model).join(' · ')}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-primary btn-sm" onClick={() => open(b, '/builder')}>
                    <Wrench size={14} /> Editar
                  </button>
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => {
                      setRenaming(b);
                      setNewName(b.name);
                    }}
                  >
                    <Pencil size={14} /> Renomear
                  </button>
                  <button className="btn-ghost btn-sm" onClick={() => duplicateSaved(b.id)}>
                    <Copy size={14} /> Duplicar
                  </button>
                  <button className="btn-ghost btn-sm" onClick={() => copyLink(b)}>
                    <Link2 size={14} /> Link
                  </button>
                  <button className="btn-ghost btn-sm" onClick={() => downloadFile(`${slugify(b.name) || 'build'}.json`, exportBuilds([b]))}>
                    <Download size={14} /> JSON
                  </button>
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => {
                      loadSelection(b.items, b.name, b.id);
                      navigate('/print');
                    }}
                  >
                    <Printer size={14} /> Imprimir
                  </button>
                  <button className="btn-ghost btn-sm ml-auto" onClick={() => setDeleting(b)}>
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={!!renaming} onClose={() => setRenaming(null)} title="Renomear configuração">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (renaming) renameSaved(renaming.id, newName);
            setRenaming(null);
          }}
        >
          <input className="input" autoFocus maxLength={60} value={newName} onChange={(e) => setNewName(e.target.value)} aria-label="Novo nome" />
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setRenaming(null)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={!newName.trim()}>
              Salvar nome
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!deleting}
        title="Excluir configuração?"
        message={`"${deleting?.name ?? ''}" será removida deste navegador. Essa ação não pode ser desfeita, a menos que você tenha exportado um backup.`}
        confirmLabel="Excluir"
        onConfirm={() => deleting && deleteSaved(deleting.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

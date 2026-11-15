import { useEffect, useState, type ReactNode } from 'react';
import { CircleCheck, CircleHelp, CircleX, Info, TriangleAlert, X, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Overall, Status } from '@/lib/types';

export function LogoMark({ size = 36, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={animated ? 'animate-float' : ''}>
      <rect x="8" y="5" width="48" height="54" rx="15" fill="#d4d4de" stroke="#0a0a0d" strokeWidth="4" />
      <rect x="13.5" y="10.5" width="37" height="33" rx="10" fill="#17171d" stroke="#8f4dff" strokeWidth="3" />
      <ellipse cx="25.5" cy="24" rx="6" ry="7.5" fill="#fff" stroke="#0a0a0d" strokeWidth="2" />
      <ellipse cx="38.5" cy="24" rx="6" ry="7.5" fill="#fff" stroke="#0a0a0d" strokeWidth="2" />
      <circle cx="27.4" cy="22.6" r="3" fill="#0a0a0d" />
      <circle cx="40.4" cy="22.6" r="3" fill="#0a0a0d" />
      <path d="M22.5 34 Q32 44.5 41.5 34 Q32 36.5 22.5 34Z" fill="#fff" stroke="#0a0a0d" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 20 Q25 16 30 19.5 M34 19.5 Q39 16 44 20" fill="none" stroke="#8f4dff" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="15" y="47.5" width="23" height="5.5" rx="2.5" fill="#9393a3" stroke="#0a0a0d" strokeWidth="2" />
      <circle cx="46" cy="50.2" r="4.2" fill="#8f4dff" stroke="#0a0a0d" strokeWidth="2" />
    </svg>
  );
}

export function Mascot({ className = '' }: { className?: string }) {
  return <img src={`${import.meta.env.BASE_URL}mascot.svg`} alt="Mascote do PC Builder" className={className} draggable={false} />;
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-2.5">
      <span className="transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
        <LogoMark size={36} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl font-bold uppercase tracking-tight [text-shadow:2px_2px_0_#521ba3]">
            PC<span className="text-brand-300"> Builder</span>
          </span>
          <span className="mt-1 hidden text-[8.5px] font-medium uppercase tracking-[0.26em] text-steel-400 sm:block">Build your dream machine</span>
        </span>
      )}
    </span>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  ok: 'border-brand-500/50 bg-brand-500/15 text-brand-200',
  warn: 'border-white/40 bg-white/10 text-white',
  error: 'border-white bg-white text-ink-950',
  unknown: 'border-dashed border-steel-500 bg-transparent text-steel-300',
};

const STATUS_TEXT: Record<Status, string> = {
  ok: 'Compatível',
  warn: 'Atenção',
  error: 'Incompatível',
  unknown: 'Informação insuficiente',
};

export function StatusIcon({ status, size = 16 }: { status: Status; size?: number }) {
  const props = { size, strokeWidth: 2.2 };
  if (status === 'ok') return <CircleCheck {...props} />;
  if (status === 'warn') return <TriangleAlert {...props} />;
  if (status === 'error') return <CircleX {...props} />;
  return <CircleHelp {...props} />;
}

export function StatusBadge({ status, label, small = false }: { status: Status; label?: string; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${STATUS_STYLE[status]} ${small ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-xs'}`}
    >
      <StatusIcon status={status} size={small ? 12 : 14} />
      {label ?? STATUS_TEXT[status]}
    </span>
  );
}

export function OverallBadge({ overall, label }: { overall: Overall; label: string }) {
  if (overall === 'empty') {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-500 px-2.5 py-1 text-xs text-steel-400">{label}</span>;
  }
  return <StatusBadge status={overall} label={label} />;
}

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[240px] -translate-x-1/2 translate-y-1 rounded-lg border border-ink-500 bg-ink-900 px-2.5 py-1.5 text-center text-[11px] leading-snug text-steel-100 opacity-0 shadow-soft transition-all duration-150 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Fechar" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`animate-pop card relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-b-none bg-ink-850 shadow-soft sm:rounded-2xl ${wide ? 'max-w-4xl' : 'max-w-lg'}`}
      >
        <div className="flex items-center justify-between border-b border-ink-500/70 px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-steel-400 transition hover:bg-ink-600 hover:text-white" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm leading-relaxed text-steel-300">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="btn-white"
          onClick={() => {
            onConfirm();
            onCancel();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(92vw,360px)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-slide-in pointer-events-auto flex items-start gap-3 rounded-xl border border-ink-500 bg-ink-850/95 px-4 py-3 text-sm shadow-soft backdrop-blur"
        >
          <span className={`mt-0.5 ${t.kind === 'error' ? 'text-white' : 'text-brand-400'}`}>
            {t.kind === 'success' ? <Check size={16} /> : t.kind === 'error' ? <TriangleAlert size={16} /> : <Info size={16} />}
          </span>
          <span className="flex-1 text-steel-100">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-steel-500 hover:text-white" aria-label="Dispensar">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 border-dashed px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-ink-500 bg-ink-700 text-brand-400">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-steel-400">{text}</p>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, text, actions }: { eyebrow: string; title: string; text?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="label text-brand-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
        {text && <p className="mt-3 text-steel-300">{text}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function useDebounced<T>(value: T, delay = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function SocialIcon({ name, size = 18 }: { name: 'github' | 'linkedin' | 'instagram' | 'x'; size?: number }) {
  const paths: Record<string, string> = {
    github:
      'M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z',
    linkedin:
      'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z',
    instagram:
      'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z',
    x: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41Z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

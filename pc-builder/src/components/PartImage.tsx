import { CATEGORY_MAP } from '@/lib/categories';
import type { Part } from '@/lib/types';

const hash = (text: string) => {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
};

export default function PartImage({ part, size = 'md', className = '' }: { part: Part; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const Icon = CATEGORY_MAP[part.category].icon;
  const h = hash(part.id);
  const angle = h % 360;
  const dots = Array.from({ length: 6 }, (_, i) => ({ x: ((h >> (i * 3)) % 90) + 5, y: ((h >> (i * 2 + 1)) % 90) + 5, r: (i % 3) + 1 }));
  const dim = size === 'sm' ? 'h-12 w-12 rounded-lg' : size === 'lg' ? 'h-48 w-full rounded-2xl' : 'aspect-[4/3] w-full rounded-xl';
  const icon = size === 'sm' ? 20 : size === 'lg' ? 64 : 44;
  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden border border-ink-500/70 bg-ink-900 ${dim} ${className}`}
      role="img"
      aria-label={`Ilustração: ${part.name}`}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{ background: `conic-gradient(from ${angle}deg at 70% 30%, rgba(143,77,255,.28), rgba(10,10,13,0) 40%, rgba(143,77,255,.12) 70%, rgba(10,10,13,0))` }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <g stroke="#2e2e39" strokeWidth=".5">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${i * 12.5} 0V100M0 ${i * 12.5}H100`} />
          ))}
        </g>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r * 0.6} fill="#8f4dff" opacity=".55" />
        ))}
      </svg>
      <div className="relative flex flex-col items-center gap-1.5 text-brand-300">
        <Icon size={icon} strokeWidth={1.4} />
        {size !== 'sm' && <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-steel-300">{part.brand}</span>}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Wrench } from 'lucide-react';
import { Logo, SocialIcon, Toasts } from './ui';
import { SITE } from '@/config/site';
import { selectionCount, useStore } from '@/store/useStore';

const NAV = [
  { to: '/builder', label: 'Configurador' },
  { to: '/overview', label: 'Build Overview' },
  { to: '/compare', label: 'Comparador' },
  { to: '/ready-builds', label: 'Ready Builds' },
  { to: '/saved', label: 'Minhas builds' },
  { to: '/about', label: 'About' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const count = useStore((s) => selectionCount(s.selection));

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-brand-500/15 text-white' : 'text-steel-300 hover:bg-ink-700 hover:text-white'}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`no-print sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? 'border-ink-500/70 bg-ink-950/85 backdrop-blur-xl' : 'border-transparent bg-transparent'}`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="PC Builder - início">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/builder" className="btn-primary btn-sm hidden sm:inline-flex">
              <Wrench size={14} />
              {count > 0 ? `Continuar (${count})` : 'Iniciar montagem'}
            </Link>
            <button className="btn-ghost btn-sm lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="animate-pop border-t border-ink-500/70 bg-ink-950/95 px-4 py-3 backdrop-blur-xl lg:hidden" aria-label="Mobile">
            <div className="grid gap-1">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={linkClass}>
                  {n.label}
                </NavLink>
              ))}
              <Link to="/builder" className="btn-primary mt-2">
                <Wrench size={14} />
                {count > 0 ? `Continuar montagem (${count})` : 'Iniciar montagem'}
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="no-print mt-20 border-t border-ink-500/70 bg-ink-900/60">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-steel-400">{SITE.description}</p>
            <p className="mt-4 text-sm text-steel-300">
              Created by <span className="font-semibold text-white">{SITE.creator}</span>
            </p>
          </div>
          <div>
            <p className="label mb-3">Plataforma</p>
            <ul className="space-y-2 text-sm text-steel-300">
              {NAV.slice(0, 5).map((n) => (
                <li key={n.to}>
                  <Link className="transition hover:text-brand-300" to={n.to}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-3">Conecte-se</p>
            <div className="flex gap-2">
              {(['github', 'linkedin', 'instagram', 'x'] as const).map((k) => (
                <a
                  key={k}
                  href={SITE.links[k]}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={k}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-ink-500 bg-ink-800 text-steel-300 transition hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-300"
                >
                  <SocialIcon name={k} />
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-steel-500">
              Preços exibidos são valores ilustrativos e editáveis, não cotações atualizadas.
            </p>
          </div>
        </div>
        <div className="border-t border-ink-500/50 py-4 text-center text-xs text-steel-500">
          © {SITE.year} {SITE.name} — {SITE.slogan} Created by {SITE.creator}.
        </div>
      </footer>
      <Toasts />
    </div>
  );
}

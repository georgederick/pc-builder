import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Check, Layers, Scale, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import HeroPC from '@/components/HeroPC';
import { RULES } from '@/lib/compat';
import { CATEGORIES } from '@/lib/categories';
import { BRANDS, PARTS, READY_BUILDS } from '@/data/catalog';
import { formatBRL } from '@/lib/format';
import { selectionTotal } from '@/lib/share';
import { readySelection } from '@/pages/ReadyBuilds';
import { useStore } from '@/store/useStore';

const STEPS = [
  { icon: Wrench, title: 'Escolha as peças', text: 'Navegue por 10 categorias com busca, filtros técnicos e ordenação.' },
  { icon: ShieldCheck, title: 'Valide a compatibilidade', text: 'Cada seleção é checada na hora, com explicação e como resolver.' },
  { icon: BarChart3, title: 'Analise o resultado', text: 'Custo, consumo e fonte recomendada em gráficos interativos.' },
  { icon: Layers, title: 'Salve e compartilhe', text: 'Guarde no navegador, exporte em JSON, imprima ou gere um link.' },
];

export default function Home() {
  const navigate = useNavigate();
  const loadReady = useStore((s) => s.loadReady);

  const stats = [
    { value: PARTS.length, label: 'Componentes no catálogo' },
    { value: BRANDS.length, label: 'Fabricantes' },
    { value: RULES.length, label: 'Regras de compatibilidade' },
    { value: READY_BUILDS.length, label: 'Ready Builds' },
  ];

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-8 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-16">
          <div className="animate-fade-up">
            <span className="chip !border-brand-500/50 !bg-brand-500/10 !text-brand-200">
              <Sparkles size={13} /> Created by Georgederick
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-[1.02] sm:text-6xl xl:text-7xl">
              Build your
              <br />
              <span className="text-gradient">dream machine.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-steel-300">
              Monte seu computador peça por peça, com verificação de compatibilidade em tempo real, comparador técnico, gráficos de custo e consumo, e builds prontas para começar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/builder" className="btn-primary !px-6 !py-3.5 !text-base">
                <Wrench size={18} /> Iniciar montagem
              </Link>
              <Link to="/ready-builds" className="btn-ghost !px-6 !py-3.5 !text-base">
                Ver Ready Builds <ArrowRight size={16} />
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-steel-400">
              {['Sem cadastro', '100% no navegador', 'Salva localmente'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check size={14} className="text-brand-400" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto h-[420px] w-full max-w-[520px] animate-fade-up sm:h-[540px]" style={{ animationDelay: '.15s' }}>
            <HeroPC />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="card grid grid-cols-2 divide-x divide-y divide-ink-500/60 overflow-hidden lg:grid-cols-4 lg:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="p-6 text-center">
              <p className="text-gradient font-display text-4xl font-bold tabular-nums">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-steel-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-[1400px] px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label text-brand-400">Configurações populares</p>
            <h2 className="mt-2 text-3xl font-bold">Comece por uma build pronta</h2>
          </div>
          <Link to="/ready-builds" className="text-sm text-brand-300 hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {READY_BUILDS.filter((b) => ['budget-gamer', 'mid-range', 'high-performance'].includes(b.id)).map((b) => (
            <article key={b.id} className="card card-hover group flex flex-col p-6">
              <p className="label text-brand-400">{b.tier}</p>
              <h3 className="mt-2 text-xl font-semibold">{b.name}</h3>
              <p className="mt-2 flex-1 text-sm text-steel-300">{b.purpose}</p>
              <p className="mt-5 font-display text-2xl font-bold tabular-nums">{formatBRL(selectionTotal(readySelection(b)))}</p>
              <p className="text-[10px] text-steel-500">estimativa ilustrativa</p>
              <button
                className="btn-ghost mt-4 group-hover:!border-brand-500 group-hover:!bg-brand-500/15"
                onClick={() => {
                  loadReady(b.id);
                  navigate('/builder');
                }}
              >
                Carregar no configurador <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-[1400px] px-4 sm:px-6">
        <p className="label text-brand-400">Categorias</p>
        <h2 className="mb-8 mt-2 text-3xl font-bold">Todas as peças do seu PC</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/builder/${c.id}`} className="card card-hover group p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-ink-500 bg-ink-700 text-brand-300 transition group-hover:border-brand-500 group-hover:bg-brand-500/20">
                <c.icon size={20} />
              </span>
              <p className="mt-4 font-semibold">{c.label}</p>
              <p className="mt-1 text-xs text-steel-500">{PARTS.filter((p) => p.category === c.id).length} produtos</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-[1400px] px-4 sm:px-6">
        <p className="label text-brand-400">Como funciona</p>
        <h2 className="mb-8 mt-2 text-3xl font-bold">Quatro passos até a sua máquina</h2>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card relative p-6">
              <span className="absolute right-5 top-4 font-display text-5xl font-bold text-ink-600">{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white shadow-glow">
                <s.icon size={20} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-300">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-20 max-w-[1400px] px-4 sm:px-6">
        <div className="card relative overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Pronto para montar?</h2>
              <p className="mt-3 max-w-xl text-steel-300">Sem cadastro, sem custo. Escolha seus componentes e veja a compatibilidade na hora.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/builder" className="btn-primary !px-6 !py-3.5">
                <Wrench size={17} /> Iniciar montagem
              </Link>
              <Link to="/compare" className="btn-ghost !px-6 !py-3.5">
                <Scale size={17} /> Comparador
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

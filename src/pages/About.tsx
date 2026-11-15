import { Link } from 'react-router-dom';
import { Database, ShieldCheck, Wrench } from 'lucide-react';
import { Mascot, SocialIcon } from '@/components/ui';
import { SITE } from '@/config/site';

export default function About() {
  const socials = [
    { key: 'github', label: 'GitHub' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'x', label: 'X' },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up text-center">
        <Mascot className="mx-auto h-64 w-auto animate-float" />
        <p className="label mt-6 text-brand-400">About</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{SITE.name}</h1>
        <p className="mt-2 text-steel-400">{SITE.slogan}</p>
      </div>

      <div className="card mt-10 p-6 sm:p-8">
        <p className="text-lg leading-relaxed text-steel-100">
          O PC Builder nasceu da ideia de tornar a montagem de computadores mais acessível, intuitiva e transparente. A plataforma permite explorar componentes, entender
          especificações técnicas e construir configurações personalizadas, com ferramentas de compatibilidade e comparação.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: 'Transparência', text: 'Quando falta um dado técnico, o resultado é "Informação insuficiente", nunca um falso "compatível".' },
          { icon: Database, title: 'Dados honestos', text: 'Especificações de produtos conhecidos e preços marcados como valores ilustrativos e editáveis.' },
          { icon: Wrench, title: '100% no navegador', text: 'Sem backend, sem cadastro e sem serviços pagos. Tudo é salvo localmente.' },
        ].map((f) => (
          <div key={f.title} className="card p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-brand-500/40 bg-brand-500/15 text-brand-300">
              <f.icon size={18} />
            </span>
            <h2 className="mt-4 text-base font-semibold">{f.title}</h2>
            <p className="mt-1.5 text-sm text-steel-300">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-6 sm:p-8">
        <p className="label">Créditos</p>
        <p className="mt-2 text-2xl font-bold">
          Created by <span className="text-gradient">{SITE.creator}</span>
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {socials.map((s) => (
            <a key={s.key} href={SITE.links[s.key]} target="_blank" rel="noreferrer noopener" className="btn-ghost">
              <SocialIcon name={s.key} size={16} /> {s.label}
            </a>
          ))}
        </div>
        <p className="mt-5 text-xs text-steel-500">Os endereços das redes são configuráveis em um único arquivo: src/config/site.ts.</p>
      </div>

      <div className="mt-8 text-center">
        <Link to="/builder" className="btn-primary !px-6 !py-3">
          <Wrench size={16} /> Começar a montar
        </Link>
      </div>
    </div>
  );
}

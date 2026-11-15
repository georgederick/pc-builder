const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export const formatBRL = (value: number) => brl.format(value);
export const formatNum = (value: number) => num.format(value);

export const formatCapacity = (gb: number) => (gb >= 1000 ? `${formatNum(gb / 1000)} TB` : `${gb} GB`);

export const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);

export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

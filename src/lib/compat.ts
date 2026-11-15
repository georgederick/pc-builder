import { PARTS_BY_ID } from '@/data/catalog';
import { estimatePower, pick } from './power';
import type { Category, Check, Evaluation, Overall, Selection, Status } from './types';

const severity: Record<Status, number> = { ok: 0, unknown: 1, warn: 2, error: 3 };

export const worst = (list: Status[]): Status =>
  list.reduce<Status>((acc, s) => (severity[s] > severity[acc] ? s : acc), 'ok');

export const RULES = [
  'Socket do processador',
  'Versão de BIOS',
  'Tipo de memória',
  'Memória x processador',
  'Frequência da memória',
  'Slots e capacidade de RAM',
  'Formato da placa-mãe',
  'Comprimento da GPU',
  'Altura do cooler / radiador',
  'Socket do cooler',
  'Capacidade térmica',
  'Cooler incluso',
  'Saída de vídeo',
  'Potência da fonte',
  'Conectores da GPU',
  'Slots M.2',
  'Geração do M.2',
  'Portas SATA',
  'Baias do gabinete',
  'Ventoinhas',
];

export function evaluate(sel: Selection): Evaluation {
  const checks: Check[] = [];
  const push = (c: Check) => checks.push(c);

  const cpu = pick(sel, 'cpu')?.part;
  const mb = pick(sel, 'motherboard')?.part;
  const ramItem = pick(sel, 'ram');
  const ram = ramItem?.part;
  const gpu = pick(sel, 'gpu')?.part;
  const ssdItem = pick(sel, 'ssd');
  const hddItem = pick(sel, 'hdd');
  const psu = pick(sel, 'psu')?.part;
  const pcCase = pick(sel, 'case')?.part;
  const cooler = pick(sel, 'cooler')?.part;
  const fanItem = pick(sel, 'fan');

  if (cpu && mb) {
    const same = cpu.specs.socket === mb.specs.socket;
    push({
      id: 'socket',
      title: 'Socket do processador',
      status: same ? 'ok' : 'error',
      message: same
        ? `${cpu.name} e ${mb.name} usam o socket ${cpu.specs.socket}.`
        : `${cpu.name} usa o socket ${cpu.specs.socket}, mas ${mb.name} usa ${mb.specs.socket}. As peças não encaixam fisicamente.`,
      fix: same ? undefined : `Escolha uma placa-mãe com socket ${cpu.specs.socket} ou um processador com socket ${mb.specs.socket}.`,
      parts: ['cpu', 'motherboard'],
    });
    if (same && cpu.specs.biosChipsets?.includes(mb.specs.chipset)) {
      push({
        id: 'bios',
        title: 'Versão de BIOS',
        status: 'warn',
        message: `${cpu.name} pode exigir atualização de BIOS na ${mb.name} (chipset ${mb.specs.chipset}) para ser reconhecido.`,
        fix: 'Consulte a lista de CPUs compatíveis no site do fabricante da placa e confirme a versão mínima de BIOS, ou peça à loja para atualizá-la.',
        parts: ['cpu', 'motherboard'],
      });
    }
  }

  if (mb && ram) {
    const same = mb.specs.memoryType === ram.specs.type;
    push({
      id: 'memory-type',
      title: 'Tipo de memória',
      status: same ? 'ok' : 'error',
      message: same
        ? `${ram.specs.type} é aceita pela ${mb.name}.`
        : `${mb.name} aceita ${mb.specs.memoryType}, mas ${ram.name} é ${ram.specs.type}. Os módulos têm encaixes diferentes.`,
      fix: same ? undefined : `Escolha uma memória ${mb.specs.memoryType} ou uma placa-mãe compatível com ${ram.specs.type}.`,
      parts: ['motherboard', 'ram'],
    });
  }

  if (cpu && ram) {
    const supported = cpu.specs.memoryTypes.includes(ram.specs.type);
    push({
      id: 'cpu-memory',
      title: 'Memória x processador',
      status: supported ? 'ok' : 'error',
      message: supported
        ? `${cpu.name} suporta ${ram.specs.type}.`
        : `${cpu.name} suporta apenas ${cpu.specs.memoryTypes.join(' / ')}, não ${ram.specs.type}.`,
      fix: supported ? undefined : `Use memória ${cpu.specs.memoryTypes.join(' ou ')}.`,
      parts: ['cpu', 'ram'],
    });
    const official = cpu.specs.memorySpeed[ram.specs.type];
    if (supported && official !== undefined) {
      const above = ram.specs.speed > official;
      push({
        id: 'memory-speed',
        title: 'Frequência da memória',
        status: 'ok',
        message: above
          ? `${ram.name} opera a ${ram.specs.speed} MT/s, acima dos ${official} MT/s oficiais do processador. Ative o perfil XMP/EXPO na BIOS para alcançar essa frequência.`
          : `A frequência de ${ram.specs.speed} MT/s está dentro do suporte oficial do processador (${official} MT/s).`,
        parts: ['cpu', 'ram'],
      });
    }
  }

  if (mb && ramItem) {
    const modules = ramItem.part.specs.modules * ramItem.qty;
    const capacity = ramItem.part.specs.capacity * ramItem.qty;
    const slotsOk = modules <= mb.specs.memorySlots;
    const capOk = capacity <= mb.specs.maxMemory;
    push({
      id: 'memory-capacity',
      title: 'Slots e capacidade de RAM',
      status: slotsOk && capOk ? 'ok' : 'error',
      message:
        slotsOk && capOk
          ? `${modules} módulo(s) e ${capacity} GB cabem na placa (${mb.specs.memorySlots} slots, máximo ${mb.specs.maxMemory} GB).`
          : !slotsOk
            ? `A montagem usa ${modules} módulos, mas a placa tem ${mb.specs.memorySlots} slots.`
            : `A montagem soma ${capacity} GB, acima do máximo de ${mb.specs.maxMemory} GB suportado pela placa.`,
      fix: slotsOk && capOk ? undefined : 'Reduza a quantidade de kits de memória ou escolha uma placa-mãe com mais slots/capacidade.',
      parts: ['motherboard', 'ram'],
    });
  }

  if (mb && pcCase) {
    const fits = pcCase.specs.formFactors.includes(mb.specs.formFactor);
    push({
      id: 'form-factor',
      title: 'Formato da placa-mãe',
      status: fits ? 'ok' : 'error',
      message: fits
        ? `${pcCase.name} suporta placas ${mb.specs.formFactor}.`
        : `${mb.name} é ${mb.specs.formFactor}, mas ${pcCase.name} suporta apenas ${pcCase.specs.formFactors.join(', ')}.`,
      fix: fits ? undefined : `Escolha um gabinete que suporte ${mb.specs.formFactor} ou uma placa-mãe em formato ${pcCase.specs.formFactors.join('/')}.`,
      parts: ['motherboard', 'case'],
    });
  }

  if (gpu && pcCase) {
    const len = gpu.specs.length;
    const max = pcCase.specs.maxGpuLength;
    if (len === undefined || max === undefined) {
      push({
        id: 'gpu-length',
        title: 'Comprimento da GPU',
        status: 'unknown',
        message:
          len === undefined
            ? `O comprimento de ${gpu.name} varia conforme o modelo do fabricante e não está no banco de dados.`
            : `O comprimento máximo de GPU de ${pcCase.name} não está no banco de dados.`,
        fix: 'Confirme as dimensões na ficha técnica do fabricante antes de comprar.',
        parts: ['gpu', 'case'],
      });
    } else {
      const margin = max - len;
      push({
        id: 'gpu-length',
        title: 'Comprimento da GPU',
        status: margin < 0 ? 'error' : margin <= 10 ? 'warn' : 'ok',
        message:
          margin < 0
            ? `${gpu.name} tem ${len} mm, mas ${pcCase.name} aceita no máximo ${max} mm (faltam ${-margin} mm).`
            : margin <= 10
              ? `${gpu.name} (${len} mm) cabe em ${pcCase.name} (${max} mm), com folga de apenas ${margin} mm.`
              : `${gpu.name} (${len} mm) cabe com folga em ${pcCase.name} (${max} mm).`,
        fix: margin < 0 ? 'Escolha uma GPU mais curta ou um gabinete com maior espaço para placas de vídeo.' : undefined,
        parts: ['gpu', 'case'],
      });
    }
  }

  if (cpu && cooler) {
    const ok = cooler.specs.sockets.includes(cpu.specs.socket);
    push({
      id: 'cooler-socket',
      title: 'Socket do cooler',
      status: ok ? 'ok' : 'error',
      message: ok
        ? `${cooler.name} oferece suporte ao socket ${cpu.specs.socket}.`
        : `${cooler.name} não lista suporte ao socket ${cpu.specs.socket} (suporta ${cooler.specs.sockets.join(', ')}).`,
      fix: ok ? undefined : `Escolha um cooler compatível com ${cpu.specs.socket}.`,
      parts: ['cpu', 'cooler'],
    });
    const rating = cooler.specs.tdpRating;
    if (ok && rating !== undefined) {
      const status: Status = rating < cpu.specs.tdp ? 'warn' : rating < cpu.specs.maxPower ? 'warn' : 'ok';
      push({
        id: 'cooler-thermal',
        title: 'Capacidade térmica',
        status,
        message:
          rating < cpu.specs.tdp
            ? `${cooler.name} é indicado para até ${rating} W, abaixo do TDP de ${cpu.specs.tdp} W do processador.`
            : rating < cpu.specs.maxPower
              ? `${cooler.name} atende ao TDP (${cpu.specs.tdp} W), mas o pico do processador chega a ${cpu.specs.maxPower} W e o cooler é indicado para ${rating} W.`
              : `${cooler.name} (${rating} W) atende ao pico de ${cpu.specs.maxPower} W do processador.`,
        fix: status === 'warn' ? 'Considere um cooler de maior capacidade ou um water cooler.' : undefined,
        parts: ['cpu', 'cooler'],
      });
    }
  }

  if (cooler && pcCase) {
    if (cooler.specs.type === 'air') {
      const h = cooler.specs.height;
      const max = pcCase.specs.maxCoolerHeight;
      if (h === undefined || max === undefined) {
        push({
          id: 'cooler-clearance',
          title: 'Altura do cooler',
          status: 'unknown',
          message: 'A altura do cooler ou o limite do gabinete não está no banco de dados.',
          fix: 'Confirme as dimensões nas fichas técnicas.',
          parts: ['cooler', 'case'],
        });
      } else {
        const margin = max - h;
        push({
          id: 'cooler-clearance',
          title: 'Altura do cooler',
          status: margin < 0 ? 'error' : margin <= 5 ? 'warn' : 'ok',
          message:
            margin < 0
              ? `${cooler.name} tem ${h} mm, mas ${pcCase.name} aceita no máximo ${max} mm.`
              : margin <= 5
                ? `${cooler.name} (${h} mm) cabe em ${pcCase.name} (${max} mm), com folga de apenas ${margin} mm.`
                : `${cooler.name} (${h} mm) cabe em ${pcCase.name} (${max} mm).`,
          fix: margin < 0 ? 'Escolha um cooler mais baixo ou um gabinete mais largo.' : undefined,
          parts: ['cooler', 'case'],
        });
      }
    } else {
      const rad = cooler.specs.radiator;
      const max = pcCase.specs.maxRadiator;
      if (rad === undefined || max === undefined) {
        push({
          id: 'cooler-clearance',
          title: 'Radiador do water cooler',
          status: 'unknown',
          message: `O suporte de radiadores de ${pcCase.name} não está no banco de dados.`,
          fix: 'Confirme o suporte a radiadores na ficha técnica do gabinete.',
          parts: ['cooler', 'case'],
        });
      } else {
        const ok = rad <= max;
        push({
          id: 'cooler-clearance',
          title: 'Radiador do water cooler',
          status: ok ? 'ok' : 'error',
          message: ok
            ? `Radiador de ${rad} mm é suportado por ${pcCase.name} (até ${max} mm).`
            : `Radiador de ${rad} mm excede o suporte de ${max} mm de ${pcCase.name}.`,
          fix: ok ? undefined : 'Escolha um water cooler menor ou um gabinete com suporte a radiadores maiores.',
          parts: ['cooler', 'case'],
        });
      }
    }
  }

  if (cpu && !cooler && cpu.specs.includesCooler) {
    push({
      id: 'cooler-included',
      title: 'Cooler incluso',
      status: 'ok',
      message: `${cpu.name} acompanha cooler na caixa. Um cooler dedicado é opcional.`,
      parts: ['cpu', 'cooler'],
    });
  }

  if (cpu && !gpu && cpu.specs.igpu) {
    push({
      id: 'video-output',
      title: 'Saída de vídeo',
      status: 'ok',
      message: `Sem GPU dedicada, o vídeo será gerado por ${cpu.specs.igpu}, integrado ao processador.`,
      parts: ['cpu', 'gpu'],
    });
  }

  if (psu && (cpu || gpu)) {
    const est = estimatePower(sel);
    const status: Status = psu.specs.wattage < est.total ? 'error' : psu.specs.wattage < est.recommended ? 'warn' : 'ok';
    push({
      id: 'psu-power',
      title: 'Potência da fonte',
      status,
      message:
        status === 'error'
          ? `Consumo de pico estimado em ${est.total} W, acima dos ${psu.specs.wattage} W da fonte.`
          : status === 'warn'
            ? `A fonte de ${psu.specs.wattage} W cobre o consumo estimado (${est.total} W), mas a recomendação é de ao menos ${est.recommended} W.`
            : `A fonte de ${psu.specs.wattage} W atende ao consumo estimado (${est.total} W) e à recomendação de ${est.recommended} W.`,
      fix: status === 'ok' ? undefined : `Escolha uma fonte de pelo menos ${est.recommended} W.`,
      parts: ['psu', 'cpu', 'gpu'],
    });
  }

  if (psu && gpu) {
    const g = gpu.specs;
    const p = psu.specs;
    if (g.power16pin) {
      if (p.pcie16pin) {
        push({
          id: 'gpu-connectors',
          title: 'Conectores da GPU',
          status: 'ok',
          message: `${psu.name} possui conector 12VHPWR/12V-2x6 nativo para ${gpu.name}.`,
          parts: ['psu', 'gpu'],
        });
      } else if (p.pcie8pin === undefined) {
        push({
          id: 'gpu-connectors',
          title: 'Conectores da GPU',
          status: 'unknown',
          message: `O número de conectores PCIe de ${psu.name} não está no banco de dados.`,
          parts: ['psu', 'gpu'],
        });
      } else {
        const need = g.adapter8pin ?? 0;
        const enough = p.pcie8pin >= need;
        push({
          id: 'gpu-connectors',
          title: 'Conectores da GPU',
          status: enough ? 'warn' : 'error',
          message: enough
            ? `${gpu.name} usa conector 16 pinos e a fonte não tem cabo nativo. O adaptador (${need}x 8 pinos) é utilizável, mas o ideal é uma fonte com 12VHPWR nativo.`
            : `${gpu.name} exige adaptador com ${need} conectores de 8 pinos, mas ${psu.name} oferece apenas ${p.pcie8pin}.`,
          fix: enough ? 'Prefira uma fonte ATX 3.x com cabo 12VHPWR/12V-2x6 nativo.' : 'Escolha uma fonte com conector 12VHPWR nativo ou mais cabos PCIe de 8 pinos.',
          parts: ['psu', 'gpu'],
        });
      }
    } else if (g.power8pin > 0) {
      if (p.pcie8pin === undefined) {
        push({
          id: 'gpu-connectors',
          title: 'Conectores da GPU',
          status: 'unknown',
          message: `O número de conectores PCIe de ${psu.name} não está no banco de dados.`,
          parts: ['psu', 'gpu'],
        });
      } else {
        const ok = p.pcie8pin >= g.power8pin;
        push({
          id: 'gpu-connectors',
          title: 'Conectores da GPU',
          status: ok ? 'ok' : 'error',
          message: ok
            ? `${gpu.name} precisa de ${g.power8pin}x 8 pinos e ${psu.name} oferece ${p.pcie8pin}.`
            : `${gpu.name} precisa de ${g.power8pin}x conectores de 8 pinos, mas ${psu.name} oferece ${p.pcie8pin}.`,
          fix: ok ? undefined : 'Escolha uma fonte com mais conectores PCIe de 8 pinos.',
          parts: ['psu', 'gpu'],
        });
      }
    }
  }

  if (mb && ssdItem) {
    const ssd = ssdItem.part;
    if (ssd.specs.formFactor === 'M.2 2280') {
      if (mb.specs.m2Slots === undefined) {
        push({
          id: 'm2-slots',
          title: 'Slots M.2',
          status: 'unknown',
          message: `A quantidade de slots M.2 da ${mb.name} não está no banco de dados.`,
          fix: 'Confirme a quantidade de slots M.2 na ficha técnica da placa.',
          parts: ['motherboard', 'ssd'],
        });
      } else {
        const ok = ssdItem.qty <= mb.specs.m2Slots;
        push({
          id: 'm2-slots',
          title: 'Slots M.2',
          status: ok ? 'ok' : 'error',
          message: ok
            ? `${ssdItem.qty} SSD(s) M.2 ocupam ${ssdItem.qty} de ${mb.specs.m2Slots} slots da placa.`
            : `${ssdItem.qty} SSDs M.2 excedem os ${mb.specs.m2Slots} slots da placa.`,
          fix: ok ? undefined : 'Reduza a quantidade de SSDs M.2 ou use SSDs SATA 2.5".',
          parts: ['motherboard', 'ssd'],
        });
      }
      if (ssd.specs.gen !== undefined && mb.specs.m2Gen !== undefined) {
        const slower = ssd.specs.gen > mb.specs.m2Gen;
        push({
          id: 'm2-gen',
          title: 'Geração do M.2',
          status: slower ? 'warn' : 'ok',
          message: slower
            ? `${ssd.name} é PCIe ${ssd.specs.gen}.0, mas o slot M.2 mais rápido da placa é PCIe ${mb.specs.m2Gen}.0. O SSD funcionará, com velocidade limitada.`
            : `A interface PCIe ${ssd.specs.gen}.0 é suportada pelo slot M.2 da placa (até PCIe ${mb.specs.m2Gen}.0).`,
          fix: slower ? 'Para aproveitar a velocidade total, escolha uma placa com M.2 da mesma geração ou um SSD de geração menor.' : undefined,
          parts: ['motherboard', 'ssd'],
        });
      }
    }
  }

  const sataSsd = ssdItem && ssdItem.part.specs.formFactor !== 'M.2 2280' ? ssdItem.qty : 0;
  const hddQty = hddItem?.qty ?? 0;
  if (mb && sataSsd + hddQty > 0) {
    const total = sataSsd + hddQty;
    if (mb.specs.sataPorts === undefined) {
      push({
        id: 'sata-ports',
        title: 'Portas SATA',
        status: 'unknown',
        message: `A quantidade de portas SATA da ${mb.name} não está no banco de dados.`,
        parts: ['motherboard', 'ssd', 'hdd'],
      });
    } else {
      const ok = total <= mb.specs.sataPorts;
      push({
        id: 'sata-ports',
        title: 'Portas SATA',
        status: ok ? 'ok' : 'error',
        message: ok
          ? `${total} dispositivo(s) SATA usam ${total} de ${mb.specs.sataPorts} portas da placa.`
          : `${total} dispositivos SATA excedem as ${mb.specs.sataPorts} portas da placa.`,
        fix: ok ? undefined : 'Reduza os dispositivos SATA ou escolha uma placa com mais portas.',
        parts: ['motherboard', 'ssd', 'hdd'],
      });
    }
  }

  if (pcCase && hddQty > 0) {
    const bays = pcCase.specs.bays35;
    push(
      bays === undefined
        ? {
            id: 'bays-35',
            title: 'Baias do gabinete',
            status: 'unknown',
            message: `A quantidade de baias de 3,5" de ${pcCase.name} não está no banco de dados.`,
            parts: ['case', 'hdd'],
          }
        : {
            id: 'bays-35',
            title: 'Baias do gabinete',
            status: hddQty <= bays ? 'ok' : 'error',
            message:
              hddQty <= bays
                ? `${hddQty} HDD(s) cabem nas ${bays} baias de 3,5" do gabinete.`
                : `${hddQty} HDDs excedem as ${bays} baias de 3,5" do gabinete.`,
            fix: hddQty <= bays ? undefined : 'Reduza a quantidade de HDDs ou escolha um gabinete com mais baias.',
            parts: ['case', 'hdd'],
          },
    );
  }

  if (pcCase && sataSsd > 0) {
    const bays = pcCase.specs.bays25;
    push(
      bays === undefined
        ? {
            id: 'bays-25',
            title: 'Baias do gabinete',
            status: 'unknown',
            message: `A quantidade de baias de 2,5" de ${pcCase.name} não está no banco de dados.`,
            parts: ['case', 'ssd'],
          }
        : {
            id: 'bays-25',
            title: 'Baias do gabinete',
            status: sataSsd <= bays ? 'ok' : 'warn',
            message:
              sataSsd <= bays
                ? `${sataSsd} SSD(s) 2,5" cabem nas ${bays} baias do gabinete.`
                : `${sataSsd} SSDs 2,5" excedem as ${bays} baias dedicadas; será necessário usar adaptadores em baias de 3,5".`,
            fix: sataSsd <= bays ? undefined : 'Use adaptadores 2,5" para 3,5" ou reduza a quantidade.',
            parts: ['case', 'ssd'],
          },
    );
  }

  if (pcCase && fanItem) {
    const slots = pcCase.specs.fanSlots;
    if (slots === undefined) {
      push({
        id: 'fans',
        title: 'Ventoinhas',
        status: 'unknown',
        message: `O mapa de encaixes de ventoinhas de ${pcCase.name} não está no banco de dados.`,
        fix: 'Confirme as posições disponíveis na ficha técnica do gabinete.',
        parts: ['case', 'fan'],
      });
    } else {
      const added = fanItem.part.specs.quantity * fanItem.qty;
      const radiatorFans = cooler?.specs.type === 'aio' && cooler.specs.radiator ? Math.round(cooler.specs.radiator / 120) : 0;
      const free = slots - pcCase.specs.includedFans - radiatorFans;
      push({
        id: 'fans',
        title: 'Ventoinhas',
        status: added <= free ? 'ok' : 'warn',
        message:
          added <= free
            ? `${added} ventoinha(s) adicional(is) cabem nas posições livres do gabinete.`
            : `${added} ventoinhas adicionais podem exceder as posições livres do gabinete (aproximadamente ${Math.max(free, 0)}).`,
        fix: added <= free ? undefined : 'Reduza a quantidade de ventoinhas adicionais.',
        parts: ['case', 'fan'],
      });
    }
  }

  const missing: Category[] = [];
  if (!cpu) missing.push('cpu');
  if (!mb) missing.push('motherboard');
  if (!ram) missing.push('ram');
  if (!ssdItem && !hddItem) missing.push('ssd');
  if (!psu) missing.push('psu');
  if (!pcCase) missing.push('case');
  if (!gpu && !(cpu && cpu.specs.igpu)) missing.push('gpu');
  if (!cooler && !(cpu && cpu.specs.includesCooler)) missing.push('cooler');

  const counts: Record<Status, number> = { ok: 0, warn: 0, error: 0, unknown: 0 };
  checks.forEach((c) => {
    counts[c.status] += 1;
  });

  const anySelected = Object.keys(sel).length > 0;
  const top = worst(checks.map((c) => c.status));
  let overall: Overall;
  if (!anySelected) overall = 'empty';
  else if (top === 'error') overall = 'error';
  else if (top === 'warn') overall = 'warn';
  else if (top === 'unknown' || missing.length > 0) overall = 'unknown';
  else overall = 'ok';

  return { checks, missing, overall, counts };
}

export function candidateStatus(sel: Selection, category: Category, id: string, qty = 1): { status: Status; checks: Check[] } {
  const part = PARTS_BY_ID.get(id);
  if (!part) return { status: 'unknown', checks: [] };
  const next: Selection = { ...sel, [category]: { id, qty } };
  const informational = ['cooler-included', 'video-output'];
  const checks = evaluate(next).checks.filter((c) => c.parts.includes(category) && !informational.includes(c.id));
  return { status: worst(checks.map((c) => c.status)), checks };
}

export function overallLabel(ev: Evaluation): string {
  switch (ev.overall) {
    case 'empty':
      return 'Montagem vazia';
    case 'error':
      return 'Incompatível';
    case 'warn':
      return 'Atenção';
    case 'ok':
      return 'Compatível';
    default:
      return ev.counts.unknown > 0 ? 'Informação insuficiente' : 'Montagem incompleta';
  }
}

export function statusLabel(status: Status): string {
  switch (status) {
    case 'ok':
      return 'Compatível';
    case 'warn':
      return 'Atenção';
    case 'error':
      return 'Incompatível';
    default:
      return 'Informação insuficiente';
  }
}

import { PARTS, READY_BUILDS } from '../src/data/catalog';
import { evaluate } from '../src/lib/compat';
import { estimatePower } from '../src/lib/power';
import { readySelection } from '../src/pages/ReadyBuilds';
import { selectionTotal, encodeSelection, decodeSelection } from '../src/lib/share';

let failed = 0;
const fail = (msg: string) => {
  failed += 1;
  console.error(`FAIL ${msg}`);
};

for (const b of READY_BUILDS) {
  const sel = readySelection(b);
  const ev = evaluate(sel);
  const power = estimatePower(sel);
  console.log(`${b.id.padEnd(17)} total=${selectionTotal(sel)} overall=${ev.overall} ok=${ev.counts.ok} warn=${ev.counts.warn} err=${ev.counts.error} unk=${ev.counts.unknown} watts=${power.total}/${power.recommended}`);
  if (ev.counts.error > 0) fail(`${b.id} has errors: ${ev.checks.filter((c) => c.status === 'error').map((c) => c.message).join(' | ')}`);
  if (Object.keys(sel).length !== Object.keys(b.items).length) fail(`${b.id} has unknown part ids`);
  const rt = decodeSelection(encodeSelection(sel));
  if (JSON.stringify(rt) !== JSON.stringify(sel)) fail(`${b.id} share roundtrip`);
}

const ids = new Set(PARTS.map((p) => p.id));
if (ids.size !== PARTS.length) fail('duplicate ids');

const byId = (id: string) => PARTS.find((p) => p.id === id)!;
const bad = evaluate({ cpu: { id: byId('amd-ryzen-5-7600').id, qty: 1 }, motherboard: { id: byId('msi-pro-b660m-a-ddr4').id, qty: 1 } });
if (bad.overall !== 'error') fail('socket mismatch should be error');
const ddr = evaluate({ motherboard: { id: byId('msi-pro-b660m-a-ddr4').id, qty: 1 }, ram: { id: byId('kingston-fury-beast-32gb-2x16gb-ddr5-5600-cl40').id, qty: 1 } });
if (ddr.overall !== 'error') fail('ddr mismatch should be error');
const partial = evaluate({ cpu: { id: byId('amd-ryzen-5-7600').id, qty: 1 } });
if (partial.overall === 'ok') fail('partial build must not be ok');

console.log(failed === 0 ? 'ALL CHECKS PASSED' : `${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);

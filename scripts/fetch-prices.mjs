// 에누리 카탈로그 페이지에서 최저가를 읽어 data/prices.json 에 기록합니다.
// GitHub Actions 에서 주기적으로 실행됩니다. (Node 20+, 외부 패키지 없음)
import { readFile, writeFile } from 'node:fs/promises';

const watch = JSON.parse(await readFile('data/enuri-watch.json', 'utf8'));
let prev = { items: {} };
try { prev = JSON.parse(await readFile('data/prices.json', 'utf8')); } catch {}

const out = { updatedAt: new Date().toISOString(), items: { ...prev.items } };
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'ko-KR,ko;q=0.9,en;q=0.5',
};

function extract(html) {
  const pick = re => { const m = html.match(re); return m ? Number(m[1]) : null; };
  return pick(/lowPrice\\*"\s*:\s*\\*"?(\d{4,})/)        // ld+json AggregateOffer
      || pick(/minPrice\\*"\s*:\s*\\*"?(\d{4,})/)
      || pick(/showPrice=(\d{4,})/)
      || pick(/"price"\s*:\s*"?(\d{4,})/);
}

async function get(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: ctl.signal });
    const html = await res.text();
    return { status: res.status, html };
  } finally { clearTimeout(t); }
}

for (const id of watch) {
  const target = `https://price.enuri.com/catalog/${id}`;
  const sources = [
    target,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(target)}`,
  ];
  let done = false;
  for (const src of sources) {
    try {
      const { status, html } = await get(src);
      const price = extract(html);
      console.log(`[${id}] ${src.slice(0, 40)}… status=${status} len=${html.length} price=${price}`);
      if (price) {
        const name = ((html.match(/<title>([^<]+)<\/title>/) || [])[1] || '').replace(/\s*[-|].*에누리.*$/, '').trim();
        out.items[id] = { name: name || prev.items[id]?.name || '', price, updatedAt: out.updatedAt };
        done = true;
        break;
      }
    } catch (e) { console.warn(`[${id}] ${src.slice(0, 40)}… failed: ${e.message}`); }
  }
  if (!done) console.warn(`[${id}] price not found from any source`);
}
await writeFile('data/prices.json', JSON.stringify(out, null, 2) + '\n');

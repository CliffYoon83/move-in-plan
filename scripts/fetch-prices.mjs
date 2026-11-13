// 에누리 카탈로그 페이지에서 최저가(lowPrice)를 읽어 data/prices.json 에 기록합니다.
// GitHub Actions 에서 주기적으로 실행됩니다. (Node 20+, 외부 패키지 없음)
import { readFile, writeFile } from 'node:fs/promises';

const watch = JSON.parse(await readFile('data/enuri-watch.json', 'utf8'));
let prev = { items: {} };
try { prev = JSON.parse(await readFile('data/prices.json', 'utf8')); } catch {}

const out = { updatedAt: new Date().toISOString(), items: { ...prev.items } };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

for (const id of watch) {
  try {
    const res = await fetch(`https://price.enuri.com/catalog/${id}`, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' } });
    const html = await res.text();
    const price = Number((html.match(/lowPrice\*"\s*:\s*(\d{4,})/) || [])[1]);
    const name = ((html.match(/<title>([^<]+)<\/title>/) || [])[1] || '').replace(/\s*[-|].*에누리.*$/, '').trim();
    if (price) {
      out.items[id] = { name: name || prev.items[id]?.name || '', price, updatedAt: out.updatedAt };
      console.log(id, price, name);
    } else console.warn('price not found', id, res.status);
  } catch (e) { console.warn('failed', id, e.message); }
}
await writeFile('data/prices.json', JSON.stringify(out, null, 2) + '\n');

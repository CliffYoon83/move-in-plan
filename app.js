/* ===========================================================
   새집 준비 · 이사 플래너
   - 데이터는 localStorage에 저장 (내보내기/가져오기 지원)
   - 에누리 최저가: data/prices.json (GitHub Actions가 주기적으로 갱신)
     + 새로고침 버튼으로 브라우저에서 즉시 조회 시도
   =========================================================== */
(() => {
'use strict';

const LS_KEY = 'moveplan.v1';
const LS_LIVE = 'moveplan.live.v1';
const LS_THEME = 'moveplan.theme';

const CATS = {
  interior:    { name: '인테리어', color: 'var(--c-interior)',    hex: '#b08d68' },
  electronics: { name: '전자제품', color: 'var(--c-electronics)', hex: '#5c7a8a' },
  furniture:   { name: '가구',     color: 'var(--c-furniture)',   hex: '#8a9a6b' },
};
const STATUS = {
  considering: '고려중',
  confirmed: '확정',
  done: '완료',
};
const STATUS_ORDER = ['considering', 'confirmed', 'done'];

const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------- default data ---------------- */
function defaults() {
  return {
    version: 1,
    colors: { door: '#cbbfae', top: '#ece5da' },
    items: [
      // ---------- 인테리어 ----------
      {
        id: uid(), cat: 'interior', name: '싱크대', status: 'confirmed',
        model: 'ㄱ자 2960 × 1570 · 도어 영림 듄 선셋 스톤 · 상판 한스톤 크레모사',
        store: '(주)한솔홈', link: '',
        note: '최신 도면 기준. 비규격장, T5 간접조명.\n보조주방 상부장 없음 · 페닌슐라 하부 로봇청소기 150 띄움.',
        lines: [
          { label: '싱크대', spec: '2960×1570 · 비규격장, T5 간접조명', amount: 2871000 },
          { label: '보조주방', spec: '1060×650 · 상부장 X', amount: 594000 },
          { label: '타일', spec: '300×600 덧방', amount: 440000 },
          { label: '상판 업그레이드', spec: '크레모사 · 2960/1570/1160', amount: 2530000 },
          { label: '대리석 벽체', spec: '크레모사 · 2560', amount: 1408000 },
          { label: '조명', spec: 'T5 · 라인조명 1EA', amount: 440000 },
          { label: '싱크볼', spec: '깜뽀르테 860', amount: 715000 },
          { label: '견적 할인 (D.C)', spec: '전체 견적 기준', amount: -616000 },
        ],
      },
      {
        id: uid(), cat: 'interior', name: '싱크대 옆 붙박이장', status: 'confirmed',
        model: '냉장고장 3220 × 855 · 내부 ㄱ자 시스템장',
        store: '(주)한솔홈', link: '',
        note: '냉장고 · 김치냉장고 빌트인 자리 포함. 기존 냉장고장 철거 포함.',
        lines: [
          { label: '냉장고장', spec: '3220×855', amount: 1881000 },
          { label: 'ㄱ자 시스템장', spec: '내부', amount: 495000 },
          { label: '철거', spec: '기존 냉장고장', amount: 242000 },
        ],
      },
      { id: uid(), cat: 'interior', name: '거실 홈바장', status: 'considering', model: '견적 대기', store: '', link: '', note: '', price: null },
      { id: uid(), cat: 'interior', name: '중문', status: 'considering', model: '', store: '', link: '', note: '고려중', price: null },
      { id: uid(), cat: 'interior', name: '실링팬', status: 'considering', model: '', store: '', link: '', note: '고려중', price: null },

      // ---------- 전자제품 ----------
      { id: uid(), cat: 'electronics', name: '냉장고', status: 'confirmed', model: '삼성 RM70F64Q1A · 키친핏 맥스 · 자동 각얼음', store: '삼성 패밀리넷', link: '', note: '', price: 2150000 },
      { id: uid(), cat: 'electronics', name: '김치냉장고', status: 'confirmed', model: '삼성 RK70F42M2A · 키친핏 맥스 · 4도어', store: '삼성 패밀리넷', link: '', note: '', price: 1700000 },
      {
        id: uid(), cat: 'electronics', name: '시스템에어컨', status: 'confirmed',
        model: '삼성 AN30CSU4P36SSY · 공청판넬 or AI판넬 옵션', store: '삼성 패밀리넷', link: '',
        note: '3실 가격은 확인 후 입력하세요.',
        options: [ { label: '4실', price: 5032000 }, { label: '3실', price: null } ], opt: 0,
      },
      { id: uid(), cat: 'electronics', name: '세탁기', status: 'confirmed', model: '삼성 WF80H21GDS · 비스포크 AI 세탁기 21kg', store: '삼성 패밀리넷', link: '', note: '', price: 949000 },
      {
        id: uid(), cat: 'electronics', name: '식기세척기', status: 'confirmed',
        model: 'LG 디오스 오브제컬렉션 DEE6EWE · 14인용 빌트인', store: '에누리 최저가',
        link: 'https://price.enuri.com/catalog/131321549', enuri: '131321549',
        note: '', price: 1560940,
      },

      // ---------- 가구 ----------
      { id: uid(), cat: 'furniture', name: '소파', status: 'considering', model: '', store: '', link: '', note: '', price: null },
      { id: uid(), cat: 'furniture', name: '침대', status: 'considering', model: '', store: '', link: '', note: '', price: null },
      { id: uid(), cat: 'furniture', name: 'TV장식장', status: 'considering', model: '', store: '', link: '', note: '', price: null },
    ],
  };
}

/* ---------------- storage ---------------- */
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let state = store.get(LS_KEY);
if (!state || !Array.isArray(state.items)) state = defaults();
state.colors ||= { door: '#cbbfae', top: '#ece5da' };
let live = store.get(LS_LIVE) || {};
const save = () => store.set(LS_KEY, state);

/* ---------------- helpers ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const won = n => '₩' + Math.round(n).toLocaleString('ko-KR');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { if (v === null || v === undefined || v === '') return null; const n = Number(String(v).replace(/[^\d.-]/g, '')); return Number.isFinite(n) ? n : null; };
const enuriId = v => { const m = String(v || '').match(/(\d{6,})/); return m ? m[1] : ''; };
const ago = t => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.round(h / 24)}일 전`;
};

function priceOf(it) {
  if (it.enuri && live[it.enuri]?.price) return live[it.enuri].price;
  if (it.options?.length) return num(it.options[it.opt || 0]?.price);
  if (it.lines?.length) return it.lines.reduce((a, l) => a + (num(l.amount) || 0), 0);
  return num(it.price);
}

function totals() {
  const t = { all: { fixed: 0, consider: 0, done: 0, count: 0 } };
  for (const c in CATS) t[c] = { fixed: 0, consider: 0, done: 0, count: 0, tbd: 0 };
  for (const it of state.items) {
    const c = t[it.cat]; if (!c) continue;
    const p = priceOf(it) || 0;
    c.count++; t.all.count++;
    if (priceOf(it) == null) c.tbd++;
    if (it.status === 'considering') { c.consider += p; t.all.consider += p; }
    else { c.fixed += p; t.all.fixed += p; }
    if (it.status === 'done') { c.done += p; t.all.done += p; }
  }
  return t;
}

/* ---------------- number animation ---------------- */
function animateNum(el, to, fmt = v => Math.round(v).toLocaleString('ko-KR')) {
  const from = el._v ?? 0;
  el._v = to;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
  const dur = 1100, t0 = performance.now();
  cancelAnimationFrame(el._raf);
  const tick = now => {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = fmt(from + (to - from) * e);
    if (p < 1) el._raf = requestAnimationFrame(tick);
  };
  el._raf = requestAnimationFrame(tick);
}

/* ---------------- dashboard ---------------- */
function renderDashboard() {
  const t = totals();
  animateNum($('#totalNum'), t.all.fixed);
  animateNum($('#considerNum'), t.all.consider, won);
  animateNum($('#allNum'), t.all.fixed + t.all.consider, won);
  animateNum($('#donutCount'), t.all.count);
  const pct = t.all.fixed ? Math.round(t.all.done / t.all.fixed * 100) : 0;
  $('#doneLabel').textContent = `${pct}% · ${won(t.all.done)}`;
  requestAnimationFrame(() => $('#doneBar').style.width = pct + '%');

  // subtotals
  for (const c in CATS) {
    const el = $(`[data-sub="${c}"]`);
    if (el) animateNum(el, t[c].fixed, won);
  }

  // donut
  const svg = $('#donut');
  const R = 88, C = 2 * Math.PI * R;
  const useAll = t.all.fixed === 0;
  const vals = Object.keys(CATS).map(c => useAll ? t[c].fixed + t[c].consider : t[c].fixed);
  const sum = vals.reduce((a, b) => a + b, 0) || 1;
  if (!svg.childElementCount) {
    svg.innerHTML = `<circle class="track" cx="110" cy="110" r="${R}"/>` +
      Object.keys(CATS).map(c => `<circle class="seg" data-cat="${c}" cx="110" cy="110" r="${R}" stroke="${CATS[c].hex}" stroke-dasharray="0 ${C}" stroke-dashoffset="0"/>`).join('');
  }
  let off = 0;
  const gap = 4;
  Object.keys(CATS).forEach((c, i) => {
    const seg = $(`circle[data-cat="${c}"]`, svg);
    const len = vals[i] / sum * C;
    const L = Math.max(0, len - (len > gap ? gap : 0));
    const o = off;
    setTimeout(() => {
      seg.setAttribute('stroke-dasharray', `${L} ${C - L}`);
      seg.setAttribute('stroke-dashoffset', `${-o}`);
    }, 60);
    seg.dataset.tip = `${CATS[c].name} · ${won(vals[i])} (${Math.round(vals[i] / sum * 100)}%)`;
    off += len;
  });

  // category cards
  $('#catCards').innerHTML = Object.keys(CATS).map(c => `
    <a class="cat-card" href="#${c}">
      <span class="cat-dot" style="background:${CATS[c].hex}"></span>
      <span><span class="cat-name">${CATS[c].name}</span><br>
        <span class="cat-meta">${t[c].count}개 항목${t[c].tbd ? ` · 금액 미정 ${t[c].tbd}` : ''}</span></span>
      <span class="cat-amt" data-amt="${c}">${won(t[c].fixed)}${t[c].consider ? `<small>+ 고려중 ${won(t[c].consider)}</small>` : ''}</span>
    </a>`).join('');
}

/* ---------------- cards ---------------- */
const filters = { interior: 'all', electronics: 'all', furniture: 'all' };

function renderFilters(cat) {
  const box = $(`[data-filter-for="${cat}"]`);
  const items = state.items.filter(i => i.cat === cat);
  const cnt = s => items.filter(i => s === 'all' || i.status === s).length;
  box.innerHTML = [['all', '전체'], ...STATUS_ORDER.map(s => [s, STATUS[s]])]
    .map(([k, l]) => `<button data-filter="${k}" class="${filters[cat] === k ? 'on' : ''}">${l}<em>${cnt(k)}</em></button>`).join('');
}

function cardHTML(it, i) {
  const p = priceOf(it);
  const liveInfo = it.enuri ? live[it.enuri] : null;
  let priceHTML = p == null ? `<div class="price tbd">금액 미정</div>` : `<div class="price">${won(p)}</div>`;
  let opts = '';
  if (it.options?.length) {
    opts = `<div class="opts">${it.options.map((o, k) => `<button data-act="opt" data-k="${k}" class="${(it.opt || 0) === k ? 'on' : ''}">${esc(o.label)}${num(o.price) == null ? ' · 미정' : ''}</button>`).join('')}</div>`;
  }
  let liveHTML = '';
  if (it.enuri) {
    const fresh = liveInfo && Date.now() - liveInfo.at < 12 * 3600e3;
    liveHTML = `<div class="live">
      <span class="live-dot ${fresh ? '' : 'stale'}"></span>
      <span>에누리 최저가 · ${liveInfo ? ago(liveInfo.at) + ' 확인' : '확인 전'}</span>
      <a href="https://price.enuri.com/catalog/${esc(it.enuri)}" target="_blank" rel="noopener">에누리에서 보기 ↗</a>
      <button data-act="refresh" title="지금 다시 조회"><svg viewBox="0 0 24 24" width="11" height="11"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg> 새로고침</button>
    </div>`;
  }
  let lines = '';
  if (it.lines?.length) {
    lines = `<details class="lines"><summary>세부 견적 ${it.lines.length}건</summary><table>${
      it.lines.map(l => `<tr class="${(num(l.amount) || 0) < 0 ? 'neg' : ''}"><td>${esc(l.label)}${l.spec ? `<small>${esc(l.spec)}</small>` : ''}</td><td>${num(l.amount) == null ? '-' : won(num(l.amount))}</td></tr>`).join('')
    }</table></details>`;
  }
  const meta = [
    it.store ? `<span class="tag">${esc(it.store)}</span>` : '',
    it.link && !it.enuri ? `<a class="tag" href="${esc(it.link)}" target="_blank" rel="noopener">링크 ↗</a>` : '',
  ].join('');
  return `<article class="card" data-id="${it.id}" style="--i:${i * 0.05}s;--cat-c:${CATS[it.cat].hex}">
    <div class="card-top">
      <div><h4>${esc(it.name)}</h4>${it.model ? `<div class="model">${esc(it.model)}</div>` : ''}</div>
      <button class="status st-${it.status}" data-act="status" title="눌러서 상태 변경">${STATUS[it.status]}</button>
    </div>
    ${opts}
    ${priceHTML}
    ${liveHTML}
    ${meta ? `<div class="meta">${meta}</div>` : ''}
    ${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}
    ${lines}
    <div class="card-actions">
      <button data-act="edit">수정</button>
      <button data-act="del">삭제</button>
    </div>
  </article>`;
}

function renderList(cat) {
  const box = $(`[data-list="${cat}"]`);
  const items = state.items.filter(i => i.cat === cat && (filters[cat] === 'all' || i.status === filters[cat]));
  box.innerHTML = items.length
    ? items.map(cardHTML).join('')
    : `<div class="empty">${filters[cat] === 'all' ? '아직 항목이 없어요. <b>+ 항목 추가</b>로 시작해 보세요.' : '해당 상태의 항목이 없어요.'}</div>`;
  renderFilters(cat);
}

function renderAll() {
  Object.keys(CATS).forEach(renderList);
  renderDashboard();
}
function refreshCard(id) {
  const it = state.items.find(i => i.id === id);
  const old = $(`.card[data-id="${id}"]`);
  if (it && old) {
    const tmp = document.createElement('div');
    tmp.innerHTML = cardHTML(it, 0);
    const nu = tmp.firstElementChild;
    nu.style.animation = 'none';
    const wasOpen = old.querySelector('details')?.open;
    old.replaceWith(nu);
    if (wasOpen) nu.querySelector('details').open = true;
  }
  renderFilters(it?.cat || 'interior');
  renderDashboard();
}

/* ---------------- card interactions ---------------- */
document.addEventListener('click', e => {
  const f = e.target.closest('[data-filter]');
  if (f) {
    const cat = f.parentElement.dataset.filterFor;
    filters[cat] = f.dataset.filter;
    renderList(cat);
    return;
  }
  const add = e.target.closest('[data-add]');
  if (add) { openModal(null, add.dataset.add); return; }

  const btn = e.target.closest('[data-act]');
  const card = e.target.closest('.card');
  if (!btn || !card) return;
  const it = state.items.find(i => i.id === card.dataset.id);
  if (!it) return;
  const act = btn.dataset.act;
  if (act === 'status') {
    it.status = STATUS_ORDER[(STATUS_ORDER.indexOf(it.status) + 1) % STATUS_ORDER.length];
    save();
    if (filters[it.cat] !== 'all') renderList(it.cat), renderDashboard(); else refreshCard(it.id);
    toast(`'${it.name}' → ${STATUS[it.status]}`);
  } else if (act === 'opt') {
    it.opt = Number(btn.dataset.k); save(); refreshCard(it.id);
  } else if (act === 'edit') {
    openModal(it);
  } else if (act === 'del') {
    removeItem(it, card);
  } else if (act === 'refresh') {
    btn.classList.add('spin'); btn.disabled = true;
    fetchLive(it.enuri).then(ok => {
      toast(ok ? `최저가 갱신: ${won(live[it.enuri].price)}` : '지금은 바로 조회가 안 돼요. 자동 갱신 값을 사용합니다.');
      refreshCard(it.id);
    });
  }
});

function removeItem(it, card) {
  const idx = state.items.indexOf(it);
  card.classList.add('leaving');
  setTimeout(() => {
    state.items.splice(idx, 1); save(); renderList(it.cat); renderDashboard();
    toast(`'${it.name}' 삭제됨`, '되돌리기', () => {
      state.items.splice(idx, 0, it); save(); renderList(it.cat); renderDashboard();
    });
  }, 300);
}

/* ---------------- modal ---------------- */
const modal = $('#modal');
const form = $('#itemForm');
let editing = null;

function rowHTML(kind, r = {}) {
  if (kind === 'options') {
    return `<div class="rowline"><input data-f="label" placeholder="옵션명" value="${esc(r.label)}"><input data-f="price" inputmode="numeric" placeholder="금액" value="${num(r.price) ?? ''}"><button type="button" data-delrow aria-label="삭제">✕</button></div>`;
  }
  return `<div class="rowline"><input data-f="label" placeholder="항목" value="${esc(r.label)}"><input data-f="spec" placeholder="규격·내용" value="${esc(r.spec)}"><input data-f="amount" inputmode="numeric" placeholder="금액" value="${num(r.amount) ?? ''}"><button type="button" data-delrow aria-label="삭제">✕</button></div>`;
}

function openModal(it, cat = 'interior') {
  editing = it;
  $('#modalTitle').textContent = it ? '항목 수정' : `${CATS[cat].name} 항목 추가`;
  form.reset();
  const v = it || { cat, status: 'considering' };
  form.name.value = v.name || '';
  form.cat.value = v.cat;
  form.model.value = v.model || '';
  form.price.value = num(v.price) ?? '';
  form.status.value = v.status;
  form.store.value = v.store || '';
  form.link.value = v.link || '';
  form.enuri.value = v.enuri ? `https://price.enuri.com/catalog/${v.enuri}` : '';
  form.note.value = v.note || '';
  $('[data-rows="options"] .rows-list').innerHTML = (v.options || []).map(r => rowHTML('options', r)).join('');
  $('[data-rows="lines"] .rows-list').innerHTML = (v.lines || []).map(r => rowHTML('lines', r)).join('');
  $('#deleteBtn').style.visibility = it ? 'visible' : 'hidden';
  modal.showModal();
  setTimeout(() => form.name.focus(), 50);
}

form.addEventListener('click', e => {
  const a = e.target.closest('[data-addrow]');
  if (a) {
    const list = $(`[data-rows="${a.dataset.addrow}"] .rows-list`);
    list.insertAdjacentHTML('beforeend', rowHTML(a.dataset.addrow));
    list.lastElementChild.querySelector('input').focus();
  }
  const d = e.target.closest('[data-delrow]');
  if (d) d.parentElement.remove();
  if (e.target.closest('[data-close]')) modal.close();
});
$('#deleteBtn').addEventListener('click', () => {
  if (!editing) return;
  const it = editing; modal.close();
  const card = $(`.card[data-id="${it.id}"]`);
  if (card) removeItem(it, card);
});
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

form.addEventListener('submit', e => {
  e.preventDefault();
  const rows = kind => $$(`[data-rows="${kind}"] .rowline`).map(r => {
    const o = {}; $$('input', r).forEach(i => o[i.dataset.f] = i.value.trim()); return o;
  }).filter(o => o.label || o.price || o.amount);
  const options = rows('options').map(o => ({ label: o.label || '옵션', price: num(o.price) }));
  const lines = rows('lines').map(o => ({ label: o.label || '항목', spec: o.spec || '', amount: num(o.amount) }));
  const data = {
    name: form.name.value.trim() || '새 항목',
    cat: form.cat.value,
    model: form.model.value.trim(),
    price: num(form.price.value),
    status: form.status.value,
    store: form.store.value.trim(),
    link: form.link.value.trim(),
    enuri: enuriId(form.enuri.value),
    note: form.note.value.trim(),
    options: options.length ? options : undefined,
    lines: lines.length ? lines : undefined,
  };
  if (data.enuri && !data.link) data.link = `https://price.enuri.com/catalog/${data.enuri}`;
  let it;
  if (editing) {
    const oldCat = editing.cat;
    Object.assign(editing, data);
    if (!options.length) { delete editing.options; delete editing.opt; }
    else if ((editing.opt || 0) >= options.length) editing.opt = 0;
    if (!lines.length) delete editing.lines;
    if (!data.enuri) delete editing.enuri;
    it = editing;
    if (oldCat !== it.cat) renderList(oldCat);
  } else {
    it = { id: uid(), ...data, opt: 0 };
    state.items.push(it);
  }
  save();
  modal.close();
  if (filters[it.cat] !== 'all' && filters[it.cat] !== it.status) filters[it.cat] = 'all';
  renderList(it.cat); renderDashboard();
  toast(editing ? '저장했어요' : `'${it.name}' 추가됨`);
  if (it.enuri && !live[it.enuri]) fetchLive(it.enuri).then(ok => ok && refreshCard(it.id));
  requestAnimationFrame(() => $(`.card[data-id="${it.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
});

/* ---------------- toast & tooltip ---------------- */
let toastT;
function toast(msg, actionLabel, action) {
  const el = $('#toast');
  el.innerHTML = esc(msg) + (actionLabel ? `<button>${esc(actionLabel)}</button>` : '');
  if (action) el.querySelector('button').onclick = () => { action(); el.classList.remove('show'); };
  el.style.pointerEvents = action ? 'auto' : 'none';
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), action ? 5000 : 2400);
}
const tip = $('#tip');
document.addEventListener('pointermove', e => {
  const t = e.target.closest?.('[data-tip]');
  if (!t) { tip.classList.remove('show'); return; }
  tip.textContent = t.dataset.tip;
  const w = tip.offsetWidth;
  tip.style.left = Math.min(innerWidth - w - 8, Math.max(8, e.clientX - w / 2)) + 'px';
  tip.style.top = (e.clientY - 42) + 'px';
  tip.classList.add('show');
});

/* ---------------- Enuri live price ---------------- */
const PROXIES = [
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
];
function parseEnuri(html) {
  const m = html.match(/lowPrice\\*"\s*:\s*(\d{4,})/);
  return m ? Number(m[1]) : null;
}
async function fetchLive(id) {
  if (!id) return false;
  const url = `https://price.enuri.com/catalog/${id}`;
  for (const p of PROXIES) {
    try {
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), 10000);
      const r = await fetch(p(url), { signal: ctl.signal });
      clearTimeout(to);
      if (!r.ok) continue;
      const price = parseEnuri(await r.text());
      if (price) {
        live[id] = { price, at: Date.now(), src: 'browser' };
        store.set(LS_LIVE, live);
        return true;
      }
    } catch {}
  }
  return false;
}
async function loadPrices() {
  try {
    const r = await fetch('data/prices.json?t=' + Date.now(), { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json();
      for (const [id, v] of Object.entries(j.items || {})) {
        const at = Date.parse(v.updatedAt || j.updatedAt);
        if (v.price && (!live[id] || live[id].at < at)) live[id] = { price: v.price, at, src: 'action' };
      }
      store.set(LS_LIVE, live);
      renderAll();
    }
  } catch {}
  // 오래된 값은 브라우저에서 한 번 더 조회 시도
  const ids = [...new Set(state.items.filter(i => i.enuri).map(i => i.enuri))];
  for (const id of ids) {
    if (!live[id] || Date.now() - live[id].at > 3 * 3600e3) {
      if (await fetchLive(id)) renderAll();
    }
  }
}

/* ---------------- colors ---------------- */
function applyColors() {
  document.documentElement.style.setProperty('--door', state.colors.door);
  document.documentElement.style.setProperty('--top', state.colors.top);
  $('#doorColor').value = state.colors.door;
  $('#topColor').value = state.colors.top;
}
$('#doorColor').addEventListener('input', e => { state.colors.door = e.target.value; applyColors(); save(); });
$('#topColor').addEventListener('input', e => { state.colors.top = e.target.value; applyColors(); save(); });

/* ===========================================================
   Kitchen drawings (SVG, mm 단위)
   =========================================================== */
const DEFS = `<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.006 0.045" numOctaves="3" seed="7"/>
    <feColorMatrix values="0 0 0 0 .35  0 0 0 0 .29  0 0 0 0 .22  0 0 0 .38 -.09"/>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="marble" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.0016 0.012" numOctaves="4" seed="3"/>
    <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .34  0 0 0 -0.9 0.5"/>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>
</defs>`;

let D = 0; // animation delay cursor
const nd = (s = 0.06) => (D += s).toFixed(2);
function box(x, y, w, h, cls = 'door', tip = '', tex = cls === 'door' ? 'grain' : cls === 'top' ? 'marble' : '') {
  const d = nd();
  const fd = (Number(d) + 0.45).toFixed(2);
  return `<g class="mod"${tip ? ` data-tip="${esc(tip)}"` : ''}>
    <rect class="fill ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" style="--d:${fd}s"/>
    ${tex ? `<rect class="fill" x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" filter="url(#${tex})" style="--d:${fd}s"/>` : ''}
    <rect class="ol" pathLength="1" x="${x}" y="${y}" width="${w}" height="${h}" style="--d:${d}s"/>
  </g>`;
}
const solid = (x, y, w, h, cls, delay) => `<rect class="fill ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" style="--d:${delay ?? nd(0.02)}s"/>`;
function dimH(x1, x2, y, label, up = true) {
  const d = nd(0.04);
  const ty = up ? y - 18 : y + 52;
  return `<g class="fill" style="--d:${d}s">
    <path class="dim" d="M${x1} ${y}H${x2}M${x1} ${y - 18}v36M${x2} ${y - 18}v36"/>
    <text class="dim-t" x="${(x1 + x2) / 2}" y="${ty}">${label}</text></g>`;
}
function dimV(x, y1, y2, label) {
  const d = nd(0.04);
  return `<g class="fill" style="--d:${d}s">
    <path class="dim" d="M${x} ${y1}V${y2}M${x - 18} ${y1}h36M${x - 18} ${y2}h36"/>
    <text class="dim-t" x="${x - 30}" y="${(y1 + y2) / 2}" transform="rotate(-90 ${x - 30} ${(y1 + y2) / 2})">${label}</text></g>`;
}
const ol = (dpath, delay) => `<path class="ol" pathLength="1" d="${dpath}" style="--d:${delay ?? nd()}s"/>`;

function sinkSVG() {
  D = 0;
  const FL = 2300, CT = 1430, SLAB = 34, BT = CT + SLAB, TK = 2200, UB = 750, UT = 30;
  let s = DEFS;
  s += solid(0, 0, 2960, FL, 'wall', 0);
  s += solid(-120, FL, 3200, 40, 'floor', 0);
  // backsplash (대리석 벽체)
  s += `<g class="mod" data-tip="대리석 벽체 · 한스톤 크레모사 (2560)">
    <rect class="fill top" x="0" y="${UB}" width="2510" height="${CT - UB}" style="--d:.2s"/>
    <rect class="fill" x="0" y="${UB}" width="2510" height="${CT - UB}" fill="#fff" filter="url(#marble)" style="--d:.2s"/></g>`;
  // upper cabinets
  D = 0.2;
  s += box(0, UT, 50, UB - UT, 'door', '필러 FA 50');
  s += box(50, UT, 450, 390, 'door', '후드장 900');
  s += box(500, UT, 450, 390, 'door', '후드장 900');
  s += `<g class="mod" data-tip="레인지후드">
    <path class="fill steel" d="M110 ${UT + 390}H890L850 ${UT + 560}H150Z" style="--d:${nd()}s"/>
    ${ol(`M110 ${UT + 390}H890L850 ${UT + 560}H150Z`)}
    <rect class="fill dark" x="170" y="${UT + 540}" width="660" height="20" style="--d:${nd(0)}s"/></g>`;
  [950, 1340, 1730, 2120].forEach((x, i) => s += box(x, UT, 390, UB - UT, 'door', `상부장 780 (${i < 2 ? '좌' : '우'})`));
  // T5 glow
  s += `<rect class="glow" x="60" y="${UB + 2}" width="2440" height="16" style="--d:1.6s"/>`;
  s += `<rect class="fill" x="60" y="${UB + 4}" width="2440" height="8" fill="#fff3d0" style="--d:1.6s" data-tip="T5 간접조명"/>`;
  // tall unit right
  s += box(2510, UT, 450, 1070, 'door', '키큰장 450 · EP 20');
  s += box(2510, UT + 1070, 450, TK - UT - 1070, 'door', '키큰장 450 · EP 20');
  // countertop
  s += box(0, CT, 2510, SLAB, 'top', '상판 · 한스톤 크레모사');
  // base cabinets
  const base = [
    [0, 50, 'filler', '필러 FA 50'],
    [50, 200, 'pull', '양념 인출장'],
    [250, 600, 'drawer', '서랍장 600 · 인덕션'],
    [850, 560, 'door', '하부장 560'],
    [1410, 475, 'door', '개수대 하부장 950'],
    [1885, 475, 'door', '개수대 하부장 950'],
    [2360, 150, 'filler', '필러 · EP'],
  ];
  for (const [x, w, t, tip] of base) {
    if (t === 'drawer') {
      s += box(x, BT, w, 240, 'door', tip) + box(x, BT + 240, w, 248, 'door', tip) + box(x, BT + 488, w, TK - BT - 488, 'door', tip);
    } else s += box(x, BT, w, TK - BT, 'door', tip);
  }
  // grip channels (gola)
  const gd = nd(0.1);
  s += `<g class="fill" style="--d:${(Number(gd) + .5).toFixed(2)}s">
    <rect class="dark" x="50" y="${BT}" width="2310" height="14"/>
    <rect class="dark" x="250" y="${BT + 240}" width="600" height="12"/>
    <rect class="dark" x="250" y="${BT + 488}" width="600" height="12"/>
    <rect class="dark" x="2510" y="${UT + 1070}" width="450" height="12"/></g>`;
  // toe kick
  s += solid(0, TK, 2960, FL - TK, 'dark', '1.5');
  // cooktop + sink + faucet
  s += `<g class="mod" data-tip="인덕션"><rect class="fill dark" x="300" y="${CT - 12}" width="500" height="14" rx="4" style="--d:1.9s"/></g>`;
  s += `<g class="mod" data-tip="싱크볼 · 깜뽀르테 860">
    <rect class="fill steel" x="1580" y="${CT - 4}" width="600" height="8" style="--d:2s"/>
    <path class="ol" pathLength="1" d="M1880 ${CT - 4}V${CT - 230}q0-40 40-40h70v40" style="--d:2s;stroke:#8d8a86;stroke-width:16"/>
    <path class="ol" pathLength="1" d="M1880 ${CT - 120}h-60" style="--d:2.3s;stroke:#8d8a86;stroke-width:12"/></g>`;
  // dimensions
  D = 1.9;
  s += dimH(0, 950, -50, '900+FA50') + dimH(950, 1730, -50, '780') + dimH(1730, 2510, -50, '780') + dimH(2510, 2960, -50, '450');
  s += dimH(0, 2960, -170, '2960');
  s += dimH(0, 250, FL + 110, 'FA·200', false) + dimH(250, 850, FL + 110, '600', false) + dimH(850, 1410, FL + 110, '560', false) + dimH(1410, 2360, FL + 110, '950', false);
  s += dimV(-60, CT, FL, '870');
  return `<svg class="dw" viewBox="-160 -260 3260 2800" role="img" aria-label="싱크대 정면도">${s}</svg>`;
}

function planSVG() {
  D = 0;
  let s = DEFS;
  // walls
  s += `<g class="fill" style="--d:0s"><rect class="wall" x="-1560" y="-80" width="4600" height="1800" rx="30"/></g>`;
  s += ol('M-1500 -40H3000V1650', '0.1');
  s += ol('M-1500 -40V900', '0.15');
  D = 0.3;
  // 보조주방
  s += box(-1460, 0, 1060, 650, 'top', '보조주방 1060 × 650 · 상부장 X');
  s += `<text class="lbl fill" x="-930" y="340" style="--d:1.2s">보조주방</text><text class="lbl-s fill" x="-930" y="400" style="--d:1.25s">1060 × 650</text>`;
  // main run
  s += box(0, 0, 2510, 600, 'top', '주방 상판 2960 · 크레모사');
  s += box(2510, 0, 450, 600, 'door', '키큰장 450');
  // peninsula
  s += box(2240, 600, 720, 970, 'top', '페닌슐라 · 하부 로봇청소기 150 띄움');
  // cooktop / sink
  s += `<g class="mod" data-tip="인덕션"><rect class="fill dark" x="300" y="90" width="500" height="420" rx="24" style="--d:${nd()}s"/>
    <circle class="fill" cx="430" cy="220" r="90" fill="none" stroke="#777" stroke-width="8" style="--d:${nd(0)}s"/>
    <circle class="fill" cx="660" cy="380" r="80" fill="none" stroke="#777" stroke-width="8" style="--d:${nd(0)}s"/></g>`;
  s += `<g class="mod" data-tip="싱크볼 깜뽀르테 860"><rect class="fill steel" x="1450" y="110" width="860" height="400" rx="30" style="--d:${nd()}s"/>
    <circle class="fill dark" cx="1700" cy="310" r="34" style="--d:${nd(0)}s"/></g>`;
  s += `<text class="lbl fill" x="550" y="590" style="--d:1.4s" dy="-30" font-size="40">인덕션</text>`;
  s += `<text class="lbl fill" x="1880" y="590" style="--d:1.45s" dy="-30" font-size="40">싱크볼</text>`;
  s += `<text class="lbl fill" x="2600" y="1100" style="--d:1.5s">페닌슐라</text><text class="lbl-s fill" x="2600" y="1160" style="--d:1.55s">로봇청소기 150 띄움</text>`;
  s += `<text class="lbl-s fill" x="2735" y="330" style="--d:1.5s" fill="#fff">키큰장</text>`;
  D = 1.5;
  s += dimH(0, 2960, -130, '2960');
  s += dimH(-1460, -400, -130, '1060');
  s += `<g class="fill" style="--d:1.7s"><path class="dim" d="M3080 0V1570M3062 0h36M3062 1570h36"/><text class="dim-t" x="3130" y="785" transform="rotate(90 3130 785)">1570</text></g>`;
  s += dimH(2240, 2960, 1680, '720', false);
  return `<svg class="dw plan" viewBox="-1620 -260 4900 2080" role="img" aria-label="주방 평면 배치">${s}</svg>`;
}

function fridge(x, y, w, h, label, kind, delay) {
  const g = 10;
  const half = w / 2;
  const top = kind === 'kimchi' ? h * 0.5 : h * 0.55;
  return `<g class="slide-in mod" style="--d:${delay}s" data-tip="${label}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#e9e6e1" stroke="var(--ink)" stroke-width="5"/>
    <rect x="${x + g}" y="${y + g}" width="${half - g * 1.5}" height="${top - g * 1.5}" rx="4" fill="#f4f2ee"/>
    <rect x="${x + half + g / 2}" y="${y + g}" width="${half - g * 1.5}" height="${top - g * 1.5}" rx="4" fill="#f4f2ee"/>
    <rect x="${x + g}" y="${y + top + g / 2}" width="${half - g * 1.5}" height="${h - top - g * 1.5}" rx="4" fill="#f4f2ee"/>
    <rect x="${x + half + g / 2}" y="${y + top + g / 2}" width="${half - g * 1.5}" height="${h - top - g * 1.5}" rx="4" fill="#f4f2ee"/>
    <text class="lbl-s" x="${x + w / 2}" y="${y + top * 0.45}">${label.split(' · ')[0]}</text>
  </g>`;
}

function builtinSVG() {
  D = 0;
  const FL = 2300, TK = 2200, UT = 30;
  let s = DEFS;
  s += solid(-200, 0, 3420, FL, 'wall', 0);
  s += solid(-200, FL, 3620, 40, 'floor', 0);
  D = 0.15;
  // 태우기 165 (side)
  s += box(-165, UT, 145, TK - UT, 'door', '태우기 165');
  s += box(-20, UT, 40, TK - UT, 'door', 'EP 20');
  // tall 980 (2 doors) with peek animation
  s += box(20, UT, 480, TK - UT, 'door', '키큰장 980 · 내부 ㄱ자 시스템장');
  s += `<g class="open-door" style="--d:3.2s">${box(500, UT, 480, TK - UT, 'door', '키큰장 980 · 내부 ㄱ자 시스템장')}</g>`;
  // bridge cabinets
  s += box(980, UT, 915, 400, 'door', '브릿지장 915');
  s += box(1895, UT, 805, 400, 'door', '브릿지장 805');
  // opening back
  s += `<rect class="fill" x="980" y="${UT + 400}" width="1720" height="${FL - UT - 400}" fill="color-mix(in srgb,var(--ink) 6%,transparent)" style="--d:.9s"/>`;
  s += ol(`M980 ${UT + 400}V${FL}M2700 ${UT + 400}V${FL}`, '0.9');
  // EP between
  s += box(2700, UT, 20, TK - UT, 'door', 'EP 20');
  // tall 450 with niche
  s += box(2720, UT, 450, 950, 'door', '키큰장 450');
  s += `<g class="mod" data-tip="오픈 니치"><rect class="fill dark" x="2720" y="${UT + 950}" width="450" height="420" style="--d:${nd()}s" opacity=".85"/>
    <rect class="fill" x="2740" y="${UT + 1180}" width="410" height="14" fill="var(--door)" style="--d:${nd(0)}s"/>${ol(`M2720 ${UT + 950}h450v420h-450z`)}</g>`;
  s += box(2720, UT + 1370, 450, TK - UT - 1370, 'door', '키큰장 450');
  s += box(3170, UT, 50, TK - UT, 'door', 'FA 50');
  // toe kick
  s += solid(-165, TK, 1145, FL - TK, 'dark', '1.3') + solid(2700, TK, 520, FL - TK, 'dark', '1.3');
  // fridges
  s += fridge(1135, 470, 700, 1830, '냉장고 · 삼성 RM70F64Q1A 키친핏 맥스', 'fridge', 1.7);
  s += fridge(1850, 470, 700, 1830, '김치냉장고 · 삼성 RK70F42M2A 키친핏 맥스', 'kimchi', 1.95);
  D = 2.1;
  s += dimH(20, 980, -50, '980') + dimH(980, 1895, -50, '915') + dimH(1895, 2700, -50, '805') + dimH(2720, 3170, -50, '450');
  s += dimH(0, 3220, -170, '3220');
  s += dimH(-165, 20, FL + 110, '165', false);
  s += `<text class="lbl fill" x="500" y="1150" style="--d:2.4s">내부 ㄱ자 시스템장</text>`;
  return `<svg class="dw" viewBox="-300 -260 3640 2800" role="img" aria-label="냉장고장 정면도">${s}</svg>`;
}

const SPECS = {
  sink: [
    ['규격', 'ㄱ자 2960 × 1570'], ['도어', '영림 듄 선셋 스톤'], ['상판', '한스톤 크레모사'],
    ['벽체', '크레모사 2560'], ['조명', 'T5 간접 + 라인조명'], ['싱크볼', '깜뽀르테 860'],
    ['보조주방', '1060 × 650'], ['타일', '300×600 덧방'],
  ],
  plan: [
    ['주방', '2960 (D 600)'], ['페닌슐라', '1570 × 720'], ['보조주방', '1060 × 650'],
    ['상판 길이', '2960 / 1570 / 1160'], ['하부', '로봇청소기 150 띄움'],
  ],
  builtin: [
    ['규격', '3220 × 855'], ['구성', '980 · 915/805 · 450'], ['내부', 'ㄱ자 시스템장'],
    ['냉장고', 'RM70F64Q1A'], ['김치냉장고', 'RK70F42M2A'], ['도어', '영림 듄 선셋 스톤'], ['철거', '기존 냉장고장'],
  ],
  render: [['안내', '이전 시안 렌더링'], ['기준', '최신 도면 우선'], ['상판', '크레모사로 변경'], ['도어', '듄 선셋 스톤으로 변경']],
};

function showView(v) {
  const stage = $('#stage');
  if (v === 'render') {
    stage.innerHTML = `<div><img src="assets/kitchen-render.jpg" alt="싱크대 예상 렌더링" loading="lazy"><p class="cap">이전 시안 렌더링 · 구조 참고용 (도면이 최신 기준, 마감재는 변경됨)</p></div>`;
  } else {
    stage.innerHTML = { sink: sinkSVG, plan: planSVG, builtin: builtinSVG }[v]();
  }
  $('#specList').innerHTML = SPECS[v].map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`).join('');
  $$('.show-tabs button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  moveInk();
}
function moveInk() {
  const on = $('.show-tabs button.on'), ink = $('.tab-ink');
  if (!on) return;
  ink.style.left = on.offsetLeft + 'px';
  ink.style.width = on.offsetWidth + 'px';
}
$('.show-tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) showView(b.dataset.view); });
addEventListener('resize', moveInk);

/* ---------------- theme / menu / nav ---------------- */
const savedTheme = store.get(LS_THEME);
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
$('#themeBtn').addEventListener('click', () => {
  const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const nx = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nx; store.set(LS_THEME, nx);
});
const menu = $('#menu');
$('#menuBtn').addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; });
document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) menu.hidden = true; });
menu.addEventListener('click', e => {
  const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return;
  menu.hidden = true;
  if (a === 'export') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `이사준비-${new Date().toISOString().slice(0, 10)}.json`;
    link.click(); URL.revokeObjectURL(link.href);
    toast('JSON 파일로 내보냈어요');
  } else if (a === 'import') {
    $('#importFile').click();
  } else if (a === 'reset') {
    if (confirm('모든 변경 내용을 지우고 초기 데이터로 되돌릴까요?')) {
      state = defaults(); save(); applyColors(); renderAll(); toast('초기 데이터로 되돌렸어요');
    }
  }
});
$('#importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    if (!Array.isArray(j.items)) throw 0;
    state = j; state.colors ||= { door: '#cbbfae', top: '#ece5da' };
    save(); applyColors(); renderAll(); toast('데이터를 불러왔어요');
  } catch { toast('올바른 JSON 파일이 아니에요'); }
  e.target.value = '';
});

// header shadow + active nav
addEventListener('scroll', () => $('.topbar').classList.toggle('scrolled', scrollY > 10), { passive: true });
const secObs = new IntersectionObserver(es => {
  es.forEach(en => {
    if (en.isIntersecting) {
      const id = en.target.classList.contains('hero') ? 'top' : en.target.id;
      $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.sec === id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['interior', 'electronics', 'furniture'].forEach(id => secObs.observe(document.getElementById(id)));
secObs.observe($('.hero'));

// reveal on scroll
const revObs = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revObs.unobserve(en.target); } }), { threshold: 0.08 });
$$('.reveal').forEach(el => revObs.observe(el));

// redraw kitchen when it scrolls into view the first time
let drawn = false;
new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting && !drawn) { drawn = true; showView('sink'); }
}), { threshold: 0.25 }).observe($('.showcase'));

/* ---------------- init ---------------- */
applyColors();
renderAll();
requestAnimationFrame(moveInk);
loadPrices();
})();

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

/* ---------------- product specs (사이즈 · 사진) ---------------- */
const SPEC = {
  fridge:     { code: 'RM70F64Q1A',     size: '912 × 1853 × 697 mm (W×H×D)', img: 'assets/products/fridge.jpg',
    features: ['총 623L (냉장 388L · 냉동 235L) · 4도어 · 에너지 1등급', '대용량 아이스메이커 · 큐브(각얼음) 자동 생성', 'AI 하이브리드 쿨링 · AI 절약모드', 'UV 위생 · 미세 자동정온'] },
  kimchi:     { code: 'RK70F42M2A',     size: '799 × 1853 × 697 mm (W×H×D)', img: 'assets/products/kimchi.jpg',
    features: ['420L · 4도어(3룸) · 에너지 2등급 · 김치통 6개', '독립냉각 · 메탈쿨링커튼 · 아삭모드', '발효숙성(물김치·무김치, 육류) · 다목적 맞춤보관(쌀, 야채, 와인 등)', 'AI 정온모드 · 구입김치 스캔보관 · Wi-Fi'] },
  aircon:     { code: 'AN30CSU4P36SSY', size: '36평형 4실 (18+6+6+6평) · 실내기 1200×450×138 / 970×410×135 mm', img: 'assets/products/aircon.jpg',
    features: ['무풍 간접냉방 · AI 판넬', '에너지 1등급 · 인버터 · Wi-Fi 내장', 'AI 운전 · AI 건조 · 열교환기 세척 · UV 팬살균', '스마트폰 제어 · 음성인식'] },
  washer:     { code: 'WF80H21GDS',     size: '686 × 984 × 796 mm (W×H×D)', img: 'assets/products/washer.jpg',
    features: ['세탁 21kg · 에너지 1등급 · 인버터 DD 모터', 'AI 세탁 · AI 진동소음 저감 · AI 에너지 절약', '버블워시 · 워터샷 · 스팀살균 · 빨래 추가', '무세제 통세척 · 다이얼 스크린 · 건조기 조작 연동'] },
  dishwasher: { code: 'DEE6EWE',        size: '598 × 815 × 567 mm (W×H×D)', img: 'assets/products/dishwasher.jpg',
    features: ['14인용 빌트인 · 에너지 1등급 · 스팀 살균', '건조: 자동문열림 · 열풍 · 응축', '3단 선반(높이조절) · 저소음 · 소량 부분세척', '내부조명 · 음성안내 · 스마트폰 제어'] },
};

/* ---------------- default data ---------------- */
function defaults() {
  return {
    version: 3,
    colors: { door: '#cbbfae', top: '#ece5da' },
    items: [
      // ---------- 인테리어 ----------
      {
        id: uid(), cat: 'interior', name: '싱크대', status: 'confirmed',
        model: 'ㄱ자 2960 × 1570 · 도어 영림 듄 선셋 스톤 · 상판 한스톤 크레모사',
        store: '(주)한솔홈', link: '',
        note: '최신 도면 기준. 비규격장, T5 간접조명.\n보조주방 상부장 없음 · 키큰장 하부 로봇청소기 150 띄움.',
        lines: [
          { label: '싱크대', spec: '2960×1570 · 비규격장, T5 간접조명', amount: 2871000 },
          { label: '보조주방', spec: '1060×650 · 상부장 X', amount: 594000 },
          { label: '타일', spec: '300×600 덧방', amount: 440000 },
          { label: '상판 업그레이드', spec: '크레모사 · 2960/1570/1160', amount: 2530000 },
          { label: '대리석 벽체', spec: '크레모사 · 2560', amount: 1408000 },
          { label: '조명', spec: 'T5 · 라인조명 1EA', amount: 440000 },
          { label: '싱크볼', spec: '백조 깜포르테 860', amount: 715000 },
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
      { id: uid(), cat: 'interior', name: '마루보수', status: 'considering', model: '견적 대기', store: '', link: '', note: '', price: null },
      { id: uid(), cat: 'interior', name: '도배', status: 'considering', model: '견적 대기', store: '', link: '', note: '', price: null },
      { id: uid(), cat: 'interior', name: '중문', status: 'considering', model: '', store: '', link: '', note: '고려중', price: null },
      { id: uid(), cat: 'interior', name: '실링팬', status: 'considering', model: '', store: '', link: '', note: '고려중', price: null },

      // ---------- 전자제품 ----------
      { id: uid(), cat: 'electronics', name: '냉장고', status: 'confirmed', model: '삼성 RM70F64Q1A · 키친핏 맥스 · 자동 각얼음', store: '삼성 패밀리넷', link: '', note: '', price: 2150000, size: SPEC.fridge.size, img: SPEC.fridge.img, features: SPEC.fridge.features },
      { id: uid(), cat: 'electronics', name: '김치냉장고', status: 'confirmed', model: '삼성 RK70F42M2A · 키친핏 맥스 · 4도어', store: '삼성 패밀리넷', link: '', note: '', price: 1700000, size: SPEC.kimchi.size, img: SPEC.kimchi.img, features: SPEC.kimchi.features },
      {
        id: uid(), cat: 'electronics', name: '시스템에어컨', status: 'confirmed',
        model: '삼성 AN30CSU4P36SSY · 4실 · AI 판넬', store: '삼성 패밀리넷', link: '',
        note: '', price: 5032000, size: SPEC.aircon.size, img: SPEC.aircon.img, features: SPEC.aircon.features,
      },
      { id: uid(), cat: 'electronics', name: '세탁기', status: 'confirmed', model: '삼성 WF80H21GDS · 비스포크 AI 세탁기 21kg', store: '삼성 패밀리넷', link: '', note: '', price: 949000, size: SPEC.washer.size, img: SPEC.washer.img, features: SPEC.washer.features },
      {
        id: uid(), cat: 'electronics', name: '식기세척기', status: 'confirmed',
        model: 'LG 디오스 오브제컬렉션 DEE6EWE · 14인용 빌트인', store: '에누리 최저가',
        link: 'https://price.enuri.com/catalog/131321549', enuri: '131321549',
        note: '', price: 1560940, size: SPEC.dishwasher.size, img: SPEC.dishwasher.img, features: SPEC.dishwasher.features,
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

/* ---------------- migration (기존 저장 데이터 업데이트) ---------------- */
function migrate(st) {
  if ((st.version || 1) >= 2) return migrate3(st);
  for (const it of st.items) {
    if (it.note) it.note = it.note.replace('페닌슐라 하부 로봇청소기', '키큰장 하부 로봇청소기');
    (it.lines || []).forEach(l => { if (l.spec === '깜뽀르테 860') l.spec = '백조 깜포르테 860'; });
    for (const k in SPEC) {
      if ((it.model || '').includes(SPEC[k].code)) { it.size ||= SPEC[k].size; it.img ||= SPEC[k].img; }
    }
  }
  const idx = st.items.findIndex(i => i.cat === 'interior' && i.name === '중문');
  for (const name of ['도배', '마루보수']) {
    if (!st.items.some(i => i.name === name)) {
      const it = { id: uid(), cat: 'interior', name, status: 'considering', model: '견적 대기', store: '', link: '', note: '', price: null };
      st.items.splice(idx >= 0 ? idx : st.items.length, 0, it);
    }
  }
  st.version = 2;
  migrate3(st);
}
function migrate3(st) {
  if ((st.version || 1) >= 3) return;
  for (const it of st.items) {
    for (const k in SPEC) {
      if ((it.model || '').includes(SPEC[k].code) && !it.features) it.features = SPEC[k].features;
    }
    if ((it.model || '').includes('AN30CSU4P36SSY')) {
      it.model = '삼성 AN30CSU4P36SSY · 4실 · AI 판넬';
      const four = (it.options || []).find(o => o.label === '4실');
      if (four) it.price = Number(four.price) || 5032000;
      delete it.options; delete it.opt;
      if (it.note === '3실 가격은 확인 후 입력하세요.') it.note = '';
    }
  }
  st.version = 3;
  store.set(LS_KEY, st);
}

let state = store.get(LS_KEY);
if (!state || !Array.isArray(state.items)) state = defaults();
state.colors ||= { door: '#cbbfae', top: '#ece5da' };
migrate(state);
let live = store.get(LS_LIVE) || {};
const save = () => { store.set(LS_KEY, state); pushCloud(); };

/* ---------------- cloud (Firebase) sync ---------------- */
const sync = { on: false, user: null, remote: new Map(), metaJSON: '', seeded: false, loaded: false };
const stable = o => JSON.stringify(o, Object.keys(o).sort());
const cleanItem = (it, order) => JSON.parse(JSON.stringify({ ...it, order })); // undefined 제거
function canEdit() {
  if (!sync.on) return true;
  if (sync.user) return true;
  toast('수정하려면 로그인하세요', '로그인', () => window.cloud?.signIn().catch(authErr));
  return false;
}
function authErr(e) {
  if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return;
  toast(e?.code === 'auth/unauthorized-domain' ? '이 주소가 Firebase 승인 도메인에 없어요' : '로그인 실패: ' + (e?.code || e?.message));
}
function pushCloud(force = false) {
  if (!sync.on || !sync.user || !window.cloud || (!sync.loaded && !force)) return;
  const upserts = [], deletes = [], seen = new Set();
  state.items.forEach((it, i) => {
    const d = cleanItem(it, i);
    const j = stable(d);
    seen.add(d.id);
    if (sync.remote.get(d.id) !== j) { upserts.push(d); sync.remote.set(d.id, j); }
  });
  for (const id of [...sync.remote.keys()]) if (!seen.has(id)) { deletes.push(id); sync.remote.delete(id); }
  const metaJ = JSON.stringify(state.colors);
  const meta = metaJ !== sync.metaJSON ? { colors: state.colors } : null;
  if (meta) sync.metaJSON = metaJ;
  if (!upserts.length && !deletes.length && !meta) return;
  setSyncState('saving');
  window.cloud.commit({ upserts, deletes, meta })
    .then(() => setSyncState('ok'))
    .catch(err => {
      setSyncState('error');
      toast(err.code === 'permission-denied' ? '이 계정은 수정 권한이 없어요. 변경이 저장되지 않았어요.' : '저장 실패: ' + err.message);
      sync.remote.clear(); sync.metaJSON = ''; // 다음 스냅샷으로 원래 상태 복구
    });
}
function setSyncState(s) {
  const el = $('#syncPill'); if (!el) return;
  const txt = {
    local: '이 브라우저에만 저장 중', view: '보기 전용 · 로그인하면 함께 편집', ok: '실시간 공유 중',
    saving: '저장 중…', error: '저장 실패 · 권한 확인 필요', offline: '연결 중…',
  }[s];
  el.dataset.state = s;
  el.querySelector('b').textContent = txt;
}
function renderAuth() {
  const b = $('#authBtn'); if (!b) return;
  if (!sync.on) { b.hidden = true; return; }
  b.hidden = false;
  if (sync.user) {
    b.innerHTML = sync.user.photo ? `<img src="${esc(sync.user.photo)}" alt="" referrerpolicy="no-referrer">` : `<span>${esc((sync.user.name || '?')[0])}</span>`;
    b.title = `${sync.user.name || ''} (${sync.user.email}) · 눌러서 로그아웃`;
    b.classList.add('in');
  } else {
    b.innerHTML = '<span class="g">G</span>로그인';
    b.title = 'Google 계정으로 로그인';
    b.classList.remove('in');
  }
}
window.addEventListener('cloud:ready', () => { sync.on = true; setSyncState('offline'); renderAuth(); });
window.addEventListener('cloud:auth', e => {
  sync.user = e.detail;
  renderAuth();
  setSyncState(sync.user ? 'ok' : 'view');
  if (sync.user && sync.loaded && !sync.remote.size && !sync.seeded) seedCloud();
});
window.addEventListener('cloud:items', e => {
  const { items, fromCache } = e.detail;
  if (!items.length) {
    if (fromCache) return;
    sync.loaded = true;
    if (sync.user && !sync.seeded) seedCloud();
    return; // 클라우드가 비어 있으면 로컬 데이터를 그대로 보여줌
  }
  sync.loaded = true;
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  sync.remote = new Map(items.map(it => [it.id, stable(it)]));
  state.items = items.map(({ order, ...it }) => it);
  store.set(LS_KEY, state);
  if (editing) editing = state.items.find(i => i.id === editing.id) || editing;
  renderAll();
  setSyncState(sync.user ? 'ok' : 'view');
});
window.addEventListener('cloud:meta', e => {
  if (e.detail?.colors) {
    sync.metaJSON = JSON.stringify(e.detail.colors);
    state.colors = e.detail.colors; store.set(LS_KEY, state); applyColors();
  }
});
window.addEventListener('cloud:error', e => {
  console.warn('cloud', e.detail);
  if (e.detail.where === 'init') { sync.on = false; setSyncState('local'); renderAuth(); }
  else if (e.detail.code === 'permission-denied') setSyncState('view');
  else setSyncState('error');
});
function seedCloud() {
  sync.seeded = true;
  sync.remote.clear(); sync.metaJSON = '';
  pushCloud(true);
  toast('지금 데이터를 공유 저장소에 올렸어요');
}

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
  const imgBadge = it.img ? `<button class="photo-badge" data-act="photo" title="제품 사진" aria-label="제품 사진 보기"><svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 7h3l2-2h6l2 2h3v12H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>` : '';
  const sizeHTML = it.size ? `<div class="size"><svg viewBox="0 0 24 24" width="13" height="13"><path d="M3 17 17 3l4 4L7 21z M7 13l2 2M10 10l2 2M13 7l2 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>${esc(it.size)}</div>` : '';
  return `<article class="card${it.img ? ' has-img' : ''}" data-id="${it.id}"${it.img ? ` data-img="${esc(it.img)}"` : ''} style="--i:${i * 0.05}s;--cat-c:${CATS[it.cat].hex}">
    <div class="card-top">
      <div><h4>${esc(it.name)}${imgBadge}</h4>${it.model ? `<div class="model">${esc(it.model)}</div>` : ''}${sizeHTML}</div>
      <button class="status st-${it.status}" data-act="status" title="눌러서 상태 변경">${STATUS[it.status]}</button>
    </div>
    ${opts}
    ${priceHTML}
    ${liveHTML}
    ${it.features?.length ? `<ul class="features">${it.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
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
  if (add) { if (canEdit()) openModal(null, add.dataset.add); return; }

  const btn = e.target.closest('[data-act]');
  const card = e.target.closest('.card');
  if (!btn || !card) return;
  const it = state.items.find(i => i.id === card.dataset.id);
  if (!it) return;
  const act = btn.dataset.act;
  if (['status', 'opt', 'edit', 'del'].includes(act) && !canEdit()) return;
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
  card.classList.add('leaving');
  setTimeout(() => {
    const idx = state.items.findIndex(i => i.id === it.id);
    if (idx < 0) return;
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
  form.size.value = v.size || '';
  form.img.value = v.img || '';
  form.features.value = (v.features || []).join('\n');
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
    size: form.size.value.trim() || undefined,
    img: form.img.value.trim() || undefined,
    features: form.features.value.split('\n').map(x => x.trim()).filter(Boolean),
    options: options.length ? options : undefined,
    lines: lines.length ? lines : undefined,
  };
  if (data.enuri && !data.link) data.link = `https://price.enuri.com/catalog/${data.enuri}`;
  let it;
  if (editing) editing = state.items.find(i => i.id === editing.id) || null;
  if (editing) {
    const oldCat = editing.cat;
    Object.assign(editing, data);
    if (!options.length) { delete editing.options; delete editing.opt; }
    else if ((editing.opt || 0) >= options.length) editing.opt = 0;
    if (!lines.length) delete editing.lines;
    if (!data.features.length) delete editing.features;
    if (!data.enuri) delete editing.enuri;
    it = editing;
    if (oldCat !== it.cat) renderList(oldCat);
  } else {
    it = { id: uid(), ...data, opt: 0 };
    if (!data.features.length) delete it.features;
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
/* ---------------- product photo preview (hover) ---------------- */
const preview = $('#preview');
let previewFor = null;
function showPreview(card) {
  const it = state.items.find(i => i.id === card.dataset.id);
  if (!it?.img) return;
  previewFor = card;
  const img = preview.querySelector('img');
  if (img.getAttribute('src') !== it.img) img.src = it.img;
  preview.querySelector('figcaption').innerHTML = `<b>${esc(it.name)}</b>${it.size ? `<span>${esc(it.size)}</span>` : ''}`;
  const r = card.getBoundingClientRect();
  const W = 240, H = 300;
  let left = r.right + 14;
  if (left + W > innerWidth - 8) left = r.left - W - 14;
  if (left < 8) left = Math.max(8, Math.min(innerWidth - W - 8, r.left + r.width / 2 - W / 2));
  let top = r.top + r.height / 2 - H / 2;
  top = Math.max(70, Math.min(innerHeight - H - 8, top));
  preview.style.left = left + 'px';
  preview.style.top = top + 'px';
  preview.classList.add('show');
}
function hidePreview() { previewFor = null; preview.classList.remove('show'); }
document.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse') return;
  const card = e.target.closest?.('.card.has-img');
  if (card && card !== previewFor) showPreview(card);
  else if (!card && previewFor) hidePreview();
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act="photo"]');
  if (b) { e.stopPropagation(); const c = b.closest('.card'); previewFor === c ? hidePreview() : showPreview(c); }
  else if (previewFor && !e.target.closest('.card.has-img')) hidePreview();
}, true);
addEventListener('scroll', () => previewFor && hidePreview(), { passive: true });

const tip = $('#tip');
let tipEl = null, tipT;
document.addEventListener('pointermove', e => {
  const t = e.target.closest?.('[data-tip]');
  if (!t) { tip.classList.remove('show'); tipEl = null; clearTimeout(tipT); return; }
  if (t !== tipEl) {
    tipEl = t;
    tip.textContent = t.dataset.tip;
    tip.classList.add('show');
    clearTimeout(tipT);
    tipT = setTimeout(() => tip.classList.remove('show'), 3000); // 같은 곳에 3초 머물면 사라짐
  }
  if (!tip.classList.contains('show')) return;
  const w = tip.offsetWidth;
  tip.style.left = Math.min(innerWidth - w - 8, Math.max(8, e.clientX - w / 2)) + 'px';
  tip.style.top = (e.clientY - 42) + 'px';
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
let colorT;
const colorSave = () => { clearTimeout(colorT); colorT = setTimeout(save, 500); };
$('#doorColor').addEventListener('input', e => { state.colors.door = e.target.value; applyColors(); colorSave(); });
$('#topColor').addEventListener('input', e => { state.colors.top = e.target.value; applyColors(); colorSave(); });
$('#doorColor').addEventListener('click', e => { if (!canEdit()) e.preventDefault(); });
$('#topColor').addEventListener('click', e => { if (!canEdit()) e.preventDefault(); });

/* ===========================================================
   Kitchen drawings (SVG, mm 단위) — 클릭하면 열리고 켜지는 인터랙션
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
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff1cf" stop-opacity=".95"/>
    <stop offset=".45" stop-color="#ffe9bd" stop-opacity=".35"/>
    <stop offset="1" stop-color="#ffe9bd" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#d9d8d5"/><stop offset=".5" stop-color="#a9a7a3"/><stop offset="1" stop-color="#cfcdc9"/>
  </linearGradient>
  <linearGradient id="bowl" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8e8c88"/><stop offset="1" stop-color="#b9b7b3"/>
  </linearGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e4e3e0"/><stop offset=".5" stop-color="#c3c1bd"/><stop offset="1" stop-color="#dcdad6"/></linearGradient>
  <linearGradient id="bowlWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9a7a3"/><stop offset=".25" stop-color="#cfcdc9"/><stop offset="1" stop-color="#bdbbb7"/></linearGradient>
  <linearGradient id="bowlFloor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9d8d5"/><stop offset=".55" stop-color="#c9c7c3"/><stop offset="1" stop-color="#dedcd9"/></linearGradient>
  <radialGradient id="drainCover" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#f6f6f4"/><stop offset=".6" stop-color="#d4d3d0"/><stop offset="1" stop-color="#a8a6a2"/></radialGradient>
  <linearGradient id="panel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6f5f2"/><stop offset=".55" stop-color="#eeede9"/><stop offset="1" stop-color="#e6e4e0"/></linearGradient>
  <radialGradient id="heat"><stop offset="0" stop-color="#ffb347"/><stop offset=".55" stop-color="#ff5a2a"/><stop offset="1" stop-color="#c81e0a" stop-opacity="0"/></radialGradient>
  <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d7eefa" stop-opacity=".95"/><stop offset="1" stop-color="#a9d6ee" stop-opacity=".55"/>
  </linearGradient>
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
const grip = (x, y, w) => `<rect class="dark" x="${x}" y="${y}" width="${w}" height="14"/>`;

/* 캐비닛 내부 (문 뒤에 그려짐) */
function inside(x, y, w, h, kind = 'shelf') {
  let s = `<rect class="cab-in" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  const sh = n => { for (let k = 1; k <= n; k++) { const yy = y + (h / (n + 1)) * k; s += `<rect class="shelf" x="${x + 8}" y="${yy}" width="${w - 16}" height="14"/>`; } };
  if (kind === 'upper') {
    sh(1);
    const y1 = y + h / 2, y2 = y + h - 8;
    for (let cx = x + 50; cx < x + w - 60; cx += 85) {
      s += `<rect class="ware" x="${cx}" y="${y1 - 120}" width="60" height="120" rx="8"/>`;
      s += `<rect class="ware2" x="${cx + 5}" y="${y2 - 70}" width="70" height="70" rx="30"/>`;
    }
  } else if (kind === 'sinkbase') {
    s += `<path d="M${x + w - 120} ${y} v120 a60 60 0 0 1 -120 0 v-40" fill="none" stroke="#a8a6a2" stroke-width="22"/>`;
    s += `<rect class="ware" x="${x + 60}" y="${y + h - 220}" width="90" height="200" rx="16"/>`;
  } else if (kind === 'base') {
    sh(1);
    s += `<rect class="ware2" x="${x + 60}" y="${y + h / 2 - 150}" width="160" height="136" rx="16"/>`;
    s += `<rect class="ware" x="${x + 260}" y="${y + h - 200}" width="180" height="190" rx="10"/>`;
  } else if (kind === 'tall') {
    sh(3);
  }
  return s;
}

/* 여닫이 도어: hinge = left | right | top(플랩) | slide(오른쪽으로 밀림) */
function swing(x, y, w, h, hinge, tip, inner = '', extra = '') {
  return `<g class="sw hot" data-act="toggle" data-hinge="${hinge}" data-tip="${esc(tip)} · 눌러서 열기">
    <g class="inside">${inner || inside(x, y, w, h)}</g>
    <g class="leaf">${box(x, y, w, h, 'door')}${extra}</g>
  </g>`;
}

function sinkSVG() {
  D = 0;
  const FL = 2300, CT = 1430, SLAB = 34, BT = CT + SLAB, TK = 2200, UB = 750, UT = 30, RB = FL - 150;
  let s = DEFS;
  s += solid(0, 0, 2960, FL, 'wall', 0);
  s += solid(-120, FL, 3200, 40, 'floor', 0);

  // 대리석 벽체 + T5 조명 (클릭하면 조명 켜짐)
  s += `<g class="bs hot" data-act="toggle" data-tip="대리석 벽체 · 크레모사 — 눌러서 T5 조명 켜기">
    <rect class="fill top" x="0" y="${UB}" width="2510" height="${CT - UB}" style="--d:.2s"/>
    <rect class="fill" x="0" y="${UB}" width="2510" height="${CT - UB}" fill="#fff" filter="url(#marble)" style="--d:.2s"/>
    <rect class="wash" x="0" y="${UB}" width="2510" height="${CT - UB}" fill="url(#wash)"/>
    <rect class="t5g" x="40" y="${UB - 10}" width="2440" height="60" fill="#ffe7b0" filter="url(#soft)"/>
    <rect class="t5" x="50" y="${UB + 2}" width="2420" height="10" rx="5"/>
  </g>`;

  // 상부장
  D = 0.2;
  s += box(0, UT, 50, UB - UT, 'door', '필러 FA 50');
  s += swing(50, UT, 450, 390, 'left', '후드장 900', inside(50, UT, 450, 390, 'upper'));
  s += swing(500, UT, 450, 390, 'right', '후드장 900', inside(500, UT, 450, 390, 'upper'));
  s += `<g class="mod" data-tip="레인지후드">
    <path class="fill steel" d="M110 ${UT + 390}H890L850 ${UT + 560}H150Z" style="--d:${nd()}s"/>
    ${ol(`M110 ${UT + 390}H890L850 ${UT + 560}H150Z`)}
    <rect class="fill dark" x="170" y="${UT + 540}" width="660" height="20" style="--d:${nd(0)}s"/></g>`;
  [[950, 'left'], [1340, 'right'], [1730, 'left'], [2120, 'right']].forEach(([x, hg], i) =>
    s += swing(x, UT, 390, UB - UT, hg, `상부장 780 (${i < 2 ? '좌' : '우'})`, inside(x, UT, 390, UB - UT, 'upper')));

  // 키큰장 (하부 150 띄움 → 로봇청소기)
  s += swing(2510, UT, 450, 1070, 'right', '키큰장 450', inside(2510, UT, 450, 1070, 'tall'));
  s += swing(2510, UT + 1070, 450, RB - UT - 1070, 'right', '키큰장 450', inside(2510, UT + 1070, 450, RB - UT - 1070, 'tall'), grip(2510, UT + 1070, 450));
  s += `<rect class="fill" x="2510" y="${RB}" width="450" height="150" fill="color-mix(in srgb,var(--ink) 10%,transparent)" style="--d:1.2s"/>`;
  s += `<g class="robot hot" data-act="robot" data-tip="로봇청소기 · 키큰장 하부 150 띄움 — 눌러보기">
    <rect x="2575" y="${FL - 105}" width="320" height="95" rx="40" fill="#2f2c2a"/>
    <rect x="2600" y="${FL - 118}" width="270" height="22" rx="11" fill="#55504b"/>
    <circle cx="2850" cy="${FL - 60}" r="10" fill="#7fd6a0"/>
  </g>`;

  // 상판
  s += box(0, CT, 2510, SLAB, 'top', '상판 · 한스톤 크레모사');

  // 하부장
  s += box(0, BT, 50, TK - BT, 'door', '필러 FA 50');
  s += swing(50, BT, 200, TK - BT, 'left', '양념 인출장', `<rect class="cab-in" x="50" y="${BT}" width="200" height="${TK - BT}"/>` +
    [0, 1, 2].map(k => `<rect class="shelf" x="62" y="${BT + 180 + k * 200}" width="176" height="12"/><rect class="ware" x="80" y="${BT + 90 + k * 200}" width="40" height="90" rx="6"/><rect class="ware2" x="140" y="${BT + 110 + k * 200}" width="40" height="70" rx="6"/>`).join(''), grip(50, BT, 200));
  // 서랍 3단 (아래 → 위 순서로 그려야 위 서랍이 앞으로 나올 때 겹침이 자연스러움)
  const drw = (y, h, label, stuff) => `<g class="drw hot" data-act="toggle" data-tip="${label} · 눌러서 열기">
      <g class="dbox"><rect x="262" y="${y}" width="576" height="150" fill="#d8cbb6"/><rect x="262" y="${y}" width="576" height="24" fill="#b9a98f"/>${stuff(y)}</g>
      <g class="front">${box(250, y, 600, h, 'door')}${grip(250, y, 600)}</g>
    </g>`;
  s += drw(BT + 488, TK - BT - 488, '서랍 3단 (하)', y => `<ellipse cx="420" cy="${y + 95}" rx="120" ry="34" fill="#6d6a66"/><ellipse cx="680" cy="${y + 95}" rx="110" ry="30" fill="#8a8681"/>`);
  s += drw(BT + 240, 248, '서랍 3단 (중)', y => `<rect x="320" y="${y + 50}" width="160" height="80" rx="10" fill="#efe9df"/><rect x="520" y="${y + 50}" width="240" height="80" rx="10" fill="#e3d9c9"/>`);
  s += drw(BT, 240, '서랍 3단 (상) · 인덕션 하부', y => [0, 1, 2, 3, 4, 5].map(k => `<rect x="${310 + k * 85}" y="${y + 40}" width="${k % 2 ? 18 : 26}" height="100" rx="8" fill="${k % 2 ? '#9a9792' : '#c9c3b8'}"/>`).join(''));
  s += swing(850, BT, 560, TK - BT, 'left', '하부장 560', inside(850, BT, 560, TK - BT, 'base'), grip(850, BT, 560));
  s += swing(1410, BT, 475, TK - BT, 'left', '개수대 하부장 950', inside(1410, BT, 475, TK - BT, 'sinkbase'), grip(1410, BT, 475));
  s += swing(1885, BT, 475, TK - BT, 'right', '개수대 하부장 950', inside(1885, BT, 475, TK - BT, 'sinkbase'), grip(1885, BT, 475));
  s += box(2360, BT, 150, TK - BT, 'door', '필러 · EP');
  s += solid(0, TK, 2510, FL - TK, 'dark', '1.5');

  // 인덕션
  s += `<g class="mod" data-tip="인덕션 3구"><rect class="fill dark" x="300" y="${CT - 12}" width="500" height="14" rx="4" style="--d:1.9s"/></g>`;
  // 싱크볼 + 폭포수전 (클릭하면 물)
  const SPX = 1880, SY = CT - 236;
  let streams = '';
  for (let k = 0; k < 7; k++) streams += `<line x1="${SPX - 66 + k * 22}" y1="${SY + 16}" x2="${SPX - 66 + k * 22}" y2="${CT}" style="animation-delay:${-k * 0.13}s"/>`;
  s += `<g class="sink hot" data-act="toggle" data-tip="백조 깜포르테 860 · 폭포수전 — 눌러서 물 틀기">
    <rect class="fill" x="1560" y="${CT - 6}" width="640" height="10" fill="url(#steel)" style="--d:2s"/>
    <g class="fill" style="--d:2.1s">
      <rect x="${SPX - 22}" y="${CT - 300}" width="44" height="300" rx="6" fill="url(#steel)" stroke="#8d8a86" stroke-width="3"/>
      <rect x="${SPX - 90}" y="${SY}" width="180" height="18" rx="4" fill="url(#steel)" stroke="#8d8a86" stroke-width="3"/>
      <rect x="${SPX + 22}" y="${CT - 260}" width="60" height="12" rx="6" fill="#8d8a86"/>
    </g>
    <g class="water-g">
      <rect x="${SPX - 76}" y="${SY + 16}" width="152" height="${CT - SY - 16}" fill="url(#waterG)" rx="6"/>
      <g class="stream">${streams}</g>
    </g>
  </g>`;

  // 치수
  D = 1.9;
  s += dimH(0, 950, -50, '900+FA50') + dimH(950, 1730, -50, '780') + dimH(1730, 2510, -50, '780') + dimH(2510, 2960, -50, '450');
  s += dimH(0, 2960, -170, '2960');
  s += dimH(0, 250, FL + 110, 'FA·200', false) + dimH(250, 850, FL + 110, '600', false) + dimH(850, 1410, FL + 110, '560', false) + dimH(1410, 2360, FL + 110, '950', false) + dimH(2510, 2960, FL + 110, '450', false);
  s += dimV(-60, CT, FL, '870');
  s += `<g class="fill" style="--d:2.4s"><path class="dim" d="M3020 ${RB}V${FL}"/><text class="dim-t" x="3050" y="${RB + 60}" text-anchor="start" style="text-anchor:start">150</text></g>`;
  return `<svg class="dw" viewBox="-160 -260 3300 2800" role="img" aria-label="싱크대 정면도">${s}</svg>`;
}

function planSVG() {
  D = 0;
  let s = DEFS;
  // 벽 (보조주방은 ㄱ자로 꺾인 니치 안쪽 벽에 배치)
  s += `<g class="fill" style="--d:0s"><rect class="wall" x="-900" y="-90" width="4100" height="2050" rx="30"/></g>`;
  s += ol('M3000 -40H-40V680H-740V1900', '0.1');
  s += ol('M3000 -40V1700', '0.15');
  s += `<g class="fill" style="--d:.6s" data-tip="창문"><rect x="-756" y="1080" width="32" height="360" fill="#e9f3f8" stroke="var(--ink)" stroke-width="4"/><line x1="-740" y1="1080" x2="-740" y2="1440" stroke="var(--ink)" stroke-width="3"/></g>`;
  D = 0.3;
  // 보조주방 (니치 안쪽 벽, 주방과 ㄱ자)
  s += box(-700, 720, 650, 1060, 'top', '보조주방 1060 × 650 · 상부장 X');
  s += `<text class="lbl fill" x="-375" y="1230" style="--d:1.2s">보조주방</text><text class="lbl-s fill" x="-375" y="1310" style="--d:1.25s">1060 × 650</text>`;
  // 주방 상판 + 키큰장 + 페닌슐라
  s += box(0, 0, 2510, 600, 'top', '주방 상판 2960 · 크레모사');
  s += box(2510, 0, 450, 600, 'door', '키큰장 450 · 하부 로봇청소기');
  s += box(2240, 600, 720, 970, 'top', '페닌슐라');

  // 인덕션 3구 (클릭하면 불)
  const burner = (cx, cy, r) => `<circle class="burn-glow" cx="${cx}" cy="${cy}" r="${r + 10}" fill="url(#heat)"/>
    <circle class="burn" cx="${cx}" cy="${cy}" r="${r}"/><circle class="burn" cx="${cx}" cy="${cy}" r="${r * 0.6}"/>`;
  s += `<g class="ind hot" data-act="toggle" data-tip="인덕션 3구 — 눌러서 켜기">
    <rect class="fill dark" x="290" y="70" width="540" height="460" rx="26" style="--d:${nd()}s"/>
    <g class="fill" style="--d:${nd(0)}s">${burner(430, 220, 110)}${burner(700, 200, 80)}${burner(590, 410, 90)}
      <g class="ind-ui"><circle cx="350" cy="490" r="9"/><circle cx="380" cy="490" r="9"/><circle cx="410" cy="490" r="9"/></g></g>
  </g>`;

  // 백조 깜포르테 860: 새틴 스테인리스 볼 + 가운데 원형 배수구 커버 + 폭포수전 (클릭하면 물)
  const DX = 1880, DY = 330;
  let flow = '';
  for (let k = 0; k < 8; k++) flow += `<line x1="${DX - 70 + k * 20}" y1="132" x2="${DX - 80 + k * 23}" y2="${DY - 40}" style="animation-delay:${-k * 0.11}s"/>`;
  s += `<g class="sink hot" data-act="toggle" data-tip="백조 깜포르테 860 · 폭포수전 — 눌러서 물 틀기">
    <g class="fill" style="--d:${nd()}s">
      <rect x="1440" y="78" width="880" height="464" rx="26" fill="url(#rim)" stroke="#8d8a86" stroke-width="4"/>
      <rect x="1462" y="100" width="836" height="420" rx="34" fill="url(#bowlWall)"/>
      <rect x="1500" y="150" width="760" height="338" rx="26" fill="url(#bowlFloor)"/>
      <path d="M1478 168H2282" stroke="#e9e8e5" stroke-width="7" stroke-linecap="round" opacity=".9"/>
      <path d="M1478 176H2282" stroke="#9a9894" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <rect x="1500" y="150" width="760" height="338" rx="26" fill="none" stroke="#b9b7b3" stroke-width="3"/>
      <text x="${DX}" y="140" text-anchor="middle" font-size="22" fill="#8e8c88" font-weight="600" letter-spacing="1">Camforte</text>
      <g data-tip="깜포르테 원형 배수구 커버">
        <circle cx="${DX}" cy="${DY}" r="96" fill="#5f5d5a"/>
        <circle cx="${DX}" cy="${DY}" r="90" fill="url(#drainCover)" stroke="#8a8884" stroke-width="2"/>
        <ellipse cx="${DX - 22}" cy="${DY - 34}" rx="46" ry="20" fill="#fff" opacity=".45"/>
        <circle cx="${DX}" cy="${DY}" r="78" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
        <text x="${DX}" y="${DY + 8}" text-anchor="middle" font-size="20" fill="#8a8884" font-weight="600" letter-spacing="1">Camforte</text>
      </g>
    </g>
    <g class="fill" style="--d:${nd()}s" data-tip="폭포수전">
      <rect x="${DX - 40}" y="18" width="80" height="58" rx="12" fill="url(#steel)" stroke="#7d7b77" stroke-width="4"/>
      <rect x="${DX - 80}" y="68" width="160" height="64" rx="8" fill="url(#steel)" stroke="#7d7b77" stroke-width="4"/>
      <rect x="${DX - 70}" y="120" width="140" height="10" rx="4" fill="#6f6d69"/>
      <rect x="${DX + 55}" y="28" width="70" height="22" rx="11" fill="#8d8a86"/>
    </g>
    <g class="water-g">
      <path d="M${DX - 74} 130H${DX + 74}L${DX + 100} ${DY - 30}H${DX - 100}Z" fill="url(#waterG)"/>
      <g class="stream">${flow}</g>
      <ellipse class="ripple" cx="${DX}" cy="${DY}" rx="150" ry="70"/>
      <ellipse class="ripple" cx="${DX}" cy="${DY}" rx="150" ry="70" style="animation-delay:-.6s"/>
      <ellipse class="ripple" cx="${DX}" cy="${DY}" rx="110" ry="110" style="animation-delay:-.3s"/>
    </g>
  </g>`;

  // 로봇청소기 (키큰장 하부)
  s += `<g class="robot-plan hot" data-act="robot" data-tip="로봇청소기 · 키큰장 하부 150 띄움 — 눌러보기">
    <circle cx="2735" cy="310" r="165" fill="#2f2c2a" fill-opacity=".85" stroke="#2f2c2a" stroke-width="4" stroke-dasharray="18 12"/>
    <circle cx="2735" cy="250" r="34" fill="#55504b"/><circle cx="2800" cy="380" r="12" fill="#7fd6a0"/>
  </g>`;

  // 라벨 (가려지지 않게 상판 밖 아래쪽으로)
  s += `<text class="lbl fill" x="560" y="690" style="--d:1.4s">인덕션 3구</text>`;
  s += `<text class="lbl fill" x="1880" y="690" style="--d:1.45s">싱크볼</text><text class="lbl-s fill" x="1880" y="760" style="--d:1.47s">백조 깜포르테 860</text>`;
  s += `<text class="lbl fill" x="2600" y="1120" style="--d:1.5s">페닌슐라</text>`;
  s += `<text class="lbl-s fill" x="2735" y="560" style="--d:1.5s">로봇청소기</text>`;
  D = 1.5;
  s += dimH(0, 2960, -130, '2960');
  s += `<g class="fill" style="--d:1.7s"><path class="dim" d="M3080 0V1570M3062 0h36M3062 1570h36"/><text class="dim-t" x="3130" y="785" transform="rotate(90 3130 785)">1570</text></g>`;
  s += dimH(2240, 2960, 1680, '720', false);
  s += dimV(-820, 720, 1780, '1060');
  s += dimH(-700, -50, 1850, '650', false);
  return `<svg class="dw plan" viewBox="-960 -260 4260 2280" role="img" aria-label="주방 평면 배치">${s}</svg>`;
}

/* 냉장고 내용물 */
const can = (x, y, c) => `<rect x="${x}" y="${y - 118}" width="62" height="118" rx="9" fill="${c}"/><rect x="${x + 4}" y="${y - 122}" width="54" height="10" rx="4" fill="#d8dadc"/><rect x="${x}" y="${y - 80}" width="62" height="26" fill="#fff" opacity=".35"/>`;
const soju = (x, y) => `<rect x="${x + 20}" y="${y - 215}" width="24" height="70" rx="6" fill="#3f9a5c" opacity=".9"/><rect x="${x + 18}" y="${y - 226}" width="28" height="16" rx="3" fill="#2e6f43"/><rect x="${x}" y="${y - 155}" width="64" height="155" rx="14" fill="#4aa86a" opacity=".85"/><rect x="${x}" y="${y - 110}" width="64" height="42" fill="#f4f7f2"/><rect x="${x + 10}" y="${y - 145}" width="8" height="120" rx="4" fill="#fff" opacity=".4"/>`;
const ion = (x, y) => `<rect x="${x + 16}" y="${y - 205}" width="40" height="26" rx="6" fill="#1f5fbf"/><rect x="${x}" y="${y - 182}" width="72" height="182" rx="16" fill="#eef5fb"/><rect x="${x}" y="${y - 130}" width="72" height="60" fill="#2f74d0"/><rect x="${x + 10}" y="${y - 114}" width="52" height="10" rx="5" fill="#fff" opacity=".8"/>`;
const banchan = (x, y, food, w = 150) => `<rect x="${x}" y="${y - 92}" width="${w}" height="92" rx="12" fill="#f4f6f7" stroke="#cfd6db" stroke-width="3"/><rect x="${x + 8}" y="${y - 70}" width="${w - 16}" height="60" rx="8" fill="${food}"/><rect x="${x - 4}" y="${y - 100}" width="${w + 8}" height="18" rx="6" fill="#9fb4c2"/>`;
const meat = (x, y, w = 190, h = 70) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="10" fill="#b8473f"/>
  <path d="M${x + 20} ${y - h + 20}q${w / 4} 14 ${w / 2} 0t${w / 2 - 40} 6M${x + 26} ${y - 22}q${w / 3} -12 ${w - 60} 4" stroke="#f3d6cf" stroke-width="7" fill="none" stroke-linecap="round"/>
  <rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="10" fill="#fff" opacity=".32"/><rect x="${x + w - 64}" y="${y - h + 10}" width="50" height="22" rx="4" fill="#fff" opacity=".9"/>`;
const kimchiTong = (x, y, w = 330, h = 190) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="16" fill="#f6f2ec" stroke="#cfc6ba" stroke-width="3"/>
  <rect x="${x + 12}" y="${y - h + 40}" width="${w - 24}" height="${h - 54}" rx="10" fill="#c43b2a"/>
  ${[0, 1, 2, 3].map(k => `<path d="M${x + 30 + k * (w - 60) / 3} ${y - h + 52}q18 40 0 ${h - 80}" stroke="#f1d39b" stroke-width="12" fill="none" stroke-linecap="round" opacity=".85"/>`).join('')}
  <rect x="${x + 12}" y="${y - h + 40}" width="${w - 24}" height="${h - 54}" rx="10" fill="#fff" opacity=".18"/>
  <rect x="${x - 6}" y="${y - h - 6}" width="${w + 12}" height="34" rx="10" fill="#7a8f74"/>`;

function fridgeInside(x, y, w, h, kind, top) {
  const g = 14, ix = x + g, iw = w - g * 2;
  const fy = y + g, fh = top - g * 1.5;               // 상단 칸
  const by = y + top + g / 2, bh = h - top - g * 1.5; // 하단 칸
  let s = `<rect x="${ix}" y="${fy}" width="${iw}" height="${fh}" rx="6" fill="#fbfcfd"/>
    <rect x="${ix}" y="${fy}" width="${iw}" height="90" fill="#fff8e1" opacity=".9" filter="url(#soft)"/>`;
  const shelf = yy => `<rect x="${ix}" y="${yy}" width="${iw}" height="12" fill="#dfe8ee" stroke="#c4d1da" stroke-width="2"/>`;
  if (kind === 'fridge') {
    const s1 = fy + fh * 0.3, s2 = fy + fh * 0.6, s3 = fy + fh * 0.86;
    s += shelf(s1) + shelf(s2) + shelf(s3);
    // 반찬통
    s += banchan(ix + 30, s1, '#6f9a4a') + banchan(ix + 200, s1, '#c0392b') + banchan(ix + 370, s1, '#8b5a2b') + banchan(ix + 540, s1, '#e8c15a', 140) + banchan(ix + 700, s1, '#9bbf5a', 130);
    // 맥주 + 소주
    s += [0, 1, 2, 3, 4].map(k => can(ix + 30 + k * 70, s2, k % 2 ? '#d9a93a' : '#c9ccd0')).join('');
    s += [0, 1, 2].map(k => soju(ix + 420 + k * 80, s2)).join('');
    s += can(ix + 680, s2, '#d9a93a') + can(ix + 750, s2, '#d9a93a');
    // 이온음료
    s += [0, 1, 2, 3].map(k => ion(ix + 40 + k * 88, s3)).join('');
    s += banchan(ix + 420, s3, '#f0e2c0', 170) + banchan(ix + 610, s3, '#d1744a', 160);
    // 야채칸
    s += `<rect x="${ix + 10}" y="${s3 + 24}" width="${iw - 20}" height="${fy + fh - s3 - 30}" rx="8" fill="#eaf3e6" stroke="#c6d7bf" stroke-width="3"/>
      <circle cx="${ix + 120}" cy="${s3 + 70}" r="34" fill="#7cb342"/><circle cx="${ix + 200}" cy="${s3 + 75}" r="30" fill="#ef6c00"/><rect x="${ix + 260}" y="${s3 + 50}" width="160" height="40" rx="20" fill="#9ccc65"/>`;
    // 냉동실: 얼린 고기
    s += `<rect x="${ix}" y="${by}" width="${iw}" height="${bh}" rx="6" fill="#e3eef5"/>`;
    const d1 = by + bh * 0.48;
    s += `<rect x="${ix + 10}" y="${d1}" width="${iw - 20}" height="10" fill="#c7d8e3"/>`;
    s += meat(ix + 30, d1 - 6) + meat(ix + 240, d1 - 6, 210, 80) + meat(ix + 470, d1 - 6, 170) + meat(ix + 660, d1 - 6, 190, 60);
    s += meat(ix + 40, d1 - 86, 230, 60) + meat(ix + 300, d1 - 92, 200, 66) + meat(ix + 530, d1 - 72, 240, 56);
    s += meat(ix + 30, by + bh - 20, 260, 90) + meat(ix + 320, by + bh - 20, 200, 80) + meat(ix + 550, by + bh - 20, 260, 86);
    s += meat(ix + 80, by + bh - 110, 220, 70) + meat(ix + 380, by + bh - 106, 260, 66);
    s += `<rect x="${ix}" y="${by}" width="${iw}" height="${bh}" rx="6" fill="#ffffff" opacity=".12"/>`;
    s += `<text class="lbl-s" x="${x + w / 2}" y="${by + 50}" style="fill:#5c7a8a">냉동실</text>`;
  } else {
    const s1 = fy + fh * 0.5;
    s += shelf(s1);
    s += kimchiTong(ix + 30, s1 - 6) + kimchiTong(ix + 390, s1 - 6, 310);
    s += kimchiTong(ix + 30, fy + fh - 10, 330, 200) + kimchiTong(ix + 390, fy + fh - 10, 310, 200);
    s += `<rect x="${ix}" y="${by}" width="${iw}" height="${bh}" rx="6" fill="#f3f6f8"/>`;
    const d1 = by + bh * 0.5;
    s += `<rect x="${ix + 10}" y="${d1}" width="${iw - 20}" height="10" fill="#d4dde3"/>`;
    s += kimchiTong(ix + 40, d1 - 8, 300, 220) + kimchiTong(ix + 380, d1 - 8, 300, 220);
    s += kimchiTong(ix + 40, by + bh - 20, 300, 230) + kimchiTong(ix + 380, by + bh - 20, 300, 230);
  }
  return s;
}

function fridge(x, y, w, h, label, kind, delay) {
  // 비스포크 키친핏 맥스 외관: 화이트 새틴 패널 + 블랙 가로 핸들 밴드 + 하단 다리
  const B = 44, FEET = 34, GAP = 6, half = w / 2;
  const top = kind === 'kimchi' ? h * 0.5 : h * 0.57;   // 상단 도어 높이 비율
  const bodyB = y + h - FEET;
  const panel = (dx, dy, dw, dh) => `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="4" fill="url(#panel)" stroke="#d6d3ce" stroke-width="2"/>
    <rect x="${dx + 6}" y="${dy + 6}" width="${dw * 0.28}" height="${dh - 12}" rx="3" fill="#fff" opacity=".35"/>`;
  const door = (dx, dy, dw, dh, side) => `<g class="fdoor" data-h="${side}">${panel(dx, dy, dw, dh)}</g>`;
  const drawer = (dy, dh) => `<g class="fdrw">${panel(x + GAP, dy, w - GAP * 2, dh)}</g>`;
  const band = (by) => `<rect x="${x}" y="${by}" width="${w}" height="${B}" fill="#1d1d1d"/>
    <rect x="${x + 14}" y="${by + B - 12}" width="${w - 28}" height="5" rx="2" fill="#3a3a3a"/>`;
  const feet = `<rect x="${x + 8}" y="${bodyB}" width="${w - 16}" height="${FEET - 8}" fill="#2a2a2a"/>
    <rect x="${x + 30}" y="${y + h - 14}" width="60" height="14" rx="4" fill="#1a1a1a"/><rect x="${x + w - 90}" y="${y + h - 14}" width="60" height="14" rx="4" fill="#1a1a1a"/>`;
  let fronts = '';
  const t1 = y + top - B / 2;                // 상단 도어 하단
  fronts += door(x + GAP, y + GAP, half - GAP * 1.5, t1 - y - GAP, 'l');
  fronts += door(x + half + GAP / 2, y + GAP, half - GAP * 1.5, t1 - y - GAP, 'r');
  let bands = band(t1);
  if (kind === 'kimchi') {
    const r0 = t1 + B, R = bodyB - r0 - B, dh = R / 2;
    fronts += drawer(r0, dh - GAP / 2);
    bands += band(r0 + dh - GAP / 2 + GAP / 2);
    fronts += drawer(r0 + dh + B, bodyB - (r0 + dh + B) - GAP / 2);
  } else {
    const b0 = t1 + B;
    fronts += door(x + GAP, b0, half - GAP * 1.5, bodyB - b0 - GAP / 2, 'l');
    fronts += door(x + half + GAP / 2, b0, half - GAP * 1.5, bodyB - b0 - GAP / 2, 'r');
  }
  const name = label.split(' · ')[0];
  return `<g class="slide-in" style="--d:${delay}s">
    <g class="frg hot" data-act="toggle" data-tip="${esc(label)} — 눌러서 열기">
      <rect x="${x}" y="${y}" width="${w}" height="${h - FEET + 4}" rx="6" fill="#1f1f1f"/>
      <g class="fin">${fridgeInside(x, y, w, h - FEET, kind, top)}</g>
      ${feet}
      ${bands}
      ${fronts}
      <g class="fname"><text class="lbl-s" x="${x + w / 2}" y="${y + top * 0.45}" style="fill:#b5b0a8">${name}</text>
      <text class="dim-t" x="${x + w / 2}" y="${y + top * 0.45 + 56}" style="fill:#c3beb6">${w}</text></g>
    </g>
  </g>`;
}

function pantry(x0, y0, x1, y1) {
  // 내부 ㄱ자 팬트리: 상단 가로 선반 + 오른쪽 세로 선반열, 왼쪽 아래는 키 큰 수납 공간
  const W = x1 - x0, split = x0 + 560, band = y0 + 640;
  let s = `<rect x="${x0}" y="${y0}" width="${W}" height="${y1 - y0}" fill="#e7e0d5"/>`;
  s += `<rect x="${x0}" y="${y0}" width="${W}" height="${y1 - y0}" fill="#5a4f45" opacity=".12"/>`;
  const shelf = (a, b, y) => `<rect class="shelf" x="${a}" y="${y}" width="${b - a}" height="18"/>`;
  [y0 + 300, band].forEach(y => s += shelf(x0 + 10, x1 - 10, y));
  [band + 330, band + 660, band + 990, band + 1320].forEach(y => y < y1 - 60 && (s += shelf(split + 10, x1 - 10, y)));
  s += `<rect x="${split}" y="${band}" width="18" height="${y1 - band}" fill="#b9ad9c"/>`;
  // 물건들
  const jar = (x, y, h, c) => `<rect x="${x}" y="${y - h}" width="70" height="${h}" rx="10" fill="${c}" opacity=".9"/><rect x="${x + 6}" y="${y - h - 16}" width="58" height="18" rx="5" fill="#6b5e52"/>`;
  const boxy = (x, y, w, h, c) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="6" fill="${c}"/>`;
  s += jar(x0 + 60, y0 + 300, 150, '#f3eadb') + jar(x0 + 150, y0 + 300, 120, '#e8d7b9') + jar(x0 + 240, y0 + 300, 170, '#f1e4cc') + boxy(x0 + 420, y0 + 300, 200, 160, '#c8b79d') + boxy(x0 + 650, y0 + 300, 220, 120, '#a99a85');
  s += boxy(x0 + 50, band, 260, 190, '#d5c4a8') + jar(x0 + 360, band, 160, '#f3eadb') + jar(x0 + 450, band, 140, '#e8d7b9') + boxy(x0 + 620, band, 250, 220, '#b8a78d');
  s += boxy(split + 50, band + 330, 300, 160, '#cbb99c') + jar(split + 70, band + 660, 160, '#f1e4cc') + jar(split + 170, band + 660, 130, '#efe2c9') + jar(split + 270, band + 660, 150, '#e8d7b9');
  s += boxy(split + 60, band + 990, 280, 200, '#a99a85') + boxy(split + 40, band + 1320, 320, 150, '#d5c4a8');
  // 왼쪽 아래 키 큰 공간: 청소기
  s += `<rect x="${x0 + 200}" y="${band + 260}" width="40" height="${y1 - band - 360}" rx="12" fill="#77706a"/><rect x="${x0 + 150}" y="${y1 - 140}" width="150" height="70" rx="16" fill="#5c5650"/><rect x="${x0 + 175}" y="${band + 200}" width="90" height="90" rx="14" fill="#8a8580"/>`;
  // H5 조명 (세로 + 선반 하부)
  s += `<g class="h5">
    <rect x="${x0 + 6}" y="${y0 + 20}" width="12" height="${y1 - y0 - 40}" rx="6" fill="#fff3cf"/>
    <rect x="${x1 - 18}" y="${y0 + 20}" width="12" height="${y1 - y0 - 40}" rx="6" fill="#fff3cf"/>
    <rect x="${x0}" y="${y0}" width="70" height="${y1 - y0}" fill="#ffe7b0" filter="url(#soft)" opacity=".8"/>
    <rect x="${x1 - 70}" y="${y0}" width="70" height="${y1 - y0}" fill="#ffe7b0" filter="url(#soft)" opacity=".8"/>
    ${[y0 + 318, band + 18].map(y => `<rect x="${x0 + 30}" y="${y}" width="${W - 60}" height="40" fill="#ffefc4" filter="url(#soft)" opacity=".7"/>`).join('')}
    <text class="lbl-s" x="${x0 + W / 2}" y="${y0 + 120}" style="fill:#8a6a3a">H5 조명</text>
  </g>`;
  return s;
}

function builtinSVG() {
  D = 0;
  const FL = 2300, TK = 2200, UT = 30, NT = 860, NB = 1460; // 니치(슬라이드장) 상하단
  let s = DEFS;
  s += solid(-200, 0, 3420, FL, 'wall', 0);
  s += solid(-200, FL, 3620, 40, 'floor', 0);
  D = 0.15;
  s += box(-165, UT, 145, TK - UT, 'door', '태우기 165');
  s += box(-20, UT, 40, TK - UT, 'door', 'EP 20');
  // 키큰장 980 — 내부 ㄱ자 팬트리 (클릭하면 문이 오른쪽으로 밀림)
  s += `<g class="sw hot" data-act="toggle" data-hinge="slide" data-tip="내부 ㄱ자 팬트리장 · 눌러서 열기">
    <g class="inside">${pantry(20, UT, 980, TK)}</g>
    <g class="leaf">${box(20, UT, 480, TK - UT, 'door')}${box(500, UT, 480, TK - UT, 'door')}
      <text class="lbl" x="500" y="1150">내부 ㄱ자 팬트리장</text></g>
  </g>`;
  // 브릿지장 (플랩 도어)
  s += swing(980, UT, 915, 400, 'top', '브릿지장 915', inside(980, UT, 915, 400, 'upper'));
  s += swing(1895, UT, 805, 400, 'top', '브릿지장 805', inside(1895, UT, 805, 400, 'upper'));
  // 냉장고 자리
  s += `<rect class="fill" x="980" y="${UT + 400}" width="1720" height="${FL - UT - 400}" fill="color-mix(in srgb,var(--ink) 6%,transparent)" style="--d:.9s"/>`;
  s += ol(`M980 ${UT + 400}V${FL}M2700 ${UT + 400}V${FL}`, '0.9');
  s += box(2700, UT, 20, TK - UT, 'door', 'EP 20');
  // 키큰장 450: 상부 도어 / 슬라이드장(밥솥) / 하부 도어
  s += swing(2720, UT, 450, NT - UT, 'right', '키큰장 450 (상)', inside(2720, UT, 450, NT - UT, 'tall'));
  s += `<g class="mod"><rect class="fill cab-in" x="2720" y="${NT}" width="450" height="${NB - NT}" style="--d:${nd()}s"/>
    <rect class="fill" x="2735" y="${NT + 6}" width="420" height="40" fill="#ffe7b0" filter="url(#soft)" style="--d:${nd(0)}s"/>
    ${ol(`M2720 ${NT}h450v${NB - NT}h-450z`)}</g>`;
  s += `<g class="tray hot" data-act="toggle" data-tip="밥솥 슬라이드장 · 눌러서 꺼내기">
    <g class="steam"><path d="M2900 ${NT + 230}q-30 -40 0 -80t0 -80"/><path d="M2950 ${NT + 220}q-30 -40 0 -80t0 -80"/><path d="M3000 ${NT + 230}q-30 -40 0 -80t0 -80"/></g>
    <g class="pull">
      <rect x="2735" y="${NB - 60}" width="420" height="24" rx="4" fill="#b9ad9c" stroke="var(--ink)" stroke-width="4"/>
      <rect x="2800" y="${NB - 330}" width="290" height="270" rx="60" fill="#f4f2ee" stroke="#5a5550" stroke-width="5"/>
      <rect x="2800" y="${NB - 330}" width="290" height="90" rx="45" fill="#e2ded8" stroke="#5a5550" stroke-width="5"/>
      <rect x="2900" y="${NB - 200}" width="90" height="46" rx="8" fill="#2f2c2a"/>
      <rect x="2915" y="${NB - 190}" width="60" height="12" rx="3" fill="#7fd6a0"/>
      <rect x="3040" y="${NB - 300}" width="30" height="20" rx="6" fill="#8d8a86"/>
    </g>
  </g>`;
  s += swing(2720, NB, 450, TK - NB, 'right', '키큰장 450 (하)', inside(2720, NB, 450, TK - NB, 'tall'));
  s += box(3170, UT, 50, TK - UT, 'door', 'FA 50');
  s += solid(-165, TK, 1145, FL - TK, 'dark', '1.3') + solid(2700, TK, 520, FL - TK, 'dark', '1.3');
  // 냉장고 912 + 김치냉장고 799 = 1711 (자리 1720)
  s += fridge(984, 447, 912, 1853, '냉장고 · 삼성 RM70F64Q1A 키친핏 맥스 912×1853×697', 'fridge', 1.7);
  s += fridge(1900, 447, 799, 1853, '김치냉장고 · 삼성 RK70F42M2A 키친핏 맥스 799×1853×697', 'kimchi', 1.95);
  D = 2.1;
  s += dimH(20, 980, -50, '980') + dimH(980, 1895, -50, '915') + dimH(1895, 2700, -50, '805') + dimH(2720, 3170, -50, '450');
  s += dimH(0, 3220, -170, '3220');
  s += dimH(-165, 20, FL + 110, '165', false);
  s += dimV(3290, NT, NB, `${NB - NT}`);
  return `<svg class="dw" viewBox="-300 -260 3700 2800" role="img" aria-label="냉장고장 정면도">${s}</svg>`;
}

const SPECS = {
  sink: [
    ['규격', 'ㄱ자 2960 × 1570'], ['도어', '영림 듄 선셋 스톤'], ['상판', '한스톤 크레모사'],
    ['벽체', '크레모사 2560'], ['조명', 'T5 간접 + 라인조명'], ['싱크볼', '백조 깜포르테 860'],
    ['수전', '폭포수전'], ['보조주방', '1060 × 650'], ['타일', '300×600 덧방'], ['로봇청소기', '키큰장 하부 150'],
  ],
  plan: [
    ['주방', '2960 (D 600)'], ['페닌슐라', '1570 × 720'], ['보조주방', '1060 × 650 (ㄱ자)'],
    ['인덕션', '3구'], ['싱크볼', '백조 깜포르테 860'], ['상판 길이', '2960 / 1570 / 1160'], ['로봇청소기', '키큰장 하부'],
  ],
  builtin: [
    ['규격', '3220 × 855'], ['구성', '980 · 915/805 · 450'], ['내부', 'ㄱ자 팬트리장'], ['조명', 'H5 조명'],
    ['슬라이드장', '밥솥 수납'], ['냉장고', 'RM70F64Q1A (912)'], ['김치냉장고', 'RK70F42M2A (799)'], ['도어', '영림 듄 선셋 스톤'],
  ],
  render: [['안내', '이전 시안 렌더링'], ['기준', '최신 도면 우선'], ['상판', '크레모사로 변경'], ['도어', '듄 선셋 스톤으로 변경']],
};
const HINTS = {
  sink: '도어 · 서랍 · 대리석 벽체(조명) · 싱크볼(물) · 로봇청소기를 눌러보세요',
  plan: '인덕션(불) · 싱크볼(물) · 로봇청소기를 눌러보세요',
  builtin: 'ㄱ자 팬트리장 · 냉장고 · 김치냉장고 · 브릿지장 · 밥솥 슬라이드장을 눌러보세요',
  render: '',
};

function showView(v) {
  const stage = $('#stage');
  if (v === 'render') {
    stage.innerHTML = `<div><img src="assets/kitchen-render.jpg" alt="싱크대 예상 렌더링" loading="lazy"><p class="cap">이전 시안 렌더링 · 구조 참고용 (도면이 최신 기준, 마감재는 변경됨)</p></div>`;
  } else {
    stage.innerHTML = { sink: sinkSVG, plan: planSVG, builtin: builtinSVG }[v]() + `<p class="hint-chip"><span>👆</span>${HINTS[v]}</p>`;
  }
  $('#specList').innerHTML = SPECS[v].map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`).join('');
  $$('.show-tabs button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  moveInk();
}
$('#stage').addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t || !t.closest('svg')) return;
  if (t.dataset.act === 'toggle') t.classList.toggle('open');
  else if (t.dataset.act === 'robot') { t.classList.remove('go'); void t.getBoundingClientRect(); t.classList.add('go'); }
});
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
    if (canEdit()) $('#importFile').click();
  } else if (a === 'reset') {
    if (!canEdit()) return;
    if (confirm(sync.on ? '함께 쓰는 데이터 전체를 초기 데이터로 되돌릴까요? 상대방 화면에도 바로 적용돼요.' : '모든 변경 내용을 지우고 초기 데이터로 되돌릴까요?')) {
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

$('#authBtn').addEventListener('click', () => {
  if (!window.cloud) return;
  if (sync.user) { if (confirm('로그아웃할까요?')) window.cloud.signOut(); }
  else window.cloud.signIn().catch(authErr);
});

/* ---------------- init ---------------- */
setSyncState('local');
applyColors();
renderAll();
requestAnimationFrame(moveInk);
loadPrices();
})();

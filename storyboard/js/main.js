/* TODAY'S MOOD — interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- mission card data ---------------- */
  const CARDS = [
    {
      code: 'MOOD 01', title: 'FIND SOMETHING IN COMMON', time: '19:00',
      body: '우리 사이에는 생각보다\n공통점이 많을지도 모릅니다.\n\n지금부터 대화를 나누며\n서로의 공통점 3가지를 찾아주세요.\n\n꼭 특별한 내용일 필요는 없습니다.\n좋아하는 음식, 생활 습관, 여행 취향, 학교생활까지.',
      qLabel: '오늘의 질문', q: '“요즘 가장 시간을 많이 쓰고 있는 건?”',
      goal: '전체 대화 유도 · 특정 사람에게 호감을 강요하지 않고 자연스러운 공통점 발견',
      next: '19:00–19:20 TALK ROUND 1'
    },
    {
      code: 'MOOD 02', title: 'CHANGE THE SCENE', time: '19:20',
      body: '지금까지 이야기했던 자리에서\n조금 움직여볼 시간입니다.\n\n아직 대화를 많이 나누지 못했던 사람들과\n새로운 자리에 앉아주세요.\n\n오늘의 두 번째 장면을 시작합니다.',
      qLabel: 'TALK ABOUT', q: '“학교를 다니지 않았다면 지금 뭘 하고 있었을 것 같나요?”',
      goal: '술집 환경상 대규모 이동 대신 옆자리 교체 · 맞은편 교체 · 2:2 조합 변경',
      next: '19:20–19:40 TALK ROUND 2'
    },
    {
      code: 'MOOD 03', title: 'FIRST IMPRESSION', time: '19:40',
      body: '처음 봤을 때와\n지금의 인상이 달라진 사람이 있나요?\n\n한 사람에게 가볍게 말해주세요.\n\n외모보다는\n분위기나 성격에 대한 이야기면 좋습니다.',
      qLabel: '이렇게 말해보세요', q: '“처음에는 OO할 것 같았는데, 이야기해보니까 OO한 것 같아요.”',
      goal: '긍정적인 피드백 유도 · 연프 특유의 ‘첫인상 변화’ 차용 · 외모 평가 최소화',
      next: '19:40–20:00 FREE TALK 2 (개입 없음)'
    },
    {
      code: 'SECRET NOTE', title: 'ANONYMOUS QUESTION', time: '20:00', theme: 'secret',
      body: '직접 물어보기엔 살짝 애매하지만\n조금 궁금한 것이 있나요?\n\n궁금한 사람이 있다면\n그 사람에게 물어보고 싶은 질문 하나를\n제작진에게 개인톡으로 보내주세요.',
      qLabel: 'NOTE', q: '질문자는 공개되지 않습니다.',
      goal: '제작진이 질문을 받아 불쾌하거나 지나치게 사적인 질문을 걸러낸 뒤 익명으로 전달',
      next: '20:00–20:20 SECRET TALK'
    },
    {
      code: 'TALK CHANGE', title: 'NEW PERSON, NEW STORY', time: '20:20',
      body: '아직 이야기를 많이 나누지 못한 사람이 있다면\n이번에는 그 사람과 대화를 나눠보세요.\n\n꼭 1:1일 필요는 없습니다.\n2:2도 좋고, 세 사람이 함께 이야기해도 좋습니다.',
      qLabel: 'TALK CARD', list: ['최근 가장 해보고 싶은 것 한 가지', '갑자기 일주일 휴가가 생긴다면?', '최근 가장 기억에 남는 하루는?'],
      goal: '강제 1:1 매칭을 하지 않음 · 친구 만들기 중심의 취지 유지',
      next: '20:20–20:40 FREE MOVE TALK'
    },
    {
      code: 'LAST EXCHANGE', title: 'RETURN THE ITEM', time: '20:40',
      body: '오늘 처음 만났을 때\n받았던 물건을 기억하시나요?\n\n그 물건의 주인을 찾아 직접 돌려주세요.\n그리고 물건을 건네면서\n오늘 궁금했던 것 하나를 물어보세요.',
      qLabel: 'LAST SCENE', q: '처음 시작했던 물건으로 오늘의 마지막 미션을 마무리합니다.',
      goal: '18:30 ITEM EXCHANGE의 소지품을 회수 → 프로그램의 시작과 끝을 연결',
      next: '20:40–21:00 FINAL FREE TALK'
    },
    {
      code: "TODAY'S MOOD", title: 'ENDING', time: '21:00', theme: 'ending',
      body: '오늘 처음 만난 사람들과\n조금은 익숙해졌나요?\n\n누군가와 친해졌을 수도 있고,\n새로운 친구를 만났을 수도 있고,\n그냥 즐거운 하루였을 수도 있습니다.\n\n어떤 형태든 괜찮습니다.\n오늘의 무드가 좋은 기억으로 남았으면 합니다.',
      qLabel: 'FIN', q: '오늘의 프로그램은 여기까지입니다. 이후 시간은 자유롭게 보내주세요.',
      goal: '공식 프로그램 종료 선언 · 이후 인스타/연락처 교환, 2차는 참가자 자유',
      next: '21:00 이후 자유'
    }
  ];

  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function cardHTML(c) {
    const q = c.list
      ? `<div class="mc-q"><b>${c.qLabel}</b>${c.list.map(x => '· ' + esc(x)).join('<br>')}</div>`
      : `<div class="mc-q"><b>${c.qLabel}</b>${esc(c.q)}</div>`;
    return `<div class="mcard ${c.theme || ''}">
      <div class="mc-head"><b>TODAY'S <em>MOOD</em></b><span>VIDEO × DMD</span></div>
      <div class="mc-code${c.code.length > 8 ? ' long' : ''}">${esc(c.code)}</div>
      <div class="mc-title">${esc(c.title)}</div>
      <div class="mc-body">${esc(c.body)}</div>
      ${q}
      <div class="mc-foot"><i>${c.time}</i><span>EP.01</span></div>
    </div>`;
  }

  /* ---------------- missions UI ---------------- */
  const tabs = $('#mTabs'), rail = $('#rail'), detail = $('#mDetail'), chat = $('#chat'), push = $('#push');
  let current = -1, pushTimer;

  CARDS.forEach((c, i) => {
    const t = document.createElement('button');
    t.type = 'button'; t.className = 'm-tab'; t.setAttribute('role', 'tab');
    t.innerHTML = `${c.code === "TODAY'S MOOD" ? 'ENDING' : esc(c.code)}<small>${c.time}</small>`;
    t.addEventListener('click', () => selectCard(i));
    tabs.appendChild(t);

    const r = document.createElement('button');
    r.type = 'button'; r.className = 'rail-item';
    r.setAttribute('aria-label', `${c.code} 카드 미리보기 (${c.time})`);
    r.innerHTML = cardHTML(c);
    r.addEventListener('click', () => { selectCard(i); $('#missions').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); });
    rail.appendChild(r);
  });

  function selectCard(i, silent) {
    if (i === current) return;
    current = i;
    const c = CARDS[i];
    $$('.m-tab', tabs).forEach((t, k) => t.setAttribute('aria-selected', k === i));
    $$('.rail-item', rail).forEach((t, k) => t.classList.toggle('selected', k === i));
    const activeTab = tabs.children[i];
    tabs.scrollTo({ left: activeTab.offsetLeft - 16, behavior: 'smooth' });

    const q = c.list
      ? `<ul>${c.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
      : `<p>${esc(c.q)}</p>`;
    detail.classList.remove('swap'); void detail.offsetWidth; detail.classList.add('swap');
    detail.innerHTML = `
      <div class="md-meta"><span class="md-time">${c.time}</span><span>KAKAO MISSION ${String(i + 1).padStart(2, '0')} / 07</span></div>
      <h3 class="md-code">${esc(c.code)}</h3>
      <p class="md-title">${esc(c.title)}</p>
      <p class="md-copy">${esc(c.body)}</p>
      <div class="md-q"><b>${c.qLabel}</b>${q}</div>
      <div class="md-ops"><div><b>PURPOSE</b>${esc(c.goal)}</div><div><b>NEXT</b>${esc(c.next)}</div></div>`;

    // phone
    $('#phoneTime').textContent = c.time;
    const short = c.code === "TODAY'S MOOD" ? 'ENDING' : c.code;
    $('#pushText').textContent = `[${short}] 새로운 카드가 도착했습니다.`;
    chat.innerHTML = `
      <div class="msg">
        <span class="msg-ava">TM</span>
        <div class="msg-body">
          <div class="msg-name">TODAY'S MOOD 제작진</div>
          <div class="msg-row"><span class="msg-text">${i === 6 ? '오늘의 마지막 카드입니다 🎬' : `${esc(short)} 카드가 도착했습니다 🎬`}</span><span class="msg-time">${c.time}</span></div>
        </div>
      </div>
      <div class="msg" style="animation-delay:.25s">
        <span class="msg-ava" style="visibility:hidden">TM</span>
        <div class="msg-body"><div class="msg-row"><div class="msg-card">${cardHTML(c)}</div><span class="msg-time">${c.time}</span></div></div>
      </div>`;
    if (!silent) {
      clearTimeout(pushTimer);
      push.classList.remove('show'); void push.offsetWidth; push.classList.add('show');
      pushTimer = setTimeout(() => push.classList.remove('show'), 2200);
    }
  }
  selectCard(0, true);

  // play the first notification when the missions section is first seen
  const missionIO = new IntersectionObserver(es => {
    if (es[0].isIntersecting) {
      push.classList.add('show');
      pushTimer = setTimeout(() => push.classList.remove('show'), 2400);
      missionIO.disconnect();
    }
  }, { threshold: .45 });
  missionIO.observe($('.m-stage'));

  // rail arrows
  const step = () => (rail.firstElementChild?.offsetWidth || 300) + 18;
  $('#railPrev').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('#railNext').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));

  // card hover tilt (fine pointers only)
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced) {
    $$('.rail-item').forEach(el => {
      const card = $('.mcard', el);
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.setProperty('--ry', `${x * 10}deg`);
        card.style.setProperty('--rx', `${-y * 10}deg`);
      });
      el.addEventListener('pointerleave', () => { card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg'); });
    });
  }

  // timeline kakao rows → open their card
  $$('.tl[data-card]').forEach(row => {
    row.addEventListener('click', () => {
      selectCard(+row.dataset.card);
      $('#missions').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- reveal on scroll ---------------- */
  const revealIO = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.reveal').forEach(el => revealIO.observe(el));

  /* ---------------- scroll-driven: hero / nav / timeline ---------------- */
  const hero = $('#hero'), poster = $('#heroPoster'), intro = $('#heroIntro');
  const nav = $('#nav'), pageBar = $('#pageProgress');
  const timeline = $('#timeline'), rows = $$('.tl', timeline);
  const clockTime = $('#clockTime'), clockTitle = $('#clockTitle'), clockPart = $('#clockPart'), clockBar = $('#clockBar');
  const navLinks = $$('.nav-links a');
  const sections = navLinks.map(a => $(a.getAttribute('href')));
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const START = toMin('18:10'), END = toMin('21:00');
  let activeRow = null, ticking = false;

  function heroUpdate(vw, vh) {
    if (vw <= 900) { hero.style.removeProperty('--p'); return; }
    const total = hero.offsetHeight - vh;
    const p = clamp(window.scrollY / total);
    const pp = reduced ? (p > .3 ? 1 : 0) : ease(clamp(p / .7));
    const p2 = clamp((p - .3) / .4);

    const baseW = poster.offsetWidth, baseH = poster.offsetHeight;
    const targetS = Math.min(.92, (vw * .4) / baseW, (vh * .78) / baseH);
    const s = 1 + (targetS - 1) * pp;
    const tx = -(vw * .23) * pp;

    hero.style.setProperty('--p', pp.toFixed(4));
    poster.style.setProperty('--s', s.toFixed(4));
    poster.style.setProperty('--tx', tx.toFixed(1) + 'px');
    intro.style.setProperty('--p2', p2.toFixed(4));
    intro.style.setProperty('--ix', (vw * .03).toFixed(1) + 'px');
    hero.classList.toggle('intro-on', p2 > .5);
  }

  function timelineUpdate(vh) {
    const r = timeline.getBoundingClientRect();
    const mark = vh * .5;
    timeline.style.setProperty('--fill', clamp((mark - r.top) / r.height).toFixed(4));

    let found = rows[0];
    for (const row of rows) { if (row.getBoundingClientRect().top < mark) found = row; }
    if (found !== activeRow) {
      activeRow = found;
      let past = true;
      rows.forEach(row => {
        if (row === found) { past = false; row.classList.add('active'); row.classList.remove('past'); }
        else { row.classList.remove('active'); row.classList.toggle('past', past); }
      });
      clockTime.textContent = found.dataset.time;
      clockTitle.textContent = found.dataset.title;
      clockPart.textContent = found.dataset.part;
      clockBar.style.transform = `scaleX(${clamp((toMin(found.dataset.time) - START) / (END - START)).toFixed(3)})`;
      clockTime.classList.remove('flip'); void clockTime.offsetWidth; clockTime.classList.add('flip');
    }
  }

  function onScroll() {
    ticking = false;
    const vw = window.innerWidth, vh = window.innerHeight, y = window.scrollY;
    heroUpdate(vw, vh);
    nav.classList.toggle('scrolled', y > 40);
    pageBar.style.transform = `scaleX(${clamp(y / (document.documentElement.scrollHeight - vh)).toFixed(4)})`;
    timelineUpdate(vh);

    let cur = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * .4) cur = i; });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === cur));
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  onScroll();

  /* ---------------- cursor glow ---------------- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced) {
    const glow = $('.cursor-glow');
    let gx = 0, gy = 0, tx = 0, ty = 0, raf;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('has-cursor');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
    function loop() {
      gx += (tx - gx) * .12; gy += (ty - gy) * .12;
      glow.style.transform = `translate(${gx}px,${gy}px)`;
      raf = Math.abs(tx - gx) + Math.abs(ty - gy) > .5 ? requestAnimationFrame(loop) : null;
    }
  }
})();

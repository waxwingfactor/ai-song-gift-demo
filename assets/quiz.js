(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const ICON = {
    cake: '<path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M5 16c2 1.5 4.5 1.5 7 0s5-1.5 7 0M12 12V8M12 5.5c.8-.6.8-1.5 0-2.5-.8 1-.8 1.9 0 2.5z"/>',
    rings: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M9 9l-1.5-3h3L9 9zM15 9l-1.5-3h3L15 9z"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    flower: '<circle cx="12" cy="9" r="2.2"/><path d="M12 6.8C12 4 15 3 15.8 5.5 18.5 5 19 8 16.6 9c2.4 1 1.9 4-.8 3.5C15 15 12 14 12 11.2 12 14 9 15 8.2 12.5 5.5 13 5 10 7.4 9 5 8 5.5 5 8.2 5.5 9 3 12 4 12 6.8zM12 14v7M12 18c-2-2-4-2-5-1M12 19c2-2 4-2 5-1"/>',
    tie: '<path d="M10 3h4l-1 3 2.5 11L12 21l-3.5-4L11 6l-1-3z"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5L2 9zM6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12M12 9c-1.5-4-6-4-6-1.5S9 9 12 9zm0 0c1.5-4 6-4 6-1.5S15 9 12 9z"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/>',
    baby: '<circle cx="12" cy="8" r="4"/><path d="M6 21c0-3.5 2.7-6 6-6s6 2.5 6 6M10.5 8h.01M13.5 8h.01"/>'
  };
  const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;

  const OCCASIONS = [['Birthday', 'cake'], ['Anniversary', 'rings'], ['Wedding', 'rings'], ["Valentine's Day", 'heart'], ["Mother's Day", 'flower'],
    ["Father's Day", 'tie'], ['Graduation', 'cap'], ['Retirement', 'sun'], ['New baby', 'baby'], ['Thank you', 'gift'], ['Just because', 'star']];
  const RELATIONS = ['Partner', 'Wife', 'Husband', 'Mom', 'Dad', 'Friend', 'Daughter', 'Son', 'Grandma', 'Grandpa', 'Sister', 'Brother', 'Coworker', 'Other'];
  const GENRES = ['Acoustic pop', 'Country', 'R&B / Soul', 'Piano ballad', 'Folk', 'Rock', 'Upbeat pop', 'Hip-hop', 'Jazz', 'Lullaby', 'Surprise me'];
  const MOODS = ['Heartfelt', 'Joyful', 'Funny', 'Nostalgic', 'Romantic', 'Anthemic'];
  const VOICES = ['Female voice', 'Male voice', 'Surprise me'];

  // Each step: title, sub, fields. Field types: text, email, textarea, chips, tiles, check.
  const STEPS = [
    { title: 'Who is this song for?', sub: 'Their name will be sung, so spell it the way they like it.', fields: [
      { id: 'recipient', type: 'text', label: 'Their name', max: 40, req: true, ph: 'e.g. Maya' },
      { id: 'pronounce', type: 'text', label: 'How do you say it?', hint: '(optional, helps the singer)', max: 60, ph: 'e.g. MY-uh' },
      { id: 'relationship', type: 'chips', label: 'They are my…', options: RELATIONS, req: true }] },
    { title: "What's the occasion?", sub: 'This sets the feeling of the whole song.', fields: [
      { id: 'occasion', type: 'tiles', options: OCCASIONS, req: true }] },
    { title: 'Pick the sound', sub: 'Not sure? "Surprise me" lets us match it to your story.', fields: [
      { id: 'genre', type: 'chips', label: 'Style', options: GENRES, req: true },
      { id: 'mood', type: 'chips', label: 'Mood', options: MOODS, req: true },
      { id: 'voice', type: 'chips', label: 'Singer', options: VOICES, req: true }] },
    { title: 'Tell us about them', sub: 'Specific beats general. Real names, places and moments make the best songs.', fields: [
      { id: 'about', type: 'textarea', label: 'What makes them who they are?', max: 600, req: true, min: 25,
        ph: 'She sings in the car with the windows down, collects postcards, and is the first person everyone calls.' },
      { id: 'memory', type: 'textarea', label: 'A memory you share', max: 600,
        ph: 'Getting lost on the way to Big Sur and finding the best taco truck of our lives.' },
      { id: 'details', type: 'textarea', label: 'Little details only you would know', hint: '(nicknames, inside jokes, places)', max: 400,
        ph: 'Calls me "Captain". Our dog is Biscuit. We met at Lakeside Coffee.' }] },
    { title: 'What should the song say?', sub: 'The one thing you want them to hear.', fields: [
      { id: 'message', type: 'textarea', label: 'Your message', max: 400, req: true, min: 10,
        ph: 'Thank you for ten years of adventures. I would choose you again every time.' },
      { id: 'avoid', type: 'text', label: 'Anything to leave out?', hint: '(optional)', max: 200, ph: 'e.g. no mention of age' }] },
    { title: 'Last step', sub: "We'll email the finished song here.", fields: [
      { id: 'buyerName', type: 'text', label: 'Your first name', max: 40, req: true, ph: 'e.g. Sam', auto: 'given-name' },
      { id: 'email', type: 'email', label: 'Email', max: 120, req: true, ph: 'you@example.com', auto: 'email' },
      { id: 'consent', type: 'check', req: true,
        label: 'I understand the lyrics and music are created with AI, and I have permission to use the names and stories I shared.' }] }
  ];

  const state = { step: 0, answers: JSON.parse(sessionStorage.getItem('rr_answers') || '{}'), song: null };
  const form = $('#form'), err = $('#err');

  function show(id) {
    ['landing', 'quiz', 'writing', 'review'].forEach(s => $('#' + s).classList.toggle('hidden', s !== id));
    $('#foot').classList.toggle('hidden', id !== 'landing');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function render() {
    form.innerHTML = '';
    STEPS.forEach((st, i) => {
      const el = document.createElement('div');
      el.className = 'step' + (i === state.step ? ' on' : '');
      el.innerHTML = `<h2>${st.title}</h2><p class="sub">${st.sub}</p>` + st.fields.map(fieldHtml).join('');
      form.appendChild(el);
    });
    form.insertAdjacentHTML('beforeend', `<div class="actions"><div class="wrap">
      <button type="button" class="btn ghost" id="back">Back</button>
      <button type="submit" class="btn coral" id="next"></button></div></div>`);
    bind();
    paint();
  }

  function fieldHtml(f) {
    const v = state.answers[f.id] ?? '';
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const label = f.label ? `<label for="f_${f.id}">${f.label} ${f.hint ? `<span class="hint">${f.hint}</span>` : ''}</label>` : '';
    if (f.type === 'text' || f.type === 'email')
      return `<div class="field">${label}<input class="input" id="f_${f.id}" name="${f.id}" type="${f.type}" maxlength="${f.max}"
        placeholder="${esc(f.ph || '')}" value="${esc(v)}" ${f.auto ? `autocomplete="${f.auto}"` : ''}></div>`;
    if (f.type === 'textarea')
      return `<div class="field">${label}<textarea class="textarea" id="f_${f.id}" name="${f.id}" maxlength="${f.max}"
        placeholder="${esc(f.ph || '')}">${esc(v)}</textarea><div class="count" data-for="${f.id}"></div></div>`;
    if (f.type === 'chips')
      return `<div class="field"><span class="q">${f.label}</span><div class="chips" data-id="${f.id}">` +
        f.options.map(o => `<button type="button" class="chip${v === o ? ' on' : ''}" data-v="${esc(o)}">${o}</button>`).join('') + '</div></div>';
    if (f.type === 'tiles')
      return `<div class="field"><div class="tiles" data-id="${f.id}">` +
        f.options.map(([o, ic]) => `<button type="button" class="tile${v === o ? ' on' : ''}" data-v="${esc(o)}">${svg(ic)}<b>${o}</b></button>`).join('') + '</div></div>';
    if (f.type === 'check')
      return `<div class="field"><label class="check"><input type="checkbox" id="f_${f.id}" ${v ? 'checked' : ''}><span>${f.label}</span></label></div>`;
    return '';
  }

  function bind() {
    form.querySelectorAll('.chips, .tiles').forEach(group => group.addEventListener('click', e => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      group.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('on', x === b));
      state.answers[group.dataset.id] = b.dataset.v; persist(); err.textContent = '';
      if (group.classList.contains('tiles')) setTimeout(next, 220);
    }));
    form.querySelectorAll('input, textarea').forEach(inp => inp.addEventListener('input', () => {
      state.answers[inp.id.slice(2)] = inp.type === 'checkbox' ? inp.checked : inp.value; persist(); counts(); err.textContent = '';
    }));
    form.addEventListener('submit', e => { e.preventDefault(); next(); });
    $('#back').addEventListener('click', () => { if (state.step === 0) return show('landing'); state.step--; paint(); });
    counts();
  }

  function counts() {
    form.querySelectorAll('.count').forEach(c => {
      const f = STEPS.flatMap(s => s.fields).find(x => x.id === c.dataset.for);
      c.textContent = `${(state.answers[f.id] || '').length} / ${f.max}`;
    });
  }

  function paint() {
    form.querySelectorAll('.step').forEach((el, i) => el.classList.toggle('on', i === state.step));
    $('#bar').style.width = Math.round(((state.step + 1) / (STEPS.length + 1)) * 100) + '%';
    $('#steplbl').textContent = `Step ${state.step + 1} of ${STEPS.length}`;
    $('#next').textContent = state.step === STEPS.length - 1 ? 'Write my lyrics' : 'Continue';
    $('#back').textContent = state.step === 0 ? 'Home' : 'Back';
    err.textContent = '';
    window.scrollTo(0, 0);
    const first = form.querySelector('.step.on input.input, .step.on textarea');
    if (first && !first.value && matchMedia('(min-width: 700px)').matches) first.focus();
  }

  function validate(i) {
    for (const f of STEPS[i].fields) {
      const v = state.answers[f.id];
      if (f.req && (v === undefined || v === '' || v === false)) {
        if (f.type === 'check') return 'Please tick the box to continue.';
        return f.type === 'chips' || f.type === 'tiles' ? `Please choose ${f.label ? f.label.toLowerCase().replace('they are my…', 'who they are to you') : 'an occasion'}.` : `Please fill in "${f.label}".`;
      }
      if (f.min && v && v.trim().length < f.min) return `Tell us a little more in "${f.label}" (a sentence or two).`;
      if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'That email address does not look right.';
    }
    return '';
  }

  function next() {
    const problem = validate(state.step);
    if (problem) { err.textContent = problem; return; }
    if (state.step < STEPS.length - 1) { state.step++; paint(); return; }
    writeLyrics();
  }

  function persist() { sessionStorage.setItem('rr_answers', JSON.stringify(state.answers)); }

  async function call(body) {
    const r = await fetch(RR.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(body) });
    let j = {}; try { j = await r.json(); } catch (e) { }
    if (!r.ok || !j.ok) throw new Error(j.message || 'Something went wrong. Please try again.');
    return j;
  }

  // ---------- writing animation
  let lineTimer;
  function writingLines(words) {
    const lines = ['Reading your story', 'Finding the heart of it', ...words.map(w => `Looking for a rhyme for “${w}”`), 'Shaping the chorus', 'Counting syllables', 'Polishing the last verse'];
    let i = 0; const p = $('#writingLine'); p.textContent = lines[0];
    clearInterval(lineTimer);
    lineTimer = setInterval(() => { i = (i + 1) % lines.length; p.style.opacity = 0; setTimeout(() => { p.textContent = lines[i]; p.style.opacity = 1; }, 250); }, 2200);
  }
  function storyWords() {
    const text = [state.answers.memory, state.answers.details, state.answers.about].join(' ');
    const caps = (text.match(/\b[A-Z][a-z]{3,}\b/g) || []).filter(w => !['The', 'She', 'They', 'Their', 'When', 'Thank', 'This', 'That', 'Then'].includes(w));
    return [...new Set(caps)].slice(0, 2);
  }

  async function writeLyrics() {
    show('writing'); $('#writingTitle').textContent = `Writing ${state.answers.recipient}'s song…`; writingLines(storyWords());
    try {
      const quiz = { ...state.answers }; delete quiz.consent;
      const j = await call({ action: 'draft', quiz });
      state.song = j; sessionStorage.setItem('rr_song', JSON.stringify(j));
      clearInterval(lineTimer); renderReview();
    } catch (e) {
      clearInterval(lineTimer); show('quiz'); err.textContent = e.message;
    }
  }

  // ---------- review & edit
  function parseLyrics(text) {
    const out = []; let cur = null;
    for (const raw of text.split('\n')) {
      const line = raw.trimEnd(); const m = line.match(/^\s*\[(.+?)\]\s*$/);
      if (m) { cur = { tag: m[1], lines: [] }; out.push(cur); continue; }
      if (!cur) { cur = { tag: 'Verse', lines: [] }; out.push(cur); }
      cur.lines.push(line);
    }
    out.forEach(s => { while (s.lines.length && !s.lines[0].trim()) s.lines.shift(); while (s.lines.length && !s.lines[s.lines.length - 1].trim()) s.lines.pop(); });
    return out.filter(s => s.lines.length);
  }
  function lyricsFromEditor() {
    return [...document.querySelectorAll('#sections .section')].map(s => `[${s.dataset.tag}]\n${s.querySelector('textarea').value.trim()}`).join('\n\n');
  }
  function grow(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }

  function renderReview() {
    const s = state.song;
    $('#songTitle').value = s.title;
    const a = state.answers;
    $('#soundText').textContent = s.sound || [a.genre, a.mood, a.voice].join(' · ');
    const box = $('#sections'); box.innerHTML = '';
    parseLyrics(s.lyrics).forEach(sec => {
      const d = document.createElement('div'); d.className = 'section'; d.dataset.tag = sec.tag;
      d.innerHTML = `<span class="tag">${sec.tag.replace(/[<>&]/g, '')}</span><textarea rows="1" spellcheck="true"></textarea>`;
      const t = d.querySelector('textarea'); t.value = sec.lines.join('\n');
      t.addEventListener('input', () => { grow(t); editedNote(); });
      box.appendChild(d); requestAnimationFrame(() => grow(t));
    });
    s.original = lyricsFromEditor();
    $('#rewritesLeft').textContent = s.drafts_left > 0 ? `${s.drafts_left} left` : 'none left';
    $('#rewriteBtn').disabled = !(s.drafts_left > 0);
    $('#reviewErr').textContent = ''; editedNote();
    show('review');
  }
  function editedNote() {
    $('#editedNote').textContent = state.song && lyricsFromEditor() !== state.song.original ? '✓ Your edits will be sung exactly as written' : '';
  }

  $('#rewriteBtn').addEventListener('click', async () => {
    const note = $('#rewriteNote').value.trim();
    if (note.length < 5) { $('#reviewErr').textContent = 'Tell us what to change first.'; return; }
    show('writing'); $('#writingTitle').textContent = 'Taking another pass…'; writingLines(storyWords());
    try {
      const j = await call({ action: 'rewrite', token: state.song.token, note, current: lyricsFromEditor() });
      state.song = { ...state.song, ...j }; sessionStorage.setItem('rr_song', JSON.stringify(state.song));
      $('#rewriteNote').value = ''; $('#rewriteBox').open = false;
      clearInterval(lineTimer); renderReview();
    } catch (e) { clearInterval(lineTimer); renderReview(); $('#reviewErr').textContent = e.message; }
  });

  $('#reviewBack').addEventListener('click', () => { state.step = STEPS.length - 2; show('quiz'); paint(); });

  $('#checkoutBtn').addEventListener('click', async () => {
    const btn = $('#checkoutBtn'), title = $('#songTitle').value.trim(), lyrics = lyricsFromEditor();
    if (!title) { $('#reviewErr').textContent = 'Give the song a title.'; return; }
    if (lyrics.replace(/\[.*?\]/g, '').trim().length < 80) { $('#reviewErr').textContent = 'The lyrics look too short to sing.'; return; }
    btn.disabled = true; btn.textContent = 'Opening secure checkout…';
    try {
      const j = await call({ action: 'checkout', token: state.song.token, title, lyrics, email: state.answers.email, buyerName: state.answers.buyerName });
      localStorage.setItem('rr_last', JSON.stringify({ token: state.song.token, recipient: state.answers.recipient, at: Date.now() }));
      location.href = j.url;
    } catch (e) { $('#reviewErr').textContent = e.message; btn.disabled = false; btn.textContent = 'Approve & checkout'; }
  });

  // ---------- landing
  $('#start').addEventListener('click', () => { state.step = 0; render(); show('quiz'); });
  try {
    const last = JSON.parse(localStorage.getItem('rr_last') || 'null');
    if (last && Date.now() - last.at < 7 * 864e5) {
      const b = $('#resume'); b.classList.remove('hidden');
      b.innerHTML = `<span>Your song for <b></b> is on its way.</span><a class="btn small" href="song.html#${last.token}">Track it</a>`;
      b.querySelector('b').textContent = last.recipient;
    }
  } catch (e) { }
  const saved = sessionStorage.getItem('rr_song');
  if (saved && location.hash === '#review') { state.song = JSON.parse(saved); render(); renderReview(); }
})();

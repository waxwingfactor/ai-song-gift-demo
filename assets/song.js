(() => {
  const $ = s => document.querySelector(s);
  const token = location.hash.slice(1).split('&')[0];
  const STEPS = [
    ['payment_confirmed', 'Payment confirmed'],
    ['sent_to_kie', 'Composing the music'],
    ['kie_text', 'Recording the vocals'],
    ['kie_first', 'First version finished'],
    ['stored', 'Mixing and saving both versions'],
  ];
  const show = id => ['loading', 'missing', 'progress', 'ready', 'failed'].forEach(s => $('#' + s).classList.toggle('hidden', s !== id));
  const txt = (el, v) => { el.textContent = v == null ? '' : v; };
  let timer, listened = false;

  async function status() {
    const r = await fetch(RR.supabaseUrl + '/rest/v1/rpc/song_status', {
      method: 'POST', headers: { apikey: RR.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_token: token })
    });
    return r.ok ? r.json() : null;
  }

  function renderProgress(s) {
    show('progress');
    txt($('#pTitle'), s.paid ? `${s.recipient}'s song is being made` : 'Waiting for payment');
    txt($('#pSub'), s.paid ? `“${s.title}” · usually about 5 minutes` : 'Finish checkout and recording starts right away.');
    const done = new Set(s.stages);
    let nowSet = false;
    $('#steps').innerHTML = '';
    STEPS.forEach(([k, label]) => {
      const li = document.createElement('li');
      const isDone = done.has(k);
      const isNow = !isDone && !nowSet && s.paid;
      if (isNow) nowSet = true;
      li.className = isDone ? 'done' : isNow ? 'now' : '';
      li.innerHTML = `<span class="dot">${isDone ? '✓' : ''}</span><span></span>`;
      li.lastChild.textContent = label;
      $('#steps').appendChild(li);
    });
  }

  function lyricsHtml(text) {
    const box = $('#lyrics'); box.innerHTML = '';
    (text || '').split('\n').filter(l => l.trim()).forEach(line => {
      const m = line.match(/^\s*\[(.+?)\]\s*$/);
      if (m) { const t = document.createElement('span'); t.className = 'tag'; t.textContent = m[1]; box.appendChild(t); }
      else box.appendChild(document.createTextNode(line + '\n'));
    });
  }

  async function renderReady(s) {
    if (listened) return; listened = true;
    const r = await fetch(RR.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ action: 'listen', token }) });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) { listened = false; return; }
    show('ready');
    txt($('#rFor'), `A song for ${s.recipient}${s.buyer_name ? ', from ' + s.buyer_name : ''}`);
    txt($('#rTitle'), s.title);
    const box = $('#players'); box.innerHTML = '';
    j.tracks.forEach((t, i) => {
      const c = document.createElement('div'); c.className = 'card player';
      c.innerHTML = `<img alt=""><div><div class="v">Version ${'AB'[i] || i + 1}</div><h3></h3><audio controls preload="metadata"></audio>
        <a class="dl" download>Download MP3</a></div>`;
      if (t.image_url) c.querySelector('img').src = t.image_url; else c.querySelector('img').style.visibility = 'hidden';
      txt(c.querySelector('h3'), s.title);
      c.querySelector('audio').src = t.url;
      c.querySelector('a').href = t.download_url;
      box.appendChild(c);
    });
    lyricsHtml(s.lyrics);
  }

  async function tick() {
    if (!token) return show('missing');
    let s;
    try { s = await status(); } catch (e) { s = undefined; }
    if (s === null) return show('missing');
    if (s) {
      if (['ready', 'delivered'].includes(s.status)) { clearInterval(timer); return renderReady(s); }
      if (['failed', 'cancelled'].includes(s.status)) { clearInterval(timer); return show('failed'); }
      renderProgress(s);
    }
  }
  tick(); timer = setInterval(tick, 4000);
})();

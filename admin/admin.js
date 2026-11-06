(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = n => '$' + (Number(n) || 0).toFixed(Number(n) < 1 ? 3 : 2);
  const ago = t => { if (!t) return ''; const s = (Date.now() - new Date(t)) / 1000; return s < 60 ? Math.round(s) + 's ago' : s < 3600 ? Math.round(s / 60) + 'm ago' : s < 86400 ? Math.round(s / 3600) + 'h ago' : new Date(t).toLocaleDateString(); };
  const clock = t => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
  const STATUS = {
    draft: ['Writing lyrics', ''], awaiting_payment: ['At checkout', 'wait'], paid: ['Paid', 'run'], on_hold: ['On hold', 'bad'],
    submitting: ['Sending', 'run'], generating: ['Generating', 'run'], storing: ['Saving', 'run'], ready: ['Ready', 'ok'],
    delivered: ['Delivered', 'ok'], failed: ['Failed', 'bad'], cancelled: ['Cancelled', '']
  };
  const pill = s => `<span class="pill ${(STATUS[s] || ['', ''])[1]}">${(STATUS[s] || [s])[0]}</span>`;
  const FILTERS = [['all', 'All'], ['paid', 'Paid'], ['active', 'In production'], ['problem', 'Problems'], ['open', 'Unpaid']];
  const groups = { paid: s => !!s.paid_at, active: s => ['paid', 'submitting', 'generating', 'storing'].includes(s.status),
    problem: s => ['failed', 'on_hold'].includes(s.status), open: s => ['draft', 'awaiting_payment'].includes(s.status), all: () => true };
  let key = sessionStorage.getItem('rr_admin') || '', data = null, filter = 'all', timer, openId = null;

  async function rpc(fn, body) {
    const r = await fetch(RR.supabaseUrl + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: RR.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  async function action(act, song) {
    const r = await fetch(RR.admin, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ key, action: act, song }) });
    const j = await r.json().catch(() => ({}));
    toast(j.message || (j.ok ? 'Done' : 'Not allowed'));
    setTimeout(load, 1200); if (openId) setTimeout(() => openSong(openId), 1500);
  }
  function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

  async function load() {
    try {
      const j = await rpc('admin_overview', { p_key: key });
      if (!j.ok) { sessionStorage.removeItem('rr_admin'); return showLogin('That key did not work.'); }
      data = j; render(); $('#live').classList.remove('off'); $('#updated').textContent = 'Updated ' + clock(new Date());
    } catch (e) { $('#live').classList.add('off'); $('#updated').textContent = 'Offline, retrying…'; }
  }

  function render() {
    const S = data.songs, day = s => new Date(s.created_at) > Date.now() - 864e5;
    const paid = S.filter(s => s.paid_at), delivered = S.filter(s => ['ready', 'delivered'].includes(s.status));
    const revenue = paid.reduce((a, s) => a + Number(s.amount || 0), 0);
    const cost = data.usage.reduce((a, u) => a + Number(u.cost_usd || 0), 0);
    const turn = delivered.filter(s => s.submitted_at && s.ready_at).map(s => (new Date(s.ready_at) - new Date(s.paid_at || s.submitted_at)) / 1000);
    const median = turn.length ? turn.sort((a, b) => a - b)[Math.floor(turn.length / 2)] : null;
    const conv = S.filter(s => s.status !== 'draft' || s.paid_at).length;
    $('#kpis').innerHTML = [
      ['Songs started', S.length, `${S.filter(day).length} in the last 24 h`],
      ['Paid orders', paid.length, `${money(revenue)} ${paid.some(s => s.test_order) ? '(test payments)' : ''}`],
      ['Delivered', delivered.length, median ? `median ${Math.round(median)} s from payment` : '—'],
      ['In production', S.filter(groups.active).length, `${data.counters.sent_last_24h} / ${data.counters.daily_cap} daily cap used`],
      ['Problems', S.filter(groups.problem).length, 'failed or on hold'],
      ['API spend', money(cost), paid.length ? `${money(cost / Math.max(paid.length, 1))} per paid song (all-in)` : 'last 30 days'],
    ].map(([l, v, s]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div><div class="s">${esc(s)}</div></div>`).join('');

    $('#filters').innerHTML = FILTERS.map(([k, l]) => `<button class="${k === filter ? 'on' : ''}" data-f="${k}">${l} <span class="muted">${S.filter(groups[k]).length}</span></button>`).join('');
    const rows = S.filter(groups[filter]);
    $('#rows').innerHTML = rows.length ? rows.map(s => `<tr class="row" data-id="${s.id}">
      <td><div class="t">${esc(s.title || '(writing…)')}</div><div class="ref">${esc(s.ref)}</div></td>
      <td>${esc(s.recipient)}<div class="muted">${esc(s.occasion)} · ${esc(s.genre)}</div></td>
      <td>${pill(s.status)}${s.last_error ? `<div class="muted" style="color:var(--red)">${esc(s.last_error)}</div>` : ''}${s.email_status === 'suppressed_demo' ? '<div class="muted">email held (demo)</div>' : ''}</td>
      <td>${s.shopify_order ? esc(s.shopify_order) + (s.test_order ? ' <span class="muted">test</span>' : '') : '<span class="muted">—</span>'}</td>
      <td class="muted">${ago(s.created_at)}</td><td class="num">${money(s.cost_usd)}</td></tr>`).join('')
      : '<tr><td colspan="6" class="muted">Nothing here.</td></tr>';

    const LABEL = { failed: 'Generation failed', kie_rejected: 'Kie.ai rejected the request', order_without_song: 'Paid order has no song reference',
      second_order_needs_refund: 'Second payment for the same song (refund)', payment_amount_mismatch: 'Paid amount does not match price',
      held_by_daily_cap: 'Held by the daily cap', attempts_exhausted: 'Stopped after 3 attempts', payment_in_wrong_state: 'Payment arrived in an unexpected state', email_failed: 'Email failed' };
    $('#alerts').innerHTML = data.alerts.length ? data.alerts.slice(0, 8).map(a => `<li><b>${esc(LABEL[a.kind] || a.kind)}</b>${esc(a.ref || (a.detail && a.detail.order) || '')} · ${ago(a.at)}
      ${a.detail && (a.detail.error || a.detail.order) ? `<div class="muted">${esc(a.detail.error || 'Order ' + a.detail.order)}</div>` : ''}</li>`).join('')
      : '<li class="none"><b>All clear</b>No failed or blocked orders.</li>';

    const u = data.usage;
    $('#usage').innerHTML = `<thead><tr><th>Service</th><th class="num">Calls</th><th class="num">Cost</th></tr></thead><tbody>` +
      u.map(x => `<tr><td>${esc({ llm: 'Lyrics AI', kie: 'Kie.ai music', storage: 'Storage', email: 'Email' }[x.provider] || x.provider)}<div class="muted">${esc(x.op)} · ${Number(x.units).toLocaleString()} ${esc(x.unit)}</div></td>
      <td class="num">${x.calls}</td><td class="num">${money(x.cost_usd)}</td></tr>`).join('') + `</tbody><tfoot><tr><td>Total</td><td></td><td class="num">${money(cost)}</td></tr></tfoot>`;

    const c = data.counters;
    $('#guards').innerHTML = [
      ['Duplicate deliveries blocked', c.duplicates_blocked], ['Paid orders without a song', c.orders_without_song],
      ['Songs sent to Kie.ai (24 h)', `${c.sent_last_24h} / ${c.daily_cap}`]
    ].map(([l, v]) => `<div><span>${l}</span><b>${v}</b></div>`).join('');
  }

  async function openSong(id) {
    openId = id;
    const j = await rpc('admin_song', { p_key: key, p_song: id });
    if (!j.ok) return;
    const s = j.song, q = s.quiz || {};
    const OK = new Set(['payment_confirmed', 'sent_to_kie', 'kie_text', 'kie_first', 'stored', 'email_sent', 'lyrics_approved', 'draft_written', 'rewrite_written']);
    const BAD = new Set(['failed', 'kie_rejected', 'email_failed', 'second_order_needs_refund', 'payment_amount_mismatch', 'held_by_daily_cap', 'attempts_exhausted']);
    const can = { retry: ['failed', 'on_hold'].includes(s.status) && s.shopify_order_id, resend: ['ready', 'delivered'].includes(s.status),
      cancel: ['draft', 'awaiting_payment', 'paid', 'on_hold', 'failed'].includes(s.status), check: s.kie_task_id && ['generating', 'storing'].includes(s.status) };
    const cost = j.usage.reduce((a, u) => a + Number(u.cost_usd), 0);
    $('#detail').innerHTML = `<div class="d-h"><span class="ref">${esc(s.ref)}</span> ${pill(s.status)}<h2>${esc(s.title || '(no title yet)')}</h2>
      <div class="muted">For ${esc(s.recipient)} (${esc(q.relationship)}) from ${esc(s.buyer_name)} · ${esc(s.occasion)} · ${esc(q.genre)}, ${esc(q.mood)}</div></div>
      <div class="d-actions">
        ${can.retry ? '<button class="btn small coral" data-a="retry">Retry generation</button>' : ''}
        ${can.check ? '<button class="btn small" data-a="check">Check Kie.ai now</button>' : ''}
        ${can.resend ? '<button class="btn small" data-a="resend">Resend email</button>' : ''}
        ${can.resend ? `<a class="btn small ghost" target="_blank" rel="noopener" href="../song.html#${esc(s.token)}">Open customer page</a>` : ''}
        ${can.cancel ? '<button class="btn small ghost" data-a="cancel">Cancel</button>' : ''}
      </div>
      ${s.last_error ? `<p class="err">${esc(s.last_error)}</p>` : ''}
      <dl class="kv">
        <dt>Customer</dt><dd>${esc(s.email)}</dd>
        <dt>Shopify order</dt><dd>${s.shopify_order ? esc(s.shopify_order) + ' · ' + money(s.amount) + ' ' + esc(s.currency) + (s.test_order ? ' (test)' : '') : '—'}</dd>
        <dt>Kie.ai task</dt><dd>${s.kie_task_id ? `<code>${esc(s.kie_task_id)}</code> · attempt ${s.submit_attempts}` : '—'}</dd>
        <dt>Lyrics</dt><dd>${s.drafts} AI draft${s.drafts === 1 ? '' : 's'}${s.edited ? ' · <b>edited by customer</b>' : ''}</dd>
        <dt>Email</dt><dd>${esc(s.email_status || '—')}</dd>
        <dt>Cost so far</dt><dd>${money(cost)} (${j.usage.map(u => `${esc(u.provider)} ${money(u.cost_usd)}`).join(', ') || 'none'})</dd>
      </dl>
      <div class="d-sec"><h4>Timeline</h4><ul class="timeline">${j.events.map(e => `<li class="${OK.has(e.kind) ? 'ok' : BAD.has(e.kind) ? 'bad' : ''}"><span class="when">${clock(e.at)}</span>${esc(e.kind.replace(/_/g, ' '))}
        ${e.detail ? `<code>${esc(JSON.stringify(e.detail)).slice(0, 160)}</code>` : ''}</li>`).join('')}</ul></div>
      <div class="d-sec"><h4>Musical direction sent to Kie.ai</h4><pre class="lyr">${esc(s.style || '—')}${s.negative_tags ? '\n\nAvoid: ' + esc(s.negative_tags) : ''}${s.vocal_gender ? '\nVoice: ' + (s.vocal_gender === 'm' ? 'male' : 'female') : ''}${s.sung_name && s.sung_name !== s.recipient ? '\nName sung as: ' + esc(s.sung_name) : ''}</pre></div>
      <div class="d-sec"><h4>${s.edited ? 'Approved lyrics (customer-edited)' : 'Lyrics'}</h4><pre class="lyr">${esc(s.lyrics || s.lyrics_ai || '—')}</pre></div>
      <div class="d-sec"><h4>Quiz answers</h4><div class="quiz-a">${['about', 'memory', 'details', 'message', 'avoid', 'pronounce'].filter(k => q[k]).map(k => `<div><b>${k}</b> ${esc(q[k])}</div>`).join('')}</div></div>`;
    $('#drawer').classList.remove('hidden');
    $('#detail').querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.a === 'cancel' && !confirm('Cancel this song?')) return;
      b.disabled = true; action(b.dataset.a, s.id);
    }));
  }

  function showLogin(msg) {
    clearInterval(timer); $('#app').classList.add('hidden'); $('#login').classList.remove('hidden'); $('#loginErr').textContent = msg || '';
  }
  function start() {
    $('#login').classList.add('hidden'); $('#app').classList.remove('hidden');
    load(); clearInterval(timer); timer = setInterval(() => { if (!document.hidden) { load(); if (openId && !$('#drawer').classList.contains('hidden')) openSong(openId); } }, 5000);
  }
  $('#loginForm').addEventListener('submit', e => { e.preventDefault(); key = $('#key').value.trim(); sessionStorage.setItem('rr_admin', key); start(); });
  $('#logout').addEventListener('click', () => { sessionStorage.removeItem('rr_admin'); key = ''; showLogin(); });
  $('#filters').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { filter = b.dataset.f; render(); } });
  $('#rows').addEventListener('click', e => { const r = e.target.closest('tr.row'); if (r) openSong(r.dataset.id); });
  document.addEventListener('click', e => { if (e.target.closest('[data-close]')) { $('#drawer').classList.add('hidden'); openId = null; } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { $('#drawer').classList.add('hidden'); openId = null; } });
  if (location.hash.length > 10) { key = decodeURIComponent(location.hash.slice(1)); sessionStorage.setItem('rr_admin', key); history.replaceState(null, '', location.pathname); }
  key ? start() : showLogin();
})();

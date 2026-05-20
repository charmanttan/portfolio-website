// Client-side password gate.
// Password is stored as SHA-256 hash (not plaintext), so it can't be read by
// casually viewing source. Note: still client-side — brute-force is possible
// against weak passwords. For true confidentiality, encrypt the content itself.
(function() {
  const PASSWORD_HASH = 'd4fa609079f538cf795cb65a1c6ebc3c0ae8930b68c3845e4a0868895ee73d71';
  const projectKey = location.pathname.split('/').pop().replace('.html','');
  const storageKey = `cs-unlocked-${projectKey}`;

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
  }

  if (sessionStorage.getItem(storageKey) === 'yes') return;

  // Hide page content immediately to prevent flash
  const hideStyle = document.createElement('style');
  hideStyle.id = 'cs-hide';
  hideStyle.textContent = 'body > *:not(.cs-gate) { visibility: hidden !important; } body { overflow: hidden !important; cursor: auto !important; }';
  document.head.appendChild(hideStyle);

  function mountGate() {
    const gate = document.createElement('div');
    gate.className = 'cs-gate';
    gate.innerHTML = `
      <style>
        .cs-gate {
          position: fixed; inset: 0; z-index: 100000;
          background: #f0e8d8;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          cursor: auto;
          animation: gateIn .6s cubic-bezier(.4,0,.2,1);
        }
        @keyframes gateIn { from { opacity: 0; } to { opacity: 1; } }
        .cs-gate-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 65% 30%, rgba(201,89,58,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 10% 80%, rgba(125,143,106,0.05) 0%, transparent 50%);
        }
        .cs-gate-card {
          position: relative;
          width: 100%; max-width: 440px;
          padding: 56px 48px;
          text-align: left;
        }
        .cs-gate-eyebrow {
          font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #c9593a; margin-bottom: 24px;
          display: flex; align-items: center; gap: 14px;
        }
        .cs-gate-eyebrow::before { content:''; display:block; width:28px; height:1px; background:#c9593a; }
        .cs-gate-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 44px; font-weight: 800; letter-spacing: -0.03em;
          line-height: 1; margin-bottom: 18px; color: #1e1a14;
        }
        .cs-gate-sub {
          font-size: 15px; line-height: 1.65; color: #8a7a68;
          margin-bottom: 40px; max-width: 340px;
        }
        .cs-gate-form { display: flex; flex-direction: column; gap: 14px; }
        .cs-gate-input {
          width: 100%;
          padding: 18px 20px;
          background: transparent;
          border: 1px solid rgba(30,26,20,0.18);
          border-radius: 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; color: #1e1a14;
          outline: none;
          transition: border-color .25s;
        }
        .cs-gate-input:focus { border-color: #1e1a14; }
        .cs-gate-input::placeholder { color: rgba(138,122,104,0.7); letter-spacing: 0.04em; }
        .cs-gate-input.error { border-color: #c9593a; animation: shake .4s; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .cs-gate-btn {
          padding: 18px 28px;
          background: #1e1a14; color: #f0e8d8;
          border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          transition: background .25s, transform .25s;
          display: inline-flex; align-items: center; justify-content: space-between;
          gap: 10px;
        }
        .cs-gate-btn:hover { background: #c9593a; transform: translateY(-2px); }
        .cs-gate-error {
          font-size: 13px; color: #c9593a;
          margin-top: 4px;
          min-height: 18px;
          opacity: 0; transition: opacity .25s;
        }
        .cs-gate-error.show { opacity: 1; }
        .cs-gate-back {
          position: absolute; top: 32px; left: 48px;
          font-size: 13px; letter-spacing: 0.07em; text-transform: uppercase;
          color: #8a7a68; text-decoration: none; transition: color .2s;
        }
        .cs-gate-back:hover { color: #1e1a14; }
        .cs-gate-footer {
          margin-top: 40px;
          font-size: 12px; color: #8a7a68;
          display: flex; align-items: center; gap: 8px;
        }
        .cs-gate-lock { width: 12px; height: 12px; opacity: 0.6; }
      </style>
      <div class="cs-gate-bg"></div>
      <a href="../index.html#work" class="cs-gate-back">← All Work</a>
      <div class="cs-gate-card">
        <div class="cs-gate-eyebrow">Protected Case Study</div>
        <h1 class="cs-gate-title">Under NDA.</h1>
        <p class="cs-gate-sub">This case study contains confidential work. Enter the password shared with you to view the full project.</p>
        <form class="cs-gate-form" id="cs-gate-form">
          <input
            class="cs-gate-input"
            id="cs-gate-input"
            type="password"
            placeholder="Enter password"
            autocomplete="off"
            autofocus
          />
          <div class="cs-gate-error" id="cs-gate-error">Incorrect password. Please try again.</div>
          <button class="cs-gate-btn" type="submit">
            <span>View Case Study</span>
            <span>→</span>
          </button>
        </form>
        <div class="cs-gate-footer">
          <svg class="cs-gate-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
          <span>Don't have the password? <a href="mailto:charmanttan@gmail.com?subject=General%20Inquiry" style="color:#1e1a14;text-decoration:underline;">Request access</a></span>
        </div>
      </div>
    `;
    document.body.appendChild(gate);

    const form = gate.querySelector('#cs-gate-form');
    const input = gate.querySelector('#cs-gate-input');
    const errorEl = gate.querySelector('#cs-gate-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hash = await sha256(input.value);
      if (hash === PASSWORD_HASH) {
        sessionStorage.setItem(storageKey, 'yes');
        gate.style.animation = 'gateIn .5s reverse forwards';
        setTimeout(() => {
          gate.remove();
          document.getElementById('cs-hide')?.remove();
        }, 500);
      } else {
        input.classList.add('error');
        errorEl.classList.add('show');
        input.select();
        setTimeout(() => input.classList.remove('error'), 400);
      }
    });

    input.addEventListener('input', () => {
      errorEl.classList.remove('show');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountGate);
  } else {
    mountGate();
  }
})();

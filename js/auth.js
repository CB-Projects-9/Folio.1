// Log-in gate, menu and log out. Runs first on every page (see SPEC.md, The log-in gate).
(function () {
  var isLogin = document.currentScript.getAttribute('data-page') === 'login';
  var cfg = window.FOLIO_CONFIG || {};
  var configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  var client = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  // Keep gated pages hidden until the check passes, so nothing flashes before a redirect.
  var hide = document.createElement('style');
  hide.textContent = 'body{visibility:hidden}';
  if (!isLogin) document.head.appendChild(hide);

  async function currentUser() {
    if (!client) return null;
    try {
      var result = await client.auth.getSession();
      return result.data.session ? result.data.session.user : null;
    } catch (e) {
      return null;
    }
  }

  var ready = currentUser().then(function (user) {
    if (isLogin) {
      if (user) location.replace('index.html');
      return user;
    }
    if (!user) {
      location.replace('login.html');
      return new Promise(function () {}); // never resolves; the page is leaving
    }
    hide.remove();
    return user;
  });

  async function logOut() {
    if (client) {
      try { await client.auth.signOut(); } catch (e) { /* go to log-in regardless */ }
    }
    // If the sign-out request failed, still forget the session on this device.
    Object.keys(localStorage).forEach(function (key) {
      if (/^sb-.*-auth-token$/.test(key)) localStorage.removeItem(key);
    });
    location.replace('login.html');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.menu-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        document.getElementById('menu').classList.toggle('open', !open);
      });
    }
    document.querySelectorAll('[data-logout]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        logOut();
      });
    });
  });

  window.Folio = { client: client, configured: configured, ready: ready };
})();

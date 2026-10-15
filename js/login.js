// Log in and sign up on one page, with a toggle between them (DESIGN.md, The log-in page).
(function () {
  var mode = 'login';
  var form = document.getElementById('login-form');
  var email = document.getElementById('email');
  var password = document.getElementById('password');
  var submit = document.getElementById('submit');
  var toggle = document.getElementById('toggle');
  var notice = document.getElementById('notice');

  function showError(field, message) {
    var el = document.getElementById(field.id + '-error');
    el.textContent = message || '';
    el.hidden = !message;
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function showNotice(message) {
    notice.textContent = message || '';
    notice.hidden = !message;
  }

  function setMode(next) {
    mode = next;
    submit.textContent = mode === 'login' ? 'Log in' : 'Sign up';
    toggle.textContent = mode === 'login' ? 'New here? Sign up' : 'Have an account? Log in';
    password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    showError(email);
    showError(password);
  }

  if (!Folio.configured) {
    showNotice('Log-in is not set up yet. The Supabase project URL and public anon key need adding to js/config.js.');
    submit.disabled = true;
  }

  toggle.addEventListener('click', function () {
    showNotice(Folio.configured ? '' : notice.textContent);
    setMode(mode === 'login' ? 'signup' : 'login');
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!Folio.configured) return;
    var ok = true;
    showError(email);
    showError(password);

    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) {
      showError(email, 'Please enter your email address.');
      ok = false;
    }
    if (!password.value) {
      showError(password, 'Please enter your password.');
      ok = false;
    } else if (mode === 'signup' && password.value.length < 6) {
      showError(password, 'Please use at least 6 characters.');
      ok = false;
    }
    if (!ok) return;

    submit.disabled = true;
    var auth = Folio.client.auth;
    var details = { email: email.value.trim(), password: password.value };
    try {
      var result = mode === 'login'
        ? await auth.signInWithPassword(details)
        : await auth.signUp(details);
      if (result.error) {
        var msg = result.error.message || '';
        showError(password, /invalid login/i.test(msg) ? 'That email and password do not match.' : msg);
      } else if (result.data.session) {
        location.replace('index.html');
        return;
      } else {
        setMode('login');
        showNotice('Check your email to confirm your account, then log in.');
      }
    } catch (err) {
      showError(password, 'Something went wrong. Please try again.');
    }
    submit.disabled = false;
  });
})();

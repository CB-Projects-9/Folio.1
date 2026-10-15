// Account page: show the signed-in email.
Folio.ready.then(function (user) {
  document.getElementById('account-email').textContent = user.email || '';
});

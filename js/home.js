// Welcome page: the visitor's most recent trips, or the example trips while they have none.
Folio.ready
  .then(FolioStore.open)
  .then(function () { return showTrips(3); })
  .then(function (total) {
    document.getElementById('recent-title').textContent = total ? 'Recent trips' : 'Example trips';
    document.getElementById('see-all').hidden = total === 0;
  });

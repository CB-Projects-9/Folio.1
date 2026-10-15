// Welcome page: the most recent trips.
Folio.ready
  .then(FolioStore.open)
  .then(function () { return showTrips(3); })
  .then(function (total) { document.getElementById('see-all').hidden = total === 0; });

// Welcome page: the visitor's most recent trips (once they have some), then the example trips, always.
Folio.ready
  .then(FolioStore.open)
  .then(function () { return showTrips(3, document.getElementById('example-list')); })
  .then(function (total) {
    document.getElementById('recent-section').hidden = total === 0;
  });

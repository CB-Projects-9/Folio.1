// Trips page: every trip as a tile.
Folio.ready
  .then(FolioStore.open)
  .then(function () { return showTrips(); });

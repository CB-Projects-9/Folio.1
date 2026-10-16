// Step 2: choose a video or a collage (SPEC.md, media.html).
(async function () {
  var trip = await loadStepTrip();
  if (!trip) {
    location.replace('upload.html');
    return;
  }
  if (!trip.photoIds.length) {
    location.replace('upload.html?id=' + encodeURIComponent(trip.id));
    return;
  }

  document.title = 'Folio · ' + trip.title;
  document.getElementById('trip-name').textContent = trip.title;
  document.getElementById('step-view').hidden = false;
  renderSteps('media', trip, 'upload.html?id=' + encodeURIComponent(trip.id));

  document.querySelectorAll('.choose-tile').forEach(function (tile) {
    tile.addEventListener('click', async function () {
      trip.media = tile.dataset.media;
      await FolioStore.saveTrip(trip);
      location.href = 'edit.html?id=' + encodeURIComponent(trip.id);
    });
  });
})();

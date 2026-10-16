// Step 5: export (SPEC.md, export.html). A placeholder for now.
(async function () {
  var trip = await loadStepTrip();
  if (!trip) {
    location.replace('upload.html');
    return;
  }
  document.title = 'Folio · Export ' + trip.title;
  document.getElementById('trip-name').textContent = trip.title;
  document.getElementById('step-view').hidden = false;
  renderSteps('export', trip, 'preview.html?id=' + encodeURIComponent(trip.id));
})();

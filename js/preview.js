// Step 4: preview (SPEC.md, preview.html). A placeholder for now.
(async function () {
  var trip = await loadStepTrip();
  if (!trip) {
    location.replace('upload.html');
    return;
  }
  document.title = 'Folio · Preview ' + trip.title;
  document.getElementById('trip-name').textContent = trip.title;
  document.getElementById('step-view').hidden = false;
  renderSteps('preview', trip, 'edit.html?id=' + encodeURIComponent(trip.id));
})();

// Shared by the step pages (SPEC.md, Making a trip: the step pages).

// Loads the trip named in the address (?id=...). Resolves to null when there is no id,
// and shows the page's "not found" message when the id does not match a trip.
window.loadStepTrip = async function () {
  var user = await Folio.ready;
  await FolioStore.open(user);
  var id = new URLSearchParams(location.search).get('id');
  if (!id) return null;
  var trip = await FolioStore.getTrip(id);
  if (!trip) {
    var missing = document.getElementById('not-found');
    if (missing) missing.hidden = false;
    throw new Error('trip not found');
  }
  return trip;
};

// Draws the Back link and the step links into #step-row (DESIGN.md, Step pages).
// current: 'upload' | 'media' | 'edit' | 'preview' | 'export'.
window.renderSteps = function (current, trip, backHref) {
  var row = document.getElementById('step-row');
  var id = trip ? encodeURIComponent(trip.id) : '';
  var hasPhotos = Boolean(trip && trip.photoIds.length);
  var hasMedia = hasPhotos && Boolean(trip.media);
  var steps = [
    ['upload', 'Upload', id ? 'upload.html?id=' + id : 'upload.html', true],
    ['media', 'Media type', 'media.html?id=' + id, hasPhotos],
    ['edit', 'Edits', 'edit.html?id=' + id, hasMedia],
    ['preview', 'Preview', 'preview.html?id=' + id, hasMedia]
  ];

  var back = document.createElement('a');
  back.className = 'step-back';
  back.href = backHref;
  back.textContent = 'Back';

  var list = document.createElement('ol');
  list.className = 'step-links';
  list.setAttribute('aria-label', 'Steps');
  steps.forEach(function (step) {
    var li = document.createElement('li');
    var item;
    if (step[0] === current) {
      item = document.createElement('span');
      item.className = 'step-current';
      item.setAttribute('aria-current', 'step');
    } else if (!step[3]) {
      item = document.createElement('span');
      item.className = 'step-off';
      item.setAttribute('aria-disabled', 'true');
    } else {
      item = document.createElement('a');
      item.href = step[2];
    }
    item.textContent = step[1];
    li.append(item);
    list.append(li);
  });

  row.replaceChildren(back, list);
};

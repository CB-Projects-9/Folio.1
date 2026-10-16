// Builds trip tiles (used on the home and Trips pages).
function makeTile(href, cover, title, photoCount, isExample) {
  var li = document.createElement('li');
  var a = document.createElement('a');
  a.className = 'trip-card';
  a.href = href;

  if (isExample) {
    var tag = document.createElement('span');
    tag.className = 'example-tag';
    tag.textContent = 'Example';
    a.append(tag);
  }

  var name = document.createElement('span');
  name.className = 'trip-title';
  name.textContent = title;

  a.append(cover, name);
  // photoCount is null when the count is left off (example tiles on the home page).
  if (photoCount !== null) {
    var count = document.createElement('span');
    count.className = 'trip-count';
    count.textContent = photoCount + (photoCount === 1 ? ' photo' : ' photos');
    a.append(count);
  }
  li.append(a);
  return li;
}

window.tripCard = function (trip, cover) {
  var pic;
  if (cover) {
    pic = document.createElement('img');
    pic.className = 'cover';
    pic.src = URL.createObjectURL(cover.blob);
    pic.alt = 'Cover photo for ' + trip.title;
  } else {
    pic = document.createElement('span');
    pic.className = 'ph';
    pic.textContent = 'No photos yet';
  }
  return makeTile('trip.html?id=' + encodeURIComponent(trip.id), pic, trip.title, trip.photoIds.length, false);
};

window.exampleCard = function (example, showCount) {
  var pic = document.createElement('img');
  if (example.collage) {
    pic.className = 'cover cover-fit';
    pic.src = example.collage;
    pic.alt = 'Cover for the ' + example.title + ' example: ' + example.collageAlt;
  } else {
    pic.className = 'cover';
    pic.src = exampleImage(example, example.cover || example.photos[0]);
    pic.alt = 'Cover photo for the ' + example.title + ' example';
  }
  return makeTile('example.html?trip=' + example.id, pic, example.title, showCount ? example.photos.length : null, true);
};

// Fills the list with the visitor's trips (up to limit, or all when limit is 0).
// Example trips: on the Trips page they stand in for an empty list; on the home page they
// always go in their own list (examplesList), below the visitor's trips.
// exampleCounts: show photo counts on the example tiles (the Trips page does, the home page does not).
// Returns the number of the visitor's own trips.
window.showTrips = async function (limit, exampleCounts, examplesList) {
  var trips = await FolioStore.listTrips();
  var list = document.getElementById('trip-list');
  var empty = document.getElementById('trip-empty');
  if (examplesList || !trips.length) {
    FOLIO_EXAMPLES.forEach(function (example) {
      (examplesList || list).append(exampleCard(example, exampleCounts));
    });
  }
  var shown = limit ? trips.slice(0, limit) : trips;
  for (var trip of shown) {
    var cover = trip.photoIds.length ? await FolioStore.getPhoto(trip.photoIds[0]) : null;
    list.append(tripCard(trip, cover));
  }
  if (empty) empty.hidden = trips.length > 0;
  return trips.length;
};

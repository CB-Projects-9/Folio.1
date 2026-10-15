// Builds one trip tile (used on the home and Trips pages).
window.tripCard = function (trip, cover) {
  var li = document.createElement('li');
  var a = document.createElement('a');
  a.className = 'trip-card';
  a.href = 'trip.html?id=' + encodeURIComponent(trip.id);

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

  var title = document.createElement('span');
  title.className = 'trip-title';
  title.textContent = trip.title;

  var count = document.createElement('span');
  count.className = 'trip-count';
  var n = trip.photoIds.length;
  count.textContent = n + (n === 1 ? ' photo' : ' photos');

  a.append(pic, title, count);
  li.append(a);
  return li;
};

// Fills a list with trip tiles, or shows the empty message. Returns the number of trips.
window.showTrips = async function (limit) {
  var trips = await FolioStore.listTrips();
  var list = document.getElementById('trip-list');
  var shown = limit ? trips.slice(0, limit) : trips;
  for (var trip of shown) {
    var cover = trip.photoIds.length ? await FolioStore.getPhoto(trip.photoIds[0]) : null;
    list.append(tripCard(trip, cover));
  }
  document.getElementById('trip-empty').hidden = trips.length > 0;
  return trips.length;
};

// Trips, photos and captions, kept only in this browser (IndexedDB).
// Each account gets its own database, so two people on one device do not see each other's trips.
(function () {
  var db = null;

  function req(r) {
    return new Promise(function (resolve, reject) {
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
    });
  }

  function store(name, mode) {
    return db.transaction(name, mode || 'readonly').objectStore(name);
  }

  function newId() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  var Store = {
    open: function (user) {
      var open = indexedDB.open('folio-' + user.id, 1);
      open.onupgradeneeded = function () {
        var d = open.result;
        d.createObjectStore('trips', { keyPath: 'id' });
        d.createObjectStore('photos', { keyPath: 'id' }).createIndex('tripId', 'tripId');
      };
      return req(open).then(function (d) { db = d; });
    },

    listTrips: function () {
      return req(store('trips').getAll()).then(function (trips) {
        return trips.sort(function (a, b) { return b.updated - a.updated; });
      });
    },

    getTrip: function (id) {
      return req(store('trips').get(id));
    },

    createTrip: function () {
      var now = Date.now();
      var trip = { id: newId(), title: 'Untitled trip', photoIds: [], created: now, updated: now };
      return req(store('trips', 'readwrite').put(trip)).then(function () { return trip; });
    },

    saveTrip: function (trip) {
      trip.updated = Date.now();
      return req(store('trips', 'readwrite').put(trip));
    },

    getPhoto: function (id) {
      return req(store('photos').get(id));
    },

    // Photos in the trip's saved order.
    photosFor: function (trip) {
      return Promise.all(trip.photoIds.map(Store.getPhoto)).then(function (list) {
        return list.filter(Boolean);
      });
    },

    // Rotation and size are set once here, so they never change on reload (DESIGN.md, Image treatment).
    addPhoto: function (trip, image) {
      var photo = {
        id: newId(),
        tripId: trip.id,
        blob: image.blob,
        width: image.width,
        height: image.height,
        caption: '',
        rot: Math.round((Math.random() * 6 - 3) * 10) / 10,
        size: Math.round((0.85 + Math.random() * 0.15) * 100) / 100
      };
      return req(store('photos', 'readwrite').put(photo)).then(function () {
        trip.photoIds.push(photo.id);
        return Store.saveTrip(trip);
      }).then(function () { return photo; });
    },

    savePhoto: function (photo) {
      return req(store('photos', 'readwrite').put(photo));
    },

    deletePhoto: function (trip, id) {
      return req(store('photos', 'readwrite').delete(id)).then(function () {
        trip.photoIds = trip.photoIds.filter(function (p) { return p !== id; });
        return Store.saveTrip(trip);
      });
    }
  };

  window.FolioStore = Store;
})();

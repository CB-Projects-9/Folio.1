// Step one of making a trip: name it and add photos (SPEC.md, trip.html).
(async function () {
  // Longest side kept in the browser. Provisional until the owner decides (SPEC.md, Open questions).
  var MAX_EDGE = 2000;
  var UNTITLED = 'Untitled trip';

  var user = await Folio.ready;
  await FolioStore.open(user);

  // A new trip is only saved once it has a photo or a title, so leaving straight away creates nothing.
  var id = new URLSearchParams(location.search).get('id');
  var trip = id ? await FolioStore.getTrip(id) : null;
  if (id && !trip) {
    document.getElementById('not-found').hidden = false;
    return;
  }

  var heading = document.getElementById('trip-heading');
  var titleInput = document.getElementById('trip-title');
  var count = document.getElementById('photo-count');
  var grid = document.getElementById('photo-grid');
  var fileInput = document.getElementById('file-input');
  var dropzone = document.getElementById('dropzone');
  var adding = document.getElementById('adding');
  var addError = document.getElementById('add-error');
  var continueBtn = document.getElementById('continue');
  var urls = [];

  document.getElementById('trip-view').hidden = false;
  if (trip) {
    heading.textContent = trip.title;
    document.title = 'Folio · ' + trip.title;
    if (trip.title !== UNTITLED) titleInput.value = trip.title;
  } else {
    document.title = 'Folio · New trip';
  }

  async function ensureTrip() {
    if (trip) return trip;
    trip = await FolioStore.createTrip();
    history.replaceState(null, '', 'trip.html?id=' + encodeURIComponent(trip.id));
    return trip;
  }

  titleInput.addEventListener('input', async function () {
    var title = titleInput.value.trim();
    if (!trip && !title) return;
    await ensureTrip();
    trip.title = title || UNTITLED;
    FolioStore.saveTrip(trip);
  });

  continueBtn.addEventListener('click', function () {
    if (trip && trip.photoIds.length) location.href = 'export.html?id=' + encodeURIComponent(trip.id);
  });

  async function render(focusIndex) {
    urls.forEach(URL.revokeObjectURL);
    urls = [];
    var photos = trip ? await FolioStore.photosFor(trip) : [];
    var n = photos.length;
    count.textContent = n + (n === 1 ? ' photo' : ' photos');
    continueBtn.disabled = n === 0;
    grid.replaceChildren();

    photos.forEach(function (photo, i) {
      var li = document.createElement('li');
      li.className = 'photo-tile';
      li.dataset.id = photo.id;

      var fig = document.createElement('figure');
      fig.className = 'print';
      var img = document.createElement('img');
      var url = URL.createObjectURL(photo.blob);
      urls.push(url);
      img.src = url;
      img.alt = photo.caption || 'Photo ' + (i + 1) + ' of ' + n;
      fig.append(img);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'text-btn';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove photo ' + (i + 1));

      li.append(fig, remove);
      grid.append(li);
    });

    // After a removal, keep keyboard focus on the next Remove button (or the drop zone button).
    if (focusIndex !== undefined) {
      var buttons = grid.querySelectorAll('.text-btn');
      (buttons[Math.min(focusIndex, buttons.length - 1)] || document.getElementById('choose')).focus();
    }
  }

  grid.addEventListener('click', async function (e) {
    var b = e.target.closest('.text-btn');
    if (!b) return;
    var pid = b.closest('.photo-tile').dataset.id;
    var i = trip.photoIds.indexOf(pid);
    await FolioStore.deletePhoto(trip, pid);
    render(i);
  });

  // Resize in the browser before saving, to keep storage manageable.
  function resize(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.round(img.naturalWidth * scale);
        var h = Math.round(img.naturalHeight * scale);
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          if (blob) resolve({ blob: blob, width: w, height: h });
          else reject(new Error('resize failed'));
        }, 'image/jpeg', 0.85);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('unreadable'));
      };
      img.src = url;
    });
  }

  async function addFiles(files) {
    var failed = [];
    files = Array.from(files);
    if (!files.length) return;
    addError.hidden = true;
    for (var k = 0; k < files.length; k++) {
      adding.textContent = 'Adding photo ' + (k + 1) + ' of ' + files.length + '…';
      try {
        if (!files[k].type.startsWith('image/')) throw new Error('not an image');
        var image = await resize(files[k]);
        await FolioStore.addPhoto(await ensureTrip(), image);
      } catch (err) {
        failed.push(files[k].name);
      }
    }
    adding.textContent = '';
    if (failed.length) {
      addError.textContent = 'These could not be added: ' + failed.join(', ') + '. Please use JPEG or PNG photos.';
      addError.hidden = false;
    }
    render();
  }

  document.getElementById('choose').addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    addFiles(fileInput.files);
    fileInput.value = '';
  });

  dropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropzone.classList.add('over');
  });
  dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('over'); });
  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('over');
    addFiles(e.dataTransfer.files);
  });

  render();
})();

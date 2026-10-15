// One trip: add, caption, reorder and remove photos (SPEC.md, trip.html).
(async function () {
  // Longest side kept in the browser. Provisional until the owner decides (SPEC.md, Open questions).
  var MAX_EDGE = 2000;

  var user = await Folio.ready;
  await FolioStore.open(user);

  var id = new URLSearchParams(location.search).get('id');
  var trip;
  if (id) {
    trip = await FolioStore.getTrip(id);
  } else {
    trip = await FolioStore.createTrip();
    history.replaceState(null, '', 'trip.html?id=' + encodeURIComponent(trip.id));
  }
  if (!trip) {
    document.getElementById('not-found').hidden = false;
    return;
  }

  var titleInput = document.getElementById('trip-title');
  var count = document.getElementById('photo-count');
  var list = document.getElementById('scrapbook');
  var fileInput = document.getElementById('file-input');
  var dropzone = document.getElementById('dropzone');
  var adding = document.getElementById('adding');
  var addError = document.getElementById('add-error');
  var urls = [];

  document.getElementById('trip-view').hidden = false;
  document.getElementById('export-link').href = 'export.html?id=' + encodeURIComponent(trip.id);
  titleInput.value = trip.title;
  document.title = 'Folio · ' + trip.title;

  titleInput.addEventListener('change', function () {
    trip.title = titleInput.value.trim() || 'Untitled trip';
    titleInput.value = trip.title;
    document.title = 'Folio · ' + trip.title;
    FolioStore.saveTrip(trip);
  });

  function button(label, act, disabled) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'text-btn';
    b.textContent = label;
    b.dataset.act = act;
    b.disabled = Boolean(disabled);
    return b;
  }

  async function render(focus) {
    urls.forEach(URL.revokeObjectURL);
    urls = [];
    var photos = await FolioStore.photosFor(trip);
    var n = photos.length;
    count.textContent = n + (n === 1 ? ' photo' : ' photos');
    list.replaceChildren();

    photos.forEach(function (photo, i) {
      var li = document.createElement('li');
      li.className = 'scrap';
      li.dataset.id = photo.id;
      li.style.setProperty('--rot', photo.rot + 'deg');
      li.style.width = Math.round(photo.size * 100) + '%';

      var fig = document.createElement('figure');
      fig.className = 'print';
      var img = document.createElement('img');
      var url = URL.createObjectURL(photo.blob);
      urls.push(url);
      img.src = url;
      img.alt = photo.caption || 'Photo ' + (i + 1) + ' from ' + trip.title;
      img.width = photo.width;
      img.height = photo.height;
      fig.append(img);

      var label = document.createElement('label');
      label.className = 'visually-hidden';
      label.htmlFor = 'cap-' + photo.id;
      label.textContent = 'Caption for photo ' + (i + 1);
      var cap = document.createElement('input');
      cap.className = 'caption-input';
      cap.id = 'cap-' + photo.id;
      cap.placeholder = 'Add a caption';
      cap.maxLength = 140;
      cap.value = photo.caption;
      cap.addEventListener('input', function () {
        photo.caption = cap.value.trim();
        img.alt = photo.caption || 'Photo ' + (i + 1) + ' from ' + trip.title;
        FolioStore.savePhoto(photo);
      });

      var tools = document.createElement('div');
      tools.className = 'scrap-tools';
      tools.append(
        button('Move earlier', 'up', i === 0),
        button('Move later', 'down', i === n - 1),
        button('Remove', 'remove')
      );

      li.append(fig, label, cap, tools);
      list.append(li);
    });

    if (focus) {
      var target = list.querySelector('[data-id="' + focus.id + '"] [data-act="' + focus.act + '"]');
      if (target && !target.disabled) target.focus();
      else if (list.querySelector('button:not(:disabled)')) list.querySelector('button:not(:disabled)').focus();
    }
  }

  list.addEventListener('click', async function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var pid = b.closest('.scrap').dataset.id;
    var i = trip.photoIds.indexOf(pid);
    if (b.dataset.act === 'remove') {
      await FolioStore.deletePhoto(trip, pid);
      render({ id: trip.photoIds[Math.min(i, trip.photoIds.length - 1)], act: 'remove' });
      return;
    }
    var j = b.dataset.act === 'up' ? i - 1 : i + 1;
    trip.photoIds.splice(i, 1);
    trip.photoIds.splice(j, 0, pid);
    await FolioStore.saveTrip(trip);
    render({ id: pid, act: b.dataset.act });
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
    addError.hidden = true;
    for (var k = 0; k < files.length; k++) {
      adding.textContent = 'Adding photo ' + (k + 1) + ' of ' + files.length + '…';
      try {
        if (!files[k].type.startsWith('image/')) throw new Error('not an image');
        await FolioStore.addPhoto(trip, await resize(files[k]));
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

// Step 3: Edits (SPEC.md, edit.html).
// For a video: order and captions, caption style, cover, duration, transition.
(async function () {
  var SWATCHES = FolioVideo.SWATCHES; // palette name -> colour
  var DURATIONS = [1, 1.5, 2, 2.5, 3];
  var TRANSITIONS = [
    ['cut', 'Clean cut', 'Straight to the next photo.'],
    ['dissolve', 'Dissolve', 'One photo blends into the next.'],
    ['slide', 'Slide', 'Photos slide on and off, right to left.']
  ];

  var trip = await loadStepTrip();
  if (!trip) {
    location.replace('upload.html');
    return;
  }
  var id = encodeURIComponent(trip.id);
  if (!trip.photoIds.length) {
    location.replace('upload.html?id=' + id);
    return;
  }
  if (!trip.media) {
    location.replace('media.html?id=' + id);
    return;
  }

  document.title = 'Folio · Edit ' + trip.title;
  document.getElementById('trip-name').textContent = trip.title;
  document.getElementById('step-view').hidden = false;
  renderSteps('edit', trip, 'media.html?id=' + id);

  if (trip.media === 'collage') {
    document.getElementById('collage-soon').hidden = false;
    return;
  }
  document.getElementById('video-edit').hidden = false;
  document.getElementById('preview-btn').href = 'preview.html?id=' + id;

  var photos = await FolioStore.photosFor(trip);
  var byId = {};
  var urls = {};
  photos.forEach(function (p) {
    byId[p.id] = p;
    urls[p.id] = URL.createObjectURL(p.blob);
  });

  // Video choices, saved with the trip. Starting values come from SPEC.md.
  var video = FolioVideo.defaults(trip, trip.photoIds);

  // The live samples are drawn with the same code that makes the video (js/video.js).
  var bitmaps = {};
  function bitmapFor(photo) {
    if (!bitmaps[photo.id]) bitmaps[photo.id] = createImageBitmap(photo.blob);
    return bitmaps[photo.id];
  }
  var fontsLoaded = FolioVideo.fontsReady();

  function save() {
    return FolioStore.saveTrip(trip);
  }

  // ---- Order and captions ----
  var grid = document.getElementById('photo-grid');
  var status = document.getElementById('order-status');
  var n = photos.length;
  document.getElementById('photo-count').textContent = n + (n === 1 ? ' photo' : ' photos');

  function labelTiles() {
    Array.from(grid.children).forEach(function (li, i) {
      li.querySelector('.print').setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + n + '. Use the arrow keys to move it.');
    });
  }

  function saveOrder() {
    trip.photoIds = Array.from(grid.children).map(function (li) { return li.dataset.id; });
    labelTiles();
    save();
  }

  photos.forEach(function (photo, i) {
    var li = document.createElement('li');
    li.className = 'photo-tile';
    li.dataset.id = photo.id;

    var fig = document.createElement('figure');
    fig.className = 'print';
    fig.tabIndex = 0;
    var img = document.createElement('img');
    img.src = urls[photo.id];
    img.alt = photo.caption || 'Photo from ' + trip.title;
    img.draggable = false;
    fig.append(img);

    var label = document.createElement('label');
    label.className = 'visually-hidden';
    label.htmlFor = 'cap-' + photo.id;
    label.textContent = 'Caption for this photo';
    var cap = document.createElement('input');
    cap.className = 'caption-input';
    cap.id = 'cap-' + photo.id;
    cap.placeholder = 'Add a caption';
    cap.maxLength = 140;
    cap.autocomplete = 'off';
    cap.value = photo.caption || '';
    cap.addEventListener('input', function () {
      photo.caption = cap.value.trim();
      img.alt = photo.caption || 'Photo from ' + trip.title;
      FolioStore.savePhoto(photo);
      drawCaptionSample();
    });

    li.append(fig, label, cap);
    grid.append(li);
  });
  labelTiles();

  // Drag with a mouse, pen or finger: the other tiles shift to show where the photo will land.
  grid.addEventListener('pointerdown', function (e) {
    var fig = e.target.closest('.print');
    if (!fig || e.button !== 0) return;
    var li = fig.closest('.photo-tile');
    var startX = e.clientX;
    var startY = e.clientY;
    var dragging = false;
    e.preventDefault();
    fig.focus();
    try { fig.setPointerCapture(e.pointerId); } catch (err) { /* the page-wide listeners below still work */ }

    function move(ev) {
      if (!dragging) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) < 8) return;
        dragging = true;
        li.classList.add('dragging');
      }
      var under = document.elementFromPoint(ev.clientX, ev.clientY);
      var over = under && under.closest('.photo-tile');
      if (!over || over === li || over.parentNode !== grid) return;
      var tiles = Array.from(grid.children);
      grid.insertBefore(li, tiles.indexOf(li) < tiles.indexOf(over) ? over.nextSibling : over);
    }

    function end() {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', end);
      document.removeEventListener('pointercancel', end);
      if (!dragging) return;
      li.classList.remove('dragging');
      saveOrder();
      status.textContent = 'Moved to position ' + (Array.from(grid.children).indexOf(li) + 1) + ' of ' + n + '.';
    }

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
  });

  // Keyboard: arrow keys move the focused photo one place.
  grid.addEventListener('keydown', function (e) {
    var fig = e.target.closest('.print');
    if (!fig) return;
    var li = fig.closest('.photo-tile');
    var back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    var forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    if (!back && !forward) return;
    e.preventDefault();
    if (back && li.previousElementSibling) grid.insertBefore(li, li.previousElementSibling);
    else if (forward && li.nextElementSibling) grid.insertBefore(li.nextElementSibling, li);
    else return;
    fig.focus();
    saveOrder();
    status.textContent = 'Moved to position ' + (Array.from(grid.children).indexOf(li) + 1) + ' of ' + n + '.';
  });

  function radio(className, label, checked) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(checked));
    b.setAttribute('aria-label', label);
    return b;
  }

  // ---- Caption style ----
  var captionCanvas = document.getElementById('caption-sample');
  var captionColours = document.getElementById('cap-colours');

  // The first photo with a caption shows how captions will look; otherwise an example on the first photo.
  async function drawCaptionSample() {
    var sample = photos.find(function (p) { return p.caption; }) || photos[0];
    var bitmap = await bitmapFor(sample);
    await fontsLoaded;
    FolioVideo.drawPhoto(captionCanvas.getContext('2d'), bitmap, sample.caption || 'Your caption here', video.caption);
  }

  optionGroup(
    document.getElementById('cap-vertical'),
    [{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }],
    function (v) { return video.caption.vertical === v; },
    function (v) { video.caption.vertical = v; drawCaptionSample(); }
  );
  optionGroup(
    document.getElementById('cap-horizontal'),
    [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }, { value: 'right', label: 'Right' }],
    function (v) { return video.caption.horizontal === v; },
    function (v) { video.caption.horizontal = v; drawCaptionSample(); }
  );
  optionGroup(
    document.getElementById('cap-style'),
    [
      { value: 'regular', label: 'Regular', className: 'style-regular' },
      { value: 'bold', label: 'Bold', className: 'style-bold' },
      { value: 'italic', label: 'Italic', className: 'style-italic' }
    ],
    function (v) { return video.caption.style === v; },
    function (v) { video.caption.style = v; drawCaptionSample(); }
  );

  Object.keys(SWATCHES).forEach(function (name) {
    var b = radio('swatch', name + ' caption text', video.caption.colour === name);
    b.dataset.value = name;
    b.style.backgroundColor = SWATCHES[name];
    b.addEventListener('click', function () {
      video.caption.colour = name;
      captionColours.querySelectorAll('button').forEach(function (other) {
        other.setAttribute('aria-checked', String(other === b));
      });
      drawCaptionSample();
      save();
    });
    captionColours.append(b);
  });
  drawCaptionSample();

  // ---- Cover ----
  var headingInput = document.getElementById('cover-heading');
  var detailsInput = document.getElementById('cover-details');
  var coverCanvas = document.getElementById('cover-sample');
  var swatchBox = document.getElementById('swatches');
  var photoBox = document.getElementById('cover-photos');

  headingInput.value = video.cover.title;
  detailsInput.value = video.cover.details;

  function markChecked() {
    var current = video.cover.background;
    swatchBox.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-checked', String(current.type === 'swatch' && b.dataset.value === current.value));
    });
    photoBox.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-checked', String(current.type === 'photo' && b.dataset.value === current.value));
    });
  }

  async function updateCover() {
    markChecked();
    var current = video.cover.background;
    var bitmap = current.type === 'photo' ? await bitmapFor(byId[current.value]) : null;
    await fontsLoaded;
    FolioVideo.drawCover(coverCanvas.getContext('2d'), video.cover, bitmap);
  }

  Object.keys(SWATCHES).forEach(function (name) {
    var b = radio('swatch', name + ' background', false);
    b.dataset.value = name;
    b.style.backgroundColor = SWATCHES[name];
    b.addEventListener('click', function () {
      video.cover.background = { type: 'swatch', value: name };
      updateCover();
      save();
    });
    swatchBox.append(b);
  });

  photos.forEach(function (p, i) {
    var b = radio('cover-photo', 'Photo ' + (i + 1) + ' as background', false);
    b.dataset.value = p.id;
    var img = document.createElement('img');
    img.src = urls[p.id];
    img.alt = '';
    b.append(img);
    b.addEventListener('click', function () {
      video.cover.background = { type: 'photo', value: p.id };
      updateCover();
      save();
    });
    photoBox.append(b);
  });

  headingInput.addEventListener('input', function () {
    video.cover.title = headingInput.value.trim();
    updateCover();
    save();
  });
  detailsInput.addEventListener('input', function () {
    video.cover.details = detailsInput.value.trim();
    updateCover();
    save();
  });
  updateCover();

  // ---- Duration and transition ----
  function optionGroup(box, items, isChosen, choose) {
    items.forEach(function (item) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'option';
      b.setAttribute('role', 'radio');
      var name = document.createElement('span');
      name.className = 'option-name' + (item.className ? ' ' + item.className : '');
      name.textContent = item.label;
      b.append(name);
      if (item.note) {
        var note = document.createElement('span');
        note.className = 'option-note';
        note.textContent = item.note;
        b.append(note);
      }
      b.addEventListener('click', function () {
        choose(item.value);
        refresh();
        save();
      });
      box.append(b);
    });
    function refresh() {
      Array.from(box.children).forEach(function (b, i) {
        b.setAttribute('aria-checked', String(isChosen(items[i].value)));
      });
    }
    refresh();
  }

  optionGroup(
    document.getElementById('durations'),
    DURATIONS.map(function (d) { return { value: d, label: d + 's' }; }),
    function (v) { return video.duration === v; },
    function (v) { video.duration = v; }
  );

  optionGroup(
    document.getElementById('transitions'),
    TRANSITIONS.map(function (t) { return { value: t[0], label: t[1], note: t[2] }; }),
    function (v) { return video.transition === v; },
    function (v) { video.transition = v; }
  );

  save();
})();

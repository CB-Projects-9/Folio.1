// Step 3: Edits (SPEC.md, edit.html). For a video: order and captions, cover, duration, transition.
(async function () {
  // [name, colour, text on it]; text is dark on light swatches and light on dark ones.
  var SWATCHES = [
    ['cream', '#F6EFE3', 'dark'],
    ['sand', '#E4D3BA', 'dark'],
    ['clay', '#C9A98A', 'dark'],
    ['terracotta', '#A24B30', 'light'],
    ['dark brown', '#3B2A21', 'light']
  ];
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
  var video = trip.video || {};
  video.cover = video.cover || {};
  if (video.cover.title === undefined) video.cover.title = trip.title === 'Untitled trip' ? '' : trip.title;
  if (video.cover.details === undefined) video.cover.details = '';
  var bg = video.cover.background;
  if (!bg || (bg.type === 'photo' && !byId[bg.value])) video.cover.background = { type: 'swatch', value: 'cream' };
  video.duration = video.duration || 2.5;
  video.transition = video.transition || 'dissolve';
  trip.video = video;

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

  // ---- Cover ----
  var headingInput = document.getElementById('cover-heading');
  var detailsInput = document.getElementById('cover-details');
  var preview = document.getElementById('cover-preview');
  var previewTitle = document.getElementById('cover-preview-title');
  var previewDetails = document.getElementById('cover-preview-details');
  var swatchBox = document.getElementById('swatches');
  var photoBox = document.getElementById('cover-photos');

  headingInput.value = video.cover.title;
  detailsInput.value = video.cover.details;

  function radio(className, label, checked) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(checked));
    b.setAttribute('aria-label', label);
    return b;
  }

  function markChecked() {
    var current = video.cover.background;
    swatchBox.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-checked', String(current.type === 'swatch' && b.dataset.value === current.value));
    });
    photoBox.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-checked', String(current.type === 'photo' && b.dataset.value === current.value));
    });
  }

  function updateCover() {
    var current = video.cover.background;
    preview.classList.remove('text-light', 'with-photo');
    preview.style.backgroundImage = '';
    if (current.type === 'photo') {
      preview.style.backgroundColor = '#3B2A21';
      preview.style.backgroundImage = 'url("' + urls[current.value] + '")';
      preview.classList.add('text-light', 'with-photo');
    } else {
      var swatch = SWATCHES.find(function (s) { return s[0] === current.value; }) || SWATCHES[0];
      preview.style.backgroundColor = swatch[1];
      if (swatch[2] === 'light') preview.classList.add('text-light');
    }
    previewTitle.textContent = video.cover.title;
    previewDetails.textContent = video.cover.details;
    markChecked();
  }

  SWATCHES.forEach(function (s) {
    var b = radio('swatch', s[0] + ' background', false);
    b.dataset.value = s[0];
    b.style.backgroundColor = s[1];
    b.addEventListener('click', function () {
      video.cover.background = { type: 'swatch', value: s[0] };
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
      name.className = 'option-name';
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

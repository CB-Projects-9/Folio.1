// Step 3: Edits (SPEC.md, edit.html).
// Video: order and captions, caption style, cover, duration, transition.
// Collage: order and captions, collage style, caption style, title card.
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

  var isVideo = trip.media !== 'collage';
  document.title = 'Folio · Edit ' + trip.title;
  document.getElementById('trip-name').textContent = trip.title;
  document.getElementById('step-view').hidden = false;
  document.getElementById('edit-form').hidden = false;
  document.querySelectorAll(isVideo ? '.video-only' : '.collage-only').forEach(function (el) { el.hidden = false; });
  document.getElementById('preview-btn').href = 'preview.html?id=' + id;
  renderSteps('edit', trip, 'media.html?id=' + id);

  var photos = await FolioStore.photosFor(trip);
  var byId = {};
  var urls = {};
  photos.forEach(function (p) {
    byId[p.id] = p;
    urls[p.id] = URL.createObjectURL(p.blob);
  });
  var n = photos.length;

  // Choices, saved with the trip. Starting values come from SPEC.md.
  var settings = isVideo ? FolioVideo.defaults(trip, trip.photoIds) : FolioCollage.defaults(trip);

  // The live samples are drawn with the same code that makes the video and the collage pages.
  var bitmaps = {};
  function bitmapFor(photo) {
    if (!bitmaps[photo.id]) bitmaps[photo.id] = createImageBitmap(photo.blob);
    return bitmaps[photo.id];
  }
  var fontsLoaded = FolioVideo.fontsReady();

  function save() {
    return FolioStore.saveTrip(trip);
  }

  function radio(className, label, checked) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(checked));
    b.setAttribute('aria-label', label);
    return b;
  }

  // A row of option buttons. isDisabled (optional) fades buttons that cannot be used.
  // Returns refresh(), to call when something else changes what is chosen or allowed.
  function optionGroup(box, items, isChosen, choose, isDisabled) {
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
        if (b.disabled) return;
        choose(item.value);
        refresh();
        save();
      });
      box.append(b);
    });
    function refresh() {
      Array.from(box.children).forEach(function (b, i) {
        b.setAttribute('aria-checked', String(isChosen(items[i].value)));
        b.disabled = Boolean(isDisabled && isDisabled(items[i].value));
      });
    }
    refresh();
    return refresh;
  }

  // Round colour swatches. isDisabled (optional) fades swatches that cannot be used.
  function swatchGroup(box, labelEnd, isChosen, choose, isDisabled) {
    Object.keys(SWATCHES).forEach(function (name) {
      var b = radio('swatch', name + ' ' + labelEnd, false);
      b.dataset.value = name;
      b.style.backgroundColor = SWATCHES[name];
      b.addEventListener('click', function () {
        if (b.disabled) return;
        choose(name);
        refresh();
        save();
      });
      box.append(b);
    });
    function refresh() {
      box.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-checked', String(isChosen(b.dataset.value)));
        b.disabled = Boolean(isDisabled && isDisabled(b.dataset.value));
      });
    }
    refresh();
    return refresh;
  }

  // ---- Order and captions ----
  var grid = document.getElementById('photo-grid');
  var status = document.getElementById('order-status');
  document.getElementById('photo-count').textContent = n + (n === 1 ? ' photo' : ' photos');

  function labelTiles() {
    Array.from(grid.children).forEach(function (li, i) {
      li.querySelector('.print').setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + n + '. Use the arrow keys to move it.');
    });
  }

  function saveOrder() {
    trip.photoIds = Array.from(grid.children).map(function (li) { return li.dataset.id; });
    photos.sort(function (a, b) { return trip.photoIds.indexOf(a.id) - trip.photoIds.indexOf(b.id); });
    labelTiles();
    save();
    if (!isVideo) refreshStyleTiles();
  }

  photos.forEach(function (photo) {
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

  // ---- Caption style (both) ----
  var captionCanvas = document.getElementById('caption-sample');
  var positionNote = document.getElementById('cap-position-note');
  var tiltBox = document.getElementById('cap-tilt');
  var onPaper = function () { return !isVideo && settings.style !== 'mosaic'; };

  // The first photo with a caption shows how captions will look; otherwise an example on the first photo.
  async function drawCaptionSample() {
    var sample = photos.find(function (p) { return p.caption; }) || photos[0];
    var bitmap = await bitmapFor(sample);
    await fontsLoaded;
    var text = sample.caption || 'Your caption here';
    if (isVideo) FolioVideo.drawPhoto(captionCanvas.getContext('2d'), bitmap, text, settings.caption);
    else FolioCollage.drawCaptionSample(captionCanvas, settings, bitmap, text);
  }

  var positionLocked = function () { return !isVideo && settings.style === 'polaroid'; };
  var refreshVertical = optionGroup(
    document.getElementById('cap-vertical'),
    [{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }],
    function (v) { return settings.caption.vertical === v; },
    function (v) { settings.caption.vertical = v; drawCaptionSample(); },
    positionLocked
  );
  var refreshHorizontal = optionGroup(
    document.getElementById('cap-horizontal'),
    [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }, { value: 'right', label: 'Right' }],
    function (v) { return settings.caption.horizontal === v; },
    function (v) { settings.caption.horizontal = v; drawCaptionSample(); },
    positionLocked
  );
  var refreshTilt = isVideo ? function () {} : optionGroup(
    tiltBox,
    [{ value: true, label: 'Follow the photo’s tilt: on' }, { value: false, label: 'Off' }],
    function (v) { return settings.caption.followTilt === v; },
    function (v) { settings.caption.followTilt = v; drawCaptionSample(); }
  );
  optionGroup(
    document.getElementById('cap-style'),
    [
      { value: 'regular', label: 'Regular', className: 'style-regular' },
      { value: 'bold', label: 'Bold', className: 'style-bold' },
      { value: 'italic', label: 'Italic', className: 'style-italic' }
    ],
    function (v) { return settings.caption.style === v; },
    function (v) { settings.caption.style = v; drawCaptionSample(); }
  );
  var refreshCaptionColours = swatchGroup(
    document.getElementById('cap-colours'),
    'caption text',
    function (v) { return settings.caption.colour === v; },
    function (v) { settings.caption.colour = v; drawCaptionSample(); },
    function (v) { return onPaper() && FolioCollage.PAPER_UNREADABLE.indexOf(v) >= 0; }
  );

  // Adapts the caption controls to the collage style (SPEC.md, edit.html: Caption style).
  function adaptCaptionControls() {
    if (isVideo) return;
    if (onPaper() && FolioCollage.PAPER_UNREADABLE.indexOf(settings.caption.colour) >= 0) settings.caption.colour = 'dark brown';
    positionNote.hidden = settings.style !== 'polaroid';
    tiltBox.hidden = settings.style !== 'scrapbook';
    refreshVertical();
    refreshHorizontal();
    refreshTilt();
    refreshCaptionColours();
    drawCaptionSample();
  }

  // ---- Video only: cover, duration, transition ----
  if (isVideo) {
    var video = settings;
    var headingInput = document.getElementById('cover-heading');
    var detailsInput = document.getElementById('cover-details');
    var coverCanvas = document.getElementById('cover-sample');
    var swatchBox = document.getElementById('swatches');
    var photoBox = document.getElementById('cover-photos');
    headingInput.value = video.cover.title;
    detailsInput.value = video.cover.details;

    var markCover = function () {
      var current = video.cover.background;
      swatchBox.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-checked', String(current.type === 'swatch' && b.dataset.value === current.value));
      });
      photoBox.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-checked', String(current.type === 'photo' && b.dataset.value === current.value));
      });
    };
    var updateCover = async function () {
      markCover();
      var current = video.cover.background;
      var bitmap = current.type === 'photo' ? await bitmapFor(byId[current.value]) : null;
      await fontsLoaded;
      FolioVideo.drawCover(coverCanvas.getContext('2d'), video.cover, bitmap);
    };

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
  }

  // ---- Collage only: collage style, title card ----
  var refreshStyleTiles = function () {};
  if (!isVideo) {
    var collage = settings;
    var styleBox = document.getElementById('style-tiles');
    var styleTiles = {};

    FolioCollage.STYLES.forEach(function (s) {
      var b = radio('style-tile', s[1], collage.style === s[0]);
      b.removeAttribute('aria-label');
      var pic = document.createElement('canvas');
      pic.className = 'style-pic';
      pic.setAttribute('aria-hidden', 'true');
      var label = document.createElement('span');
      label.className = 'choose-label';
      label.textContent = s[1];
      b.append(pic, label);
      b.addEventListener('click', function () {
        collage.style = s[0];
        styleBox.querySelectorAll('.style-tile').forEach(function (t) {
          t.setAttribute('aria-checked', String(t === b));
        });
        adaptCaptionControls();
        drawCardSample();
        save();
      });
      styleBox.append(b);
      styleTiles[s[0]] = pic;
    });

    // Small first pages of this trip in each style, so the tiles show the real photos.
    var tileRun = 0;
    refreshStyleTiles = async function () {
      var run = ++tileRun;
      for (var i = 0; i < FolioCollage.STYLES.length; i++) {
        var name = FolioCollage.STYLES[i][0];
        var small = await FolioCollage.stylePreview(trip, photos, name, 0.16);
        if (run !== tileRun) return;
        var pic = styleTiles[name];
        pic.width = small.width;
        pic.height = small.height;
        pic.getContext('2d').drawImage(small, 0, 0);
      }
    };

    optionGroup(
      document.getElementById('orientation'),
      [{ value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }],
      function (v) { return collage.orientation === v; },
      function (v) { collage.orientation = v; refreshStyleTiles(); }
    );

    // Number of pages: 1 up to the number of photos; empty means about 12 photos per page.
    var pagesInput = document.getElementById('page-count');
    var pagesNote = document.getElementById('pages-note');
    pagesInput.max = n;
    pagesInput.placeholder = n === 1 ? '1' : '1–' + n;
    if (collage.pages) pagesInput.value = collage.pages;
    pagesInput.addEventListener('input', function () {
      var raw = pagesInput.value.trim();
      var value = Number(raw);
      if (!raw) {
        collage.pages = null;
        pagesNote.hidden = true;
      } else if (Number.isInteger(value) && value >= 1 && value <= n) {
        collage.pages = value;
        pagesNote.hidden = true;
      } else {
        collage.pages = null;
        pagesNote.textContent = 'Choose a number from 1 to ' + n + '.';
        pagesNote.hidden = false;
      }
      save();
      refreshStyleTiles();
    });

    // Title card
    var cardHeading = document.getElementById('card-heading');
    var cardDetails = document.getElementById('card-details');
    var cardCanvas = document.getElementById('card-sample');
    var cardPageField = document.getElementById('card-page-field');
    var cardPageInput = document.getElementById('card-page');
    cardHeading.value = collage.card.title;
    cardDetails.value = collage.card.details;
    cardPageInput.value = collage.card.page;
    cardPageInput.max = n;

    var drawCardSample = async function () {
      await fontsLoaded;
      FolioCollage.drawCardSample(cardCanvas, collage);
    };
    cardHeading.addEventListener('input', function () {
      collage.card.title = cardHeading.value.trim();
      drawCardSample();
      save();
    });
    cardDetails.addEventListener('input', function () {
      collage.card.details = cardDetails.value.trim();
      drawCardSample();
      save();
    });
    swatchGroup(
      document.getElementById('card-colours'),
      'card',
      function (v) { return collage.card.colour === v; },
      function (v) { collage.card.colour = v; drawCardSample(); }
    );
    optionGroup(
      document.getElementById('card-place'),
      [{ value: 'first', label: 'First page only' }, { value: 'every', label: 'Every page' }, { value: 'page', label: 'Page…' }],
      function (v) { return collage.card.place === v; },
      function (v) { collage.card.place = v; cardPageField.hidden = v !== 'page'; refreshStyleTiles(); }
    );
    cardPageField.hidden = collage.card.place !== 'page';
    cardPageInput.addEventListener('input', function () {
      var value = Number(cardPageInput.value);
      if (Number.isInteger(value) && value >= 1) {
        collage.card.page = value;
        save();
        refreshStyleTiles();
      }
    });

    adaptCaptionControls();
    drawCardSample();
    refreshStyleTiles();
  }

  drawCaptionSample();
  save();
})();

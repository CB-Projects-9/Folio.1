// Export a trip in three steps: choose, preview, download or print (SPEC.md, export.html).
(async function () {

  var user = await Folio.ready;
  await FolioStore.open(user);

  var id = new URLSearchParams(location.search).get('id');
  var trip = id ? await FolioStore.getTrip(id) : null;
  var problem = document.getElementById('problem');

  if (!trip) {
    problem.innerHTML = 'This trip could not be found. <a href="trips.html">See all trips</a>';
    problem.hidden = false;
    return;
  }

  var tripUrl = 'trip.html?id=' + encodeURIComponent(trip.id);
  document.getElementById('trip-name').textContent = trip.title;
  document.title = 'Folio · ' + trip.title;

  var photos = await FolioStore.photosFor(trip);
  if (!photos.length) {
    problem.innerHTML = 'This trip has no photos yet. <a href="' + tripUrl + '">Add photos</a>';
    problem.hidden = false;
    return;
  }

  var urls = photos.map(function (p) { return URL.createObjectURL(p.blob); });
  var preview = document.getElementById('preview');
  var printArea = document.getElementById('print-area');
  var mainAction = document.getElementById('main-action');
  var printCollage = document.getElementById('print-collage');
  var finalHelp = document.getElementById('final-help');
  var collageBlob = null;
  var collageUrl = null;

  document.getElementById('export-view').hidden = false;
  document.getElementById('back-link').href = tripUrl;

  // 'video' or 'collage', set by the tile the visitor clicks on the choose screen.
  var chosen = null;
  function layout() {
    return chosen;
  }

  function altFor(p, i) {
    return p.caption || 'Photo ' + (i + 1) + ' from ' + trip.title;
  }

  // ---- Steps ----
  async function go(step, quiet) {
    stopShow();
    document.querySelectorAll('[data-panel]').forEach(function (s) {
      s.hidden = s.dataset.panel !== String(step);
    });
    // The question and the step list belong to different screens (DESIGN.md, The choose screen).
    document.getElementById('choose-question').hidden = step !== 1;
    document.getElementById('export-head').classList.toggle('choose-head', step === 1);
    document.querySelector('.steps').hidden = step === 1;
    document.querySelectorAll('[data-step]').forEach(function (li) {
      if (li.dataset.step === String(step)) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    if (step === 2) await buildPreview();
    if (step === 3) setFinal();
    if (quiet) return;
    var heading = step === 1 ? document.getElementById('trip-name') : document.querySelector('[data-panel="' + step + '"] h2');
    heading.tabIndex = -1;
    heading.focus();
  }

  document.querySelectorAll('.choose-tile').forEach(function (tile) {
    tile.addEventListener('click', function () {
      if (chosen !== tile.dataset.layout) preview.replaceChildren();
      chosen = tile.dataset.layout;
      go(2);
    });
  });

  document.querySelectorAll('[data-go]').forEach(function (b) {
    b.addEventListener('click', function () { go(Number(b.dataset.go)); });
  });

  // ---- Slideshow ----
  var slideshow = null;

  function buildSlideshow() {
    slideshow = makeSlideshow(preview, photos.map(function (p, i) {
      return { src: urls[i], alt: altFor(p, i), caption: p.caption };
    }));
  }

  function stopShow() {
    if (slideshow) slideshow.stop();
  }

  // ---- Collage ----
  // A tight mosaic of straight photos in mixed sizes around a title panel (DESIGN.md, Collage style).

  // Tall photos span two rows and wide photos two columns, alternating so the sizes stay mixed.
  function photoShapes() {
    var tall = 0, wide = 0;
    return photos.map(function (p) {
      if (p.height > p.width * 1.2) return tall++ % 2 === 0 ? 'tall' : 'small';
      if (p.width > p.height * 1.2) return wide++ % 2 === 0 ? 'wide' : 'small';
      return 'small';
    });
  }

  // Places the title panel and each photo on a grid of cells, then fills any holes.
  function planMosaic(shapes) {
    var n = shapes.length;
    var cols = n <= 2 ? 2 : n <= 5 ? 3 : 4;
    var grid = [];
    var tiles = [];

    function at(r, c) { return grid[r] ? grid[r][c] : undefined; }
    function free(r, c) { return c >= 0 && c < cols && r >= 0 && at(r, c) === undefined; }
    function mark(t) {
      for (var r = t.r; r < t.r + t.h; r++) {
        grid[r] = grid[r] || [];
        for (var c = t.c; c < t.c + t.w; c++) grid[r][c] = t;
      }
    }
    function put(t, r, c, w, h) {
      t.r = r; t.c = c; t.w = w; t.h = h;
      tiles.push(t);
      mark(t);
    }

    put({ panel: true }, n <= 3 ? 0 : 1, Math.floor((cols - 2) / 2), 2, 1);

    shapes.forEach(function (shape, i) {
      var r = 0, c = 0;
      while (!free(r, c)) {
        c++;
        if (c >= cols) { c = 0; r++; }
      }
      var t = { photo: i };
      if (shape === 'wide' && free(r, c + 1)) put(t, r, c, 2, 1);
      else if (shape === 'tall' && free(r + 1, c)) put(t, r, c, 1, 2);
      else put(t, r, c, 1, 1);
    });

    var rows = grid.length;
    function allFree(r0, r1, c0, c1) {
      for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) if (!free(r, c)) return false;
      return true;
    }
    // Stretch a neighbouring tile into each hole: from above, the left, the right, or below.
    function fill(r, c) {
      var t = at(r - 1, c);
      if (t && t.r + t.h === r && allFree(r, r, t.c, t.c + t.w - 1)) { t.h++; mark(t); return true; }
      t = at(r, c - 1);
      if (t && t.c + t.w === c && allFree(t.r, t.r + t.h - 1, c, c)) { t.w++; mark(t); return true; }
      t = at(r, c + 1);
      if (t && t.c === c + 1 && allFree(t.r, t.r + t.h - 1, c, c)) { t.c--; t.w++; mark(t); return true; }
      t = at(r + 1, c);
      if (t && t.r === r + 1 && allFree(r, r, t.c, t.c + t.w - 1)) { t.r--; t.h++; mark(t); return true; }
      return false;
    }
    var changed = true;
    while (changed) {
      changed = false;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          if (free(r, c) && fill(r, c)) changed = true;
        }
      }
    }
    return { cols: cols, rows: rows, tiles: tiles };
  }

  // Shrinks text until it fits the width, then shortens it with "…" if it still does not.
  function fitText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    while (text.length > 1 && ctx.measureText(text + '…').width > maxWidth) text = text.slice(0, -1);
    return text.trim() + '…';
  }

  async function buildCollage() {
    if (collageBlob) return;
    try {
      await document.fonts.load('500 64px Lora');
      await document.fonts.load('300 28px Poppins');
    } catch (e) { /* fall back to system fonts */ }

    var plan = planMosaic(photoShapes());
    var W = 2400, gap = 20;
    var cellW = (W - gap * (plan.cols + 1)) / plan.cols;
    var rowH = Math.round(cellW * 0.72);
    var H = gap + plan.rows * (rowH + gap);
    var bitmaps = await Promise.all(photos.map(function (p) { return createImageBitmap(p.blob); }));

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F6EFE3';
    ctx.fillRect(0, 0, W, H);

    plan.tiles.forEach(function (t) {
      var x = gap + t.c * (cellW + gap);
      var y = gap + t.r * (rowH + gap);
      var w = t.w * cellW + (t.w - 1) * gap;
      var h = t.h * rowH + (t.h - 1) * gap;

      if (t.panel) {
        ctx.fillStyle = '#FBF7F0';
        ctx.fillRect(x, y, w, h);
        var size = Math.round(rowH * 0.2);
        ctx.font = '500 ' + size + 'px Lora, serif';
        ctx.letterSpacing = Math.round(size * 0.2) + 'px';
        var title = trip.title.toUpperCase();
        while (size > 24 && ctx.measureText(title).width > w * 0.85) {
          size -= 2;
          ctx.font = '500 ' + size + 'px Lora, serif';
          ctx.letterSpacing = Math.round(size * 0.2) + 'px';
        }
        title = fitText(ctx, title, w * 0.85);
        ctx.fillStyle = '#3B2A21';
        ctx.textAlign = 'center';
        // Letter spacing adds space after the last letter too, so nudge right by half of it.
        ctx.fillText(title, x + w / 2 + size * 0.1, y + h / 2);
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#C9A98A';
        ctx.fillRect(x + w / 2 - size * 0.45, y + h / 2 + size * 0.5, size * 0.9, Math.max(2, size * 0.03));
        return;
      }

      if (t.photo === undefined) return;
      var b = bitmaps[t.photo];
      var scale = Math.max(w / b.width, h / b.height);
      var sw = w / scale, sh = h / scale;
      ctx.drawImage(b, (b.width - sw) / 2, (b.height - sh) / 2, sw, sh, x, y, w, h);

      var caption = photos[t.photo].caption;
      if (caption) {
        var strip = Math.round(rowH * 0.14);
        ctx.fillStyle = '#FBF7F0';
        ctx.fillRect(x, y + h - strip, w, strip);
        ctx.font = '300 ' + Math.round(strip * 0.45) + 'px Poppins, sans-serif';
        ctx.fillStyle = '#6B5648';
        ctx.textAlign = 'left';
        ctx.fillText(fitText(ctx, caption, w - strip), x + strip / 2, y + h - strip * 0.36);
      }
    });

    collageBlob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/jpeg', 0.9); });
    collageUrl = URL.createObjectURL(collageBlob);
  }

  async function buildPreview() {
    if (layout() === 'video') {
      buildSlideshow();
      return;
    }
    preview.textContent = 'Making your collage…';
    await buildCollage();
    var fig = document.createElement('figure');
    fig.className = 'print collage-preview';
    var img = document.createElement('img');
    img.src = collageUrl;
    img.alt = 'Collage of ' + photos.length + ' photos from ' + trip.title;
    fig.append(img);
    preview.replaceChildren(fig);
  }

  // ---- Download or print ----
  function slug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trip';
  }

  function setFinal() {
    if (layout() === 'collage') {
      mainAction.textContent = 'Download collage';
      printCollage.hidden = false;
      finalHelp.textContent = 'Downloads as a JPEG image. You can also print it.';
    } else {
      mainAction.textContent = 'Print photos';
      printCollage.hidden = true;
      finalHelp.textContent = 'Prints one photo per page. Your browser\'s print window can also save it as a PDF.';
    }
  }

  function preparePrint() {
    printArea.replaceChildren();
    if (layout() === 'collage') {
      var img = document.createElement('img');
      img.className = 'print-collage';
      img.src = collageUrl;
      img.alt = 'Collage of ' + photos.length + ' photos from ' + trip.title;
      printArea.append(img);
      return;
    }
    photos.forEach(function (p, i) {
      var fig = document.createElement('figure');
      fig.className = 'print-page';
      var img = document.createElement('img');
      img.src = urls[i];
      img.alt = altFor(p, i);
      fig.append(img);
      if (p.caption) {
        var cap = document.createElement('figcaption');
        cap.className = 'caption';
        cap.textContent = p.caption;
        fig.append(cap);
      }
      printArea.append(fig);
    });
  }

  function doPrint() {
    preparePrint();
    var imgs = Array.from(printArea.querySelectorAll('img'));
    Promise.all(imgs.map(function (i) { return i.decode().catch(function () {}); })).then(function () {
      window.print();
    });
  }

  mainAction.addEventListener('click', async function () {
    if (layout() === 'collage') {
      await buildCollage();
      var a = document.createElement('a');
      a.href = collageUrl;
      a.download = slug(trip.title) + '-collage.jpg';
      document.body.append(a);
      a.click();
      a.remove();
    } else {
      doPrint();
    }
  });
  printCollage.addEventListener('click', doPrint);

  go(1, true);
})();

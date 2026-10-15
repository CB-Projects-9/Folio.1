// Export a trip in three steps: choose, preview, download or print (SPEC.md, export.html).
(async function () {
  var SLIDE_SECONDS = 4; // provisional, see DESIGN.md, Movement

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
  document.title = 'Folio · Export ' + trip.title;

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
  var timer = null;

  document.getElementById('export-view').hidden = false;
  document.getElementById('back-link').href = tripUrl;

  function layout() {
    return document.querySelector('input[name="layout"]:checked').value;
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
    document.querySelectorAll('[data-step]').forEach(function (li) {
      if (li.dataset.step === String(step)) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    if (step === 2) await buildPreview();
    if (step === 3) setFinal();
    if (quiet) return;
    var heading = document.querySelector('[data-panel="' + step + '"] h2');
    heading.tabIndex = -1;
    heading.focus();
  }

  document.querySelectorAll('[data-go]').forEach(function (b) {
    b.addEventListener('click', function () { go(Number(b.dataset.go)); });
  });

  // ---- Slideshow ----
  function buildSlideshow() {
    var box = document.createElement('div');
    box.className = 'slideshow';
    box.setAttribute('aria-roledescription', 'slideshow');
    photos.forEach(function (p, i) {
      var fig = document.createElement('figure');
      fig.className = 'slide' + (i === 0 ? ' on' : '');
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
      box.append(fig);
    });

    var controls = document.createElement('div');
    controls.className = 'slide-controls';
    var prev = makeBtn('Previous');
    var play = makeBtn('Play');
    var next = makeBtn('Next photo');
    var where = document.createElement('span');
    where.className = 'caption';
    where.setAttribute('aria-live', 'polite');
    controls.append(prev, play, next, where);

    var index = 0;
    function show(i) {
      index = (i + photos.length) % photos.length;
      box.querySelectorAll('.slide').forEach(function (s, k) { s.classList.toggle('on', k === index); });
      where.textContent = (index + 1) + ' of ' + photos.length;
    }
    prev.addEventListener('click', function () { show(index - 1); });
    next.addEventListener('click', function () { show(index + 1); });
    play.addEventListener('click', function () {
      if (timer) {
        stopShow();
      } else {
        timer = setInterval(function () { show(index + 1); }, SLIDE_SECONDS * 1000);
        play.textContent = 'Pause';
      }
    });
    stopShow = function () {
      clearInterval(timer);
      timer = null;
      play.textContent = 'Play';
    };
    show(0);
    preview.replaceChildren(box, controls);
  }

  function stopShow() {}

  function makeBtn(label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-secondary';
    b.textContent = label;
    return b;
  }

  // ---- Collage ----
  function wrapText(ctx, text, maxWidth) {
    var words = text.split(/\s+/);
    var lines = [];
    var line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines.slice(0, 2);
  }

  async function buildCollage() {
    if (collageBlob) return;
    try { await document.fonts.load('300 28px Poppins'); } catch (e) { /* fall back to system font */ }

    var W = 2400, pad = 100, gap = 70, mount = 18, capSize = 28, capLine = 40;
    var n = photos.length;
    var cols = n === 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
    var cellW = (W - pad * 2 - gap * (cols - 1)) / cols;
    var bitmaps = await Promise.all(photos.map(function (p) { return createImageBitmap(p.blob); }));

    var measure = document.createElement('canvas').getContext('2d');
    measure.font = '300 ' + capSize + 'px Poppins, sans-serif';

    // Work out each print's size and each row's height first.
    var items = photos.map(function (p, i) {
      var printW = cellW * p.size;
      var imgW = printW - mount * 2;
      var imgH = Math.min(imgW * (p.height / p.width), cellW * 1.2);
      imgW = imgH * (p.width / p.height);
      var lines = p.caption ? wrapText(measure, p.caption, cellW) : [];
      return { p: p, bmp: bitmaps[i], imgW: imgW, imgH: imgH, w: imgW + mount * 2, h: imgH + mount * 2, lines: lines };
    });
    var rows = [];
    for (var r = 0; r < n; r += cols) rows.push(items.slice(r, r + cols));
    var rowH = rows.map(function (row) {
      return Math.max.apply(null, row.map(function (it) {
        return it.h + (it.lines.length ? 24 + it.lines.length * capLine : 0);
      }));
    });
    var H = pad * 2 + rowH.reduce(function (a, b) { return a + b; }, 0) + gap * (rows.length - 1);

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = Math.round(H);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F6EFE3';
    ctx.fillRect(0, 0, W, H);

    var y = pad;
    rows.forEach(function (row, ri) {
      row.forEach(function (it, ci) {
        var cx = pad + ci * (cellW + gap) + cellW / 2;
        var cy = y + it.h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(it.p.rot * Math.PI / 180);
        ctx.shadowColor = 'rgba(59, 42, 33, 0.12)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = '#FBF7F0';
        ctx.fillRect(-it.w / 2, -it.h / 2, it.w, it.h);
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#D8C7AE';
        ctx.lineWidth = 2;
        ctx.strokeRect(-it.w / 2, -it.h / 2, it.w, it.h);
        ctx.drawImage(it.bmp, -it.imgW / 2, -it.imgH / 2, it.imgW, it.imgH);
        ctx.restore();

        if (it.lines.length) {
          ctx.fillStyle = '#6B5648';
          ctx.font = measure.font;
          ctx.textAlign = 'center';
          it.lines.forEach(function (line, li) {
            ctx.fillText(line, cx, y + it.h + 24 + capSize + li * capLine);
          });
        }
      });
      y += rowH[ri] + gap;
    });

    collageBlob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/jpeg', 0.9); });
    collageUrl = URL.createObjectURL(collageBlob);
  }

  async function buildPreview() {
    if (layout() === 'slideshow') {
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
      mainAction.textContent = 'Print slideshow';
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

  document.querySelectorAll('input[name="layout"]').forEach(function (r) {
    r.addEventListener('change', function () { preview.replaceChildren(); });
  });

  go(1, true);
})();

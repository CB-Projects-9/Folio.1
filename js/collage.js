// Lays out and draws a visitor's collage pages (DESIGN.md, Collage styles; SPEC.md, edit.html and preview.html).
// Three styles (Mosaic, Polaroid pile, Scrapbook), each with five layouts for Regenerate.
// Uses FolioVideo (js/video.js) for the palette, caption drawing and fonts, so captions match the video.
(function () {
  var DPI = 300;
  var SHORT = 8.5 * DPI, LONG = 11 * DPI; // 2550 x 3300
  var LAYOUTS = 5;
  var CREAM = '#F6EFE3', OFFWHITE = '#FBF7F0', SAND = '#E4D3BA', BORDER = '#D8C7AE', DARK = '#3B2A21', CLAY = '#C9A98A';
  var STYLES = [
    ['mosaic', 'Mosaic'],
    ['polaroid', 'Polaroid pile'],
    ['scrapbook', 'Scrapbook']
  ];
  // Text colours that would vanish on the light paper of the Polaroid pile and Scrapbook styles.
  var PAPER_UNREADABLE = ['cream', 'sand', 'clay'];

  function pageSize(orientation) {
    return orientation === 'landscape' ? { w: LONG, h: SHORT } : { w: SHORT, h: LONG };
  }

  // Fills in any missing collage choices with the starting values from SPEC.md. Returns trip.collage.
  function defaults(trip) {
    var c = trip.collage || {};
    c.style = c.style || 'mosaic';
    c.orientation = c.orientation || 'portrait';
    if (c.pages === undefined) c.pages = null; // null: enough pages for about 12 photos each
    c.caption = c.caption || {};
    c.caption.vertical = c.caption.vertical || 'bottom';
    c.caption.horizontal = c.caption.horizontal || 'center';
    c.caption.colour = c.caption.colour || 'cream';
    c.caption.style = c.caption.style || 'regular';
    c.caption.followTilt = Boolean(c.caption.followTilt);
    c.card = c.card || {};
    if (c.card.title === undefined) c.card.title = trip.title === 'Untitled trip' ? '' : trip.title;
    if (c.card.details === undefined) c.card.details = '';
    c.card.colour = c.card.colour || 'cream';
    c.card.place = c.card.place || 'first'; // 'first' | 'every' | 'page'
    c.card.page = c.card.page || 1;
    c.layout = c.layout || 0;
    trip.collage = c;
    return c;
  }

  // The caption colour actually used: dark brown instead of colours that would vanish on light paper.
  function captionStyleFor(collage) {
    var s = Object.assign({}, collage.caption);
    if (collage.style !== 'mosaic' && PAPER_UNREADABLE.indexOf(s.colour) >= 0) s.colour = 'dark brown';
    return s;
  }

  function pageCount(collage, photoCount) {
    var n = Number(collage.pages);
    if (Number.isInteger(n) && n >= 1 && n <= photoCount) return n;
    return Math.max(1, Math.ceil(photoCount / 12));
  }

  // Shares the photos out across the pages (SPEC.md, Sharing photos across pages).
  // The title card takes one spot on each page it is on; earlier pages get any extra.
  // Returns [{ card: bool, photos: [photo, ...] }, ...].
  function distribute(collage, photos) {
    var pages = pageCount(collage, photos.length);
    var cardOn = [];
    for (var p = 0; p < pages; p++) {
      var place = collage.card.place;
      cardOn.push(place === 'every' || (place === 'first' && p === 0) || (place === 'page' && p === Math.min(collage.card.page, pages) - 1));
    }
    var total = photos.length + cardOn.filter(Boolean).length;
    var base = Math.floor(total / pages), extra = total % pages;
    var out = [], next = 0;
    for (p = 0; p < pages; p++) {
      var spots = base + (p < extra ? 1 : 0);
      var count = Math.max(0, spots - (cardOn[p] ? 1 : 0));
      out.push({ card: cardOn[p], photos: photos.slice(next, next + count) });
      next += count;
    }
    // Any photos left over (only possible in unusual cases) go on the last page.
    if (next < photos.length) out[pages - 1].photos = out[pages - 1].photos.concat(photos.slice(next));
    return out;
  }

  // A small seeded random number source, so a layout looks the same every time it is drawn.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seedFor(collage, pageIndex) {
    return (collage.layout + 1) * 7919 + pageIndex * 104729 + collage.style.length * 31 + (collage.orientation === 'landscape' ? 17 : 0);
  }
  function between(r, lo, hi) { return lo + r() * (hi - lo); }

  // ---- Pieces shared by the styles ----

  function shadowed(ctx, blur, dy, draw) {
    ctx.save();
    ctx.shadowColor = 'rgba(59, 42, 33, 0.22)';
    ctx.shadowBlur = blur;
    ctx.shadowOffsetY = dy;
    draw();
    ctx.restore();
  }

  // Draws bitmap into rect, cropped from the centre to fill it.
  function drawCover(ctx, bitmap, x, y, w, h) {
    var s = Math.max(w / bitmap.width, h / bitmap.height);
    var sw = w / s, sh = h / s;
    ctx.drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, x, y, w, h);
  }

  // The title card's text, centred in rect: title in Lora caps, a short rule, details in Poppins light.
  function drawCardText(ctx, card, rect) {
    var light = card.colour === 'terracotta' || card.colour === 'dark brown';
    var ink = light ? CREAM : DARK;
    var title = (card.title || '').toUpperCase();
    var size = Math.round(Math.min(rect.w / 7, rect.h / 4));
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = ink;
    ctx.font = '500 ' + size + 'px Lora, serif';
    ctx.letterSpacing = Math.round(size * 0.18) + 'px';
    while (size > 12 && ctx.measureText(title).width > rect.w * 0.84) {
      size -= 2;
      ctx.font = '500 ' + size + 'px Lora, serif';
      ctx.letterSpacing = Math.round(size * 0.18) + 'px';
    }
    var cx = rect.x + rect.w / 2;
    var cy = rect.y + rect.h / 2;
    var detailsSize = Math.max(10, Math.round(size * 0.42));
    var hasDetails = Boolean(card.details);
    var titleY = hasDetails ? cy - size * 0.15 : cy + size * 0.35;
    if (title) ctx.fillText(title, cx + size * 0.09, titleY);
    ctx.letterSpacing = '0px';
    ctx.fillStyle = light ? CREAM : CLAY;
    ctx.fillRect(cx - size * 0.45, titleY + size * 0.4, size * 0.9, Math.max(2, size * 0.04));
    if (hasDetails) {
      ctx.fillStyle = ink;
      ctx.font = '300 ' + detailsSize + 'px Poppins, sans-serif';
      var lines = FolioVideo.wrap(ctx, card.details, rect.w * 0.84);
      lines.forEach(function (line, i) {
        ctx.fillText(line, cx, titleY + size * 0.4 + detailsSize * 1.6 + i * detailsSize * 1.35);
      });
    }
    ctx.restore();
  }

  function cardFill(card) { return FolioVideo.SWATCHES[card.colour] || OFFWHITE; }

  // A Polaroid centred on (0, 0) in the current transform: even border, deeper bottom strip with the caption.
  function drawPolaroid(ctx, pw, bitmap, caption, capStyle, card) {
    var b = pw * 0.06, strip = pw * 0.22;
    var photo = pw - 2 * b;
    var ph = b + photo + strip;
    shadowed(ctx, pw * 0.05, pw * 0.012, function () {
      ctx.fillStyle = card ? cardFill(card) : OFFWHITE;
      ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    });
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, pw * 0.003);
    ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
    if (card) {
      drawCardText(ctx, card, { x: -pw / 2 + b, y: -ph / 2 + b, w: photo, h: photo + strip - b });
      return;
    }
    drawCover(ctx, bitmap, -pw / 2 + b, -ph / 2 + b, photo, photo);
    if (caption) {
      var size = Math.round(strip * 0.3);
      var style = Object.assign({}, capStyle, { vertical: 'top', horizontal: 'center' });
      FolioVideo.drawCaption(ctx, caption, { x: -pw / 2, y: ph / 2 - strip + strip * 0.12, w: pw, h: strip }, style, size, b, false);
    }
  }

  // A scrapbook print centred on (0, 0): off-white border, thin outline, two strips of tape on opposite corners.
  function drawScrapPrint(ctx, w, h, bitmap, tapeFlip, card) {
    var b = Math.min(w, h) * 0.05;
    shadowed(ctx, Math.min(w, h) * 0.04, Math.min(w, h) * 0.01, function () {
      ctx.fillStyle = card ? cardFill(card) : OFFWHITE;
      ctx.fillRect(-w / 2, -h / 2, w, h);
    });
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.004);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    if (card) drawCardText(ctx, card, { x: -w / 2 + b, y: -h / 2 + b, w: w - 2 * b, h: h - 2 * b });
    else drawCover(ctx, bitmap, -w / 2 + b, -h / 2 + b, w - 2 * b, h - 2 * b);
    var tl = Math.min(w, h) * 0.3, tw = tl * 0.28;
    [[-1, -1], [1, 1]].forEach(function (corner) {
      var cx = corner[0] * (tapeFlip ? -1 : 1) * w / 2, cy = corner[1] * h / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((corner[0] * corner[1] * (tapeFlip ? -1 : 1)) * -Math.PI / 4);
      ctx.fillStyle = 'rgba(251, 247, 240, 0.7)';
      ctx.fillRect(-tl / 2, -tw / 2, tl, tw);
      ctx.restore();
    });
  }

  // ---- Mosaic ----
  // Places the title card and each photo on a grid of cells, then fills any holes by stretching neighbours.
  function planMosaic(shapes, cols, cardCell) {
    var grid = [], tiles = [];
    function at(r, c) { return grid[r] ? grid[r][c] : undefined; }
    function free(r, c) { return c >= 0 && c < cols && r >= 0 && at(r, c) === undefined; }
    function mark(t) {
      for (var r = t.r; r < t.r + t.h; r++) {
        grid[r] = grid[r] || [];
        for (var c = t.c; c < t.c + t.w; c++) grid[r][c] = t;
      }
    }
    function put(t, r, c, w, h) { t.r = r; t.c = c; t.w = w; t.h = h; tiles.push(t); mark(t); }
    if (cardCell) put({ card: true }, cardCell[0], cardCell[1], Math.min(2, cols), 1);
    shapes.forEach(function (shape, i) {
      var r = 0, c = 0;
      while (!free(r, c)) { c++; if (c >= cols) { c = 0; r++; } }
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
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) if (free(r, c) && fill(r, c)) changed = true;
    }
    return { cols: cols, rows: rows, tiles: tiles };
  }

  function drawMosaic(ctx, W, H, page, collage, bitmaps, r, capStyle) {
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, W, H);
    var n = page.photos.length;
    var cells = n + (page.card ? 2 : 0);
    var cols = Math.max(2, Math.min(5, Math.round(Math.sqrt(cells * W / H * 1.1))));
    // Each layout mixes sizes differently: portrait photos may go tall, landscape ones wide.
    var shapes = page.photos.map(function (p) {
      var pick = r();
      if (p.height > p.width * 1.15) return pick < 0.55 ? 'tall' : 'small';
      if (p.width > p.height * 1.15) return pick < 0.55 ? 'wide' : 'small';
      return pick < 0.2 ? 'tall' : pick < 0.4 ? 'wide' : 'small';
    });
    var estRows = Math.max(2, Math.ceil(cells / cols));
    var cardCell = page.card ? [Math.floor(r() * Math.max(1, estRows - 1)), Math.floor(r() * (cols - 1))] : null;
    var plan = planMosaic(shapes, cols, cardCell);
    var gap = Math.round(Math.min(W, H) * 0.012);
    var cellW = (W - gap * (plan.cols + 1)) / plan.cols;
    var rowH = (H - gap * (plan.rows + 1)) / plan.rows;
    plan.tiles.forEach(function (t) {
      var x = gap + t.c * (cellW + gap), y = gap + t.r * (rowH + gap);
      var w = t.w * cellW + (t.w - 1) * gap, h = t.h * rowH + (t.h - 1) * gap;
      if (t.card) {
        ctx.fillStyle = cardFill(collage.card);
        ctx.fillRect(x, y, w, h);
        drawCardText(ctx, collage.card, { x: x, y: y, w: w, h: h });
        return;
      }
      if (t.photo === undefined) return;
      var photo = page.photos[t.photo];
      drawCover(ctx, bitmaps[photo.id], x, y, w, h);
      if (photo.caption) {
        var size = Math.round(Math.max(24, Math.min(w, h) / 13));
        FolioVideo.drawCaption(ctx, photo.caption, { x: x, y: y, w: w, h: h }, capStyle, size, Math.round(size * 0.8), true);
      }
    });
  }

  // ---- Grid of loose spots, used by the Polaroid pile and Scrapbook ----
  // itemRatio: the typical width / height of what goes in each spot, so tall prints get narrower cells.
  // Returns one spot per item, in reading order: { cx, cy, cw, ch } (centre and cell size).
  function spots(count, W, H, inset, itemRatio) {
    var cols = Math.max(1, Math.min(count, Math.round(Math.sqrt(count * (W / H) / (itemRatio || 1)))));
    var rows = Math.ceil(count / cols);
    var out = [];
    var areaW = W - 2 * inset, areaH = H - 2 * inset;
    var cellH = areaH / rows;
    // Share the items evenly across the rows (earlier rows get any extra), so no row is left nearly empty.
    for (var rr = 0; rr < rows; rr++) {
      var inRow = Math.floor(count / rows) + (rr < count % rows ? 1 : 0);
      var cellW = areaW / inRow;
      for (var c = 0; c < inRow; c++) {
        out.push({ cx: inset + (c + 0.5) * cellW, cy: inset + (rr + 0.5) * cellH, cw: cellW, ch: cellH });
      }
    }
    return out;
  }

  // ---- Polaroid pile ----
  function drawPolaroidPile(ctx, W, H, page, collage, bitmaps, r, capStyle) {
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, W, H);
    var items = page.photos.map(function (p) { return { photo: p }; });
    var count = items.length + (page.card ? 1 : 0);
    var places = spots(count, W, H, -Math.min(W, H) * 0.03, 1 / 1.16);
    if (page.card) {
      // The card takes the spot closest to the middle of the page.
      var middle = 0, best = Infinity;
      places.forEach(function (p, i) {
        var dist = Math.hypot(p.cx - W / 2, p.cy - H / 2);
        if (dist < best) { best = dist; middle = i; }
      });
      items.splice(middle, 0, { card: true });
    }
    var drawn = items.map(function (item, i) {
      var s = places[i];
      var base = Math.min(s.cw, s.ch / 1.16);
      return {
        item: item,
        x: s.cx + between(r, -0.12, 0.12) * s.cw,
        y: s.cy + between(r, -0.1, 0.1) * s.ch,
        pw: base * (item.card ? 1.5 : between(r, 1.05, 1.3)),
        rot: between(r, -3, 3) * Math.PI / 180,
        z: item.card ? 2 : r()
      };
    });
    // The title card sits near the middle of the page, fully on it, on top of the pile.
    drawn.forEach(function (d) {
      if (!d.item.card) return;
      var half = d.pw * 0.62;
      d.x = Math.min(W - half, Math.max(half, W / 2 + between(r, -0.08, 0.08) * W));
      d.y = Math.min(H - half, Math.max(half, H / 2 + between(r, -0.08, 0.08) * H));
    });
    drawn.sort(function (a, b) { return a.z - b.z; });
    drawn.forEach(function (d) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      if (d.item.card) drawPolaroid(ctx, d.pw, null, null, capStyle, collage.card);
      else drawPolaroid(ctx, d.pw, bitmaps[d.item.photo.id], d.item.photo.caption, capStyle, null);
      ctx.restore();
    });
  }

  // ---- Scrapbook ----
  function drawScrapbook(ctx, W, H, page, collage, bitmaps, r, capStyle) {
    ctx.fillStyle = SAND;
    ctx.fillRect(0, 0, W, H);
    var items = page.photos.map(function (p) { return { photo: p }; });
    if (page.card) items.unshift({ card: true });
    var capSize = Math.round(Math.min(W, H) / 60);
    var ratios = page.photos.map(function (p) { return p.width / p.height; });
    var avgRatio = ratios.length ? ratios.reduce(function (a, b) { return a + b; }, 0) / ratios.length : 1;
    var places = spots(items.length, W, H, Math.min(W, H) * 0.03, avgRatio * 0.85);
    var drawn = items.map(function (item, i) {
      var s = places[i];
      var room = item.card ? 0 : capSize * 3.2; // space for the caption above or below
      var boxW = s.cw * between(r, 0.82, 0.95), boxH = (s.ch - room) * between(r, 0.82, 0.95);
      var w, h;
      if (item.card) { w = s.cw * 0.95; h = Math.min(s.ch * 0.9, w * 0.62); }
      else {
        var ratio = item.photo.width / item.photo.height;
        w = Math.min(boxW, boxH * ratio);
        h = w / ratio;
      }
      return {
        item: item,
        w: w,
        h: h,
        x: s.cx + between(r, -0.05, 0.05) * s.cw,
        y: s.cy + between(r, -0.05, 0.05) * s.ch,
        rot: between(r, -3, 3) * Math.PI / 180,
        tapeFlip: r() < 0.5,
        z: item.card ? 2 : r()
      };
    });
    drawn.sort(function (a, b) { return a.z - b.z; });
    drawn.forEach(function (d) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      if (d.item.card) drawScrapPrint(ctx, d.w, d.h, null, d.tapeFlip, collage.card);
      else drawScrapPrint(ctx, d.w, d.h, bitmaps[d.item.photo.id], d.tapeFlip, null);
      if (!collage.caption.followTilt) ctx.rotate(-d.rot);
      var caption = d.item.photo && d.item.photo.caption;
      if (caption) {
        // Above or below the print, on the page: a rect just outside the print's top or bottom edge.
        var above = capStyle.vertical === 'top';
        var rectH = capSize * 3;
        var rect = { x: -d.w / 2, y: above ? -d.h / 2 - rectH - capSize * 0.3 : d.h / 2 + capSize * 0.3, w: d.w, h: rectH };
        var style = Object.assign({}, capStyle, { vertical: above ? 'bottom' : 'top' });
        FolioVideo.drawCaption(ctx, caption, rect, style, capSize, 0, false);
      }
      ctx.restore();
    });
  }

  var DRAW = { mosaic: drawMosaic, polaroid: drawPolaroidPile, scrapbook: drawScrapbook };

  // Draws one page at scale (1 = full print size) and returns its canvas.
  function drawPage(page, pageIndex, collage, bitmaps, scale) {
    var size = pageSize(collage.orientation);
    var canvas = document.createElement('canvas');
    canvas.width = Math.round(size.w * scale);
    canvas.height = Math.round(size.h * scale);
    var ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    DRAW[collage.style](ctx, size.w, size.h, page, collage, bitmaps, rng(seedFor(collage, pageIndex)), captionStyleFor(collage));
    return canvas;
  }

  async function bitmapsFor(photos) {
    var out = {};
    await Promise.all(photos.map(async function (p) { out[p.id] = await createImageBitmap(p.blob); }));
    return out;
  }

  // Makes every page at the given scale (1 = print size), one at a time, so only one
  // full-size page is held at once. onPage(canvas, index, count) receives each page as it is made.
  async function makePages(trip, photos, scale, onPage) {
    var collage = trip.collage;
    await FolioVideo.fontsReady();
    var bitmaps = await bitmapsFor(photos);
    var pages = distribute(collage, photos);
    for (var i = 0; i < pages.length; i++) {
      await onPage(drawPage(pages[i], i, collage, bitmaps, scale), i, pages.length);
      await new Promise(function (res) { setTimeout(res, 0); });
    }
    Object.keys(bitmaps).forEach(function (k) { bitmaps[k].close(); });
  }

  // ---- Samples for the Edits page ----

  // One photo (or print) with an example caption in the chosen style, on a 16:9 canvas.
  function drawCaptionSample(canvas, collage, bitmap, caption) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var capStyle = captionStyleFor(collage);
    if (collage.style === 'mosaic') {
      FolioVideo.drawPhoto(ctx, bitmap, caption, capStyle);
      return;
    }
    ctx.save();
    if (collage.style === 'polaroid') {
      ctx.fillStyle = CREAM;
      ctx.fillRect(0, 0, W, H);
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-1.5 * Math.PI / 180);
      drawPolaroid(ctx, H * 0.72, bitmap, caption, capStyle, null);
    } else {
      ctx.fillStyle = SAND;
      ctx.fillRect(0, 0, W, H);
      var capSize = Math.round(H / 18);
      var ratio = bitmap.width / bitmap.height;
      var h = H * 0.6, w = h * ratio;
      if (w > W * 0.6) { w = W * 0.6; h = w / ratio; }
      var rot = -2 * Math.PI / 180;
      ctx.translate(W / 2, H / 2);
      ctx.rotate(rot);
      drawScrapPrint(ctx, w, h, bitmap, false, null);
      if (!collage.caption.followTilt) ctx.rotate(-rot);
      var above = capStyle.vertical === 'top';
      var rect = { x: -w / 2, y: above ? -h / 2 - capSize * 3.3 : h / 2 + capSize * 0.3, w: w, h: capSize * 3 };
      FolioVideo.drawCaption(ctx, caption, rect, Object.assign({}, capStyle, { vertical: above ? 'bottom' : 'top' }), capSize, 0, false);
    }
    ctx.restore();
  }

  // The title card on its own, filling the canvas, in the chosen style's look.
  function drawCardSample(canvas, collage) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.fillStyle = collage.style === 'scrapbook' ? SAND : CREAM;
    ctx.fillRect(0, 0, W, H);
    var w = W * 0.7, h = H * 0.62;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.fillStyle = cardFill(collage.card);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    drawCardText(ctx, collage.card, { x: -w / 2, y: -h / 2, w: w, h: h });
    ctx.restore();
  }

  // A small first page of the trip in a given style (for the style tiles).
  async function stylePreview(trip, photos, styleName, scale) {
    var collage = Object.assign({}, trip.collage, { style: styleName, layout: 0 });
    var bitmaps = await bitmapsFor(photos);
    await FolioVideo.fontsReady();
    var page = distribute(collage, photos)[0];
    var canvas = drawPage(page, 0, collage, bitmaps, scale);
    Object.keys(bitmaps).forEach(function (k) { bitmaps[k].close(); });
    return canvas;
  }

  window.FolioCollage = {
    STYLES: STYLES,
    LAYOUTS: LAYOUTS,
    PAPER_UNREADABLE: PAPER_UNREADABLE,
    pageSize: pageSize,
    defaults: defaults,
    pageCount: pageCount,
    distribute: distribute,
    makePages: makePages,
    drawCaptionSample: drawCaptionSample,
    drawCardSample: drawCardSample,
    stylePreview: stylePreview
  };
})();

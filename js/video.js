// Makes a trip's video in the browser (SPEC.md, preview.html), and draws the same frames
// for the live samples on the Edits page, so what the visitor sees there matches the video.
(function () {
  var W = 1280, H = 720, FPS = 30;
  var MUXER_URL = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/+esm';

  var SWATCHES = {
    'cream': '#F6EFE3',
    'sand': '#E4D3BA',
    'clay': '#C9A98A',
    'terracotta': '#A24B30',
    'dark brown': '#3B2A21'
  };
  var DARK = '#3B2A21';
  var CREAM = '#F6EFE3';
  function isLightText(colourName) { return colourName === 'terracotta' || colourName === 'dark brown'; }

  // Fills in any missing choices with the starting values from SPEC.md. Returns trip.video.
  function defaults(trip, photoIds) {
    var v = trip.video || {};
    v.cover = v.cover || {};
    if (v.cover.title === undefined) v.cover.title = trip.title === 'Untitled trip' ? '' : trip.title;
    if (v.cover.details === undefined) v.cover.details = '';
    var bg = v.cover.background;
    if (!bg || (bg.type === 'photo' && photoIds.indexOf(bg.value) < 0)) v.cover.background = { type: 'swatch', value: 'cream' };
    v.caption = v.caption || {};
    v.caption.vertical = v.caption.vertical || 'bottom';
    v.caption.horizontal = v.caption.horizontal || 'center';
    v.caption.colour = v.caption.colour || 'cream';
    v.caption.style = v.caption.style || 'regular';
    v.duration = v.duration || 2.5;
    v.transition = v.transition || 'dissolve';
    trip.video = v;
    return v;
  }

  function fontsReady() {
    return Promise.all([
      '500 64px Lora', '300 30px Poppins', '400 36px Poppins', '700 36px Poppins', 'italic 400 36px Poppins'
    ].map(function (f) { return document.fonts.load(f).catch(function () {}); }));
  }

  // Up to two lines that fit maxWidth; the second is shortened with "…" if needed.
  function wrap(ctx, text, maxWidth) {
    var words = text.split(/\s+/);
    var lines = [''];
    words.forEach(function (w) {
      var last = lines.length - 1;
      var test = lines[last] ? lines[last] + ' ' + w : w;
      if (ctx.measureText(test).width <= maxWidth || !lines[last]) lines[last] = test;
      else lines.push(w);
    });
    if (lines.length > 2) {
      var second = lines.slice(1).join(' ');
      while (second.length > 1 && ctx.measureText(second + '…').width > maxWidth) second = second.slice(0, -1);
      lines = [lines[0], second.trim() + '…'];
    }
    return lines;
  }

  // A photo fitted whole on cream, with its caption laid over it in the chosen style.
  function drawPhoto(ctx, bitmap, caption, style) {
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, W, H);
    var s = Math.min(W / bitmap.width, H / bitmap.height);
    var w = bitmap.width * s, h = bitmap.height * s;
    var x = (W - w) / 2, y = (H - h) / 2;
    ctx.drawImage(bitmap, x, y, w, h);
    if (caption) drawCaption(ctx, caption, { x: x, y: y, w: w, h: h }, style, Math.round(H / 20), Math.round(H / 30), true);
  }

  // A caption inside rect (DESIGN.md, The Edits page): placed by style.vertical and style.horizontal,
  // in the visitor's colour and Regular, Bold or Italic Poppins, at most two lines.
  // shadow: a soft shadow behind the letters, for captions laid over photos.
  function drawCaption(ctx, caption, rect, style, size, inset, shadow) {
    var weight = style.style === 'bold' ? '700' : '400';
    var italic = style.style === 'italic' ? 'italic ' : '';
    ctx.save();
    ctx.font = italic + weight + ' ' + size + 'px Poppins, sans-serif';
    var lines = wrap(ctx, caption, rect.w - inset * 2);
    var lineH = Math.round(size * 1.3);
    var x = rect.x, y = rect.y, w = rect.w, h = rect.h;
    var tx = style.horizontal === 'left' ? x + inset : style.horizontal === 'right' ? x + w - inset : x + w / 2;
    ctx.textAlign = style.horizontal === 'left' ? 'left' : style.horizontal === 'right' ? 'right' : 'center';
    var firstBaseline = style.vertical === 'top'
      ? y + inset + size
      : y + h - inset - (lines.length - 1) * lineH - Math.round(size * 0.25);
    ctx.fillStyle = SWATCHES[style.colour] || CREAM;
    if (shadow) {
      ctx.shadowColor = isLightText(style.colour) ? 'rgba(246, 239, 227, 0.85)' : 'rgba(59, 42, 33, 0.5)';
      ctx.shadowBlur = Math.round(size * 0.35);
    }
    lines.forEach(function (line, i) { ctx.fillText(line, tx, firstBaseline + i * lineH); });
    ctx.restore();
  }

  // The cover: a swatch or a photo (filling the frame, with a soft dark wash), title and details centred.
  function drawCover(ctx, cover, bitmap) {
    var bg = cover.background;
    var light;
    if (bg.type === 'photo' && bitmap) {
      var s = Math.max(W / bitmap.width, H / bitmap.height);
      var sw = W / s, sh = H / s;
      ctx.drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, 0, 0, W, H);
      ctx.fillStyle = 'rgba(59, 42, 33, 0.45)';
      ctx.fillRect(0, 0, W, H);
      light = true;
    } else {
      ctx.fillStyle = SWATCHES[bg.value] || CREAM;
      ctx.fillRect(0, 0, W, H);
      light = isLightText(bg.value);
    }
    ctx.save();
    ctx.fillStyle = light ? CREAM : DARK;
    ctx.textAlign = 'center';
    var title = (cover.title || '').toUpperCase();
    var size = 64;
    ctx.font = '500 ' + size + 'px Lora, serif';
    ctx.letterSpacing = '8px';
    while (size > 28 && ctx.measureText(title).width > W * 0.84) {
      size -= 4;
      ctx.font = '500 ' + size + 'px Lora, serif';
    }
    var hasDetails = Boolean(cover.details);
    var titleY = H / 2 + (hasDetails ? -8 : size * 0.35);
    // Letter spacing adds space after the last letter too, so nudge right by half of it.
    if (title) ctx.fillText(title, W / 2 + 4, titleY);
    ctx.letterSpacing = '0px';
    if (hasDetails) {
      ctx.font = '300 30px Poppins, sans-serif';
      ctx.fillText(cover.details, W / 2, titleY + 56);
    }
    ctx.restore();
  }

  function frameCanvas() {
    return typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
  }

  async function pickCodec() {
    if (typeof VideoEncoder === 'undefined') return null;
    var codecs = ['avc1.4d0028', 'avc1.42e01f', 'avc1.640028', 'avc1.42001f'];
    for (var i = 0; i < codecs.length; i++) {
      try {
        var r = await VideoEncoder.isConfigSupported({ codec: codecs[i], width: W, height: H, bitrate: 3000000, framerate: FPS });
        if (r.supported) return codecs[i];
      } catch (e) { /* try the next one */ }
    }
    return null;
  }

  // Resolves to an MP4 Blob. onProgress(0..1) is called as frames are made.
  async function make(trip, photos, onProgress) {
    var codec = await pickCodec();
    if (!codec) throw new Error('unsupported');
    var muxerLib = await import(MUXER_URL);
    await fontsReady();

    var video = trip.video;
    var caption = video.caption;
    var bitmaps = {};
    async function bitmapFor(photo) {
      if (!bitmaps[photo.id]) bitmaps[photo.id] = await createImageBitmap(photo.blob);
      return bitmaps[photo.id];
    }
    var coverPhoto = video.cover.background.type === 'photo'
      ? photos.find(function (p) { return p.id === video.cover.background.value; }) : null;

    // Slot 0 is the cover; slots 1..n are the photos. Only two slot frames are kept at a time.
    var slots = photos.length + 1;
    var cache = {};
    async function slotFrame(i) {
      if (cache[i]) return cache[i];
      var c = frameCanvas();
      var ctx = c.getContext('2d');
      if (i === 0) drawCover(ctx, video.cover, coverPhoto ? await bitmapFor(coverPhoto) : null);
      else drawPhoto(ctx, await bitmapFor(photos[i - 1]), photos[i - 1].caption, caption);
      Object.keys(cache).forEach(function (k) { if (Number(k) < i - 1) delete cache[k]; });
      cache[i] = c;
      return c;
    }

    var d = video.duration;
    var T = video.transition === 'cut' ? 0 : Math.min(0.8, d * 0.4);
    var total = Math.round(slots * d * FPS);

    var target = new muxerLib.ArrayBufferTarget();
    var muxer = new muxerLib.Muxer({ target: target, video: { codec: 'avc', width: W, height: H }, fastStart: 'in-memory' });
    var failure = null;
    var encoder = new VideoEncoder({
      output: function (chunk, meta) { muxer.addVideoChunk(chunk, meta); },
      error: function (e) { failure = e; }
    });
    encoder.configure({ codec: codec, width: W, height: H, bitrate: 3000000, framerate: FPS });

    var out = frameCanvas();
    var ctx = out.getContext('2d');
    for (var f = 0; f < total; f++) {
      if (failure) throw failure;
      var t = f / FPS;
      var i = Math.min(slots - 1, Math.floor(t / d));
      var local = t - i * d;
      var a = await slotFrame(i);
      if (T > 0 && i < slots - 1 && local > d - T) {
        var p = (local - (d - T)) / T;
        p = p * p * (3 - 2 * p); // ease in and out
        var b = await slotFrame(i + 1);
        if (video.transition === 'slide') {
          ctx.drawImage(a, -p * W, 0);
          ctx.drawImage(b, W - p * W, 0);
        } else {
          ctx.globalAlpha = 1;
          ctx.drawImage(a, 0, 0);
          ctx.globalAlpha = p;
          ctx.drawImage(b, 0, 0);
          ctx.globalAlpha = 1;
        }
      } else {
        ctx.drawImage(a, 0, 0);
      }
      var vf = new VideoFrame(out, { timestamp: Math.round(f * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
      encoder.encode(vf, { keyFrame: f % (FPS * 2) === 0 });
      vf.close();
      while (encoder.encodeQueueSize > 8) await new Promise(function (r) { setTimeout(r, 5); });
      if (f % 15 === 0) {
        if (onProgress) onProgress(f / total);
        await new Promise(function (r) { setTimeout(r, 0); });
      }
    }
    await encoder.flush();
    if (failure) throw failure;
    muxer.finalize();
    Object.keys(bitmaps).forEach(function (k) { bitmaps[k].close(); });
    if (onProgress) onProgress(1);
    return new Blob([target.buffer], { type: 'video/mp4' });
  }

  window.FolioVideo = {
    SWATCHES: SWATCHES,
    defaults: defaults,
    fontsReady: fontsReady,
    drawPhoto: drawPhoto,
    drawCaption: drawCaption,
    wrap: wrap,
    drawCover: drawCover,
    make: make
  };
})();

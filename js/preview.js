// Step 4: Preview (SPEC.md, preview.html). Makes the video, plays it, and saves it as an MP4.
(async function () {
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

  document.title = 'Folio · Preview ' + trip.title;
  document.getElementById('trip-name').textContent = trip.title;
  document.getElementById('step-view').hidden = false;
  renderSteps('preview', trip, 'edit.html?id=' + id);

  if (trip.media === 'collage') {
    await collagePreview(trip);
    return;
  }
  document.getElementById('video-preview').hidden = false;

  var video = document.getElementById('video');
  var status = document.getElementById('player-status');
  var play = document.getElementById('play');
  var scrubber = document.getElementById('scrubber');
  var time = document.getElementById('time');
  var exportBtn = document.getElementById('export');
  var exportError = document.getElementById('export-error');

  var photos = await FolioStore.photosFor(trip);
  FolioVideo.defaults(trip, trip.photoIds);

  var blob;
  try {
    blob = await FolioVideo.make(trip, photos, function (p) {
      status.textContent = 'Making your video… ' + Math.round(p * 100) + '%';
    });
  } catch (err) {
    status.textContent = err.message === 'unsupported'
      ? 'This browser cannot make videos. Please try the latest Chrome, Edge, Safari or Firefox.'
      : 'Something went wrong while making your video. Please go back and try again.';
    return;
  }

  // ---- Player: play/pause, a progress bar to drag, and the time (DESIGN.md, The Preview page) ----
  function clock(seconds) {
    var s = Math.max(0, Math.round(seconds || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function showTime() {
    time.textContent = clock(video.currentTime) + ' / ' + clock(video.duration);
    if (!scrubbing) scrubber.value = video.currentTime;
  }
  function showPlaying() {
    var playing = !video.paused && !video.ended;
    play.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
    play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  var scrubbing = false;
  video.src = URL.createObjectURL(blob);
  video.addEventListener('loadedmetadata', function () {
    status.hidden = true;
    scrubber.max = video.duration;
    play.disabled = false;
    scrubber.disabled = false;
    exportBtn.disabled = false;
    showTime();
  });
  video.addEventListener('timeupdate', showTime);
  video.addEventListener('play', showPlaying);
  video.addEventListener('pause', showPlaying);
  video.addEventListener('ended', showPlaying);

  play.addEventListener('click', function () {
    if (video.paused || video.ended) video.play();
    else video.pause();
  });
  scrubber.addEventListener('input', function () {
    scrubbing = true;
    video.currentTime = Number(scrubber.value);
    time.textContent = clock(video.currentTime) + ' / ' + clock(video.duration);
  });
  scrubber.addEventListener('change', function () { scrubbing = false; });

  // ---- Export: save the MP4 (SPEC.md, preview.html) ----
  var fileName = (trip.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trip') + '.mp4';
  var file = new File([blob], fileName, { type: 'video/mp4' });
  var isPhone = window.matchMedia('(pointer: coarse)').matches;

  function downloadLink() {
    var a = document.createElement('a');
    a.href = video.src;
    a.download = fileName;
    document.body.append(a);
    a.click();
    a.remove();
  }

  exportBtn.addEventListener('click', async function () {
    exportError.hidden = true;
    try {
      if (isPhone && navigator.canShare && navigator.canShare({ files: [file] })) {
        // The phone's share sheet: save to photos, Google Photos, or another app.
        await navigator.share({ files: [file], title: trip.title });
      } else if (window.showSaveFilePicker) {
        // The computer's save window, so the visitor chooses where the file goes.
        var handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'MP4 video', accept: { 'video/mp4': ['.mp4'] } }]
        });
        var writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        downloadLink();
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return; // the visitor closed the window
      exportError.textContent = 'The video could not be saved. Please try again.';
      exportError.hidden = false;
    }
  });
})();

// ---- Collage preview (SPEC.md, preview.html: For a collage) ----
// Shows the pages two at a time (one on phones), Regenerate cycles five layouts,
// Export saves a PDF, or one JPEG or PNG per page.
async function collagePreview(trip) {
  var FORMATS = [['pdf', 'PDF'], ['jpeg', 'JPEG'], ['png', 'PNG']];
  var view = document.getElementById('collage-preview');
  var spread = document.getElementById('spread');
  var status = document.getElementById('collage-status');
  var pager = document.getElementById('pager');
  var prev = document.getElementById('prev-pages');
  var next = document.getElementById('next-pages');
  var pagesLabel = document.getElementById('pages-label');
  var regenerate = document.getElementById('regenerate');
  var layoutLabel = document.getElementById('layout-label');
  var formatBox = document.getElementById('formats');
  var exportBtn = document.getElementById('collage-export');
  var exportError = document.getElementById('collage-export-error');
  view.hidden = false;

  var collage = FolioCollage.defaults(trip);
  var photos = await FolioStore.photosFor(trip);
  var base = trip.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trip';
  var isPhone = window.matchMedia('(pointer: coarse)').matches;
  var wide = window.matchMedia('(min-width: 640px)');
  var format = 'pdf';
  var pages = []; // [{ jpeg: Blob, url, width, height }]
  var ready = {}; // format -> [File], made ahead so Export can open the save window straight away
  var first = 0;

  function perView() { return wide.matches ? 2 : 1; }

  function showPages() {
    var count = perView();
    if (first >= pages.length) first = Math.max(0, pages.length - count);
    spread.replaceChildren();
    pages.slice(first, first + count).forEach(function (p, i) {
      var img = document.createElement('img');
      img.src = p.url;
      img.alt = 'Page ' + (first + i + 1) + ' of ' + pages.length + ' of the collage for ' + trip.title;
      img.className = 'page-img';
      spread.append(img);
    });
    spread.classList.toggle('two', count === 2 && pages.length > 1);
    pager.hidden = pages.length <= count;
    var last = Math.min(first + count, pages.length);
    pagesLabel.textContent = last === first + 1
      ? 'Page ' + (first + 1) + ' of ' + pages.length
      : 'Pages ' + (first + 1) + '–' + last + ' of ' + pages.length;
    prev.disabled = first === 0;
    next.disabled = last >= pages.length;
  }
  prev.addEventListener('click', function () { first = Math.max(0, first - perView()); showPages(); });
  next.addEventListener('click', function () { first = Math.min(pages.length - 1, first + perView()); showPages(); });
  wide.addEventListener('change', showPages);

  function fileName(ext, i) {
    return pages.length === 1 ? base + '.' + ext : base + '-' + (i + 1) + '.' + ext;
  }

  // Makes the pages at print size. Each page is turned into a JPEG straight away.
  async function build() {
    exportBtn.disabled = true;
    regenerate.disabled = true;
    status.hidden = false;
    status.textContent = 'Making your collage…';
    pages.forEach(function (p) { URL.revokeObjectURL(p.url); });
    pages = [];
    ready = {};
    await FolioCollage.makePages(trip, photos, 1, async function (canvas, i, count) {
      status.textContent = 'Making your collage… page ' + (i + 1) + ' of ' + count;
      var jpeg = await new Promise(function (r) { canvas.toBlob(r, 'image/jpeg', 0.92); });
      pages.push({ jpeg: jpeg, url: URL.createObjectURL(jpeg), width: canvas.width, height: canvas.height });
      canvas.width = canvas.height = 0;
    });
    status.hidden = true;
    layoutLabel.textContent = 'Layout ' + (collage.layout + 1) + ' of ' + FolioCollage.LAYOUTS;
    showPages();
    regenerate.disabled = false;
    await prepare(format);
  }

  // Gets the files for a format ready before Export is pressed.
  async function prepare(f) {
    exportBtn.disabled = true;
    if (!ready[f]) {
      if (f === 'jpeg') {
        ready.jpeg = pages.map(function (p, i) { return new File([p.jpeg], fileName('jpg', i), { type: 'image/jpeg' }); });
      } else if (f === 'pdf') {
        var size = collage.orientation === 'landscape' ? [792, 612] : [612, 792];
        var pdf = await FolioPDF.make(pages, size[0], size[1]);
        ready.pdf = [new File([pdf], base + '.pdf', { type: 'application/pdf' })];
      } else {
        status.hidden = false;
        var pngs = [];
        await FolioCollage.makePages(trip, photos, 1, async function (canvas, i, count) {
          status.textContent = 'Getting PNG files ready… ' + (i + 1) + ' of ' + count;
          var png = await new Promise(function (r) { canvas.toBlob(r, 'image/png'); });
          pngs.push(new File([png], fileName('png', i), { type: 'image/png' }));
          canvas.width = canvas.height = 0;
        });
        status.hidden = true;
        ready.png = pngs;
      }
    }
    if (f === format) exportBtn.disabled = false;
  }

  // Format choice: PDF, JPEG or PNG.
  FORMATS.forEach(function (fm) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'option';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(fm[0] === format));
    b.textContent = fm[1];
    b.dataset.value = fm[0];
    b.addEventListener('click', function () {
      format = fm[0];
      formatBox.querySelectorAll('.option').forEach(function (o) { o.setAttribute('aria-checked', String(o === b)); });
      if (pages.length) prepare(format);
    });
    formatBox.append(b);
  });

  regenerate.addEventListener('click', async function () {
    collage.layout = (collage.layout + 1) % FolioCollage.LAYOUTS;
    await FolioStore.saveTrip(trip);
    await build();
  });

  function download(file) {
    var url = URL.createObjectURL(file);
    var a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  // Saves the prepared files: share sheet on phones, a save window or folder on computers, else Downloads.
  exportBtn.addEventListener('click', async function () {
    var files = ready[format];
    if (!files) return;
    exportError.hidden = true;
    try {
      if (isPhone && navigator.canShare && navigator.canShare({ files: files })) {
        await navigator.share({ files: files, title: trip.title });
      } else if (files.length === 1 && window.showSaveFilePicker) {
        var ext = files[0].name.split('.').pop();
        var accept = {};
        accept[files[0].type] = ['.' + ext];
        var handle = await window.showSaveFilePicker({
          suggestedName: files[0].name,
          types: [{ description: format.toUpperCase() + ' file', accept: accept }]
        });
        var writable = await handle.createWritable();
        await writable.write(files[0]);
        await writable.close();
      } else if (files.length > 1 && window.showDirectoryPicker) {
        var folder = await window.showDirectoryPicker({ mode: 'readwrite' });
        for (var i = 0; i < files.length; i++) {
          var fh = await folder.getFileHandle(files[i].name, { create: true });
          var w = await fh.createWritable();
          await w.write(files[i]);
          await w.close();
        }
      } else {
        for (var k = 0; k < files.length; k++) {
          download(files[k]);
          await new Promise(function (r) { setTimeout(r, 400); });
        }
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return; // the save window was closed
      exportError.textContent = 'The collage could not be saved. Please try again.';
      exportError.hidden = false;
    }
  });

  await build();
}

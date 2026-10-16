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
    document.getElementById('collage-soon').hidden = false;
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

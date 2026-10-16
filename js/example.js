// View-only example trip: a collage image or a slideshow video (SPEC.md, example.html).
Folio.ready.then(function () {
  var id = new URLSearchParams(location.search).get('trip');
  var example = FOLIO_EXAMPLES.find(function (e) { return e.id === id; });
  if (!example) {
    document.getElementById('not-found').hidden = false;
    return;
  }

  document.title = 'Folio · ' + example.title + ' example';
  document.getElementById('example-title').textContent = example.title;
  document.getElementById('example-line').textContent = example.line;
  document.getElementById('example-view').hidden = false;

  if (example.layout === 'video') {
    // Never plays on its own: the visitor presses play (DESIGN.md, Never rules).
    var box = document.getElementById('example-video');
    var video = document.createElement('video');
    video.src = example.video;
    video.poster = exampleImage(example, example.cover);
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    video.setAttribute('aria-label', example.videoLabel);
    box.append(video);
    box.hidden = false;
    return;
  }

  // Collage: one image, the same one used as the trip's tile cover.
  var fig = document.getElementById('example-collage');
  fig.classList.toggle('collage-tall', Boolean(example.collageTall));
  var collage = document.createElement('img');
  collage.src = example.collage;
  collage.alt = example.collageAlt;
  fig.append(collage);
  fig.hidden = false;
});

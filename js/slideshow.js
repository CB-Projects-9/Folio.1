// A slideshow with a slow cross-fade (DESIGN.md, Movement). Used by export.html and example.html.
// It never starts on its own: the visitor presses Play.
// slides: [{ src, alt, caption }]. Returns { stop } so a page can pause it when leaving the view.
window.SLIDE_SECONDS = 4; // provisional, see DESIGN.md, Movement

window.makeSlideshow = function (container, slides) {
  var timer = null;
  var index = 0;

  var box = document.createElement('div');
  box.className = 'slideshow';
  box.setAttribute('aria-roledescription', 'slideshow');
  slides.forEach(function (s, i) {
    var fig = document.createElement('figure');
    fig.className = 'slide' + (i === 0 ? ' on' : '');
    var img = document.createElement('img');
    img.src = s.src;
    img.alt = s.alt;
    fig.append(img);
    if (s.caption) {
      var cap = document.createElement('figcaption');
      cap.className = 'caption';
      cap.textContent = s.caption;
      fig.append(cap);
    }
    box.append(fig);
  });

  function button(label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-secondary';
    b.textContent = label;
    return b;
  }

  var controls = document.createElement('div');
  controls.className = 'slide-controls';
  var prev = button('Previous');
  var play = button('Play');
  var next = button('Next photo');
  var where = document.createElement('span');
  where.className = 'caption';
  where.setAttribute('aria-live', 'polite');
  controls.append(prev, play, next, where);

  function show(i) {
    index = (i + slides.length) % slides.length;
    box.querySelectorAll('.slide').forEach(function (s, k) { s.classList.toggle('on', k === index); });
    where.textContent = (index + 1) + ' of ' + slides.length;
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    play.textContent = 'Play';
  }

  prev.addEventListener('click', function () { show(index - 1); });
  next.addEventListener('click', function () { show(index + 1); });
  play.addEventListener('click', function () {
    if (timer) {
      stop();
    } else {
      timer = setInterval(function () { show(index + 1); }, SLIDE_SECONDS * 1000);
      play.textContent = 'Pause';
    }
  });

  show(0);
  container.replaceChildren(box, controls);
  return { stop: stop };
};

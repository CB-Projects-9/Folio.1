// Built-in, view-only example trips made from the owner's photos (SPEC.md, Example trips).
// They are the same for every visitor and are never stored in the browser.
window.FOLIO_EXAMPLES = [
  {
    id: 'japan',
    title: 'Japan',
    layout: 'collage',
    // The same collage as the home page, so the tile, the home page and the example all match.
    collage: 'images/welcome-collage.jpg',
    collageAlt: 'A collage of the Japan trip: six photos around a panel reading Japan, including a golden temple among pine trees, a glass tower under storm clouds, a street lit with neon signs and a room full of glowing lanterns.'
  },
  {
    id: 'mexico',
    title: 'Mexico',
    layout: 'video',
    cover: 'IMG_3522',
    // Made once from these photos: 2.5 seconds each, dissolving into the next (DESIGN.md, Movement).
    video: 'images/mexico-slideshow.mp4',
    videoLabel: 'Video of the Mexico trip: eight photos, 2.5 seconds each, including a river beach, a church dome over red rooftops, a sunset over the sea and a rainbow over palm trees. No sound.'
  },
  {
    id: 'oregon',
    title: 'Oregon',
    layout: 'collage',
    // A pile of overlapping prints around a centred title card (DESIGN.md, Pile-of-prints collage).
    collage: 'images/oregon-collage.jpg',
    collageTall: true,
    collageAlt: 'A collage of the Oregon trip: seven overlapping photo prints around a centred card reading Oregon, 2026, These were real mountains. The photos include a snowy mountain, a lake between forested hills, a road through the mountains and a sunset over the water.'
  }
];

window.exampleImage = function (example, name) {
  return 'images/' + example.id + '/' + name + '.jpg';
};

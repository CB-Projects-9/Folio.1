// Built-in, view-only example trips made from the owner's photos (SPEC.md, Example trips).
// They are the same for every visitor and are never stored in the browser.
window.FOLIO_EXAMPLES = [
  {
    id: 'japan',
    title: 'Japan',
    layout: 'collage',
    photos: ['IMG_5574', 'IMG_4809', 'IMG_6613', 'IMG_5208', 'IMG_6569', 'IMG_5997'],
    // The same collage as the home page, so the tile, the home page and the example all match.
    collage: 'images/welcome-collage.jpg',
    collageAlt: 'A collage of the Japan trip: six photos around a panel reading Japan, including a golden temple among pine trees, a glass tower under storm clouds, a street lit with neon signs and a room full of glowing lanterns.'
  },
  {
    id: 'mexico',
    title: 'Mexico',
    layout: 'video',
    photos: ['IMG_3210', 'IMG_3487', 'IMG_3507', 'IMG_3522', 'IMG_3533', 'IMG_3540', 'IMG_3563', 'IMG_3577'],
    cover: 'IMG_3522',
    // Made once from these photos: 2.5 seconds each, dissolving into the next (DESIGN.md, Movement).
    video: 'images/mexico-slideshow.mp4',
    videoLabel: 'Slideshow video of the Mexico trip: eight photos, 2.5 seconds each, including a river beach, a church dome over red rooftops, a sunset over the sea and a rainbow over palm trees. No sound.'
  },
  {
    id: 'oregon',
    title: 'Oregon',
    layout: 'collage',
    photos: ['IMG_1268', 'IMG_1501', 'IMG_3039', 'IMG_3042', 'IMG_3105', 'IMG_3803', 'IMG_4124'],
    // A pile of overlapping prints around a centred title card (DESIGN.md, Pile-of-prints collage).
    collage: 'images/oregon-collage.jpg',
    collageTall: true,
    collageAlt: 'A collage of the Oregon trip: seven overlapping photo prints around a centred card reading Oregon, 2026, These were real mountains. The photos include a snowy mountain, a lake between forested hills, a road through the mountains and a sunset over the water.'
  }
];

window.exampleImage = function (example, name) {
  return 'images/' + example.id + '/' + name + '.jpg';
};

// Built-in, view-only example trips made from the owner's photos (SPEC.md, Example trips).
// They are the same for every visitor and are never stored in the browser.
// rot and size are fixed per photo so the scrapbook looks the same on every visit.
window.FOLIO_EXAMPLES = [
  {
    id: 'japan',
    title: 'Japan',
    layout: 'slideshow',
    line: 'Five weeks on the other side of the world, and memories that will last forever.',
    photos: ['IMG_4809', 'IMG_5208', 'IMG_5574', 'IMG_5577', 'IMG_5976', 'IMG_5997', 'IMG_6016', 'IMG_6408', 'IMG_6569', 'IMG_6613']
  },
  {
    id: 'mexico',
    title: 'Mexico',
    layout: 'scrapbook',
    line: 'Only a four-hour flight from home, and it felt like another world: stunning sunsets, magnificent buildings and unforgettable people.',
    photos: ['IMG_3210', 'IMG_3487', 'IMG_3507', 'IMG_3522', 'IMG_3533', 'IMG_3540', 'IMG_3563', 'IMG_3577'],
    rot: [-1.8, 2.2, -0.6, 1.4, -2.6, 0.8, -1.2, 2.7],
    size: [0.95, 0.88, 1, 0.9, 0.97, 0.86, 0.93, 1]
  },
  {
    id: 'oregon',
    title: 'Oregon',
    layout: 'scrapbook',
    line: 'These were real mountains. Who said America wasn\'t gorgeous?',
    photos: ['IMG_1268', 'IMG_1501', 'IMG_3039', 'IMG_3042', 'IMG_3105', 'IMG_3803', 'IMG_4124'],
    rot: [1.6, -2.3, 0.7, -1.1, 2.5, -0.4, 1.9],
    size: [1, 0.9, 0.94, 0.87, 0.96, 0.91, 0.98]
  }
];

window.exampleImage = function (example, name) {
  return 'images/' + example.id + '/' + name + '.jpg';
};

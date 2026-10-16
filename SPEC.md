# SPEC.md

## What the site is
Folio is a private travel journal. Each person has their own journal. They create trips, drop in photos, add an optional short caption to any photo, and group photos by trip. Folio can then turn a trip into a video or a collage that can be downloaded, printed, and shared with friends.

## Who it is for
Anyone who travels and wants to turn their photos into a keepsake. Each visitor sees only their own trips.

## Name
The site is called Folio. No personal name of the owner appears anywhere on the site.

## Pages
All pages are plain .html files at the top of the folder.

### login.html (never gated)
- Purpose: the front door. Sign up and log in on one page, with a toggle between them.
- Content: the name FOLIO, an email field, a password field, one button, and a small toggle link. Nothing else.
- After a successful log-in or sign-up, go to index.html.
- If a signed-in visitor opens this page, send them to index.html.

### index.html (home)
- Purpose: a welcome screen that gets the visitor started quickly.
- Top of the page: a welcome area with a big Start a trip button. The button leads to a new trip (upload.html).
- Welcome headline (approved by the owner): "For the people back home"
- Supporting line (approved by the owner): "Too many photos and nowhere to share them. Folio gathers a trip into one place that is easy to share."
- Welcome photo: a collage of the Japan example trip in the collage style from DESIGN.md (a mosaic of six photos around a panel with the trip name "Japan" and the Japan trip line), saved as images/welcome-collage.jpg. Alt text describes it as an example collage.
- Further down, as the visitor scrolls:
  - Once the visitor has at least one trip: a Recent trips section with their most recent trips (up to three) and a See all link to trips.html.
  - Always, below that: an Example trips section with the three example trips (see Example trips), each marked Example. On the home page the examples never disappear.
  - If the visitor has no trips yet, only the Example trips section is shown (no empty Recent trips heading).

### trips.html
- Purpose: all of the visitor's trips.
- Content: trip cards in a grid, each showing the trip title, a cover photo (the first photo by default), and the photo count. A New trip button (it starts a new trip, like Start a trip on the home page) sits at the top right, centred vertically with the Trips title.
- Clicking a card opens that trip at its first step (upload.html with the trip identified in the address).
- If the visitor has no trips yet, the three example trips are shown instead (no grey placeholder box), under the line "You have no trips yet." Once the visitor creates a trip, the examples and the line are removed from this page.

### example.html (view-only example trips)
- Purpose: show a new visitor what Folio can make, before they start their own trip.
- Opened by clicking an example trip card: example.html with the example named in the address (for example, example.html?trip=japan).
- View only: nothing can be added, edited, reordered, removed or exported.
- Content: the trip title with a label under it ("Collage Example" for Japan and Oregon, "Video Example" for Mexico), a Start a trip button, then the example's collage or video, then a Back to home link (to index.html).
- Gated like every other page.

## Making a trip: the step pages
Making a trip moves through one page per step. Each page knows which trip it is for from its address (for example edit.html?id=...), so a visitor can jump straight to any step.

| Step | Page | Name in the step links |
|---|---|---|
| 1 | upload.html | Upload |
| 2 | media.html | Media type |
| 3 | edit.html | Edits |
| 4 | preview.html | Preview |

- Every step page ends with a Back link on the bottom left (to the previous step) and the step links "Upload · Media type · Edits · Preview" on the bottom right, with the current step marked.
- Step links that cannot be used yet are shown faded and do nothing: Media type, Edits and Preview need at least one photo; Edits and Preview also need a media type to have been chosen.
- The Edits link opens the Edits page for the media type the visitor chose.
- The old trip.html and export.html are removed. Saving the finished video happens on the Preview page (Export button).

### upload.html (step 1: Upload)
- Purpose: name the trip and add its photos. Every New trip and Start a trip button leads here, and a trip's tile reopens it here.
- Content, top to bottom:
  - Heading: "New trip" for a new trip. When an existing trip is reopened, the heading is the trip's title instead.
  - A "Trip title" label with a text box under it. The box starts empty, with the placeholder "Where did you go?".
  - The number of photos added (for example "3 photos").
  - The drop zone for photos (drag and drop, plus a Choose photos button for phones).
  - A Continue button, centred, that leads to media.html for this trip. It is disabled until at least one photo has been added.
  - The added photos, in a grid of equal tiles (DESIGN.md, The upload page), each with a small Remove button.
  - Back (to trips.html) and the step links.
- Photos are kept in the order added (they can be reordered on the Edits page).
- A trip is only saved once a photo is added or a title is typed, so opening the page and leaving does not create an empty trip.
- If the title is left empty, the trip is called "Untitled trip" on its tile.

### media.html (step 2: Media type)
- Heading: the trip's title, and under it "How would you like to remember this one?", both centred.
- Two tiles, side by side (stacked on phones): Video and Collage. The Video tile shows a film strip made from two Japan photos (images/film-strip.jpg). The Collage tile shows the Japan collage (images/welcome-collage.jpg). Each tile's label, "Video" or "Collage", is centred under its picture.
- Clicking a tile saves the choice with the trip and goes to edit.html for this trip.
- Back (to upload.html) and the step links.

### edit.html (step 3: Edits)
- Head: "Edit" (h1) on the left; the trip's title (h2) on the right, on the same line.
- For a collage, top to bottom:
  1. Order and captions: the same as for a video (photo count, drag to reorder, a caption box under each photo). The order is the order photos fill the pages.
  2. Collage style:
     - Style: three tiles to choose from, Mosaic, Polaroid pile and Scrapbook (DESIGN.md, Collage styles). Starts at Mosaic.
     - Page: Portrait or Landscape, always 8.5 x 11 inches. Starts at Portrait.
     - Number of pages: a number box whose light grey placeholder shows the allowed range (for example "1–4"). Allowed: 1 up to the number of photos. Left empty, Folio uses enough pages for about 12 photos each. A number outside the range shows a short note under the box and is not used.
  3. Caption style: the same controls as for a video (position, text colour, Regular, Bold or Italic Poppins), adapted to the style:
     - Mosaic: captions sit on top of the photo; all position buttons work.
     - Polaroid pile: captions sit in the white strip at the bottom of each Polaroid; the position buttons are shown faded and do nothing.
     - Scrapbook: captions sit outside the photo, on the page just above or below the print (Top = above, Bottom = below), aligned left, centre or right. An extra on/off button, "Follow the photo's tilt", appears only for this style (starts off).
     - In Polaroid pile and Scrapbook the cream, sand and clay text colours are faded and cannot be chosen, because captions sit on light paper where they would be too faint to read; if one of them was chosen, dark brown is used instead.
  4. Title card: a Title box (starts as the trip's title), a Details box, a card colour (one of the five palette swatches; text is dark on cream, sand and clay and light on terracotta and dark brown; no photo background), and which page it goes on: "First page only" (the starting choice), "Every page" or "Page [number]".
  5. A Preview button that leads to preview.html for this trip.
  6. Back (to media.html) and the step links.
- Sharing photos across pages: the title card counts as one spot on each page it is on, like a photo. All spots are shared out as evenly as possible, in order, and when they do not divide evenly the earlier pages get one more. Example: 23 photos and the title card on the first page, over 3 pages, gives 24 spots, 8 per page: page 1 holds the title card and 7 photos, pages 2 and 3 hold 8 photos each.
- For a video, top to bottom:
  1. Order and captions: the photo count, then all the trip's photos in the same grid of equal tiles as the upload page. Photos can be dragged to a new order (and moved with the keyboard). Each photo has a caption box ("Add a caption") under it, saved as the visitor types.
  2. Caption style (one setting for every caption in the video): Position, top or bottom, and left, centre or right (starts at bottom, centre); Text colour, one of the five palette swatches (starts at cream); Font style, Regular, Bold or Italic, always Poppins (starts at Regular). Captions sit on top of the photo, with a soft shadow behind the letters so they stay readable (dark behind light colours, light behind dark ones). A small live sample shows a trip photo with an example caption.
  3. Cover (the first frame of the video): a Title box (starts as the trip's title) and a Details box (for example dates or places). Background: one of five palette swatches (cream, sand, clay, terracotta, dark brown) or one of the trip's photos. A small live preview shows the cover; its text is dark on light backgrounds and light on dark ones and photos.
  4. Duration: how long each photo (and the cover) is shown, one of 1, 1.5, 2, 2.5 or 3 seconds. Starts at 2.5.
  5. Transition: Clean cut (straight to the next photo), Dissolve (one blends into the next) or Slide (photos slide on and off, right to left). Starts at Dissolve.
  6. A Preview button that leads to preview.html for this trip.
  7. Back (to media.html) and the step links.
- Every choice is saved with the trip in the browser as soon as it is made.

### preview.html (step 4: Preview)
- Head: "Preview" (h1) on the left; the trip's title (h2) on the right, on the same line.
- For a video:
  - The video is made in the visitor's browser from the Edits choices: the cover first, then the photos in their order, each shown for the chosen duration, joined by the chosen transition, with captions in the chosen caption style. Captions appear only on photos that have one.
  - Format: MP4 (H.264), 1280 x 720 (16:9), silent. Each photo is fitted whole on a cream background (tall photos have cream bands at the sides). The cover fills the frame.
  - While it is being made, the tile shows "Making your video…" with a percentage. Browsers too old to make video show a plain message instead.
  - A large centred tile plays the video. Under the picture: a play/pause button on the left, then a progress bar the visitor can drag to move forwards or backwards, then the time (for example 0:08 / 0:20). It never plays on its own.
  - An Export button, centred under the tile, saves the video as an MP4 file named after the trip (for example summer-road-trip.mp4):
    - On a computer: the browser's save window, where the visitor chooses where to save it (browsers without a save window put it in Downloads).
    - On a phone: the phone's share sheet, so the visitor can save it to their photos or send it to Google Photos or another app. Folio itself never uploads anything.
- For a collage:
  - The pages are made in the visitor's browser from the Edits choices, in the chosen style, page shape and number of pages, at print quality (8.5 x 11 inches at 300 dots per inch: 2550 x 3300 pixels portrait, 3300 x 2550 landscape). While they are being made the tile shows "Making your collage…".
  - A large tile shows the pages two at a time, side by side, like an open album (one at a time on phones). With three or more pages (two or more on phones), Previous and Next arrow buttons under the tile flip through them, with a line such as "Pages 1–2 of 4".
  - A Regenerate button under the tile changes the layout of the chosen style: each press moves to the next of five layouts and then starts again, changing photo size, position, tilt and which photo sits in front, as far as the style allows. The current layout is saved with the trip and shown as "Layout 2 of 5".
  - Export: three option buttons choose the format, PDF (the starting choice), JPEG or PNG, then the Export button saves:
    - PDF: one file with one collage page per PDF page, named after the trip (for example summer-road-trip.pdf).
    - JPEG or PNG: one image per collage page (summer-road-trip-1.jpg, summer-road-trip-2.jpg and so on).
    - On a computer: the browser's save window for a single file; for several images, browsers that can choose a folder ask for one folder once, others save them to Downloads.
    - On a phone: the phone's share sheet with the file or images, so the visitor can save them to their photos or another app.
  - The PDF is written by Folio's own code (no extra library).
- Back (to edit.html) and the step links.


### about.html
- Purpose: a short, plain explainer on how Folio works, where photos are stored, and why Folio was made.
- Content must say that photos and captions are saved only in the visitor's own browser on their own device, that they are not uploaded anywhere, that clearing browser data erases them, and that downloading an export is the way to keep a backup.
- Sections, in order, with the owner's wording:
  - How: "Start a trip, add photos, and add captions. When you are ready, turn the trip into a video or a collage to share with family and friends."
  - Why (first person, no name): "I started taking trips all over the world and came home with thousands of photos. I wanted to share them with my family, but not by sending thousands of single pictures at once. So I made Folio: a place to gather the photos from a trip into one video or collage, and share it."
  - Where: "Your photos and captions are saved only in this browser, on this device. They are not uploaded anywhere. If you clear this browser's data, your photos and captions are erased. To keep a backup, download or print an export of each trip. Your trips do not appear on your other devices or browsers."
  - Coming Soon: "Choosing which photos to send takes time. The goal is to let you add every photo from a trip, have Folio help pick the best ones, and turn them into a video or collage."

### account.html (removed)
- Removed at the owner's request. The menu has no Account link. It may come back later if account settings are needed.

## Example trips
Three built-in, view-only examples made from the owner's photos. They are the same for every visitor, are not stored in the visitor's browser, and do not count as the visitor's trips. The owner asked Claude to choose the photos.

| Example | Address | Layout | Trip line (owner's words, lightly edited; used inside the Japan collage and the Oregon title card, not shown on the example pages) | Photos (in order) |
|---|---|---|---|---|
| Japan | example.html?trip=japan | Collage | Five weeks on the other side of the world, and memories that will last forever. | IMG_5574, IMG_4809, IMG_6613, IMG_5208, IMG_6569, IMG_5997 (the six photos in the welcome collage) |
| Mexico | example.html?trip=mexico | Video | Only a four-hour flight from home, and it felt like another world: stunning sunsets, magnificent buildings and unforgettable people. | IMG_3210, IMG_3487, IMG_3507, IMG_3522, IMG_3533, IMG_3540, IMG_3563, IMG_3577 |
| Oregon | example.html?trip=oregon | Collage (pile of prints) | These were real mountains. Who said America wasn't gorgeous? | IMG_1268, IMG_1501, IMG_3039, IMG_3042, IMG_3105, IMG_3803, IMG_4124 |

- Example cards show the trip title, a cover and a small Example label. They never show a photo count. The Mexico cover is IMG_3522 (chosen by the owner). The Oregon cover is its collage image (images/oregon-collage.jpg). The Japan cover is the welcome collage itself (images/welcome-collage.jpg), so the home page collage, the Japan tile and the Japan example page all show the same image.
- The Japan example page shows that same collage, large.
- The Oregon example page shows its pile-of-prints collage (DESIGN.md), large: the seven Oregon photos plus a centred title card reading "Oregon", "2026", "These were real mountains". The year 2026 was given by the owner. The page line above it stays as in the table.
- The Mexico example page plays a video file, images/mexico-slideshow.mp4 (file name kept) (MP4, silent, 4:3, about 20 seconds): the eight Mexico photos in order, 2.5 seconds each, each dissolving into the next. It is made once from the owner's photos and is larger than 500 KB (the owner has agreed). It does not play until the visitor presses play.
- The film strip on the Media type page (images/film-strip.jpg) is made once from Japan photos IMG_5577 and IMG_6016.
- The photos have no individual captions (none supplied). Alt text names the trip, for example "Photo 3 of 8 from the Mexico example".
- Welcome collage photos (all from the Japan example): tall IMG_5574 and IMG_5208; wide IMG_6613 and IMG_6569; small IMG_5997 and IMG_4809.

## The log-in gate
- Visitors can sign up with email and password and log in, using Supabase (authentication only).
- login.html is never gated.
- index.html is the home page.
- Every page except login.html sends signed-out visitors to login.html. This includes typing a page address (ending .html) directly while signed out.
- The check runs as the first thing on every gated page, and the page content stays hidden until the check passes, so nothing flashes before the redirect.
- After log-in, go to index.html.
- Log out appears on every page except login.html and returns the visitor to login.html.
- All links are relative.
- Only the Supabase project URL and the public (publishable) key are used in the browser code, in js/config.js. They were supplied by the owner and are never replaced with a secret key.

## How photos and captions are stored
- Photos, captions, trip groupings and each trip's choices (media type, photo order, caption style, video cover, duration, transition, collage style, page shape, number of pages, title card and layout) are stored only in the visitor's own browser (IndexedDB), on their own device.
- Nothing about the visitor's photos is sent to Supabase or any server.
- Each signed-in account uses its own storage area in the browser so two people on one device do not see each other's trips.
- Photos are resized in the browser when added, to keep storage manageable. The resize size is to be decided with the owner. Until then, the longest side is limited to 2000 pixels (provisional).
- The consequence (entries stay on one device, and clearing browser data erases them) is stated on about.html.

## Content rule
Never invent facts, dimensions, dates, or names that the owner has not given. Ask the owner instead.

## How it is built
- Plain HTML, CSS, and JavaScript files only. No frameworks, no npm, no build step.
- Supabase is loaded from its CDN script tag.
- index.html sits at the top of the folder.
- Structure: HTML pages at the top level, a css folder (one shared style.css), a js folder (config.js holds the Supabase project URL and publishable key; auth.js runs the log-in gate and menu; store.js handles browser storage; examples.js lists the example trips; steps.js draws the Back link and step links on the step pages; video.js makes a trip's MP4 video in the browser, using the mp4-muxer library loaded from the jsDelivr CDN (version pinned); collage.js lays out and draws collage pages in the three styles; pdf.js writes a PDF from page images; one script per page, named after its page), and an images folder.
- It must work on a phone.
- It is published from GitHub to Vercel.
- Fonts: Lora and Poppins from Google Fonts, as described in DESIGN.md.
- Every page has a title, a one-line description, and a share image so the link looks good when texted.

## Images
- The owner's own files go in a folder called images (lower case, because Vercel treats Images and images as different folders), with one subfolder per trip: images/japan, images/mexico, images/oregon. These photos are committed to the public GitHub repository, so anyone can see them.
- The owner compressed every photo to under 500 KB. None carry location (GPS) data.
- Where the owner has no image yet, use a plain grey box labelled [ADD: image of ...].
- The owner has photos from several places. They are placed where the owner says, or where the owner has asked Claude to choose (the example trips and the welcome collage).
- Any image file over 500 KB is reported to the owner.

## Out of scope
- Payments.
- Storing anything about visitors beyond their log-in.
- Any database tables.
- Photo storage on a server or in the cloud.
- Sharing links to a visitor's journal (sharing happens by downloading or printing an export).

## Open questions for the owner
- The Oregon folder includes photos that may be from other places (a city skyline, a glass art exhibit, a harbour with an aircraft carrier). Only the mountain and lake photos are used in the Oregon example. Confirm they are from Oregon.
- The share image to use when a link is texted.
- Maximum photo size to keep in the browser.

## Done when
- [ ] Works on a phone.
- [ ] The menu reaches every page.
- [ ] Sign up, log in, and log out work.
- [ ] Typing a page address (ending .html) while signed out sends me to log-in.
- [ ] Every image has alt text.
- [ ] The live link opens in a new tab or window.
- [ ] Photos can be added to a trip and still appear after reloading the page.
- [ ] A collage can be previewed and saved as a PDF, JPEG or PNG.
- [ ] A video can be previewed and saved as an MP4.
- [ ] Every page has a title, a one-line description, and a share image.

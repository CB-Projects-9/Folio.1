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
- Top of the page: a welcome area with a big Start a trip button. The button leads to a new trip (trip.html).
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
- Clicking a card opens that trip (trip.html with the trip identified in the address).
- If the visitor has no trips yet, the three example trips are shown instead (no grey placeholder box), under the line "You have no trips yet." Once the visitor creates a trip, the examples and the line are removed from this page.

### example.html (view-only example trips)
- Purpose: show a new visitor what Folio can make, before they start their own trip.
- Opened by clicking an example trip card: example.html with the example named in the address (for example, example.html?trip=japan).
- View only: nothing can be added, edited, reordered, removed or exported.
- Content: the trip title with a label under it ("Collage Example" for Japan and Oregon, "Video Example" for Mexico), a Start a trip button, then the example's collage or video, then a Back to home link (to index.html).
- Gated like every other page.

### trip.html (step one of making a trip)
- Purpose: the first step of the creation process: name the trip and add its photos. Every New trip and Start a trip button leads here.
- Content, top to bottom:
  - Heading: "New trip" for a new trip. When an existing trip is reopened from its tile, the heading is the trip's title instead.
  - A "Trip title" label with a text box under it. The box starts empty, with the placeholder "Where did you go?".
  - The number of photos added (for example "3 photos").
  - The drop zone for photos (drag and drop, plus a Choose photos button for phones).
  - A Continue button that leads to export.html for this trip. It is disabled until at least one photo has been added.
  - The added photos, in a grid of equal tiles (DESIGN.md, The trip page), each with a small Remove button.
  - A Back to trips link (to trips.html) at the bottom.
- Photos are kept in the order added.
- A trip is only saved once a photo is added or a title is typed, so opening the page and leaving does not create an empty trip.
- If the title is left empty, the trip is called "Untitled trip" on its tile.
- Reordering photos and writing captions are not on this page. They will move to the next step (to be designed with the owner). Captions written before this change are kept and still appear in exports.

### export.html
- Purpose: turn one trip into something to keep and share. Moves in separate steps.
- Step 1 (the choose screen, rebuilt with the owner):
  - Heading: the trip's title. Under it: "How would you like to remember this one?" (shown on this screen only).
  - Two tiles, side by side (stacked on phones): Video and Collage. The Video tile shows a film strip made from two Japan photos (images/film-strip.jpg). The Collage tile shows the Japan collage (images/welcome-collage.jpg). Each tile's label, "Video" or "Collage", is centred under its picture.
  - Clicking a tile chooses it and goes straight to step 2. There is no separate Next button on this screen.
  - A Back link under the tiles returns to the trip page (trip.html for this trip).
  - The step list (Choose, Preview, Download or print) is hidden on this screen and shown on steps 2 and 3.
- Step 2: preview it.
- Step 3: download or print.
- Collage: downloads as an image file (JPEG, 2400 pixels wide), and can be printed. It uses the collage style in DESIGN.md: a mixed-size mosaic with a title panel showing the trip title. A short trip line field on trip.html would be needed to add a line under the title (to be decided with the owner).
- Video: for now, the preview plays the photos in the browser with a slow cross-fade, and the photos can be printed one per page (the browser print dialog also allows saving as a PDF). Downloading the video as a file is still to be built (see Open questions).
- Steps 2 and 3 are unchanged for now, apart from the word video; they will be redesigned with the owner later.
- Captions appear only if the visitor wrote one.

### about.html
- Purpose: a short, plain explainer on how Folio works, where photos are stored, and why Folio was made.
- Content must say that photos and captions are saved only in the visitor's own browser on their own device, that they are not uploaded anywhere, that clearing browser data erases them, and that downloading an export is the way to keep a backup.
- Sections, in order: How Folio works; Where your photos are kept; Why Folio; Where it is going.
- Why Folio (approved by the owner, first person, no name):
  "I started taking trips all over the world and came home with thousands of photos. I wanted to share them with my family, but not by sending thousands of single pictures at once.
  So I made Folio: a place to gather the photos from a trip into one video or collage, and share it with whoever I choose."
- Where it is going (approved by the owner):
  "Choosing which photos to send takes time. The goal is to let you add every photo from a trip, have Folio help pick the best ones, and turn them into a video or a scrapbook to share. That part is still being built."

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
- The visitor's own video on export.html plays on the page and prints for now; downloading it as a video file is still to be built.
- The film strip on the choose screen (images/film-strip.jpg) is made once from Japan photos IMG_5577 and IMG_6016.
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
- Photos, captions, and trip groupings are stored only in the visitor's own browser (IndexedDB), on their own device.
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
- Structure: HTML pages at the top level, a css folder (one shared style.css), a js folder (config.js holds the Supabase project URL and publishable key; auth.js runs the log-in gate and menu; store.js handles browser storage; examples.js lists the example trips; slideshow.js plays a trip's photos as the video preview on export.html; one script per page), and an images folder.
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
- The wording of the How Folio works and Where your photos are kept sections on about.html (plain functional text for now).
- The Oregon folder includes photos that may be from other places (a city skyline, a glass art exhibit, a harbour with an aircraft carrier). Only the mountain and lake photos are used in the Oregon example. Confirm they are from Oregon.
- The share image to use when a link is texted.
- How the video downloads (file format and how it is made). Until built, the video only plays on the page and prints.
- How long each photo stays on screen in the video (about 4 seconds for now; the Mexico example uses 2.5 seconds).
- Maximum photo size to keep in the browser.

## Done when
- [ ] Works on a phone.
- [ ] The menu reaches every page.
- [ ] Sign up, log in, and log out work.
- [ ] Typing a page address (ending .html) while signed out sends me to log-in.
- [ ] Every image has alt text.
- [ ] The live link opens in a new tab or window.
- [ ] Photos can be added to a trip and still appear after reloading the page.
- [ ] A collage can be downloaded and printed.
- [ ] A video plays and can be printed.
- [ ] Every page has a title, a one-line description, and a share image.

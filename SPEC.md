# SPEC.md

## What the site is
Folio is a private travel journal. Each person has their own journal. They create trips, drop in photos, add an optional short caption to any photo, and group photos by trip. Folio can then turn a trip into a slideshow or a collage that can be downloaded, printed, and shared with friends.

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
- Further down, as the visitor scrolls: their most recent trips as cards, with a See all link to trips.html.
- If the visitor has no trips yet, show a quiet plain message and a grey box labelled [ADD: image of ...] where a photo would go.
- Welcome headline and supporting line: to be supplied by the owner. Use the placeholder [ADD: welcome headline] until given.

### trips.html
- Purpose: all of the visitor's trips.
- Content: trip cards in a grid, each showing the trip title, a cover photo (the first photo by default), and the photo count. A Start a trip button sits at the top.
- Clicking a card opens that trip (trip.html with the trip identified in the address).

### trip.html
- Purpose: one trip, where photos are added and arranged.
- Content: trip title (editable), a drop zone for photos (drag and drop, plus a file picker button for phones), the photos shown in the scrapbook style described in DESIGN.md, an optional short caption under each photo, and a button to remove a photo.
- Photos are kept in the order added, and can be reordered.
- A button leads to export.html for this trip.

### export.html
- Purpose: turn one trip into something to keep and share. Moves in separate steps.
- Step 1: choose a layout, Slideshow or Collage.
- Step 2: preview it.
- Step 3: download or print.
- Collage: downloads as an image file, and can be printed.
- Slideshow: plays in the browser with a slow cross-fade, and can be printed with one photo per page (the browser print dialog also allows saving as a PDF). A downloadable slideshow file format is to be decided with the owner (see Open questions).
- Captions appear only if the visitor wrote one.

### about.html
- Purpose: a short, plain explainer on how Folio works and where photos are stored.
- Content must say that photos and captions are saved only in the visitor's own browser on their own device, that they are not uploaded anywhere, that clearing browser data erases them, and that downloading an export is the way to keep a backup.
- Wording is to be supplied or approved by the owner. Use plain functional text until then.

### account.html
- Purpose: account basics.
- Content: the email the visitor signed in with, and a Log out button. Nothing else.

## The log-in gate
- Visitors can sign up with email and password and log in, using Supabase (authentication only).
- login.html is never gated.
- index.html is the home page.
- Every page except login.html sends signed-out visitors to login.html. This includes typing a page address (ending .html) directly while signed out.
- The check runs as the first thing on every gated page, and the page content stays hidden until the check passes, so nothing flashes before the redirect.
- After log-in, go to index.html.
- Log out appears on every page except login.html and returns the visitor to login.html.
- All links are relative.
- Only the Supabase project URL and the public anon key are used in the browser code. They are supplied by the owner and are never replaced with a secret key.

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
- Structure: HTML pages at the top level, a css folder (one shared style.css), a js folder (config.js holds the Supabase project URL and public anon key; auth.js runs the log-in gate and menu; store.js handles browser storage; one script per page), and an images folder.
- It must work on a phone.
- It is published from GitHub to Vercel.
- Fonts: Lora and Poppins from Google Fonts, as described in DESIGN.md.
- Every page has a title, a one-line description, and a share image so the link looks good when texted.

## Images
- The owner's own files go in a folder called images.
- Where the owner has no image yet, use a plain grey box labelled [ADD: image of ...].
- The owner has photos from several places. They will be placed where the owner says. None are placed by guesswork.
- Any image file over 500 KB is reported to the owner.

## Out of scope
- Payments.
- Storing anything about visitors beyond their log-in.
- Any database tables.
- Photo storage on a server or in the cloud.
- Sharing links to a visitor's journal (sharing happens by downloading or printing an export).

## Open questions for the owner
- The welcome headline and any supporting line for index.html.
- The wording for about.html.
- The Supabase project URL and public anon key.
- Which of the owner's photos go on the welcome screen, if any.
- The share image to use when a link is texted.
- Whether the slideshow should download as a file (and in what format) or only play and print. Until decided, it only plays and prints.
- How long each slideshow photo stays on screen (about 4 seconds for now).
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
- [ ] A slideshow plays and can be printed.
- [ ] Every page has a title, a one-line description, and a share image.

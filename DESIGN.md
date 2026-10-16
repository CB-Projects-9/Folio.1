# DESIGN.md

## Concept
Folio is a private travel journal that feels like a well-made photo album. A visitor drops in photos from a trip, and Folio turns them into a keepsake slideshow or collage they can download, print, and share.

## References
No outside references were named. The direction comes from the person's own words: soft, warm, inviting, professional, and photo-first. The borrowed system is the old photo album: mounted prints with soft borders, paper and clay tones, and a quiet interface that lets the pictures lead. No names, logos, text, images, or fonts are copied from anywhere.
- Pile-of-prints collage (Oregon example): the owner shared a photo of overlapping instant-film prints as a layout reference. Only the general idea is borrowed (bordered prints piled and overlapping, some running off the edges). None of its photos, people or styling are copied.
- Collage layout: the owner shared a printed family photo-collage card as a layout reference. Only the general idea is borrowed (a tight mosaic of straight photos in mixed sizes around a plain panel for the title). None of its text, photos, fonts or ornaments are copied.

## Mood
- Feels like: warm, nostalgic, crafted.
- Must never feel like: generic, cluttered, cold or corporate.

## Colour palette
- Cream paper, #F6EFE3: main page background.
- Warm off-white, #FBF7F0: cards, the log-in form area, print mounts, and the menu bar.
- Sand, #E4D3BA: section backgrounds, drop zones, and quiet dividers.
- Clay, #C9A98A: borders, hover states, and small decorative marks.
- Terracotta, #A24B30: buttons, links, and the single accent on each page. Use it sparingly.
- Terracotta light, #C46B4B: hover and focus states for buttons only. Never use it for text.
- Dark brown, #3B2A21: all headings and body text.
- Soft brown, #6B5648: captions, helper text, and secondary labels.
- Border tone, #D8C7AE: thin print borders and input outlines.
- Text on cream must always have strong contrast. Use dark brown or soft brown, never clay or sand, for any text.

## Typefaces
Free Google Fonts only: Lora and Poppins.
- Headings: Lora, all caps, weight 500, letter spacing about 0.12em.
  - Page title (h1): 28px on phones, 36px on desktop.
  - Section heading (h2): 20px on phones, 24px on desktop.
  - Small heading (h3): 16px, letter spacing 0.14em.
- Body text: Poppins, weight 300 or 400, 15px, line height 1.7.
- Captions and helper text: Poppins, weight 300, 13px, in soft brown.
- Buttons and menu links: Poppins, weight 400, 14px. Menu links are not in caps.
- Volume sits between quiet and medium. Text stays small and light with plenty of space so the photos carry the page.

## Layout and grid
- Calm, structured frame across the whole site: one centered content column, maximum width 1100px, with 16px side gutters on phones and 32px on desktop.
- Looser scrapbook feel only inside the trip, export and example views.
- Pacing is balanced: comfortable space between sections, never cramped and never empty.
- Spacing scale: 8, 16, 24, 40, 64 pixels.
- Welcome page (index.html) and Trips page scroll. The export flow moves in separate steps. Other pages stay short with minimal scrolling.
- Trip cards sit in a grid: one column on phones, two on tablets, three on desktop.
- Everything must work on a phone first.

## Image treatment
- Photos keep their natural colour. No filters.
- Every photo sits like a mounted print: thin border in #D8C7AE, a small margin of warm off-white around the image, and a soft, low shadow.
- Outside the trip, export and example views, photos sit straight.
- Inside the trip view, photos sit on the page like prints dropped on a table: rotated slightly (between minus 3 and plus 3 degrees), in slightly different sizes. The rotation is set once per photo and does not change on reload.
- Captions sit below the print in Poppins light, soft brown. Captions are optional, and no empty caption space is shown.
- Where there is no photo yet, show a plain grey box labelled [ADD: image of ...]. The welcome page and Trips page no longer need one: the welcome collage and the example trips fill those spaces.
- Every image has alt text.

## Movement
- Subtle only: gentle fades when a page or section appears (about 300ms) and a soft lift on photo hover (about 2px up, slightly deeper shadow).
- The exported slideshow may use a slow cross-fade between photos (about 1.2 seconds). Each photo stays on screen for about 4 seconds (provisional, to be confirmed by the owner).
- The Mexico example slideshow is a video: 2.5 seconds per photo, with each photo dissolving into the next over about 1 second (inside its 2.5 seconds). It has no sound and only plays when the visitor presses play.
- No auto-playing music or video. No heavy animation.
- Respect the visitor's reduced motion setting by turning movement off.

## The log-in page (login.html)
This is the front door, so it is kept as short as possible.
- Mostly empty cream page. Nothing else appears: no menu, no extra links, no photos.
- The name FOLIO sits near the top center in Lora caps with wide letter spacing, large for this page (40px).
- Below it, a quiet form: email, password, and one terracotta button.
- Sign up and log in share one page. A small text toggle under the button switches between them ("New here? Sign up" and "Have an account? Log in"). The button label changes to match.
- Errors appear in plain words directly under the field, in dark brown with a small terracotta mark, never in a pop-up.
- No pop-ups, no banners, no forced extra steps.

## Menu and buttons
- Menu: a thin bar in warm off-white at the top of every page except login.html. FOLIO wordmark on the left (links to index.html). Links: Home, Trips, About. (Account was removed at the owner's request.)
- On desktop the links sit together on the right of the bar, with Log out at the far right end, set apart by a thin vertical line in #D8C7AE. The current page's link is terracotta.
- On phones, the links fold into a simple menu button that opens a short list. Maximum five items.
- Primary button: terracotta (#A24B30) fill, cream text, 4px corner radius, generous padding, soft lift on hover.
- Secondary button: transparent with a 1px terracotta outline and terracotta text.
- Buttons are at least 44px tall for easy tapping.
- The one big call to action on the welcome page is the button labelled Start a trip.
- Never show more than one primary button per screen.

## Tone of voice
- Warm, plain, and brief, like a note written on the back of a print.
- Speak to the visitor directly and kindly. Short sentences.
- No marketing language, no exclamation marks, no jargon.
- Where text has not been supplied by the owner, use plain functional wording only (for example, "Add photos") and do not invent taglines or stories.

## The welcome page (index.html)
- Welcome area: the headline "For the people back home", the supporting line, and the Start a trip button are stacked in the centre of the column, with comfortable space above (64px).
- The supporting line is centred and balanced, so it breaks into two lines of about equal length rather than one long line and one short one.
- Below it, one wide mounted print (up to 880px wide), centred, holding the welcome collage. The print takes the collage's own shape. The collage follows the Collage style below and shows the Japan example trip.
- Trips sit on one full-width sand band (#E4D3BA) with 64px of space above and below. Inside it, "Recent trips" comes first (only once the visitor has trips), then 64px of space, then "Example trips", which is always there. Each section heading is on the left.
- Each trip is an off-white tile: thin #D8C7AE border, 8px margin around the cover photo, soft low shadow, then the trip title (small heading style) and photo count (caption style) below. Tiles lift slightly on hover.
- The See all link sits at the bottom right of the Recent trips section, in dark brown, underlined. It shows only when the visitor has their own trips.

## Collage style
- A tight mosaic, like a printed photo card: photos sit straight (no rotation, no individual mounts or shadows), edge to edge in a grid, separated by thin cream (#F6EFE3) gutters, with a matching cream border around the whole collage.
- Photos come in mixed sizes: some tall (two rows high), some wide (two columns wide), some small (one cell). Each photo fills its tile and is cropped from the centre.
- One tile, near the middle, is a plain warm off-white (#FBF7F0) panel with no photo. It holds the trip name in Lora caps with wide letter spacing (dark brown), a short thin clay (#C9A98A) rule, and the trip's line below in Poppins light (soft brown), all centred. If there is no line, the panel shows the trip name only.
- Welcome collage grid (4 columns by 3 rows, six photos and the panel):
  - Row 1: tall photo, small photo, wide photo.
  - Row 2: (tall photo continues), title panel two columns wide, tall photo.
  - Row 3: wide photo, small photo, (tall photo continues).
- The export collage (export.html) uses the same style, and its grid adapts to the trip:
  - 4 columns for 6 or more photos, 3 columns for 3 to 5 photos, 2 columns for 1 or 2 photos.
  - Tall (portrait) photos get tall tiles and wide (landscape) photos get wide tiles where they fit; the rest get single tiles. Photos keep the trip's order, reading left to right, top to bottom.
  - The title panel is two columns wide, in the second row (the first row when there are 3 or fewer photos), as near the middle as the grid allows. It shows the trip title. It also holds a trip line once trips have one (see SPEC.md).
  - Any gap left in the grid is filled by stretching a neighbouring photo, so there are no empty holes.
  - A photo's caption, if written, sits in a thin warm off-white strip along the bottom of its tile, in Poppins light, soft brown, on one line (shortened with "…" if too long).

## Pile-of-prints collage (Oregon example)
- A tall (2:3) image covered edge to edge with overlapping photo prints on a cream (#F6EFE3) background, like prints piled on a table. Some prints run off the edges.
- Each print has an even warm off-white (#FBF7F0) border, a thin #D8C7AE outline and a soft shadow. Photos fill their print and are cropped from the centre.
- Prints are large (seven photos fill the whole image) and tilted slightly, between minus 3 and plus 3 degrees, set once and never changed.
- A title card sits in the centre, on top of the pile, and is the largest card so it does not get lost. It is a plain off-white print with no photo and three centred lines stacked vertically: OREGON (Lora caps, wide letter spacing, largest), 2026 (Poppins, dark brown, wide letter spacing), a short clay rule, then "These were real mountains" (Poppins light, soft brown).

## Example trips
- Example tiles look like normal trip tiles, with one addition: a small "Example" label in Poppins 13px, dark brown on warm off-white with a thin #D8C7AE border and 4px radius, sitting on the top-left corner of the cover photo.
- The Japan and Oregon tile covers are their whole collage images, shown uncropped (fitted inside the cover area on a cream background), so it reads as the same collage as on the home page.
- The same tiles appear on the Trips page in place of the empty-state grey box until the visitor creates a trip.

## The Trips page (trips.html)
- Page head: the Trips title (h1) on the left and the New trip button (primary) on the right, centred vertically against the title, in the same layout as the example page head.

## The example view (example.html)
- Page head: on the left, the trip title (h1) with a small label under it in soft brown ("Collage Example" or "Slideshow Example"). On the right, the Start a trip button (the one primary button on this screen), centred vertically against the title and label. On narrow screens it drops below the title only if there is not room beside it.
- Collage example (Oregon): the pile-of-prints collage shown large, as one mounted print the full width of the content column (up to 640px wide on desktop, because it is tall), centred, so it matches the Oregon tile.
- Slideshow example (Mexico): the slideshow video in one mounted print the full width of the content column, with the browser's normal video controls. Before it plays it shows IMG_3522 (the Mexico cover). Frames are 4:3 on a cream background, each photo fitted whole (not cropped) and centred.
- Collage example (Japan): the welcome collage shown large, as one mounted print the full width of the content column, so it matches the home page and the Japan tile.
- A Back to home link sits at the bottom of the page and returns to index.html. (A visitor's own trip page, trip.html, has a Back to trips link in the same style.)

## The about page (about.html)
- One reading column, about 640px wide, with the four sections in order: How Folio works, Where your photos are kept, Why Folio, Where it is going.
- Section headings use the h2 style. Body text in Poppins 15px.
- Why Folio is written in the first person, in the owner's own words, with no name.

## Never rules
1. Never cover the page with pop-ups, cookie banners, or overlays.
2. Never auto-play music or video.
3. Never crowd the menu or the screen with buttons and options.
4. Never force an extra step before the simple thing (the log-in page stays to email, password, one button).
5. Never use a stock-photo or template look: no generic hero banners, no icon-heavy feature grids, no cold corporate blues or greys.

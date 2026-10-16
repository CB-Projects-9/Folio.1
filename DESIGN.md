# DESIGN.md

## Concept
Folio is a private travel journal that feels like a well-made photo album. A visitor drops in photos from a trip, and Folio turns them into a keepsake video or collage they can download, print, and share.

## References
No outside references were named. The direction comes from the person's own words: soft, warm, inviting, professional, and photo-first. The borrowed system is the old photo album: mounted prints with soft borders, paper and clay tones, and a quiet interface that lets the pictures lead. No names, logos, text, images, or fonts are copied from anywhere.
- Polaroid pile and the pile-of-prints collage (Oregon example): the owner shared a photo of overlapping instant-film prints as a layout reference. Only the general idea is borrowed (bordered prints piled and overlapping, some running off the edges). None of its photos, people or styling are copied.
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
- Captions inside a visitor's video use Poppins Regular, Bold (700) or Italic, as the visitor chooses on the Edits page.
- Buttons and menu links: Poppins, weight 400, 14px. Menu links are not in caps.
- Volume sits between quiet and medium. Text stays small and light with plenty of space so the photos carry the page.

## Layout and grid
- Calm, structured frame across the whole site: one centered content column, maximum width 1100px, with 16px side gutters on phones and 32px on desktop.
- Looser scrapbook feel only inside the example views.
- Pacing is balanced: comfortable space between sections, never cramped and never empty.
- Spacing scale: 8, 16, 24, 40, 64 pixels.
- Welcome page (index.html), Trips page and the Edits page scroll. Making a trip moves through separate step pages (Upload, Media type, Edits, Preview). Other pages stay short with minimal scrolling.
- Trip cards sit in a grid: one column on phones, two on tablets, three on desktop.
- Everything must work on a phone first.

## Image treatment
- Photos keep their natural colour. No filters.
- Every photo sits like a mounted print: thin border in #D8C7AE, a small margin of warm off-white around the image, and a soft, low shadow.
- Outside the example views, photos sit straight.
- On the Upload and Edits pages, photos sit straight on equal tiles (see The upload page).
- Captions sit below the print in Poppins light, soft brown. Captions are optional, and no empty caption space is shown.
- Where there is no photo yet, show a plain grey box labelled [ADD: image of ...]. The welcome page and Trips page no longer need one: the welcome collage and the example trips fill those spaces.
- Every image has alt text.

## Movement
- Subtle only: gentle fades when a page or section appears (about 300ms) and a soft lift on photo hover (about 2px up, slightly deeper shadow).
- A visitor's video uses the duration (1 to 3 seconds per photo) and transition (clean cut, dissolve, or slide right to left) they choose on the Edits page.
- The Mexico example video: 2.5 seconds per photo, with each photo dissolving into the next over about 1 second (inside its 2.5 seconds). It has no sound and only plays when the visitor presses play.
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

## Collage style (Mosaic)
- A tight mosaic, like a printed photo card: photos sit straight (no rotation, no individual mounts or shadows), edge to edge in a grid, separated by thin cream (#F6EFE3) gutters, with a matching cream border around the whole collage.
- Photos come in mixed sizes: some tall (two rows high), some wide (two columns wide), some small (one cell). Each photo fills its tile and is cropped from the centre.
- One tile, near the middle, is a plain warm off-white (#FBF7F0) panel with no photo. It holds the trip name in Lora caps with wide letter spacing (dark brown), a short thin clay (#C9A98A) rule, and the trip's line below in Poppins light (soft brown), all centred. If there is no line, the panel shows the trip name only.
- Welcome collage grid (4 columns by 3 rows, six photos and the panel):
  - Row 1: tall photo, small photo, wide photo.
  - Row 2: (tall photo continues), title panel two columns wide, tall photo.
  - Row 3: wide photo, small photo, (tall photo continues).
- A visitor's Mosaic pages (built by js/collage.js) use the same style, and the grid adapts to the photos on each page:
  - 4 columns for 6 or more photos, 3 columns for 3 to 5 photos, 2 columns for 1 or 2 photos.
  - Tall (portrait) photos get tall tiles and wide (landscape) photos get wide tiles where they fit; the rest get single tiles. Photos keep the trip's order, reading left to right, top to bottom.
  - The title card panel is two columns wide, in the second row (the first row when there are 3 or fewer photos), as near the middle as the grid allows, on the pages the visitor chose. It shows the title card's title and details in the card colour.
  - Any gap left in the grid is filled by stretching a neighbouring photo, so there are no empty holes.
  - Captions sit on top of the photo, like the video, in the visitor's caption style (position, colour, Regular, Bold or Italic Poppins) with the same soft shadow behind the letters.
  - Regenerate (five layouts) changes which photos are big or small and where they sit. Mosaic photos stay straight and never overlap.

## Pile-of-prints collage (Oregon example)
- A tall (2:3) image covered edge to edge with overlapping photo prints on a cream (#F6EFE3) background, like prints piled on a table. Some prints run off the edges.
- Each print has an even warm off-white (#FBF7F0) border, a thin #D8C7AE outline and a soft shadow. Photos fill their print and are cropped from the centre.
- Prints are large (seven photos fill the whole image) and tilted slightly, between minus 3 and plus 3 degrees, set once and never changed.
- A title card sits in the centre, on top of the pile, and is the largest card so it does not get lost. It is a plain off-white print with no photo and three centred lines stacked vertically: OREGON (Lora caps, wide letter spacing, largest), 2026 (Poppins, dark brown, wide letter spacing), a short clay rule, then "These were real mountains" (Poppins light, soft brown).

## Collage styles for a visitor's collage
- Pages are 8.5 x 11 inches, portrait or landscape, drawn at 300 dots per inch. Each style has five layouts (Regenerate), made the same way every time so a chosen layout looks the same on every visit.
- Mosaic: see Collage style (Mosaic) above.
- Polaroid pile: overlapping instant-film prints on a cream page, covering it edge to edge, some running off the edges. Each print has an even warm off-white (#FBF7F0) border with a deeper strip along the bottom (about a fifth of the print's height), a thin #D8C7AE outline and a soft shadow. Photos are square, cropped from the centre. Prints tilt between minus 3 and plus 3 degrees. Captions sit in the bottom strip, centred, in the visitor's colour and font style (no shadow needed). Regenerate changes size, position, tilt and which print sits on top.
- Scrapbook: a sand (#E4D3BA) page with prints laid loosely, with room around them. Each print has an off-white border and a thin outline, and two short strips of translucent "tape" (warm off-white at about 70% strength) across opposite corners. Photos keep their own shape. Prints tilt gently (minus 3 to plus 3 degrees) and overlap only a little. Captions sit on the page just above or below their print, aligned left, centre or right, in the visitor's colour and font style; with "Follow the photo's tilt" on they turn with the print. Regenerate changes size, position, tilt and which print sits on top.
- Title card in each style: Mosaic, a plain panel two cells wide; Polaroid pile, a larger Polaroid with no photo, placed near the middle and on top; Scrapbook, a paper card with tape, placed near the top. The card is the visitor's chosen colour, with the title in Lora caps with wide letter spacing, a short clay rule (cream on dark cards), and the details in Poppins light.

## Example trips
- Example tiles look like normal trip tiles, with one addition: a small "Example" label in Poppins 13px, dark brown on warm off-white with a thin #D8C7AE border and 4px radius, sitting on the top-left corner of the cover photo.
- The Japan and Oregon tile covers are their whole collage images, shown uncropped (fitted inside the cover area on a cream background), so it reads as the same collage as on the home page.
- The same tiles appear on the Trips page in place of the empty-state grey box until the visitor creates a trip.

## Step pages (making a trip)
- Every step page (Upload, Media type, Edits, Preview) ends with one row: a Back link on the left and the step links "Upload · Media type · Edits · Preview" on the right, separated by thin middle dots, in Poppins 14px dark brown, underlined on hover.
- The current step's link is terracotta and not underlined. Links that cannot be used yet are soft brown at half strength and do nothing.
- On phones the row wraps: Back on its own line, the step links under it.
- Back and the step links are at least 44px tall for tapping.

## The upload page (upload.html)
- One calm column, top to bottom: the "New trip" heading (h1), the Trip title label and text box (placeholder "Where did you go?" in soft brown), the photo count (caption style), the drop zone, then the Continue button, centred under the drop zone (the one primary button on this screen; shown faded and not clickable until a photo is added).
- Added photos sit in a grid of equal square tiles: three or four across on desktop, two on phones, with 16px between tiles in both directions.
- Each tile is a warm off-white mount with the thin #D8C7AE border and soft shadow. The photo is fitted whole inside it with a small margin and never cropped, so a tall photo leaves more of the tile showing at the left and right, and a wide photo more at the top and bottom. No tilt.
- Under each tile, a small Remove text button (12px text, still 44px tall so it is easy to tap).

## The media type page (media.html)
- Page head: the trip's title (h1), and under it "How would you like to remember this one?" in soft brown, both centred. 64px of space separates this text from the tiles.
- Two equal tiles below, side by side on tablets and desktop, stacked on phones. Each tile is a warm off-white mount with the thin #D8C7AE border and soft shadow, holding a picture of the same shape (the collage's wide shape) and, centred under it, the label in the small heading style (Lora caps 16px): "Video" or "Collage".
- The whole tile is the button. It lifts slightly on hover and shows the terracotta focus outline when tabbed to.
- Video picture: a film strip in dark brown (#3B2A21) with cream sprocket holes along the top and bottom and two frames with rounded corners, each holding a Japan photo. The second frame runs off the right edge.
- Collage picture: the Japan collage from the home page.

## The Edits page (edit.html)
- Page head on one line: "Edit" (h1) on the left; the trip's title on the right as an h2, in the h2 style (20px on phones, 24px on desktop), centred vertically against "Edit". On narrow screens the h2 drops under "Edit" if there is not room.
- Five sections, each with a small heading (h3 style, Lora caps 16px) and 64px of space between sections: Order and captions, Caption style, Cover, Duration, Transition.
- Order and captions: the photo count (caption style), then the same equal square tiles as the upload page. Each tile can be picked up and dragged to a new place; while dragging, the tile lifts (deeper shadow) and the other tiles shift to show where it will land. Under each tile, a caption box (Poppins 13px, light outline, placeholder "Add a caption"). Small "Move earlier" / "Move later" controls are not shown; keyboard users move a focused tile with the arrow keys.
- Caption style: on desktop, the controls on the left and a live sample on the right; stacked on phones. Controls, each with a small label: Position (two rows of option buttons, "Top · Bottom" and "Left · Centre · Right"), Text colour (the same five round swatches as the cover), Font style (option buttons "Regular", "Bold", "Italic", each shown in its own style). The sample is a 16:9 card with a trip photo fitted on cream and the example caption "Your caption here" (or the first caption the visitor wrote) in the chosen spot, colour and style.
- Captions in the video: Poppins, about 1/20 of the frame height, inset from the photo's edge by about 1/30 of the frame, at most two lines. A soft shadow sits behind the letters: dark brown at half strength behind cream, sand and clay; cream behind terracotta and dark brown.
- Cover: on desktop, the controls on the left and a live preview on the right; stacked on phones. Controls: Title and Details text boxes, then "Background" with five round swatches (cream, sand, clay, terracotta, dark brown) and, under them, the trip's photos as small square thumbnails to choose from. The chosen swatch or photo has a 2px terracotta ring. The preview is a 16:9 card (the video's shape) showing the background with the title (Lora caps) and details (Poppins light) centred on it; the text is dark brown on cream, sand and clay, and cream on terracotta, dark brown and photos (photos get a soft dark wash so the text stays readable).
- Duration: five option buttons in a row, "1s · 1.5s · 2s · 2.5s · 3s", outlined in #D8C7AE; the chosen one is filled terracotta with cream text.
- Transition: three option buttons in the same style, "Clean cut", "Dissolve", "Slide", each with a short line under it in caption style.
- The Preview button (primary, the one primary button on this page) is centred under the Transition section, then the Back and step links row.
- For a collage, the sections are: Order and captions, Collage style, Caption style, Title card, then the Preview button.
- Collage style section: three equal style tiles in a row (stacked on phones), each a small picture of the style with its name under it in the small heading style ("Mosaic", "Polaroid pile", "Scrapbook"); the chosen tile has a 2px terracotta ring. Under them, "Page" with option buttons "Portrait" and "Landscape" (8.5 × 11 in shown in caption style), and "Number of pages" with a small number box (placeholder such as "1–4" in soft brown) and a caption-style note if the number is outside the range.
- Caption style section for a collage: the same controls as the video. For Polaroid pile the position buttons are shown at half strength and do nothing, with a caption-style note "Captions sit in the white strip of each Polaroid." For Scrapbook, an extra option button "Follow the photo's tilt" (on or off) appears under the position buttons. Cream, sand and clay swatches are at half strength and do nothing for Polaroid pile and Scrapbook. The live sample shows one photo (or print) in the chosen style with an example caption.
- Title card section: Title and Details boxes, card colour swatches, and "Page" option buttons: "First page only", "Every page", "Page" with a small number box. A small live sample of the card sits beside the controls on desktop.

## The Preview page (preview.html)
- Page head on one line, like the Edits page: "Preview" (h1) on the left, the trip's title (h2) on the right.
- One large tile, centred, the full width of the content column: a warm off-white mount with the thin #D8C7AE border and soft shadow, holding the 16:9 video. While the video is being made, the tile shows "Making your video…" and a percentage, centred in soft brown.
- Controls under the picture, inside the mount, on one row: a round play/pause button on the left (terracotta, cream icon, 44px), then the progress bar filling the rest of the row (a thin #D8C7AE track with a terracotta filled part and a round terracotta handle, at least 44px tall to grab), then the time in caption style ("0:08 / 0:20").
- The Export button (primary, the one primary button on this page) is centred 40px under the tile, like Continue on the Upload page. It is faded and does nothing until the video is ready.
- Then the Back and step links row.
- For a collage: the same page head and one large tile (warm off-white mount) showing the pages. On tablets and desktop two pages sit side by side with 24px between them, each with the thin #D8C7AE outline and soft shadow, like an open album; on phones one page at a time. While the pages are being made, the tile shows "Making your collage…" centred in soft brown.
- Under the tile, one row: Previous and Next arrow buttons (secondary style, "‹" and "›", 44px) with "Pages 1–2 of 4" between them, shown only when there is more than one view to flip through; and the Regenerate button (secondary) with "Layout 2 of 5" in caption style beside it.
- Under that, centred: "Save as" with three option buttons "PDF", "JPEG", "PNG", then the Export button (primary, the one primary button on this page), 40px under the tile row like Continue on the Upload page.

## The Trips page (trips.html)
- Page head: the Trips title (h1) on the left and the New trip button (primary) on the right, centred vertically against the title, in the same layout as the example page head.

## The example view (example.html)
- Page head: on the left, the trip title (h1) with a small label under it in soft brown ("Collage Example" or "Video Example"). On the right, the Start a trip button (the one primary button on this screen), centred vertically against the title and label. On narrow screens it drops below the title only if there is not room beside it.
- Collage example (Oregon): the pile-of-prints collage shown large, as one mounted print the full width of the content column (up to 640px wide on desktop, because it is tall), centred, so it matches the Oregon tile.
- Video example (Mexico): the video in one mounted print the full width of the content column, with the browser's normal video controls. Before it plays it shows IMG_3522 (the Mexico cover). Frames are 4:3 on a cream background, each photo fitted whole (not cropped) and centred.
- Collage example (Japan): the welcome collage shown large, as one mounted print the full width of the content column, so it matches the home page and the Japan tile.
- A Back to home link sits at the bottom of the page and returns to index.html.

## The about page (about.html)
- One reading column, about 640px wide, with the four sections in order: How, Why, Where, Coming Soon. Each section is one heading and one paragraph.
- Section headings use the h2 style. Body text in Poppins 15px.
- Why is written in the first person, in the owner's own words, with no name.

## Never rules
1. Never cover the page with pop-ups, cookie banners, or overlays.
2. Never auto-play music or video.
3. Never crowd the menu or the screen with buttons and options.
4. Never force an extra step before the simple thing (the log-in page stays to email, password, one button).
5. Never use a stock-photo or template look: no generic hero banners, no icon-heavy feature grids, no cold corporate blues or greys.

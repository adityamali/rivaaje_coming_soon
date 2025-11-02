# Rivaajê — Coming soon (static)

This is a small static "coming soon" landing page for a premium watch brand inspired by Indian tradition and heritage.

Files added
- `index.html` — main page
- `styles.css` — styling
- `scripts.js` — countdown and simple email capture (localStorage)
- `assets/logo.svg` — brand mark
 - `background.mp4` (optional) — place a video named `background.mp4` in the project root or in `assets/` to use as a full-page backdrop

How to run

Open `index.html` in a browser. On macOS you can run:

```bash
open "index.html"
```

Customize
- Change the launch date in `scripts.js` (LAUNCH_DATE constant).
- Update brand copy, social links and logo in `assets/logo.svg`.

Notes
- This page stores captured emails locally (localStorage) for demo purposes. For production, wire the form to a server or email service provider (e.g., Mailchimp, ConvertKit, or a simple serverless function).
- Fonts use Google Fonts; an internet connection is required for them to load.

Background video
- To use a full-bleed video backdrop, add a file named `background.mp4` either at the project root (`background.mp4`) or inside the `assets/` folder (`assets/background.mp4`).
- The page will automatically try `assets/background.mp4` first, then `background.mp4`.
- Keep the file reasonably optimized for web (H.264 baseline/profile, ~5–10 MB or smaller for initial load). For production prefer adaptive streaming or a compressed short loop.

Safari / encoding notes
- Desktop Safari (and older Safari versions) prefer MP4 (H.264) with AAC audio. If your video is WebM or encoded with a codec Safari doesn't support, it will not play. Use the command below to produce a broadly-compatible MP4 optimized for the web:

```bash
ffmpeg -i input.mov -vcodec libx264 -profile:v baseline -level 3.0 -preset fast -crf 23 -acodec aac -movflags +faststart background.mp4
```

This command produces an H.264 MP4 with a fast-start flag (better for progressive playback). If Safari still doesn't play the file locally, try opening the page from a simple static server (some browsers behave differently over file://). You can serve the folder quickly with Python:

```bash
cd "/Users/aditya/Rivaajê/coming soon"
python3 -m http.server 8000
# then visit http://localhost:8000 in Safari
```

Mobile Safari notes
- iOS Safari sometimes blocks autoplay even when muted. This project sets `muted` + `playsinline` and uses a small JS fallback that attempts to play again on the first user gesture (touch/click). If autoplay still doesn't start, a quick tap on the page will start the background video.
- To reduce mobile data use, consider serving a small poster image for mobile devices or conditionally loading the video only on larger screens.

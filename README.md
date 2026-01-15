# Javascript Arcade

## Overview
This mini‑arcade hub presents a retro‑styled landing page that lets users launch classic games (Asteroids, Breakout, Centipede, Space Invaders).

### Key features:
- CRT‑style flickering background with a subtle scan‑line overlay.
- Animated starfield rendered on a full‑screen <canvas> element.
- Pixel‑art “Press Start 2P” font for a nostalgic feel.
- Hover effect that cycles the game tile’s border and text through a rainbow gradient.
- All assets are static, so the site can be hosted on any static‑file server (GitHub Pages, Netlify, Vercel, etc.).

### Folder Structure

    / (project root)
    │
    ├─ index.html                ← Main page markup
    ├─ assets/
    │   ├─ style.css             ← Global stylesheet
    │   ├─ starfield.js          ← Starfield animation script
    │   └─ thumbnails/
    │       ├─ asteroids.png
    │       ├─ breakout.png
    │       ├─ centipede.png
    │       └─ space-invaders.png
    └─ README.md                 ← (this file)

All paths in the HTML are relative to the assets/ directory.

### starfield.js
- Generates a field of twinkling stars using the Canvas 2D API.
- Main constants (easy to tweak):
-- STAR_COUNT – total stars (default 200).
-- MIN_SIZE / MAX_SIZE – star dimensions (5–8 px).
-- TWINKLE_SPEED – opacity change per frame (0.0075).

4.2 Game Grid & Styling
The `.grid `container uses CSS Grid (`grid-template-columns: repeat(2, 1fr)`) to lay out two columns.
Each `.game` link is a flex container that centers its content and holds an `<img>` (thumbnail) and an `<h2>` title.
The image is absolutely positioned (`z-index: 0, opacity: 0.5`) so the text appears on top.
Hovering triggers the rainbowCycle animation, smoothly cycling border‑color and text‑color through the ROYGBIV spectrum.

### Running the Project Locally
1. Clone / copy the repository to a local folder.
2. Ensure you have an HTTP server (e.g., python -m http.server, npm serve, or VS Code Live Server).
3. Open a terminal in the project root and start the server:

### Deployment Tips
- Static hosting (GitHub Pages, Netlify, Vercel) works out‑of‑the‑box—just push the repo.
- Ensure the assets/ folder is included in the deployment bundle.

# Pong Duel

A small portrait-mode Pong game for phones, built with Expo SDK 57, React Native,
and JavaScript. The repository and local folder are named `pong-duel`; the internal
Expo slug and package name retain the original `demo-app` identifier.

## Play on your phone

[**Play Pong Duel in your browser**](https://peterthelander.github.io/pong-duel/)

Open the link in Safari or Chrome, tap **Play**, and drag in the lower part
of the screen. No Expo Go, Tailscale, shared Wi-Fi, or running computer is needed.
The hosted game is public: anyone can play without signing in to ChatGPT.
Use your phone's browser if GitHub's in-app browser has trouble opening it.

## Controls

- Drag or tap in the lower half of the screen to move your paddle horizontally
  and vertically. Move the paddle upward as it hits the ball to give the return
  extra speed, up to the game's speed limit.
- Play against an AI-controlled upper paddle.
- The first player to score seven points wins. Tap the result screen to restart.
- Wall hits, paddle hits, and goals have bundled sound effects.
- Use the arrows on the home screen to choose an illustrated AI opponent.
  The card shows how many matches you have won against that opponent; counts
  are saved on this device and start at zero for existing players.
  Orly and Mike are level 300; Jeremiah, Victoria, and Uma are level 400;
  Winter and John are level 500; Esther and Madison are level 600; Ruby and
  Benjamin are level 700; Nova and Tori are level 800; Meg, Dara, and Ezra are
  level 900; Emma and Victor are level 1000. Each 100-level tier makes the AI
  faster, with level 100 the easiest and level 1000 the hardest, up to its speed
  limit.
- Use **Settings** to turn sound effects on or off and choose from twelve sound
  styles: Classic, Retro, Soft, Arcade, Chime, Bubble, Laser, Bell, Pop, Drum,
  Cosmic, and Sparkle. Tap a selected style again to hear it.
  Use **Characters** to choose a paddle color.
- Use **Ball** on the home screen to choose its color, size, and pattern.
  Five sizes range from extra small to extra large and change collision size
  during play. Patterns include stripes, dots, diagonal, cross, ring, bullseye,
  half, and checker designs.
- Use **Background** to choose Night, Sunset, Forest, Ocean, Lavender, Rose,
  Desert, or Midnight and place up to nine
  optional hearts, diamonds, circles, or stars. Each decoration can use cyan,
  pink, lime, orange, red, purple, blue, yellow, green, or white, and can be
  placed in any of nine positions. Decorations appear on the home screen and
  in the arena, and do not affect play.
  Use **Profile** to edit your
  name, customize your illustrated portrait, and see your level and progress.
  Choose your hair length, color and hairstyle, skin, shirt and eye colors,
  eyelashes, mouth, shoulder width, glasses, and necklace. Eyelash color follows
  eye color: blonde for blue eyes and matching light or dark brown for brown eyes;
  hair length applies to the None hairstyle, while Hair down is always long.
  Save applies the changes and Cancel discards them. Small portraits of you and
  your opponent appear alongside the match scores. New players start at level 1; existing
  saved levels are retained. Winning earns one progress point per 100 opponent
  levels. Each three points raises your level by one, up to level 1000; remaining
  points carry over. Existing saved points are converted using the new rule.
  Losses and abandoned matches earn no points. A higher player
  level also makes the AI faster.
- Tap **Home** during or after a match to end it and return to the home screen.
  The next match starts fresh.

Scores and match state reset when the app restarts. Preferences and the optional
profile name and level are saved unencrypted on the device; they are not sent to
a server. The game has no backend, account
system, or API keys. The hosted browser version needs an internet connection to
load the app and sound files.

## Develop locally with Expo Go

Install Node.js and an Expo Go version compatible with SDK 57, then run:

```bash
npm ci
npm start
```

Keep the computer and phone on the same Wi-Fi network, then scan the terminal's
QR code with Expo Go (Android) or the Camera app (iOS). Follow Expo Go's sign-in
instructions if prompted. If direct networking is unavailable, including some
Windows/WSL configurations, try:

```bash
npm start -- --tunnel
```

The CLI may prompt to install tunnel support. Keep the development server running
while playing. See [Expo's device setup guide](https://docs.expo.dev/get-started/start-developing/).

`npm run android` and `npm run ios` open supported emulator/simulator setups.
For browser development, run `npm run web`. Run `npm test` for the game-rules
tests, `npm run lint` for linting, and `npm run typecheck` for strict JavaScript
type checking of `gamePhysics.js` and `gameOptions.js`. CI runs these checks
before deploying. The rest of the app is not yet type-checked.
To create a hosted build:

```bash
npm run build:web
```

This writes static HTML, JavaScript, and bundled sound assets to `dist/`.
GitHub Actions builds and deploys to GitHub Pages when changes are pushed to
`master`. The Pages build uses the `/pong-duel` base path; to reproduce it
locally, run `GITHUB_PAGES=true npm run build:web`. For local testing at the
root path, use the regular build followed by `npx expo serve`.

The browser version preloads sound effects into Web Audio buffers before play;
native builds use Expo Audio.

## Project layout

- `src/app/`: Expo Router screens and layout.
- `App.js`: game loop, touch controls, scoring, and game presentation.
- `gameSettings.js`, `gamePreferences.js`, `gameOptions.js`, and `menuStyles.js`: saved preferences and menu presentation.
- `OpponentAvatar.js`: illustrated opponent portraits.
- `useGameSounds.web.js`, `useGameSounds.native.js`, and `webAudio.js`: sound playback.
- `assets/sounds/`: bundled wall, paddle, and goal effects.
- `scripts/generate-sounds.mjs`: generates the original Retro and Soft effects.
- `app.json`: Expo configuration and icons.
- `index.js`: native router entry point.
- `index.web.js` and `web.css`: browser router entry and touch/viewport styles.

## Current status

The web export was checked in Chromium with a 390 × 844 touch viewport: start,
paddle dragging, match completion, and restart. A local production build with
buffered sound was also tested on an iPhone; further device testing is welcome.

`npx eslint App.js` currently reports existing game-loop React hook/ref issues.
The app's React components and platform integrations are not yet type-checked.
Native Expo Go gameplay was not verified in this change.

## License

See [LICENSE](LICENSE) for the included MIT license.

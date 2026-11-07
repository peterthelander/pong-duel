# Pong Duel

A small portrait-mode Pong game for phones, built with Expo SDK 57, React Native,
and JavaScript. The repository and local folder are named `pong-duel`; the internal
Expo slug and package name retain the original `demo-app` identifier.

## Play on your phone

[**Play Pong Duel in your browser**](https://pong-duel-peter.peter-thelander.chatgpt.site)

Open the link in Safari or Chrome, tap **Tap to play**, and drag in the lower part
of the screen. No Expo Go, Tailscale, shared Wi-Fi, or running computer is needed.
The hosted version is private to the owner's ChatGPT account, so you may be asked
to sign in. Use your phone's browser if GitHub's in-app browser has trouble opening it.

## Controls

- Drag or tap in the lower part of the screen to move your paddle.
- Play against an AI-controlled upper paddle.
- The first player to score seven points wins. Tap the result screen to restart.
- Wall hits, paddle hits, and goals have bundled sound effects.

Scores and match state live in memory and reset when the app restarts. The game
has no backend, account system, or API keys; gameplay code makes no network requests.
The hosted browser version needs an internet connection to load its files.

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
For browser development, run `npm run web`. To create a hosted build:

```bash
npm run build:web
```

This writes static HTML, JavaScript, and bundled sound assets to `dist/`.
Sites hosting is configured in `.openai/hosting.json`. Updating GitHub alone does
not update the hosted game; export and publish a new Sites version as well.

## Project layout

- `App.js`: game loop, touch controls, scoring, audio, and presentation.
- `assets/sounds/`: bundled wall, paddle, and goal effects.
- `app.json`: Expo configuration and icons.
- `index.js`: native app registration.
- `index.web.js` and `web.css`: browser registration and touch/viewport styles.

## Current status

The web export was checked in Chromium with a 390 × 844 touch viewport: start,
paddle dragging, match completion, and restart. Real iPhone/Safari testing is still
needed, including sound behavior (browser autoplay policies may affect audio).

`npx expo lint` currently reports existing game-loop React hook/ref issues.
An ad hoc JavaScript type check also reports missing React/WAV/CSS declarations
and `Animated.View` typing issues. These checks are not yet clean; the production
web export is the build check. Native Expo Go gameplay was not verified in this change.

## License

See [LICENSE](LICENSE) for the included MIT license.

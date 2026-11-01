# Pong Duel

A small portrait-mode Pong game for phones, built with Expo SDK 57, React Native,
and JavaScript. The local project folder and Expo slug are still named `demo-app`.

## Play

- Drag or tap in the lower part of the screen to move your paddle.
- Play against an AI-controlled upper paddle.
- The first player to score seven points wins. Tap the result screen to restart.
- Wall hits, paddle hits, and goals have bundled sound effects.

Scores and match state live in memory and reset when the app restarts. The game
has no backend, account system, or API keys; gameplay code makes no network requests.
Expo development tooling still uses a network connection to load the app.

## Run on a phone

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
The existing web command has not been verified; this project is intended for phones.

## Project layout

- `App.js`: game loop, touch controls, scoring, audio, and presentation.
- `assets/sounds/`: bundled wall, paddle, and goal effects.
- `app.json`: Expo configuration and icons.
- `index.js`: app registration.

## Current status

This is an experimental game saved from a local prototype. No phone gameplay check
was performed during repository publication. It has no automated gameplay tests
or configured lint/TypeScript tooling. An ad hoc JavaScript type check reports missing
WAV module declarations and React Native typing issues around `Animated.View` and
`StyleSheet.absoluteFillObject`; these need review before treating it as a validated
SDK 57 release.

## License

See [LICENSE](LICENSE) for the included MIT license.

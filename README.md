# SokobanQuest

SokobanQuest is a mobile puzzle game built with React Native, Expo, and TypeScript. Push every box onto a target to solve a level. Boxes can be pushed but not pulled, so plan each move carefully.

## Gameplay

- Move the player with the on-screen arrow buttons.
- Push boxes onto all targets to complete the current level.
- Track your level, move count, and boxes already on targets in the status cards.
- Undo the previous move or restart the current level at any time.
- Completing a puzzle advances the campaign. Finish the last level to replay the campaign.
- Open **Edit Levels** to create, rename, reshape, play, restart, or delete levels.

## Run with Expo Go

Requirements: Node.js and the Expo Go app on an Android or iOS device.

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm start
   ```
3. Open Expo Go and scan the QR code. Keep the phone and development computer on the same Wi-Fi network.

Run the TypeScript check with:

```sh
npm run typecheck
```

## Architecture

- `index.tsx` registers the root component with Expo.
- `App.tsx` renders the game and manages the active level, player and box positions, move history, win detection, and campaign progression.
- `LevelEditor.tsx` provides the in-app level library and board painter.
- `App.styles.ts` holds the React Native `StyleSheet` definitions for the screen.
- `LevelEditor.styles.ts` holds the editor styles.
- `assets/game/` contains the transparent PNG characters and game icons used by the board and win screen.
- `levels/types.ts` defines the shared level data shape.
- `levels/level-NN.ts` contains one level's name and map.
- `levels/index.ts` assembles the levels in campaign order.
- `levels/validation.ts` validates level maps for both gameplay and the editor.

## Levels

The bundled campaign currently has five levels. Use **Edit Levels** in the game to create, edit, delete, or play levels; changes are saved on the device and remain separate from the bundled defaults. To add a bundled level in source, create a `level-NN.ts` file in `levels/`, then import and add it to the `levels` array in `levels/index.ts`. The array order is the order players encounter levels.

The editor supports rectangular boards from 5 × 5 to 12 × 12. Choose a tile brush, tap board cells to paint, and give the puzzle a title. Level maps use these symbols:

| Symbol | Meaning |
| --- | --- |
| `#` | Wall |
| Space | Floor |
| `.` | Target |
| `$` | Box |
| `@` | Player |

Each map must have exactly one player and the same nonzero number of boxes and targets. The editor checks these requirements before saving, and gameplay validates them when loading a level.

## Screenshots

![alt text](screenshots/level1.png)
![alt text](screenshots/level2.png)

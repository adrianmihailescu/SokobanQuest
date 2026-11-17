# SokobanQuest

A Sokoban puzzle game built with React Native and Expo, compatible with Expo Go.

## Get started

1. Install dependencies with `npm install`.
2. Start the development server with `npm start`.
3. Scan the QR code with Expo Go on your phone.

## Levels

Levels live in the `levels/` folder. Each `level-NN.ts` file exports a name and a text map. Add new level files and include them in `levels/index.ts` to add them to the campaign.

Maps use `#` for walls, spaces for floor, `.` for targets, `$` for boxes, and `@` for the player. Keep each map rectangular, with one player and an equal number of boxes and targets.
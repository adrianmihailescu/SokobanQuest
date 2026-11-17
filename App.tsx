
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  SafeAreaView,
} from "react-native";
import { styles } from "./App.styles";
import { levels } from "./levels";

const GAME_ICONS = {
  player: require("./assets/game/player.png"),
  box: require("./assets/game/box.png"),
  target: require("./assets/game/target.png"),
  celebration: require("./assets/game/celebration.png"),
  trophy: require("./assets/game/trophy.png"),
};

type Point = { x: number; y: number };

type GameState = {
  player: Point;
  boxes: Point[];
  moves: number;
};

function createGameState(levelMap: readonly string[]): GameState {
  if (levelMap.length === 0 || levelMap[0].length === 0) {
    throw new Error("A level map must not be empty.");
  }

  const width = levelMap[0].length;
  if (levelMap.some(row => row.length !== width)) {
    throw new Error("Every row in a level map must have the same width.");
  }

  let player: Point | undefined;
  let playerCount = 0;
  let targetCount = 0;
  const boxes: Point[] = [];

  levelMap.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (!"# .$@".includes(cell)) {
        throw new Error(`Unknown cell "${cell}" in level map.`);
      }

      if (cell === "@") {
        player = { x, y };
        playerCount++;
      }
      if (cell === "$") boxes.push({ x, y });
      if (cell === ".") targetCount++;
    });
  });

  if (playerCount !== 1 || player === undefined) {
    throw new Error("A level map must contain exactly one player.");
  }
  if (boxes.length === 0 || boxes.length !== targetCount) {
    throw new Error("A level map must contain the same nonzero number of boxes and targets.");
  }

  return { player, boxes, moves: 0 };
}
export default function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = levels[levelIndex];
  const [game, setGame] = useState(() => createGameState(level.map));
  const [history, setHistory] = useState<GameState[]>([]);

  const isWall = (x: number, y: number) =>
    level.map[y]?.[x] === "#" || level.map[y]?.[x] === undefined;

  const hasBox = (x: number, y: number) =>
    game.boxes.some(b => b.x === x && b.y === y);

  const isTarget = (x: number, y: number) =>
    level.map[y]?.[x] === ".";

  const won =
    game.boxes.length > 0 &&
    game.boxes.every(b => isTarget(b.x, b.y));
  const isLastLevel = levelIndex === levels.length - 1;
  const boardWidth = Math.max(...level.map.map(row => row.length));

  function move(dx: number, dy: number) {
    if (won) return;

    const nx = game.player.x + dx;
    const ny = game.player.y + dy;

    if (isWall(nx, ny)) return;

    const boxIndex = game.boxes.findIndex(
      b => b.x === nx && b.y === ny
    );

    let nextBoxes = [...game.boxes];

    if (boxIndex !== -1) {
      const bx = nx + dx;
      const by = ny + dy;

      if (isWall(bx, by) ||
        game.boxes.some(b => b.x === bx && b.y === by)) {
        return;
      }

      nextBoxes[boxIndex] = { x: bx, y: by };
    }

    setHistory(h => [...h, game]);

    setGame({
      player: { x: nx, y: ny },
      boxes: nextBoxes,
      moves: game.moves + 1,
    });
  }

  function restart() {
    setGame(createGameState(level.map));
    setHistory([]);
  }

  function advanceLevel() {
    if (!won || isLastLevel) return;

    const nextLevelIndex = levelIndex + 1;
    setLevelIndex(nextLevelIndex);
    setGame(createGameState(levels[nextLevelIndex].map));
    setHistory([]);
  }

  function replayCampaign() {
    setLevelIndex(0);
    setGame(createGameState(levels[0].map));
    setHistory([]);
  }

  function undo() {
    if (history.length === 0) return;

    setGame(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
  }

  function renderCell(x: number, y: number) {
    const wall = isWall(x, y);
    const box = hasBox(x, y);
    const player = game.player.x === x && game.player.y === y;
    const target = isTarget(x, y);

    return (
      <View
        key={`${x}-${y}`}
        style={[
          styles.cell,
          wall && styles.wall,
          !wall && styles.floor,
          target && styles.target,
          box && styles.box,
        ]}
      >
        {player && (
          <Image
            source={GAME_ICONS.player}
            style={styles.playerIcon}
            resizeMode="contain"
            accessibilityLabel="Player"
          />
        )}
        {box && (
          <Image
            source={GAME_ICONS.box}
            style={styles.boxIcon}
            resizeMode="contain"
            accessibilityLabel="Box"
          />
        )}
        {target && !box && !player &&
          <Image
            source={GAME_ICONS.target}
            style={styles.targetIcon}
            resizeMode="contain"
            accessibilityLabel="Target"
          />}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoRow}>
        <Image
          source={GAME_ICONS.box}
          style={styles.logoIcon}
          resizeMode="contain"
          accessibilityLabel="Box"
        />
        <Text style={styles.logo}>SOKOBAN</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statValue}>
            {String(levelIndex + 1).padStart(2, "0")}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>MOVES</Text>
          <Text style={styles.statValue}>{game.moves}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>BOXES</Text>
          <Text style={styles.statValue}>
            {game.boxes.filter(b => isTarget(b.x, b.y)).length}/
            {game.boxes.length}
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>{level.name.toUpperCase()}</Text>

      <View style={[styles.board, { aspectRatio: boardWidth / level.map.length }]}>
        {level.map.map((row, y) => (
          <View key={y} style={styles.row}>
            {[...row].map((_, x) => renderCell(x, y))}
          </View>
        ))}
      </View>

      {won ? (
        <View style={styles.win}>
          <View style={styles.winHeading}>
            <Image
              source={isLastLevel ? GAME_ICONS.trophy : GAME_ICONS.celebration}
              style={styles.winIcon}
              resizeMode="contain"
              accessibilityLabel={isLastLevel ? "Trophy" : "Celebration"}
            />
            <Text style={styles.winText}>
              {isLastLevel ? "ALL LEVELS COMPLETE!" : "LEVEL COMPLETED!"}
            </Text>
          </View>
          <Text style={styles.subtitle}>
            {isLastLevel ? "You solved every puzzle!" : "Ready for the next one?"}
          </Text>
          <Pressable
            style={styles.nextLevelButton}
            onPress={isLastLevel ? replayCampaign : advanceLevel}
          >
            <Text style={styles.nextLevelText}>
              {isLastLevel ? "PLAY AGAIN" : "NEXT LEVEL →"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.instruction}>
          Push all boxes onto the targets!
        </Text>
      )}

      <View style={styles.controls}>
        <Pressable style={styles.arrow}
          onPress={() => move(0, -1)}>
          <Text style={styles.arrowText}>▲</Text>
        </Pressable>

        <View style={styles.middleControls}>
          <Pressable style={styles.arrow}
            onPress={() => move(-1, 0)}>
            <Text style={styles.arrowText}>◀</Text>
          </Pressable>

          <Pressable style={styles.arrow}
            onPress={() => move(0, 1)}>
            <Text style={styles.arrowText}>▼</Text>
          </Pressable>

          <Pressable style={styles.arrow}
            onPress={() => move(1, 0)}>
            <Text style={styles.arrowText}>▶</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={undo}>
          <Text style={styles.actionText}>↶ UNDO</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={restart}>
          <Text style={styles.actionText}>↻ RESTART</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

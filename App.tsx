
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from "react-native";

type Point = { x: number; y: number };

type GameState = {
  player: Point;
  boxes: Point[];
  moves: number;
};

const LEVEL = [
  "#########",
  "#   .   #",
  "#   $   #",
  "#   @   #",
  "#       #",
  "#########",
];

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function createLevel(): GameState {
  let player = { x: 0, y: 0 };
  const boxes: Point[] = [];

  LEVEL.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "@") player = { x, y };
      if (cell === "$") boxes.push({ x, y });
    });
  });

  return { player, boxes, moves: 0 };
}

export default function App() {
  const [game, setGame] = useState(createLevel);
  const [history, setHistory] = useState<GameState[]>([]);

  const isWall = (x: number, y: number) =>
    LEVEL[y]?.[x] === "#" || LEVEL[y]?.[x] === undefined;

  const hasBox = (x: number, y: number) =>
    game.boxes.some(b => b.x === x && b.y === y);

  const isTarget = (x: number, y: number) =>
    LEVEL[y]?.[x] === ".";

  const won =
    game.boxes.length > 0 &&
    game.boxes.every(b => isTarget(b.x, b.y));

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
    setGame(createLevel());
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
        {player && <Text style={styles.player}>🧑</Text>}
        {box && <Text style={styles.boxEmoji}>📦</Text>}
        {target && !box && !player &&
          <Text style={styles.targetEmoji}>🎯</Text>}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>📦 SOKOBAN</Text>
      <Text style={styles.subtitle}>THE CRATE QUEST</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statValue}>01</Text>
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

      <View style={styles.board}>
        {LEVEL.map((row, y) => (
          <View key={y} style={styles.row}>
            {[...row].map((_, x) => renderCell(x, y))}
          </View>
        ))}
      </View>

      {won ? (
        <View style={styles.win}>
          <Text style={styles.winText}>🎉 LEVEL COMPLETED!</Text>
          <Text style={styles.subtitle}>
            Great job! You solved the puzzle.
          </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17251F",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: "900",
    color: "#F5D99A",
    letterSpacing: 3,
  },
  subtitle: {
    color: "#A9B9A8",
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 25,
  },
  stat: {
    backgroundColor: "#263A30",
    padding: 12,
    borderRadius: 12,
    width: "29%",
    alignItems: "center",
  },
  statLabel: {
    color: "#A9B9A8",
    fontSize: 10,
  },
  statValue: {
    color: "#F5D99A",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  board: {
    width: "100%",
    maxWidth: 360,
    aspectRatio: 9 / 6,
    backgroundColor: "#263A30",
    padding: 5,
    borderRadius: 12,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    margin: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  wall: {
    backgroundColor: "#55745A",
    borderWidth: 1,
    borderColor: "#78936C",
  },
  floor: {
    backgroundColor: "#D7C49B",
  },
  target: {
    backgroundColor: "#E5B96C",
  },
  box: {
    backgroundColor: "#A76B3F",
    borderWidth: 2,
    borderColor: "#704326",
  },
  player: {
    fontSize: 23,
  },
  boxEmoji: {
    fontSize: 21,
  },
  targetEmoji: {
    fontSize: 15,
  },
  instruction: {
    color: "#D8E4D4",
    marginTop: 25,
    fontSize: 14,
  },
  controls: {
    alignItems: "center",
    marginTop: 20,
  },
  middleControls: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },
  arrow: {
    width: 65,
    height: 55,
    borderRadius: 14,
    backgroundColor: "#D9A85F",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    color: "#263A30",
    fontSize: 25,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#314A3B",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  actionText: {
    color: "#F5D99A",
    fontWeight: "bold",
  },
  win: {
    alignItems: "center",
    marginTop: 20,
  },
  winText: {
    color: "#F5D99A",
    fontSize: 18,
    fontWeight: "bold",
  },
});

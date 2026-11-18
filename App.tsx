
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./App.styles";
import { levels as bundledLevels } from "./levels";
import { LevelEditor } from "./LevelEditor";
import type { LevelDefinition } from "./levels/types";
import { validateLevelMap } from "./levels/validation";
import type { GameState, Point } from "./types/game";

const LEVELS_STORAGE_KEY = "sokobanquest.levels.v1";

const GAME_ICONS = {
  player: require("./assets/game/player.png"),
  box: require("./assets/game/box.png"),
  target: require("./assets/game/target.png"),
  arrow: require("./assets/game/arrow.png"),
  celebration: require("./assets/game/celebration.png"),
  trophy: require("./assets/game/trophy.png"),
};

function createGameState(levelMap: readonly string[]): GameState {
  const validationError = validateLevelMap(levelMap);
  if (validationError) throw new Error(validationError);

  let player: Point | undefined;
  const boxes: Point[] = [];

  levelMap.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "@") {
        player = { x, y };
      }
      if (cell === "$") boxes.push({ x, y });
    });
  });

  if (player === undefined) throw new Error("A level map must contain exactly one player.");
  return { player, boxes, moves: 0 };
}

function readStoredLevels(serialized: string): LevelDefinition[] {
  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Saved levels must be a non-empty list.");
  }

  return parsed.map((item, index) => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("name" in item) ||
      typeof item.name !== "string" ||
      !("map" in item) ||
      !Array.isArray(item.map) ||
      !item.map.every((row: unknown) => typeof row === "string")
    ) {
      throw new Error(`Saved level ${index + 1} has an invalid format.`);
    }

    const validationError = validateLevelMap(item.map);
    if (validationError) {
      throw new Error(`Saved level ${index + 1}: ${validationError}`);
    }
    return { name: item.name, map: [...item.map] };
  });
}
export default function App() {
  const [levels, setLevels] = useState<LevelDefinition[]>(() =>
    bundledLevels.map(level => ({ name: level.name, map: [...level.map] }))
  );
  const [levelIndex, setLevelIndex] = useState(0);
  const [screen, setScreen] = useState<"game" | "editor">("game");
  const [levelsReady, setLevelsReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const level = levels[levelIndex];
  const [game, setGame] = useState(() => createGameState(level.map));
  const [history, setHistory] = useState<GameState[]>([]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(LEVELS_STORAGE_KEY)
      .then(serialized => {
        if (!active || serialized === null)
          return;
        try {
          setLevels(readStoredLevels(serialized));
        } catch (error) {
          setStorageError(
            error instanceof Error ? error.message : "Saved levels could not be read."
          );
        }
      })
      .catch(error => {
        if (active) {
          setStorageError(
            error instanceof Error ? error.message : "Saved levels could not be read."
          );
        }
      })
      .finally(() => {
        if (active)
          setLevelsReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const activeIndex = Math.min(levelIndex, levels.length - 1);
    if (activeIndex !== levelIndex) setLevelIndex(activeIndex);
    setGame(createGameState(levels[activeIndex].map));
    setHistory([]);
  }, [levels]);

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
    if (won)
      return;

    const nx = game.player.x + dx;
    const ny = game.player.y + dy;

    if (isWall(nx, ny))
      return;

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

  useEffect(() => {
    if (screen !== "game" || Platform.OS !== "web" || typeof window === "undefined")
      return;

    function handleKeyDown(event: KeyboardEvent) {
      let direction: Point | undefined;
      switch (event.key) {
        case "ArrowUp":
          direction = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          direction = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          direction = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          direction = { x: 1, y: 0 };
          break;
        default:
          return;
      }

      event.preventDefault();
      move(direction.x, direction.y);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game, level, screen, won]);

  function restart() {
    setGame(createGameState(level.map));
    setHistory([]);
  }

  function advanceLevel() {
    if (!won || isLastLevel)
      return;

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
    if (history.length === 0)
      return;

    setGame(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
  }

  async function saveLevel(index: number | null, updatedLevel: LevelDefinition) {
    const updatedLevels = [...levels];
    if (index === null)
      updatedLevels.push(updatedLevel);
    else updatedLevels[index] = updatedLevel;

    try {
      await AsyncStorage.setItem(LEVELS_STORAGE_KEY, JSON.stringify(updatedLevels));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Storage is unavailable.";
      setStorageError(`Could not save your levels. ${message}`);
      throw new Error(`Could not save your levels. ${message}`);
    }

    setStorageError("");
    setLevels(updatedLevels);
  }

  async function deleteLevel(index: number) {
    if (levels.length <= 1)
      throw new Error("Keep at least one level in your library.");
    const updatedLevels = levels.filter((_, levelPosition) => levelPosition !== index);

    try {
      await AsyncStorage.setItem(LEVELS_STORAGE_KEY, JSON.stringify(updatedLevels));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Storage is unavailable.";
      setStorageError(`Could not delete this level. ${message}`);
      throw new Error(`Could not delete this level. ${message}`);
    }

    setStorageError("");
    setLevelIndex(current => Math.min(current, updatedLevels.length - 1));
    setLevels(updatedLevels);
  }

  if (screen === "editor") {
    return (
      <SafeAreaView style={styles.container}>
        {storageError ? (
          <Text accessibilityRole="alert" style={styles.storageError}>
            {storageError}
          </Text>
        ) : null}
        <LevelEditor
          levels={levels}
          onClose={() => setScreen("game")}
          onPlayLevel={index => {
            setLevelIndex(index);
            setGame(createGameState(levels[index].map));
            setHistory([]);
            setScreen("game");
          }}
          onSaveLevel={saveLevel}
          onDeleteLevel={deleteLevel}
        />
      </SafeAreaView>
    );
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
        <View style={styles.brand}>
          <Image
            source={GAME_ICONS.box}
            style={styles.logoIcon}
            resizeMode="contain"
            accessibilityLabel="Box"
          />
          <Text style={styles.logo}>SOKOBAN</Text>
        </View>
        <Pressable
          accessibilityLabel="Edit levels"
          disabled={!levelsReady}
          style={[styles.editorButton, !levelsReady && styles.disabledEditorButton]}
          onPress={() => setScreen("editor")}
        >
          <Text style={styles.editorButtonText}>EDIT LEVELS</Text>
        </Pressable>
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
          Use the arrow keys or on-screen controls to push all boxes onto the targets!
        </Text>
      )}

      <View style={styles.controls}>
        <Pressable accessibilityLabel="Move up" style={styles.arrow}
          onPress={() => move(0, -1)}>
          <Image
            source={GAME_ICONS.arrow}
            style={styles.arrowIcon}
            resizeMode="contain"
            accessibilityLabel="Up arrow"
          />
        </Pressable>

        <View style={styles.middleControls}>
          <Pressable accessibilityLabel="Move left" style={styles.arrow}
            onPress={() => move(-1, 0)}>
            <Image
              source={GAME_ICONS.arrow}
              style={[styles.arrowIcon, styles.arrowLeft]}
              resizeMode="contain"
              accessibilityLabel="Left arrow"
            />
          </Pressable>

          <Pressable accessibilityLabel="Move down" style={styles.arrow}
            onPress={() => move(0, 1)}>
            <Image
              source={GAME_ICONS.arrow}
              style={[styles.arrowIcon, styles.arrowDown]}
              resizeMode="contain"
              accessibilityLabel="Down arrow"
            />
          </Pressable>

          <Pressable accessibilityLabel="Move right" style={styles.arrow}
            onPress={() => move(1, 0)}>
            <Image
              source={GAME_ICONS.arrow}
              style={[styles.arrowIcon, styles.arrowRight]}
              resizeMode="contain"
              accessibilityLabel="Right arrow"
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={undo}>
          <Text style={styles.actionText}>UNDO</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Restart this level"
          style={[styles.actionButton, styles.restartButton]}
          onPress={restart}
        >
          <Text style={styles.actionText}>RESTART GAME</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { LevelDefinition } from "./levels/types";
import { validateLevelMap } from "./levels/validation";
import { editorStyles as styles } from "./LevelEditor.styles";

const TILE_ICONS = {
  player: require("./assets/game/player.png"),
  box: require("./assets/game/box.png"),
  target: require("./assets/game/target.png"),
};

const TILE_TOOLS = [
  { key: "#", label: "Wall" },
  { key: " ", label: "Floor" },
  { key: ".", label: "Target" },
  { key: "$", label: "Box" },
  { key: "@", label: "Player" },
] as const;

type Tile = typeof TILE_TOOLS[number]["key"];

function createNewLevel(): LevelDefinition {
  const width = 8;
  const height = 6;
  const map: string[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      x === 0 || y === 0 || x === width - 1 || y === height - 1 ? "#" : " "
    )
  );
  map[1][1] = "@";
  map[height - 2][width - 3] = "$";
  map[height - 2][width - 2] = ".";

  return { name: "New Level", map: map.map(row => row.join("")) };
}

function resizeLevelMap(map: string[], width: number, height: number): string[] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => map[y]?.[x] ?? " ").join("")
  );
}

export type LevelEditorProps = {
  levels: LevelDefinition[];
  onClose: () => void;
  onPlayLevel: (index: number) => void;
  onSaveLevel: (index: number | null, level: LevelDefinition) => Promise<void>;
  onDeleteLevel: (index: number) => Promise<void>;
};

export function LevelEditor({
  levels,
  onClose,
  onPlayLevel,
  onSaveLevel,
  onDeleteLevel,
}: LevelEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draft, setDraft] = useState<LevelDefinition>(createNewLevel);
  const [selectedTile, setSelectedTile] = useState<Tile>("#");
  const [message, setMessage] = useState("");
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function startNewLevel() {
    setDraft(createNewLevel());
    setEditingIndex(null);
    setIsEditingDraft(true);
    setSelectedTile("#");
    setMessage("");
  }

  function startEditing(index: number) {
    setDraft({ name: levels[index].name, map: [...levels[index].map] });
    setEditingIndex(index);
    setIsEditingDraft(true);
    setSelectedTile("#");
    setMessage("");
  }

  function cancelEditing() {
    setEditingIndex(null);
    setIsEditingDraft(false);
    setMessage("");
  }

  function updateDimensions(axis: "width" | "height", delta: number) {
    const height = draft.map.length;
    const width = draft.map[0].length;
    const nextWidth = axis === "width" ? width + delta : width;
    const nextHeight = axis === "height" ? height + delta : height;
    if (nextWidth < 5 || nextWidth > 12 || nextHeight < 5 || nextHeight > 12) return;

    setDraft(current => ({
      ...current,
      map: resizeLevelMap(current.map, nextWidth, nextHeight),
    }));
  }

  function paintCell(x: number, y: number) {
    setDraft(current => {
      const nextMap = current.map.map(row => [...row]);
      if (selectedTile === "@") {
        nextMap.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (cell === "@") nextMap[rowIndex][cellIndex] = " ";
          });
        });
      }
      nextMap[y][x] = selectedTile;
      return { ...current, map: nextMap.map(row => row.join("")) };
    });
    setMessage("");
  }

  async function saveLevel() {
    const name = draft.name.trim();
    if (!name) {
      setMessage("Give your level a title first.");
      return;
    }

    const validationError = validateLevelMap(draft.map);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      await onSaveLevel(editingIndex, { name, map: [...draft.map] });
      setEditingIndex(null);
      setIsEditingDraft(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save this level.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteLevel(index: number) {
    setMessage("");
    try {
      await onDeleteLevel(index);
      setConfirmDeleteIndex(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete this level.");
    }
  }

  if (isEditingDraft) {
    const isNewLevel = editingIndex === null;
    const error = validateLevelMap(draft.map);
    const width = draft.map[0].length;

    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{isNewLevel ? "NEW PUZZLE" : "EDIT PUZZLE"}</Text>
          <Text style={styles.title}>{isNewLevel ? "Create a level" : "Shape your level"}</Text>
        </View>

        <Text style={styles.fieldLabel}>LEVEL TITLE</Text>
        <TextInput
          accessibilityLabel="Level title"
          value={draft.name}
          onChangeText={name => setDraft(current => ({ ...current, name }))}
          placeholder="Give your puzzle a name"
          placeholderTextColor="#829487"
          maxLength={40}
          style={styles.titleInput}
        />

        <View style={styles.dimensions}>
          {(["width", "height"] as const).map(axis => (
            <View key={axis} style={styles.dimensionControl}>
              <Text style={styles.dimensionLabel}>{axis.toUpperCase()}</Text>
              <Pressable
                accessibilityLabel={`Decrease board ${axis}`}
                onPress={() => updateDimensions(axis, -1)}
                style={styles.dimensionButton}
              >
                <Text style={styles.dimensionButtonText}>−</Text>
              </Pressable>
              <Text style={styles.dimensionValue}>
                {axis === "width" ? width : draft.map.length}
              </Text>
              <Pressable
                accessibilityLabel={`Increase board ${axis}`}
                onPress={() => updateDimensions(axis, 1)}
                style={styles.dimensionButton}
              >
                <Text style={styles.dimensionButtonText}>+</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.fieldLabel}>TAP A TILE TO PAINT</Text>
          <Text style={styles.hint}>Board size: 5–12 tiles</Text>
        </View>
        <View style={styles.toolbar}>
          {TILE_TOOLS.map(tool => (
            <Pressable
              key={tool.key}
              onPress={() => setSelectedTile(tool.key)}
              style={[styles.tool, selectedTile === tool.key && styles.selectedTool]}
            >
              {tool.key === "." ? (
                <Image source={TILE_ICONS.target} style={styles.toolIcon} />
              ) : tool.key === "$" ? (
                <Image source={TILE_ICONS.box} style={styles.toolIcon} />
              ) : tool.key === "@" ? (
                <Image source={TILE_ICONS.player} style={styles.toolIcon} />
              ) : (
                <View style={[styles.toolSwatch, tool.key === "#" ? styles.wall : styles.floor]} />
              )}
              <Text style={styles.toolLabel}>{tool.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.board, { aspectRatio: width / draft.map.length }]}>
          {draft.map.map((row, y) => (
            <View key={y} style={styles.boardRow}>
              {[...row].map((cell, x) => (
                <Pressable
                  accessibilityLabel={`${TILE_TOOLS.find(tool => tool.key === cell)?.label ?? "Floor"}, row ${y + 1}, column ${x + 1}`}
                  key={`${x}-${y}`}
                  onPress={() => paintCell(x, y)}
                  style={[
                    styles.boardCell,
                    cell === "#" ? styles.wall : styles.floor,
                    cell === "." && styles.targetCell,
                    cell === "$" && styles.boxCell,
                  ]}
                >
                  {cell === "." && <Image source={TILE_ICONS.target} style={styles.targetIcon} />}
                  {cell === "$" && <Image source={TILE_ICONS.box} style={styles.boardIcon} />}
                  {cell === "@" && <Image source={TILE_ICONS.player} style={styles.boardIcon} />}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {message ? (
          <Text accessibilityRole="alert" style={styles.error}>{message}</Text>
        ) : error ? (
          <Text style={styles.hint}>{error}</Text>
        ) : (
          <Text style={styles.hint}>One player, and matching boxes and targets, are required.</Text>
        )}

        <View style={styles.formActions}>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={cancelEditing}
            style={[styles.cancelEditButton, isSaving && styles.disabledButton]}
          >
            <Text style={styles.levelActionText}>CANCEL</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={saveLevel}
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>{isSaving ? "SAVING…" : "SAVE LEVEL"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Text style={styles.levelActionText}>BACK TO GAME</Text>
        </Pressable>
        <Text style={styles.eyebrow}>YOUR PUZZLE LIBRARY</Text>
        <Text style={styles.title}>Level editor</Text>
        <Text style={styles.subtitle}>Build a challenge, then play it right away.</Text>
      </View>

      <Pressable onPress={startNewLevel} style={styles.newButton}>
        <Text style={styles.newButtonText}>＋  CREATE NEW LEVEL</Text>
      </Pressable>
      {message ? <Text accessibilityRole="alert" style={styles.error}>{message}</Text> : null}

      {levels.map((level, index) => (
        <View key={`${index}-${level.name}`} style={styles.levelCard}>
          <View style={styles.cardCopy}>
            <Text style={styles.levelNumber}>LEVEL {String(index + 1).padStart(2, "0")}</Text>
            <Text style={styles.levelName}>{level.name}</Text>
            <Text style={styles.levelMeta}>
              {level.map[0].length} × {level.map.length} board · {level.map.flatMap(row => [...row]).filter(cell => cell === "$").length} boxes
            </Text>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              accessibilityLabel={`Play ${level.name}`}
              onPress={() => onPlayLevel(index)}
              style={styles.playButton}
            >
              <Text style={styles.playButtonText}>PLAY</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Restart level: ${level.name}`}
              onPress={() => onPlayLevel(index)}
              style={styles.restartLevelButton}
            >
              <Text style={styles.levelActionText}>RESTART LEVEL</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Edit ${level.name}`}
              onPress={() => startEditing(index)}
              style={styles.editLevelButton}
            >
              <Text style={styles.levelActionText}>EDIT LEVEL</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Delete ${level.name}`}
              disabled={levels.length === 1}
              onPress={() => setConfirmDeleteIndex(index)}
              style={[styles.iconButton, levels.length === 1 && styles.disabledButton]}
            >
              <Text style={styles.deleteIcon}>×</Text>
            </Pressable>
          </View>
          {confirmDeleteIndex === index && (
            <View style={styles.confirmation}>
              <Text style={styles.confirmationText}>Delete “{level.name}”?</Text>
              <Pressable onPress={() => setConfirmDeleteIndex(null)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </Pressable>
              <Pressable onPress={() => deleteLevel(index)} style={styles.confirmDeleteButton}>
                <Text style={styles.confirmDeleteText}>DELETE</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

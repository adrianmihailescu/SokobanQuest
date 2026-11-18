export function validateLevelMap(levelMap: readonly string[]): string | null {
  if (levelMap.length === 0 || levelMap[0].length === 0) {
    return "The board must not be empty.";
  }

  const width = levelMap[0].length;
  if (levelMap.some(row => row.length !== width)) {
    return "Every row must have the same width.";
  }

  let playerCount = 0;
  let targetCount = 0;
  let boxCount = 0;

  for (const row of levelMap) {
    for (const cell of row) {
      if (!"# .$@".includes(cell)) {
        return `Unknown board tile: "${cell}".`;
      }
      if (cell === "@") playerCount++;
      if (cell === ".") targetCount++;
      if (cell === "$") boxCount++;
    }
  }

  if (playerCount !== 1) {
    return "Place exactly one player on the board.";
  }
  if (boxCount === 0 || boxCount !== targetCount) {
    return "Add the same number of boxes and targets (at least one each).";
  }

  return null;
}

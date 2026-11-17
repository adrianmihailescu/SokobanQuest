export type Point = { x: number; y: number };

export type GameState = {
  player: Point;
  boxes: Point[];
  moves: number;
};

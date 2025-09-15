// Polyomino shape definitions for all 37 pieces
// 1 = filled cell, 0 = empty cell

export const PIECE_SHAPES = {
  // Normal pieces (4 cells)
  normal_I: [[1, 1, 1, 1]],  // I tetromino
  normal_O: [[1, 1], [1, 1]], // O tetromino
  normal_T: [[0, 1, 0], [1, 1, 1]], // T tetromino
  normal_L: [[1, 0], [1, 0], [1, 1]], // L tetromino
  normal_Z: [[1, 1, 0], [0, 1, 1]], // Z tetromino

  // Uncommon pieces (5 cells)
  uncommon_I: [[1, 1, 1, 1, 1]], // I pentomino
  uncommon_L: [[1, 0], [1, 0], [1, 0], [1, 1]], // Long L
  uncommon_T: [[1, 1, 1], [0, 1, 0], [0, 1, 0]], // T pentomino
  uncommon_U: [[1, 0, 1], [1, 1, 1]], // U pentomino
  uncommon_F: [[0, 1, 1], [1, 1, 0], [0, 1, 0]], // F pentomino
  uncommon_W: [[1, 0, 0], [1, 1, 0], [0, 1, 1]], // W pentomino

  // Rare pieces (7 cells)
  rare_cross: [[0, 1, 0], [1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0]], // Extended cross
  rare_L: [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 1, 1, 1]], // Big L
  rare_T: [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0]], // Wide T
  rare_stairs: [[1, 0, 0], [1, 1, 0], [0, 1, 1], [0, 0, 1]], // Stairs
  rare_hook: [[1, 1, 1], [1, 0, 0], [1, 0, 0], [1, 1, 0]], // Hook shape

  // Epic pieces (8 cells)
  epic_cross: [[0, 1, 0], [0, 1, 0], [1, 1, 1], [0, 1, 0], [0, 1, 0]], // Perfect cross
  epic_L: [[1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 1, 1, 1]], // Long L
  epic_U: [[1, 0, 0, 1], [1, 0, 0, 1], [1, 1, 1, 1]], // Big U
  epic_Z: [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]], // Big Z
  epic_spiral: [[1, 1, 1], [1, 0, 1], [1, 1, 1]], // 3x3 missing center
  epic_T: [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]], // Long T

  // Legendary pieces (9 cells)
  legendary_square: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // 3x3 square
  legendary_cross: [[0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]], // Big cross
  legendary_L: [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 1, 1, 1, 1]], // Giant L
  legendary_snake: [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1]], // Snake

  // Mythic pieces (10 cells)
  mythic_plus: [[0, 1, 1, 1, 0], [0, 1, 0, 1, 0], [1, 1, 0, 1, 1], [0, 0, 0, 0, 0]], // Complex shape
  mythic_H: [[1, 0, 1], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]], // H shape
  mythic_diamond: [[0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [1, 1, 0, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]], // Diamond (partial)
  mythic_complex: [[1, 1, 1, 0], [1, 0, 1, 0], [1, 0, 1, 1], [1, 0, 0, 0]], // Complex shape

  // Transcendent pieces (11 cells)
  transcendent_mega: [[1, 1, 1, 0], [1, 0, 1, 0], [1, 0, 1, 1], [1, 0, 0, 1], [1, 1, 0, 0]], // Mega shape
  transcendent_star: [[0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [1, 1, 1, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]], // Star (partial)
  transcendent_complex: [[1, 1, 1, 1], [1, 0, 0, 1], [1, 0, 0, 1], [1, 1, 1, 1]], // Complex border
  transcendent_ultra: [[1, 1, 0, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 1, 0], [0, 0, 0, 1, 1], [0, 0, 0, 0, 1]], // Diagonal
  transcendent_final: [[1, 0, 1, 0, 1], [1, 1, 1, 1, 1], [0, 0, 1, 0, 0]], // Final shape
};
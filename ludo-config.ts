// Ludo board configuration.
// The board image is a standard 15x15 grid inside a decorative border.
// All positions are expressed as percentages of the board container so tokens
// land exactly on the painted circles/cells regardless of rendered size.

export type PlayerColor = "red" | "green" | "yellow" | "blue"

export const PLAYER_ORDER: PlayerColor[] = ["red", "green", "yellow", "blue"]

export const PLAYER_LABEL: Record<PlayerColor, string> = {
  red: "Red",
  green: "Green",
  yellow: "Yellow",
  blue: "Blue",
}

// Solid token colors (kept close to the board art).
export const PLAYER_HEX: Record<PlayerColor, string> = {
  red: "#e23b3b",
  green: "#2f9e44",
  yellow: "#f0a91c",
  blue: "#2b73c4",
}

// --- Grid geometry -----------------------------------------------------------
// The painted 15x15 grid does not span the full image; there is a border.
// INSET is the % of the image taken up by the border on each side.
const INSET = 2.6
const CELL = (100 - INSET * 2) / 15

type Cell = [number, number] // [col, row], 0..14

export function gridToPct([col, row]: Cell): { x: number; y: number } {
  return {
    x: INSET + (col + 0.5) * CELL,
    y: INSET + (row + 0.5) * CELL,
  }
}

// --- Main loop (52 cells, clockwise) -----------------------------------------
export const MAIN_LOOP: Cell[] = [
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [7, 0],
  [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  [14, 7],
  [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  [7, 14],
  [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  [0, 7],
  [0, 6],
]

// Index into MAIN_LOOP where each color enters the board from its base.
export const START_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
}

// Safe cells (start squares + the four star cells): no captures happen here.
export const SAFE_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47])

// Home-run columns (5 colored cells leading toward the center) per color.
export const HOME_COLUMN: Record<PlayerColor, Cell[]> = {
  red: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  yellow: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  blue: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
}

export const CENTER = gridToPct([7, 7])

// The four white circles inside each home base, as % positions.
export const BASE_CIRCLES: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [
    { x: 15, y: 15 }, { x: 29.5, y: 15 },
    { x: 15, y: 29.5 }, { x: 29.5, y: 29.5 },
  ],
  green: [
    { x: 70.5, y: 15 }, { x: 85, y: 15 },
    { x: 70.5, y: 29.5 }, { x: 85, y: 29.5 },
  ],
  blue: [
    { x: 15, y: 70.5 }, { x: 29.5, y: 70.5 },
    { x: 15, y: 85 }, { x: 29.5, y: 85 },
  ],
  yellow: [
    { x: 70.5, y: 70.5 }, { x: 85, y: 70.5 },
    { x: 70.5, y: 85 }, { x: 85, y: 85 },
  ],
}

// --- Token step math ---------------------------------------------------------
// step -1  -> in base
// step 0..50 -> main loop (relative to color start)
// step 51..55 -> home column (5 cells)
// step 56 -> finished (center)
export const FINISH_STEP = 56
export const LAST_MAIN_STEP = 50

export function stepToPct(
  color: PlayerColor,
  step: number,
): { x: number; y: number } {
  if (step <= LAST_MAIN_STEP) {
    const idx = (START_INDEX[color] + step) % MAIN_LOOP.length
    return gridToPct(MAIN_LOOP[idx])
  }
  if (step < FINISH_STEP) {
    return gridToPct(HOME_COLUMN[color][step - (LAST_MAIN_STEP + 1)])
  }
  return CENTER
}

// Absolute main-loop index for a token, or null if it is off the main loop.
export function stepToLoopIndex(color: PlayerColor, step: number): number | null {
  if (step < 0 || step > LAST_MAIN_STEP) return null
  return (START_INDEX[color] + step) % MAIN_LOOP.length
}

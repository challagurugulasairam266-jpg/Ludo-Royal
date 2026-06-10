"use client"

interface DiceProps {
  value: number | null
  rolling: boolean
  color: string
}

// pip layouts for faces 1-6 on a 3x3 grid (index 0..8)
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

export function Dice({ value, rolling, color }: DiceProps) {
  const face = value ?? 1
  const active = PIPS[face] ?? []

  return (
    <div
      className={`grid h-16 w-16 shrink-0 grid-cols-3 gap-1 rounded-xl border-2 bg-card p-2 shadow-inner ${
        rolling ? "animate-spin" : ""
      }`}
      style={{ borderColor: color }}
      aria-label={value ? `Dice showing ${value}` : "Dice"}
      role="img"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="flex items-center justify-center"
          aria-hidden
        >
          <span
            className="h-2.5 w-2.5 rounded-full transition-opacity"
            style={{
              backgroundColor: color,
              opacity: !rolling && value != null && active.includes(i) ? 1 : 0,
            }}
          />
        </span>
      ))}
    </div>
  )
}

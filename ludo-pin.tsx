"use client"

import { PLAYER_HEX, type PlayerColor } from "@/lib/ludo-config"

interface LudoPinProps {
  color: PlayerColor
  /** size of the pin in pixels */
  size: number
  selectable?: boolean
  selected?: boolean
  onClick?: () => void
}

/**
 * A GPS / map "location pin" shaped token.
 * The pin's pointed tip is at the bottom-center of the SVG so that when the
 * wrapper is anchored with translate(-50%, -100%) the tip rests on the target.
 */
export function LudoPin({ color, size, selectable, selected, onClick }: LudoPinProps) {
  const hex = PLAYER_HEX[color]
  const stroke = "rgba(0,0,0,0.35)"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!selectable}
      aria-label={`${color} token`}
      className={`relative block p-0 leading-none transition-transform duration-150 ${
        selectable ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default"
      } ${selected ? "animate-bounce" : ""}`}
      style={{
        width: size,
        height: size * 1.3,
        filter: selectable
          ? "drop-shadow(0 3px 4px rgba(0,0,0,0.45))"
          : "drop-shadow(0 2px 2px rgba(0,0,0,0.4))",
      }}
    >
      <svg
        viewBox="0 0 40 52"
        width={size}
        height={size * 1.3}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* pin body: rounded head tapering to a point at the bottom */}
        <path
          d="M20 1.5C10.06 1.5 2 9.56 2 19.5c0 12.4 14.1 26.4 17.0 29.2.55.53 1.45.53 2 0C23.9 45.9 38 31.9 38 19.5 38 9.56 29.94 1.5 20 1.5Z"
          fill={hex}
          stroke={stroke}
          strokeWidth="2"
        />
        {/* inner highlight */}
        <path
          d="M20 5C12.27 5 6 11.27 6 19c0 .9.08 1.78.24 2.63C7.6 14.9 13.2 9.9 20 9.9s12.4 5 13.76 11.73C33.92 20.78 34 19.9 34 19c0-7.73-6.27-14-14-14Z"
          fill="rgba(255,255,255,0.28)"
        />
        {/* white center hole */}
        <circle cx="20" cy="19" r="7.5" fill="#ffffff" stroke={stroke} strokeWidth="1.5" />
        <circle cx="20" cy="19" r="3.4" fill={hex} />
      </svg>
    </button>
  )
}

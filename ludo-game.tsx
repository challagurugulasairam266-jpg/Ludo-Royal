"use client"

import { useCallback, useMemo, useState } from "react"
import {
  BASE_CIRCLES,
  FINISH_STEP,
  LAST_MAIN_STEP,
  PLAYER_HEX,
  PLAYER_LABEL,
  PLAYER_ORDER,
  SAFE_INDICES,
  stepToLoopIndex,
  stepToPct,
  type PlayerColor,
} from "@/lib/ludo-config"
import { LudoPin } from "@/components/ludo-pin"
import { Dice } from "@/components/dice"

// Each player has 4 tokens. step === -1 means "in base".
type TokensState = Record<PlayerColor, number[]>

function initialTokens(): TokensState {
  return {
    red: [-1, -1, -1, -1],
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1],
  }
}

const TOKEN_SIZE = 26 // px, base size of a pin

export function LudoGame() {
  const [tokens, setTokens] = useState<TokensState>(initialTokens)
  const [turnIndex, setTurnIndex] = useState(0)
  const [dice, setDice] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [awaitingMove, setAwaitingMove] = useState(false)
  const [sixStreak, setSixStreak] = useState(0)
  const [message, setMessage] = useState("Red to roll. Roll a 6 to leave home.")
  const [winner, setWinner] = useState<PlayerColor | null>(null)

  const current = PLAYER_ORDER[turnIndex]

  // Which tokens can legally move with the given dice value.
  const movableTokens = useCallback(
    (color: PlayerColor, value: number, state: TokensState): number[] => {
      const result: number[] = []
      state[color].forEach((step, i) => {
        if (step === -1) {
          if (value === 6) result.push(i)
        } else if (step + value <= FINISH_STEP) {
          result.push(i)
        }
      })
      return result
    },
    [],
  )

  const advanceTurn = useCallback((rolledSix: boolean, extra: boolean) => {
    if (rolledSix || extra) {
      // same player rolls again
      setDice(null)
      setAwaitingMove(false)
      return
    }
    setSixStreak(0)
    setTurnIndex((t) => (t + 1) % PLAYER_ORDER.length)
    setDice(null)
    setAwaitingMove(false)
  }, [])

  const handleRoll = useCallback(() => {
    if (rolling || awaitingMove || winner) return
    setRolling(true)
    const value = Math.floor(Math.random() * 6) + 1

    // brief roll animation
    setTimeout(() => {
      setRolling(false)
      setDice(value)

      const isSix = value === 6
      const newStreak = isSix ? sixStreak + 1 : 0

      // Three sixes in a row: forfeit the turn.
      if (isSix && newStreak === 3) {
        setMessage(`${PLAYER_LABEL[current]} rolled three 6s — turn forfeited!`)
        setSixStreak(0)
        setTimeout(() => {
          setTurnIndex((t) => (t + 1) % PLAYER_ORDER.length)
          setDice(null)
        }, 900)
        return
      }
      setSixStreak(newStreak)

      const options = movableTokens(current, value, tokens)
      if (options.length === 0) {
        setMessage(`${PLAYER_LABEL[current]} rolled ${value} — no moves available.`)
        setTimeout(() => advanceTurn(false, false), 900)
        return
      }
      setAwaitingMove(true)
      setMessage(
        `${PLAYER_LABEL[current]} rolled ${value} — pick a token to move.`,
      )
    }, 550)
  }, [rolling, awaitingMove, winner, sixStreak, current, tokens, movableTokens, advanceTurn])

  const handleTokenClick = useCallback(
    (color: PlayerColor, tokenIndex: number) => {
      if (!awaitingMove || color !== current || dice == null || winner) return
      const options = movableTokens(current, dice, tokens)
      if (!options.includes(tokenIndex)) return

      const next: TokensState = {
        red: [...tokens.red],
        green: [...tokens.green],
        yellow: [...tokens.yellow],
        blue: [...tokens.blue],
      }

      const cur = next[color][tokenIndex]
      const newStep = cur === -1 ? 0 : cur + dice
      next[color][tokenIndex] = newStep

      let captured = false
      let finishedNow = false

      if (newStep === FINISH_STEP) finishedNow = true

      // Capture logic: only on the shared main loop and not on a safe cell.
      const landingLoopIdx = stepToLoopIndex(color, newStep)
      if (landingLoopIdx != null && !SAFE_INDICES.has(landingLoopIdx)) {
        for (const other of PLAYER_ORDER) {
          if (other === color) continue
          next[other] = next[other].map((s) => {
            const idx = stepToLoopIndex(other, s)
            if (idx === landingLoopIdx) {
              captured = true
              return -1
            }
            return s
          })
        }
      }

      setTokens(next)

      // Win check
      if (next[color].every((s) => s === FINISH_STEP)) {
        setWinner(color)
        setMessage(`${PLAYER_LABEL[color]} wins the game!`)
        setAwaitingMove(false)
        setDice(null)
        return
      }

      const rolledSix = dice === 6
      let msg = `${PLAYER_LABEL[color]} moved.`
      if (captured) msg = `${PLAYER_LABEL[color]} captured an opponent! Extra turn.`
      else if (finishedNow) msg = `${PLAYER_LABEL[color]} sent a token home! Extra turn.`
      else if (rolledSix) msg = `${PLAYER_LABEL[color]} rolled a 6 — extra turn.`
      else msg = `${PLAYER_LABEL[PLAYER_ORDER[(turnIndex + 1) % 4]]}'s turn.`
      setMessage(msg)

      advanceTurn(rolledSix, captured || finishedNow)
    },
    [awaitingMove, current, dice, winner, tokens, movableTokens, turnIndex, advanceTurn],
  )

  const options = useMemo(
    () => (awaitingMove && dice != null ? movableTokens(current, dice, tokens) : []),
    [awaitingMove, dice, current, tokens, movableTokens],
  )

  // Build the list of rendered tokens with positions + small stacking offsets.
  const rendered = useMemo(() => {
    type R = { key: string; color: PlayerColor; index: number; x: number; y: number }
    const list: R[] = []
    const cellCount = new Map<string, number>()

    for (const color of PLAYER_ORDER) {
      tokens[color].forEach((step, index) => {
        let pos: { x: number; y: number }
        if (step === -1) {
          pos = BASE_CIRCLES[color][index]
        } else {
          pos = stepToPct(color, step)
          // offset stacked tokens sharing the same board cell
          const cellKey = `${Math.round(pos.x)}-${Math.round(pos.y)}`
          const n = cellCount.get(cellKey) ?? 0
          cellCount.set(cellKey, n + 1)
          if (n > 0) {
            pos = { x: pos.x + (n % 2 === 1 ? 1.6 : -1.6) * Math.ceil(n / 2), y: pos.y }
          }
        }
        list.push({ key: `${color}-${index}`, color, index, x: pos.x, y: pos.y })
      })
    }
    return list
  }, [tokens])

  const handleReset = () => {
    setTokens(initialTokens())
    setTurnIndex(0)
    setDice(null)
    setRolling(false)
    setAwaitingMove(false)
    setSixStreak(0)
    setWinner(null)
    setMessage("Red to roll. Roll a 6 to leave home.")
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
      {/* Board */}
      <div
        className="relative aspect-square w-full max-w-[min(92vw,640px)] shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/20"
        style={{
          backgroundImage: "url(/ludo-board.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-label="Ludo board"
      >
        {rendered.map((t) => {
          const selectable =
            awaitingMove && t.color === current && options.includes(t.index)
          return (
            <div
              key={t.key}
              className="absolute"
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                transform: "translate(-50%, -100%)",
                zIndex: selectable ? 30 : 10,
              }}
            >
              <LudoPin
                color={t.color}
                size={TOKEN_SIZE}
                selectable={selectable}
                selected={selectable}
                onClick={() => handleTokenClick(t.color, t.index)}
              />
            </div>
          )
        })}
      </div>

      {/* Control panel */}
      <aside className="flex w-full max-w-sm flex-col gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Current turn
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="inline-block h-6 w-6 rounded-full ring-2 ring-black/10"
              style={{ backgroundColor: PLAYER_HEX[current] }}
              aria-hidden
            />
            <span className="text-2xl font-bold">{PLAYER_LABEL[current]}</span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <Dice value={dice} rolling={rolling} color={PLAYER_HEX[current]} />
            <button
              type="button"
              onClick={handleRoll}
              disabled={rolling || awaitingMove || !!winner}
              className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {rolling ? "Rolling…" : awaitingMove ? "Move a token" : "Roll dice"}
            </button>
          </div>

          <p className="mt-4 min-h-10 text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>

        {/* Player progress */}
        <div className="grid grid-cols-2 gap-3">
          {PLAYER_ORDER.map((c) => {
            const finished = tokens[c].filter((s) => s === FINISH_STEP).length
            const onBoard = tokens[c].filter(
              (s) => s >= 0 && s < FINISH_STEP,
            ).length
            return (
              <div
                key={c}
                className={`rounded-xl border bg-card p-3 text-card-foreground transition ${
                  c === current ? "border-2" : "border-border"
                }`}
                style={c === current ? { borderColor: PLAYER_HEX[c] } : undefined}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: PLAYER_HEX[c] }}
                    aria-hidden
                  />
                  <span className="text-sm font-semibold">{PLAYER_LABEL[c]}</span>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Home {finished}/4 · On board {onBoard}
                </p>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition hover:opacity-90"
        >
          New game
        </button>
      </aside>

      {/* Winner overlay */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center text-card-foreground shadow-2xl">
            <span
              className="mx-auto mb-4 block h-12 w-12 rounded-full ring-4 ring-black/10"
              style={{ backgroundColor: PLAYER_HEX[winner] }}
              aria-hidden
            />
            <h2 className="text-2xl font-bold text-balance">
              {PLAYER_LABEL[winner]} wins!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              All four tokens reached home.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

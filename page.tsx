import { LudoGame } from "@/components/ludo-game"

export default function Page() {
  return (
    <main className="min-h-svh w-full px-4 py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
            Ludo Royal
          </h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground md:text-base">
            Four players, classic rules. Roll a 6 to leave home, capture
            opponents, and race all four pins to the center.
          </p>
        </header>
        <LudoGame />
      </div>
    </main>
  )
}

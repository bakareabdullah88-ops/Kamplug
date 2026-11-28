import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/shell/logo";
import { PosterWords } from "@/components/brand/poster-words";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-16 items-center px-(--gutter) md:px-10">
        <Logo />
      </header>
      <main
        id="main"
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-(--gutter) pb-16"
      >
        <PosterWords
          word="Oops"
          rows={3}
          solid={1}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[length:clamp(120px,22vw,320px)] text-accent/10"
        />
        <p className="relative eyebrow text-muted">Error 404</p>
        <EmptyState
          className="relative"
          illustration="lost"
          title="This page took a wrong turn"
          body="The link may be old, or the brand may have moved. Let's get you back to campus."
          action={<ButtonLink href="/explore">Back to the market</ButtonLink>}
          secondary={
            <ButtonLink href="/" variant="secondary">
              Home
            </ButtonLink>
          }
        />
      </main>
    </div>
  );
}

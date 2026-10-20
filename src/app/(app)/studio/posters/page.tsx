import type { Metadata } from "next";
import { Suspense } from "react";
import { Page } from "@/components/shell/page";
import { pagePad } from "@/components/app/layout";
import { PosterMaker } from "@/components/studio/poster-maker";

export const metadata: Metadata = { title: "Posters" };

export default function Route() {
  return (
    <Page className={pagePad}>
      <Suspense>
        <PosterMaker />
      </Suspense>
    </Page>
  );
}

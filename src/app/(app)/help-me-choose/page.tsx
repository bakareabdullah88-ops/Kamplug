import type { Metadata } from "next";
import { Page } from "@/components/shell/page";
import { HelpMeChoose } from "@/components/market/help-me-choose";

export const metadata: Metadata = { title: "Help me choose", robots: { index: false } };

export default function HelpMeChooseRoute() {
  return (
    <Page>
      <HelpMeChoose />
    </Page>
  );
}

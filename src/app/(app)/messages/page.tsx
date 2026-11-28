import type { Metadata } from "next";
import { Suspense } from "react";
import { Page } from "@/components/shell/page";
import { pagePad } from "@/components/app/layout";
import { NavPageHeader } from "@/components/app/nav-header";
import { InboxView } from "@/components/messages/inbox-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

export default function MessagesPage() {
  return (
    <Page className={pagePad}>
      <NavPageHeader
        title="Messages"
        description="Every chat in one place: shops you buy from, and your own shop's customers."
      />
      <Suspense fallback={<Skeleton className="h-[60dvh] w-full" rounded="lg" />}>
        <InboxView emptyBody="Message a shop from its page or a product to ask about sizes, pickup times or custom orders. Customers who order from your shop can chat with you here too." />
      </Suspense>
    </Page>
  );
}

"use client";

import Link from "next/link";
import { Bell, Menu, ShoppingBag } from "lucide-react";
import { useMode } from "@/components/shell/mode";
import { useUi } from "@/stores/ui";
import { iconBtn } from "./icon-button";
import { MessagesButton } from "./messages-button";
import { MobileSidebar } from "./mobile-sidebar";
import { useNavBadges } from "./nav-badges";
import { KamplugLogo } from "./kamplug-mark";

function Dot({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-badge px-1 text-[10px] font-bold text-white tabular ring-2 ring-surface">
      {n > 99 ? "99+" : n}
    </span>
  );
}

/** Phone header: menu and logo, then round buttons for messages, alerts and bag. Your
 * profile, search and Buy/Sell live in the side menu. */
export function MobileTopBar() {
  const mode = useMode();
  const badges = useNavBadges();
  const menu = useUi((s) => s.menuOpen);
  const setMenu = useUi((s) => s.setMenuOpen);
  const menuCount = mode === "selling" ? badges.newOrders : badges.activeOrders;
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-(--z-header) border-b border-line bg-surface pt-[env(safe-area-inset-top)] md:hidden"
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menu}
          onClick={() => setMenu(true)}
          className="relative -ml-1 grid size-10 shrink-0 pressable place-items-center rounded-full text-ink transition-colors hover:bg-ink/[0.05]"
        >
          <Menu className="size-6" />
          {menuCount > 0 && (
            <span className="absolute top-2 right-2 size-2 rounded-full bg-badge ring-2 ring-surface" />
          )}
        </button>
        <Link
          href={mode === "selling" ? "/studio" : "/home"}
          aria-label="Kamplug home"
          className="flex shrink-0 items-center"
        >
          <KamplugLogo className="text-[21px]" />
        </Link>
        <span className="min-w-0 flex-1" />
        <MessagesButton />
        <Link
          href="/notifications"
          aria-label={
            badges.notifications ? `Notifications, ${badges.notifications} unread` : "Notifications"
          }
          className={iconBtn}
        >
          <Bell className="size-5" />
          <Dot n={badges.notifications} />
        </Link>
        {mode === "buying" && (
          <Link
            href="/bag"
            aria-label={badges.bag ? `Bag, ${badges.bag} items` : "Bag"}
            className={iconBtn}
            data-bag-target
          >
            <ShoppingBag className="size-5" />
            <Dot n={badges.bag} />
          </Link>
        )}
      </div>
      <MobileSidebar open={menu} onOpenChange={setMenu} />
    </header>
  );
}

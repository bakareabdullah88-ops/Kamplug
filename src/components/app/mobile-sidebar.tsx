"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut, Plus, Search } from "lucide-react";
import { SidePanel } from "@/components/ui/sheet";
import { useMode } from "@/components/shell/mode";
import { isActive, marketNav, menuItems, shopNav, type NavItem } from "@/config/nav";
import { cn } from "@/lib/cn";
import { useCampus } from "@/queries/catalog";
import { useSession, useSignOut } from "@/queries/session";
import { toast } from "@/stores/toast";
import { useUi } from "@/stores/ui";
import { useNavBadges } from "./nav-badges";
import { UserAvatar } from "./user-avatar";
import { WorkspaceSwitch } from "./workspace-switch";

const row =
  "flex h-12 items-center gap-3.5 rounded-xl px-3 text-[15px] font-medium transition-colors";

/**
 * The phone menu. Your profile on top, then Buy/Sell and search, then the pages
 * of the side you're on, then your account. Messages, notifications and the bag
 * aren't repeated here: they have their own buttons in the header.
 */
export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const mode = useMode();
  const path = usePathname() ?? "/";
  const router = useRouter();
  const badges = useNavBadges();
  const { user } = useSession();
  const campus = useCampus(user?.campusId);
  const signOut = useSignOut();
  const setCommandOpen = useUi((s) => s.setCommandOpen);
  const all = (mode === "selling" ? shopNav : marketNav).flatMap((s) => s.items);
  const pages = menuItems(all);
  const account = marketNav.flatMap((s) => s.items).filter((i) => i.placement === "account");
  const hasShop = !!user && user.brandIds.length > 0;
  const action =
    mode === "selling" || hasShop
      ? { href: "/studio/products/new", label: "Add a product" }
      : { href: "/open-shop", label: "Open a shop" };
  const close = () => onOpenChange(false);

  const item = (it: NavItem) => {
    const active = isActive(it, path);
    const count = it.badge ? badges[it.badge] : 0;
    const Icon = it.icon;
    return (
      <li key={it.href}>
        <Link
          href={it.href}
          onClick={close}
          aria-current={active ? "page" : undefined}
          className={cn(
            row,
            active ? "bg-ink/[0.06] font-bold text-ink" : "text-ink hover:bg-ink/[0.04]",
          )}
        >
          <Icon className="size-[22px] shrink-0" />
          <span className="flex-1">{it.label}</span>
          {count > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-badge px-1.5 text-[11px] font-bold text-white tabular">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      side="left"
      width="sm"
      title="Menu"
      hideTitle
      className="max-w-[320px]"
      footer={
        <Link
          href={action.href}
          onClick={close}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-bold text-on-accent transition-colors hover:bg-accent-hover"
        >
          <Plus className="size-5" /> {action.label}
        </Link>
      }
    >
      <div className="-mx-2 flex flex-col">
        {user && (
          <Link
            href="/account/settings"
            onClick={close}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-ink/[0.04]"
          >
            <UserAvatar size={44} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[16px] font-bold">{user.name}</span>
              <span className="block truncate text-[13px] text-muted">
                {campus?.shortName ?? user.email}
              </span>
            </span>
            <ChevronRight className="size-5 text-muted" aria-hidden />
          </Link>
        )}
        <div className="flex flex-col gap-3 px-2 pt-4 pb-5">
          <WorkspaceSwitch className="w-full" />
          <button
            type="button"
            onClick={() => {
              close();
              setCommandOpen(true);
            }}
            className="flex h-12 items-center gap-3 rounded-full bg-ink/[0.05] px-4 text-[15px] text-muted transition-colors hover:text-ink"
          >
            <Search className="size-5 text-ink" /> Search Kamplug
          </button>
        </div>
        <nav
          aria-label={mode === "selling" ? "Shop" : "Market"}
          className="border-t border-line pt-3 pb-3"
        >
          <ul>{pages.map(item)}</ul>
        </nav>
        <nav aria-label="Account" className="border-t border-line pt-3">
          <ul>
            {account.map(item)}
            <li>
              <button
                type="button"
                onClick={() =>
                  void signOut.mutateAsync().then(() => {
                    close();
                    router.push("/");
                    toast("Signed out");
                  })
                }
                className={cn(row, "w-full text-danger hover:bg-danger-soft")}
              >
                <LogOut className="size-[22px] shrink-0" /> Sign out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </SidePanel>
  );
}

"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useMode } from "@/components/shell/mode";
import { cn } from "@/lib/cn";
import { useNavBadges } from "./nav-badges";

/**
 * Messages, with the number of unread conversations. One inbox holds chats as a
 * buyer and as a shop, so the count covers both and nothing is missed.
 */
export function MessagesButton({ className }: { className?: string }) {
  const mode = useMode();
  const { messages, shopMessages } = useNavBadges();
  const total = messages + shopMessages;
  // One inbox holds both sides; stay in the mode you're in.
  const href = mode === "selling" ? "/studio/messages" : "/messages";
  return (
    <Link
      href={href}
      aria-label={total ? `Messages, ${total} unread` : "Messages"}
      className={cn(
        "relative grid size-10 shrink-0 pressable place-items-center rounded-xl text-ink-2 transition-colors hover:bg-ink/[0.05] hover:text-ink max-[380px]:size-9",
        className,
      )}
    >
      <MessageCircle className="size-[18px]" />
      {total > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-badge px-1 text-[10px] font-bold text-white tabular ring-2 ring-surface">
          {total > 99 ? "99+" : total}
        </span>
      )}
    </Link>
  );
}

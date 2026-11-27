"use client";

import Link from "next/link";
import { Popover as RPopover } from "radix-ui";
import { Check, ChevronDown, MapPin, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { PlaceForm, type PlaceDraft } from "@/components/account/places";
import { ResponsiveSheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { useCampuses } from "@/queries/catalog";
import { usePlaces, useSavePlace } from "@/queries/inbox";
import { useSession } from "@/queries/session";
import { errorMessage } from "@/services/errors";
import type { SavedPlace } from "@/services/types";
import { toast } from "@/stores/toast";

/**
 * "Delivering to …" at the top of home. Tapping it opens a small menu right
 * there (not a new page): your saved places to switch between, an edit button
 * on each, and "Add a new address". Adding and editing open a sheet.
 */
export function AddressMenu({ label }: { label: string | undefined }) {
  const { user } = useSession();
  const places = usePlaces().data;
  const campuses = useCampuses().data;
  const save = useSavePlace();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlaceDraft | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);

  const defaultCampusId =
    campuses?.find((c) => c.id === user?.campusId)?.id ?? campuses?.[0]?.id ?? "";
  const zoneName = (p: SavedPlace) =>
    campuses?.find((c) => c.id === p.campusId)?.zones.find((z) => z.id === p.zoneId)?.name;

  const choose = async (p: SavedPlace) => {
    if (p.isDefault) {
      setOpen(false);
      return;
    }
    setSwitching(p.id);
    try {
      await save.mutateAsync({ ...p, pickupPointId: p.pickupPointId ?? "", isDefault: true });
      setOpen(false);
      toast.success(`Delivering to ${p.label}`, {
        description: "Distances and times now start from here.",
      });
    } catch (e) {
      toast.error("Couldn't switch address", { description: errorMessage(e) });
    } finally {
      setSwitching(null);
    }
  };

  const edit = (p: SavedPlace) => {
    setOpen(false);
    const known = campuses?.some((c) => c.id === p.campusId);
    setEditing(
      known
        ? { ...p, pickupPointId: p.pickupPointId ?? "" }
        : { ...p, campusId: defaultCampusId, zoneId: "", pickupPointId: "" },
    );
  };

  const add = () => {
    setOpen(false);
    setEditing({
      label: "",
      campusId: defaultCampusId,
      zoneId: "",
      pickupPointId: "",
      addressLine: "",
      isDefault: true,
    });
  };

  return (
    <>
      <RPopover.Root open={open} onOpenChange={setOpen}>
        <RPopover.Trigger asChild>
          <button
            type="button"
            className="group -mx-2 flex min-w-0 flex-col items-start rounded-xl px-2 py-1 text-left transition-colors hover:bg-ink/[0.05]"
          >
            <span className="text-[12.5px] text-muted">Delivering to</span>
            <span className="inline-flex min-w-0 items-center gap-1.5 text-[17px] font-bold tracking-[-0.01em]">
              <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
              <span className="truncate">{label ?? "Choose your spot"}</span>
              <ChevronDown
                className="size-4 shrink-0 text-muted transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </span>
          </button>
        </RPopover.Trigger>
        <RPopover.Portal>
          <RPopover.Content
            align="start"
            sideOffset={8}
            collisionPadding={16}
            className="z-(--z-popover) w-[min(360px,calc(100vw-32px))] origin-(--radix-popover-content-transform-origin) rounded-[20px] bg-surface p-2 shadow-lg ring-1 ring-line data-[state=closed]:animate-[pop-out_140ms_cubic-bezier(0.3,0,1,1)_forwards] data-[state=open]:animate-[pop-in_200ms_cubic-bezier(0.2,0,0,1)]"
          >
            <p className="px-3 pt-2 pb-1 text-[12px] font-bold tracking-[0.08em] text-muted uppercase">
              Deliver to
            </p>
            {places && places.length > 0 ? (
              <ul className="flex flex-col">
                {places.map((p) => (
                  <li key={p.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void choose(p)}
                      disabled={switching !== null}
                      aria-current={p.isDefault ? "true" : undefined}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink/[0.05] disabled:opacity-60"
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full ring-2",
                          p.isDefault ? "bg-accent text-on-accent ring-accent" : "ring-line-strong",
                        )}
                        aria-hidden
                      >
                        {p.isDefault && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold">
                          {p.label}
                          {switching === p.id && (
                            <span className="ml-2 text-[13px] font-normal text-muted">
                              Switching…
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[13px] text-muted">
                          {[zoneName(p), p.addressLine].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => edit(p)}
                      aria-label={`Edit ${p.label}`}
                      className="grid size-10 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2 text-[14px] text-muted">
                {label
                  ? `Distances start from ${label}. Save an address for faster checkout.`
                  : "Save where you are so shops show how far they are."}
              </p>
            )}
            <div className="mt-1 flex flex-col border-t border-line-thin pt-1">
              <button
                type="button"
                onClick={add}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-accent-ink transition-colors hover:bg-accent-soft"
              >
                <Plus className="size-5" aria-hidden /> Add a new address
              </button>
              <Link
                href="/account/places"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[14px] text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
              >
                Manage addresses
              </Link>
            </div>
          </RPopover.Content>
        </RPopover.Portal>
      </RPopover.Root>
      <ResponsiveSheet
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        title={editing?.id ? "Edit address" : "Add an address"}
      >
        {editing && (
          <PlaceForm key={editing.id ?? "new"} draft={editing} onDone={() => setEditing(null)} />
        )}
      </ResponsiveSheet>
    </>
  );
}

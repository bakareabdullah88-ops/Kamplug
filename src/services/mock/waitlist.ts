import type { WaitlistService } from "../contracts";
import { ServiceError } from "../errors";
import { newId } from "@/lib/ids";
import { commit, getDb } from "./db";
import { latency } from "./latency";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLES = ["buy", "sell", "both"] as const;

export const mockWaitlist: WaitlistService = {
  async join(raw) {
    const input = (raw ?? {}) as { email?: unknown; role?: unknown };
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    if (!email || email.length > 200 || !EMAIL_RE.test(email))
      throw new ServiceError("VALIDATION", "Enter a valid email address.", {
        email: "Enter a valid email address",
      });
    const role = ROLES.find((r) => r === input.role) ?? "buy";
    await latency(0.5);
    const db = await getDb();
    const at = db.waitlist.findIndex((w) => w.email === email);
    if (at >= 0) return { position: at + 1, already: true };
    db.waitlist.push({ id: newId("w"), email, role, createdAt: new Date().toISOString() });
    await commit("waitlist");
    return { position: db.waitlist.length, already: false };
  },
};

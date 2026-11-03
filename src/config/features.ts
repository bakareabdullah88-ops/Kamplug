/**
 * Features that need the backend. Flip these on as each service goes live;
 * the UI already handles both states.
 */
export const features = {
  /** Card / bank transfer at checkout (BACKEND-SEAM: Paystack). Offline methods always work. */
  onlinePayments: false,
  /** Password reset emails (BACKEND-SEAM: transactional email). */
  passwordResetEmail: false,
  /** Automatic seller payouts (BACKEND-SEAM: Paystack transfers). */
  payouts: false,
  /**
   * Not open yet: only the landing page is reachable and its buttons join a
   * waitlist. On unless NEXT_PUBLIC_WAITLIST is "0" (set that in Vercel to open up).
   */
  waitlist: process.env.NEXT_PUBLIC_WAITLIST !== "0",
} as const;

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
   * Waitlist mode: only the landing page is reachable and its buttons join a
   * waitlist. Off: Kamplug is open. Set NEXT_PUBLIC_WAITLIST=1 in Vercel to turn it on.
   */
  waitlist: process.env.NEXT_PUBLIC_WAITLIST === "1",
} as const;

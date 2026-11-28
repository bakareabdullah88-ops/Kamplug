"use client";

import { PauseOffscreen } from "@/components/shell/pause-offscreen";
import { LucideProvider } from "lucide-react";
import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/overlay";
import { Toaster } from "@/components/ui/toaster";
import { GlobalChrome } from "@/components/shell/global-chrome";
import { SkipLink } from "@/components/shell/page";
import { QueryProvider } from "./query";
import { ThemeProvider } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* Every icon in the app uses one thick, rounded stroke. */}
      <LucideProvider strokeWidth={2.4}>
        <QueryProvider>
          <MotionConfig reducedMotion="user">
            <TooltipProvider delayDuration={350} skipDelayDuration={200}>
              <SkipLink />
              {children}
              <GlobalChrome />
              <PauseOffscreen />
              <Toaster />
            </TooltipProvider>
          </MotionConfig>
        </QueryProvider>
      </LucideProvider>
    </ThemeProvider>
  );
}

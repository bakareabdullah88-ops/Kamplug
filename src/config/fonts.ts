/**
 * Font files. Every face a style in src/config/font-presets.ts can use is
 * declared here. Only the faces the current style uses are downloaded; the
 * default style's face is preloaded.
 *
 * To add a Google font: import it, call it with a new `--ff-…` variable and
 * `preload: false`, add it to `fontClassNames`, then use that variable in a
 * style in font-presets.ts.
 */
import {
  Bricolage_Grotesque,
  DM_Sans,
  Figtree,
  Fraunces,
  Geist,
  Geist_Mono,
  Inter,
  Instrument_Serif,
  Plus_Jakarta_Sans,
} from "next/font/google";

/** The one face for everything: a clean, warm geometric sans that reads well small. */
const figtree = Figtree({
  variable: "--ff-figtree",
  subsets: ["latin"],
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  variable: "--ff-jakarta",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const bricolage = Bricolage_Grotesque({
  variable: "--ff-bricolage",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const inter = Inter({
  variable: "--ff-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const dmSans = DM_Sans({
  variable: "--ff-dm-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const instrument = Instrument_Serif({
  variable: "--ff-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});
const geist = Geist({
  variable: "--ff-geist",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const fraunces = Fraunces({
  variable: "--ff-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/** Labels, prices in tables, order codes, status pills. */
const mono = Geist_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const fontClassNames = [
  figtree,
  jakarta,
  bricolage,
  inter,
  dmSans,
  instrument,
  geist,
  fraunces,
  mono,
]
  .map((f) => f.variable)
  .join(" ");

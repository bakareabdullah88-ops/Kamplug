import { describe, expect, it } from "vitest";
import { categoryPalette, headlineFor, paletteFor, posterPalettes } from "@/lib/poster";

describe("posters", () => {
  it("picks one loud word from a product name", () => {
    expect(headlineFor("Small chops pack")).toBe("CHOPS");
    expect(headlineFor("Party jollof bowl")).toBe("JOLLOF");
    expect(headlineFor("Zobo, 50cl")).toBe("ZOBO");
    // Long words are cut so they fit the poster.
    expect(headlineFor("Extraordinarilylong")).toHaveLength(10);
  });

  it("has a colour for every category, food in tomato", () => {
    for (const id of Object.values(categoryPalette))
      expect(posterPalettes.some((p) => p.id === id)).toBe(true);
    expect(paletteFor("food").id).toBe("tomato");
  });
});

---
name: kamplug-design
description: Kamplug's UI, UX and motion rules (warm paprika-red brand, Figtree type, home layout, motion timings, accessibility). Use before designing, restyling or animating any Kamplug screen or component.
---

# Kamplug design

Read `docs/DESIGN_GUIDE.md` in full before changing any screen. It is the source of truth for
colour, type, spacing, motion, the home screen layout and the one-account model.

The short version:

- **Phase 1** is the Campus Marketplace: six physical-product categories (Food & groceries,
  Fashion, Beauty, Technology, Academics, Lifestyle). Nothing outside them yet.
- **Brand** is multi-colour: paprika red `#CF3F17` (warm, appetising red-orange) for main actions (buttons, selected
  states), and orange, green, purple, sky, berry and lime for identity (headline words,
  section labels, steps, bands, illustrations). Never all red. Ink `#1F1A17`, canvas `#F7F6F4`.
- **Type** Figtree only, weights 400–800, the sizes in the guide's table. No second display face.
- **No vibe-coded tells:** no icon-headline-paragraph blocks, no boxes inside boxes, no
  sparkles or decorative gradients, no stacked poster words, nothing centred by default.
- **Motion** 100–500ms, decelerate in and accelerate out, menus grow from their trigger,
  rotating text holds at least 4s, and everything respects reduced motion.
- **Home** address (menu in place) → search → six category icons → featured stores (large
  cards) → product rows → more stores (equal-size cards). No duplicate sections, nothing invented.
- **One account** buys and sells; no mode switch.
- Check contrast for every new colour pairing; touch targets at least 44px.

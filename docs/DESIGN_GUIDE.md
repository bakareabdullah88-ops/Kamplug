# Kamplug design guide

The rules every screen follows. Phase 1 is the Campus Marketplace: students and campus
businesses sell physical products to other students in six categories. Everything here
serves that: find something nearby fast, trust the seller, order in a few taps.

When in doubt: the owner's words first, then this guide, then taste.

## 1. What "not vibe-coded" means here

Generic AI-made apps share the same tells. Avoid all of them:

- **Icon + headline + paragraph blocks** repeated down a page. Show the real thing instead
  (a product, a shop, an order step).
- **Boxes inside boxes.** Every card with a border, a shadow and a rounded corner flattens the
  hierarchy. Use cards only for things you tap (a store, a product). Group everything else
  with spacing and thin lines.
- **Novelty display fonts and stacked poster type** used as decoration.
- **Decorative sparkles, stars, gradients and emoji** as section markers.
- **Everything centred.** Phone screens read left to right; align to one left edge.
- **Many sizes and weights.** Keep to the type scale below.

## 2. Colour

Brand: **multi-colour and warm**. Kamplug blue is the action colour (main buttons, selected
states, the logo). The supporting colours carry the brand's identity everywhere else: the
landing headline (one colour per language), section labels and "See more" links on home, step
numbers, bands, the open FAQ item and the illustrations. Never paint a whole screen one colour.

| Token                             | Hex                   | Use                                                                |
| --------------------------------- | --------------------- | ------------------------------------------------------------------ |
| `--brand` / `--accent`            | `#3A5BFF`             | Main buttons, selected states, logo. White text passes AA (5.1:1). |
| `--accent-hover` / `--accent-ink` | `#2A3FC4`             | Hover, blue text on light backgrounds (8:1).                       |
| `--accent-soft`                   | `#EEF1FF`             | Selected chips, soft highlights.                                   |
| `--ink`                           | `#1F1A17`             | Text and dark surfaces. Warm near-black, never navy.               |
| `--muted`                         | `#6B625C`             | Secondary text (5.5:1 on canvas).                                  |
| `--canvas`                        | `#F7F6F4`             | App background.                                                    |
| `--surface`                       | `#FFFFFF`             | Cards and sheets.                                                  |
| `--line` / `--line-thin`          | `#E8E4DF` / ink at 9% | Dividers.                                                          |

Supporting colours (vivid for fills behind shapes; `-ink` versions are safe for text):

| Category         | Fill             | Text-safe |
| ---------------- | ---------------- | --------- |
| Food & groceries | orange `#FF8A3D` | `#B4500A` |
| Fashion          | purple `#8B5CF6` | `#6B3FC4` |
| Beauty           | berry `#F0445B`  | `#C02655` |
| Technology       | sky `#4DB4E6`    | `#1F78A8` |
| Academics        | green `#22A060`  | `#1E7F46` |
| Lifestyle        | lime `#A3D63C`   | `#4D7C0F` |

Every detail has a colour job, so screens are never one colour:

| Job                                   | Token                    | Colour |
| ------------------------------------- | ------------------------ | ------ |
| Main buttons, selected states, logo   | `--accent`               | blue   |
| Text links                            | `--link`                 | purple |
| Soft notes, info chips, icon spots    | `--tint` / `--tint-ink`  | orange |
| Discounts, savings, progress, toggles | `--save`                 | green  |
| Verified badges                       | `--verified`             | sky    |
| Places and pins, unread dots          | `--pin`                  | orange |
| Charts                                | `--warm-purple`          | purple |
| Ratings                               | `--warm-sun`             | yellow |
| Categories                            | each category's own pair | mixed  |

Rules:

- Body text needs 4.5:1 contrast; large text (24px+, or 19px+ bold) needs 3:1. Check every new
  pairing. Bright red (`#FF0000`-like) fails with white text, so darken it.
- Text in a supporting colour uses its `-ink` version on light backgrounds (all pass 4.5:1).
- Blue means "act" (buy, order, confirm). Errors use the danger token (red) plus an icon or wording.
- Semantic colours (success, warning, danger) are separate from the brand.

## 3. Type

One family everywhere: **Figtree** (variable, 300–900). Weight and size make the hierarchy;
never a second display face.

| Role                    | Size (phone → desktop) | Weight  | Line height |
| ----------------------- | ---------------------- | ------- | ----------- |
| Hero headline (landing) | 44 → 88px              | 800     | 1.0         |
| Page title              | 28 → 36px              | 800     | 1.1         |
| Section title           | 20 → 22px              | 700     | 1.2         |
| Card title              | 16 → 17px              | 600     | 1.3         |
| Body                    | 16px                   | 400–500 | 1.5         |
| Small / meta            | 13–14px                | 500     | 1.4         |
| Label (caps)            | 12px, +0.08em          | 700     | 1.2         |

- Keep to these sizes. Five to seven sizes in total.
- Headings: tracking about -0.02em. Body: normal tracking.
- Inputs are at least 16px on phones (smaller makes iOS zoom in).
- Lines of reading text: about 40–65 characters.
- Prices and counts use tabular figures.

## 4. Space, shape and depth

- **4px grid.** Common steps: 4, 8, 12, 16, 20, 24, 32, 48, 64.
- **Side gutter:** 16px on phones, 24–32px on desktop.
- **Radius:** 10px small controls, 14px inputs and chips, 18px cards, 24px large banners and
  sheets. Pick by size, never mix on one element.
- **Depth:** at most three levels. Flat at rest; a soft shadow only for things floating above
  the page (menus, sheets, toasts).
- **Touch targets:** 44×44px minimum.

## 5. Motion

Motion explains what happened. It never decorates.

- **Durations:** most UI motion is 100–500ms; longer is far more often the problem than shorter
  (Nielsen Norman Group). Taps and toggles 120–180ms; menus and popovers 180–240ms in, about
  140ms out; sheets and page-level changes 260–320ms.
- **Easing:** enter with a decelerating curve, `cubic-bezier(0.2, 0, 0, 1)` (Material's
  standard curve); exit with an accelerating one. No bounce on functional UI.
- **Origin:** menus and popovers grow from the control that opened them (scale 0.96 → 1 plus
  fade), never from the middle of the screen.
- **Rotating text** (for example the hero headline) holds each word for at least 4 seconds and
  changes with a short, calm transition. Anything that moves on its own for 5 seconds or more
  needs a way to pause, or stops for reduced-motion users.
- **Reduced motion:** with `prefers-reduced-motion`, swap movement for a fade or nothing.
- **One moment per screen.** If everything moves, nothing stands out.

## 6. Home screen layout (buyer)

Learned from Uber Eats, Grab and DoorDash, and from Baymard's food-delivery research:
location and search first, large tappable categories, then personal and popular picks.

1. **Address** at the top: tap opens a small menu in place (saved places, switch, edit, add),
   not a new page.
2. **Search** bar, full width.
3. **Six categories** in one row: custom flat illustrations about 64–68px over a short label,
   no boxes behind them.
4. **Featured stores:** a swipeable row of large cards (about 85% of the screen width on
   phones, image on top in a 16:9 frame, store name, one line of detail). These are the most
   important tap targets on the screen.
5. **Product rows:** swipeable rows of products with price, shop and timing.
6. **More stores:** cards the same size as each other (a grid on desktop, a column or row on
   phones).

No duplicated sections (two rows with the same title), no banners without real content behind
them, and nothing invented: every number and badge comes from real data.

## 7. Components

- **Buttons:** one primary (blue) per view. Secondary: white with a thin line. Text buttons for
  low-stakes actions. Height 44–52px; label states the action ("Add to bag", "Place order").
- **Cards:** image first, then title, then one or two lines of detail. The whole card is the
  tap target.
- **Chips:** 32–36px high, soft fill when selected.
- **Sheets and menus:** a sheet slides up on phones; on desktop the same content opens as a
  popover or side panel.
- **Empty states:** say what will appear and give the one next step.

## 8. One account

Every account can buy and sell. There is no mode switch: the same app, with "Your shop" (or
"Start selling") in the menu. Orders, messages and notifications for both sides live together,
each labelled with which side it belongs to.

## 9. Copy

Plain, short, from the student's side. Name things by what people recognise. Buttons say
exactly what happens. Errors say what went wrong and how to fix it.

## Sources

- Baymard Institute, Food Delivery & Takeout UX benchmark (2026): https://baymard.com/research-articles/food-delivery-and-takeout-ux-benchmark-2026
- Nielsen Norman Group, Executing UX Animations: Duration and Motion Characteristics: https://nngroup.com/articles/animation-duration
- Material Design motion, duration and easing: https://m1.material.io/motion/duration-easing.html and https://m2.material.io/go/design-easing
- Android Material motion theming: https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md
- WebAIM, contrast and colour accessibility: https://webaim.org/articles/contrast/
- W3C, Understanding non-text contrast (WCAG 2.2): https://w3.org/WAI/WCAG22/Understanding/non-text-contrast
- University of Michigan design system, motion (pause for 5s+ autoplay): https://design-system.lib.umich.edu/visual-elements/motion
- uxdesign.cc, 10 principles for typography in UI design: https://uxdesign.cc/10-principles-for-typography-usage-in-ui-design-a8f038f43ffd
- Google Fonts, Figtree: https://fonts.google.com/specimen/Figtree/about
- On generic AI-made design: https://www.creativebloq.com/ai/everything-looks-the-same-now-what and https://www.mindstudio.ai/blog/avoid-vibecoded-landing-pages
- DoorDash design critique (home screen structure): https://ixd.prattsi.org/2023/09/design-critique-doordash-app-ios/

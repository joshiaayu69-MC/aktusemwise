# ElevenLabs Website — Design Reference

> Independent observational analysis of the public marketing site at
> **https://elevenlabs.io**, captured on **16 Nov 2026**. Tokens were measured from the
> shipped CSS/HTML. ElevenLabs may change their site at any time.
>
> This document is not affiliated with, endorsed by, or produced by ElevenLabs. It exists as
> a design reference for our own project. Do not copy their logo, photography, copy, or font
> files. Waldenburg is a commercial typeface — see §4.4.

**Stack observed:** Next.js/React + Tailwind CSS v4 (`tw-` prefix), fonts loaded as
self-hosted `.woff2`, static marketing pages served from a CDN.

---

## 1. In one paragraph

ElevenLabs reads like a quietly confident print magazine that happens to sell AI. The canvas
is a warm off-white (`#FDFCFC`) with cream section bands (`#F5F3F1`) and warm near-black ink
(`#1C1917`), separated by half-pixel hairlines. Almost all "color" comes from soft product
imagery and a single restrained blue (`#2B7FFF`) used for links, focus rings, and data
accents. Type does the heavy lifting: large **Waldenburg Light (300)** headlines with tight
negative tracking, **Inter** for body, and a bold **semi-condensed uppercase** face for
eyebrows and labels. CTAs are quiet pills — black fill for primary, white with a hairline ring
for secondary. Rounded corners are small (8–16px), shadows are barely there, and a subtle
pixelated noise texture keeps the warm surfaces from looking flat. Nothing shouts; scale,
whitespace, and rhythm create the confidence.

---

## 2. Design principles

1. **Warm, not clinical.** Never `#FFFFFF` as the page canvas. Use eggshell/cream; reserve pure
   white for cards and elevated surfaces.
2. **Editorial before decorative.** Big light-weight headlines, tight tracking, asymmetric
   two-column splits, generous vertical space. No gradients, glassmorphism, or neon.
3. **One accent, used like a proofreading mark.** Blue for links, focus, data, and tiny state
   cues. The primary CTA stays black/ink, not blue.
4. **Quiet controls.** Pill buttons, 36–44px heights, hairline rings, `scale(0.98)` on press,
   color-only hover. No bouncy animation.
5. **Texture over shadow.** A faint noise overlay, 0.5px borders, and warm neutral steps do the
   depth work that drop shadows usually do.
6. **Content is the color.** Product screenshots, pastel atmospheric imagery, and video are the
   visual moments; the chrome stays neutral.

---

## 3. Color

### 3.1 Surfaces

| Token | Hex | Use |
|---|---|---|
| `eggshell` | `#FDFCFC` | Page background (global default) |
| `white` | `#FFFFFF` | Cards, secondary buttons, elevated controls |
| `cream` | `#F5F3F1` | Alternate section band, tab tracks, inset panels |
| `sand` | `#EBE8E4` | Chips, pressed/inset states, image placeholders |
| `ink` | `#0C0A09` | Dark media/code surfaces, footer/CTA bands |

Page background is set globally:

```css
body { background-color: var(--page-background-color); } /* eggshell */
```

### 3.2 Warm neutral scale (custom "gray")

This is effectively Tailwind's `stone` scale nudged warmer, exposed as `gray-*` in their build:

| Step | Hex | Typical use |
|---|---|---|
| `gray-25` | `#FDFCFC` | Hover fill on white buttons |
| `gray-50` | `#FAF8F8` | Subtle tint |
| `gray-100` | `#F5F3F1` | Cream band, muted fill |
| `gray-200` | `#EBE8E4` | Borders, tab track, dividers |
| `gray-300` | `#D7D2CC` | Strong borders, skeleton |
| `gray-400` | `#A59F97` | Disabled text, icons |
| `gray-500` | `#777169` | Secondary / body-muted text |
| `gray-600` | `#59544F` | Secondary headings |
| `gray-700` | `#44403B` | Primary button hover |
| `gray-800` | `#292524` | Strong ink text |
| `gray-900` | `#1C1917` | Default heading ink |
| `gray-950` | `#0C0A09` | Near-black, dark bands |

### 3.3 Accent and semantics

| Token | Hex | Use |
|---|---|---|
| `blue-500` | `#2B7FFF` | Links, focus ring, data highlight (the signature accent) |
| `blue-600` | `#155DFC` | Link hover / pressed |
| `blue-800` | `#193CB8` | Blue text on light blue |
| `blue-200/300` | `#BEDBFF` / `#8EC5FF` | Blue-tinted borders/fills |
| `red-500` | `#FB2C36` | Errors, negative deltas, destructive |
| `green-600` | `#00A63E` | Success, positive deltas |
| `amber-*` | `#FBBE45` | Warnings, highlight callouts |

Blue is **not** the primary button color. Primary actions are ink; blue is for interactivity
and information.

### 3.4 Usage ratio (approximate)

- 65% eggshell / cream surfaces
- 20% white cards and media
- 10% ink text and black bands
- 5% blue + semantic + imagery

Never place large saturated color blocks behind long text.

---

## 4. Typography

### 4.1 Families

| Role | Family | Notes |
|---|---|---|
| Editorial display / headings | **Waldenburg** (300 Book, 400 Normal, 700 Fett) | Humanist sans, high x-height, warm/print-like, single-story `a` customization. All rights reserved (KMR / Kimera Corp). |
| Condensed display | **Waldenburg FH** (700 Fett Halbschmal) | Bold semi-condensed; used for large campaign display and labels |
| UI labels / eyebrows | **Waldenburg FH** 700, uppercase | 12–18px, `0.03–0.05em` tracking |
| Body / nav / captions | **Inter** 400/500 | Open source (OFL) |
| Code / metadata | **Geist Mono** | Open source (OFL) |
| Occasional editorial serif | Hedvig Letters Serif | Rare drop-cap/editorial moments |

Fallbacks are metric-matched to Arial (`size-adjust` ~101–106%) to avoid layout shift.

### 4.2 Measured type scale

Sizes are mobile → tablet → desktop (rem). Tracking is in `em`.

| Token | Family / weight | Size | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `display-01` | Waldenburg FH 700 | 48 / 72 / 100px | 100% → 95% | tight | Rare huge campaign headline |
| `display-02` | Waldenburg FH 700 | 40 / 48 / 56 / 64px | 100% | tight | Section-level display |
| `heading-01` | Waldenburg 300 | 36 / 48 / 60px | 105% | -0.03em | Page/section H1 |
| `heading-02` | Waldenburg 300 | 32 / 40 / 48px | 110% | -0.03em | Section H2 |
| `heading-03` | Waldenburg 300 | 28 / 32 / 36px | 120% | -0.02em | Sub-section |
| `heading-04` | Waldenburg 400 | 20 / 24px | 130% | -0.01em | Card group titles |
| `heading-05` | Waldenburg 400 | 18 / 20px | 135% | 0 | Small headings |
| `body-01` | Inter 400 | 17 / 18px | 140–160% | 0 | Default body |
| `paragraph-01` | Inter 400 | 18px | 140% | 0 | Lead paragraph |
| `paragraph-02` | Inter 400 | 16px | 140% | 0 | Body |
| `paragraph-03` | Inter 400 | 14px | 140% | 0 | Caption / meta |
| `paragraph-04` | Inter 400 | 12px | 140% | 0 | Fine print |
| `subhead-01` | Waldenburg 700 | 18 / 20 / 22px | 140% | +0.01em | Bold lead-in |
| `ui-01` | Waldenburg FH 700 | 16 / 18px, uppercase | 110% | +0.03em | Eyebrow / nav label |
| `ui-03` | Waldenburg FH 700 | 14px, uppercase | 110% | +0.05em | Buttons / tabs |
| `ui-04` | Waldenburg FH 700 | 12px, uppercase | 110% | +0.05em | Small labels, badges |
| `mono` | Geist Mono 400 | 12–14px | 140% | 0 | Code, stats, timestamps |

The homepage hero uses the `type-6xl` utility: Waldenburg **300**, ~36px mobile → 48px desktop,
line-height ~2.625rem → 3.25rem, `-0.02em` tracking.

### 4.3 Rules

- **Display is light.** Headlines are weight 300, never 600–800. Drama comes from size and
  tight leading, not boldness.
- **Negative tracking only on large text.** `-0.02em` to `-0.03em` for headings; positive
  `+0.01em` on body/Inter for a slightly airier editorial feel.
- **Uppercase labels are the only "loud" type.** Waldenburg FH 700, 12–14px, 0.05em tracking.
- One `<h1>` per page. Keep heading order semantic.
- Avoid text under ~12px outside of legal fine print.

### 4.4 Licensing and open-source substitutes

**Waldenburg is a commercial font (KMR, designed by Michael Clasen / Kimera Corp). Do not
download or reuse the `.woff2` files from ElevenLabs' CDN.** License it, or use substitutes:

| Role | Open-source substitute | Package |
|---|---|---|
| Display / headings | **Hanken Grotesk** (300–700, high x-height humanist) or **Inter Tight** 300 | `@fontsource-variable/hanken-grotesk` / `inter-tight` |
| Semi-condensed bold labels | **Archivo** (variable width) or **Barlow Semi Condensed** 700 | `@fontsource-variable/archivo` |
| Body | **Inter** (same as ElevenLabs) | `@fontsource-variable/inter` |
| Mono | **Geist Mono** (same as ElevenLabs) | `@fontsource-variable/geist-mono` |

If substituting, tune `letter-spacing` and `line-height` to match the measured values above —
the rhythm matters more than the exact glyphs.

---

## 5. Layout and grid

| Property | Value |
|---|---|
| Max content width | `81.625rem` (1306px), centered |
| Grid | 12 columns |
| Outer gutter | 20px mobile → 40px tablet → 64px desktop |
| Inner gutter | 8px mobile → 16px tablet → 20px desktop |
| Card radius | 12px mobile → 16px desktop |
| Small radius | 8px mobile → 12px desktop |
| Full radius | `9999px` for pills, buttons, tab tracks |

### 5.1 Vertical section rhythm

| Token | Mobile | Desktop |
|---|---|---|
| `section-py-xs` | 12px | 12px |
| `section-py-sm` | 24px | 40px |
| `section-py-md` | 56px | 80px |
| `section-py-lg` | 80px | 120px |
| `section-py-xl` | 120px | 160px |
| `section-py-2xl` | 160px | 200px |

Default marketing sections use `py-lg`; hero often `pt-lg` + `pb-none`. Keep vertical rhythm
consistent — do not invent arbitrary paddings.

### 5.2 Breakpoints (observed)

`22.8125rem` (365px), `25rem` (400px), `32rem` (512px), `40rem` (640px), `48rem` (768px),
`53rem` (848px), `64rem` (1024px), `80rem` (1280px), `96rem` (1536px), `106.25rem` (1700px).

### 5.3 Composition patterns

- **Split hero:** 12-col grid split 6/6; headline + CTAs on the left, supporting paragraph
  bottom-aligned on the right, media/selector below, full-bleed on mobile.
- **Asymmetry:** text columns are often 5–6 of 12, with media breaking the outer gutter.
- **Alignment:** short display labels align to the left edge of the content grid; large media
  often bleeds edge-to-edge on mobile (`-mx` negative gutter) and sits inside the grid on
  desktop.
- **Whitespace:** one idea per band; a single primary message per section. Avoid dense
  multi-column marketing blocks.

---

## 6. Shape, borders, and elevation

| Element | Treatment |
|---|---|
| Buttons, tabs, badges | `border-radius: 9999px` |
| Cards | 12–16px radius |
| Inputs | 8–12px radius |
| Borders | `0.5px` (`--hairline`) or `1px` at `rgba(0,0,0,0.08–0.2)` |
| Dividers | 0.5px `gray-200`; sometimes dotted |
| Card shadow | `0 0.5px 0.75px rgba(0,0,0,.14), inset 0 0.25px rgba(255,255,255,.35)` |
| Soft lift | `0 8px 16px -6px rgba(17,17,17,.04)` |
| Elevated | `0 0 1px rgba(0,0,0,.3), 0 4px 12px rgba(0,0,0,.08), 0 12px 24px rgba(0,0,0,.06)` |

The **noise overlay** is a signature: a small tiled PNG/AVIF (`image-rendering: pixelated`)
at roughly 50% opacity over warm bands. Keep it extremely subtle (1–3% effective contrast);
it should be felt, not seen.

Dotted borders use a repeating radial gradient rather than `dashed`:

```css
--dotted-border: repeating-radial-gradient(circle, rgba(0,0,0,.15) 0 1px, transparent 1px 6px);
```

---

## 7. Components

### 7.1 Announcement bar

- Slim full-width band above the nav, one line, small Inter/UI text.
- Promo copy plus an inline pill CTA. Duplicated track for responsive/marquee behavior.
- Background stays neutral (ink or cream); no saturated color.

### 7.2 Navigation

- Logo left; primary menu centered; CTAs right.
- Link and dropdown items are 36px tall, `rounded-full`, transparent by default, `gray-100` on
  hover, black text.
- Primary CTA: black pill (`h-9`, `px-3.5`, white text). Secondary: white pill with
  `shadow-sm` + 1px ring, black text.
- Mega-menu/dropdown: white panel, 12px radius, hairline border, soft shadow, product icons +
  one-line descriptions.
- Mobile: hamburger opens a full-height sheet; 44px targets; focus is trapped and restored.
- Sticky/contextual nav appears on scroll with a subtle bottom hairline.

### 7.3 Buttons

| Variant | Spec |
|---|---|
| Primary | `bg-black text-white`, hover `gray-700`, `rounded-full`, `active:scale-[0.98]` |
| Secondary | `bg-white text-black shadow-sm ring-1 ring-black/10`, hover `gray-25` |
| Ghost | transparent, hover `gray-100` |
| Link | black text + underline on hover; external links get a small arrow icon |
| Sizes | `sm` h-9 (36px) / px-3.5; `md` h-10 (40px) / px-4; `lg` h-11 (44px) / px-5 |
| Type | Inter 14–16px; optional Waldenburg FH uppercase label for editorial CTAs |
| Transition | `background-color, color, box-shadow, border-color`; 150–200ms ease-out |

All buttons are pills. No square buttons, no gradients, no icon-only primary actions without a
label.

### 7.4 Segmented tabs / product switcher

- Full-width or auto-width `rounded-full` track on cream/`gray-200`.
- Active segment is a white pill (`bg-white`) with a soft shadow; inactive text is `gray-500`.
- Hover on inactive segments fades in a `gray-200` pill behind the label.
- Used for Creative / Agents / API and for resource-type tabs.
- Implement as real buttons with `role="tablist"`, roving focus, `aria-selected`.

### 7.5 Cards

- White/cream surface, 12–16px radius, 0.5px hairline border, almost no shadow.
- Media fills the top of the card edge-to-edge; content padded 16–24px.
- Title (Waldenburg 400/700) + one-line description (Inter `gray-500`) + quiet link/arrow.
- Hover: tiny lift or background shift only; never scale the whole card dramatically.
- In "bento" groups, cards vary in span (6/6, 4/8, 12) but share the same radius/border.

### 7.6 Logo marquee / social proof

- Single row of monochrome customer logos, `gray-400`–`gray-500`, on eggshell.
- Slow infinite marquee, pauses on hover/focus; duplicated track with `aria-hidden` on clones.
- Respect `prefers-reduced-motion` (stop the animation entirely).

### 7.7 Code windows

- Near-black surface (`#0C0A09`–`#1C1917`), 12–16px radius, hairline border.
- Geist Mono 12–14px, soft syntax colors, copy button top-right.
- Horizontal scroll on mobile; never wrap long code lines.

### 7.8 Eyebrows and badges

- Eyebrow: Waldenburg FH 700, 12px, uppercase, 0.05em tracking, `gray-500`, often with a small
  leading rule or dot.
- Badge/pill: cream fill, 12px Inter, 6–8px vertical padding, full radius.
- Status dots: 6–8px, semantic color, with text label (never color alone).

### 7.9 Footer / final CTA

- Large closing statement in Waldenburg Light above two pills ("Talk to sales", "Create …").
- Near-black or cream band, generous `py-xl`.
- Footer columns: product, company, resources, legal; 14px Inter; `gray-500` links.
- Include non-affiliation/legal text and social links; keep it quiet.

---

## 8. Motion

| Token | Value |
|---|---|
| Fast micro | 100–150ms |
| Default | 200ms |
| Large/expand | 300ms |
| Hero/media | 500–700ms |
| Easing | `cubic-bezier(0, 0, 0.2, 1)` (ease-out) |

- Hover: background-color and shadow only; no movement of layout.
- Press: `transform: scale(0.98)`.
- Tabs/menus: opacity + small translate (4–8px) or scale from 0.98; never bounce.
- Marquees/loops: slow, continuous, pause on hover/focus.
- Scroll reveals: subtle opacity/translate once; no parallax on text, no scroll-jacking.
- Always wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)` and halt
  loops under `reduce`.

---

## 9. Homepage anatomy (observed order)

1. Announcement bar (promo pill).
2. Floating/sticky top nav with product mega-menu and auth CTAs.
3. Hero: "Bringing technology to life" + primary/secondary pills; supporting paragraph right;
   product switcher (Creative / Agents / API) and voice-use-case cards.
4. Logo marquee: "Trusted by leading developers and enterprises".
5. Two-platform split: ElevenCreative vs ElevenAgents, each with a product screenshot.
6. Platform feature bands (alternating text/media), each with eyebrow, heading, short copy,
   expandable feature rows, and a quiet CTA.
7. API section with model cards and a dark code window.
8. Research timeline (model name, description, date) with a vertical rail.
9. Safety/values three-up cards with simple line icons.
10. Latest updates: 3-post grid with category and date metadata.
11. Closing CTA band ("AI Communication Platform") + footer.

The page alternates eggshell and cream bands; dark appears only inside code/media surfaces and
occasionally the closing band.

---

## 10. Accessibility

- **Focus:** visible 1.5px solid `#2B7FFF` outline, `2px` offset, on every interactive element.
  Never remove outlines without a replacement.
- **Targets:** minimum 44px for primary actions; 36px only for dense desktop nav.
- **Contrast:** body ink `#1C1917` on eggshell/cream passes AA; `gray-500` only for secondary
  text ≥14px; never `gray-400` for essential copy.
- **Semantics:** one `h1`, ordered headings, real `<button>`/`<a>`, `nav`/`main`/`article`,
  labelled form fields, `aria-expanded` on disclosure, `role="tablist"` for tabs.
- **Motion:** honor `prefers-reduced-motion`; pause marquees.
- **Media:** alt text for informative images, empty alt for decorative; captions for video.
- **Keyboard:** menus and tabs fully operable; mobile sheet traps focus and restores on close.
- **No color-only meaning:** pair status colors with text/icons.

---

## 11. Tailwind CSS v4 token setup

Add to `src/styles/global.css` after `@import "tailwindcss";`. This project runs Tailwind v4,
so tokens are declared CSS-first with `@theme`.

```css
@import "tailwindcss";

@theme {
  /* Fonts (swap Waldenburg for a licensed brand or open-source substitute) */
  --font-display: "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-condensed: "Archivo", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, monospace;

  /* Surfaces */
  --color-eggshell: #fdfcfc;
  --color-cream: #f5f3f1;
  --color-sand: #ebe8e4;

  /* Warm neutrals */
  --color-stone-25: #fdfcfc;
  --color-stone-50: #faf8f8;
  --color-stone-100: #f5f3f1;
  --color-stone-200: #ebe8e4;
  --color-stone-300: #d7d2cc;
  --color-stone-400: #a59f97;
  --color-stone-500: #777169;
  --color-stone-600: #59544f;
  --color-stone-700: #44403b;
  --color-stone-800: #292524;
  --color-stone-900: #1c1917;
  --color-stone-950: #0c0a09;

  /* Accent + semantics */
  --color-accent: #2b7fff;
  --color-accent-strong: #155dfc;
  --color-success: #00a63e;
  --color-danger: #fb2c36;
  --color-warning: #fbbe45;

  /* Radii */
  --radius-card: 0.75rem;
  --radius-card-lg: 1rem;
  --radius-input: 0.5rem;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-hairline: 0 0.5px 0.75px rgb(0 0 0 / 0.14), inset 0 0.25px rgb(255 255 255 / 0.35);
  --shadow-lift: 0 0.5rem 1rem -0.375rem rgb(17 17 17 / 0.04);
  --shadow-overlay: 0 0 1px rgb(0 0 0 / 0.3), 0 4px 12px rgb(0 0 0 / 0.08),
    0 12px 24px rgb(0 0 0 / 0.06);

  /* Type scale (mobile-first; use md:/lg: for the larger steps) */
  --text-hero: 2.25rem;
  --text-hero--line-height: 1.17;
  --text-hero--letter-spacing: -0.02em;
  --text-h1: 2.25rem;
  --text-h1--line-height: 1.05;
  --text-h1--letter-spacing: -0.03em;
  --text-h2: 2rem;
  --text-h2--line-height: 1.1;
  --text-h2--letter-spacing: -0.03em;
  --text-h3: 1.75rem;
  --text-h3--line-height: 1.2;
  --text-h3--letter-spacing: -0.02em;
  --text-body: 1.0625rem;
  --text-body--line-height: 1.6;
  --text-label: 0.8125rem;
  --text-label--line-height: 1.1;
  --text-label--letter-spacing: 0.05em;
}

@layer base {
  body {
    background-color: var(--color-eggshell);
    color: var(--color-stone-900);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :focus-visible {
    outline: 1.5px solid var(--color-accent);
    outline-offset: 2px;
  }

  ::selection {
    background: color-mix(in oklab, var(--color-accent) 20%, transparent);
  }
}
```

### 11.1 Example components

```html
<!-- Primary + secondary pills -->
<a href="/sign-up"
   class="inline-flex h-11 items-center justify-center rounded-full bg-stone-950 px-5
          text-base font-medium text-white transition-colors duration-200 ease-out
          hover:bg-stone-700 active:scale-[0.98] focus-visible:outline-accent">
  Sign up
</a>
<a href="/contact"
   class="inline-flex h-11 items-center justify-center rounded-full bg-white px-5
          text-base font-medium text-stone-900 shadow-hairline ring-1 ring-stone-900/10
          transition-colors duration-200 ease-out hover:bg-stone-25 active:scale-[0.98]">
  Contact sales
</a>

<!-- Eyebrow -->
<p class="font-condensed text-xs font-bold uppercase tracking-[0.05em] text-stone-500">
  Research
</p>

<!-- Editorial hero -->
<h1 class="font-display text-hero font-light tracking-[-0.02em] text-stone-900 text-balance md:text-5xl">
  Bringing technology to life
</h1>

<!-- Card -->
<article class="rounded-card-lg border border-stone-200/70 bg-white p-6 shadow-lift">
  <h2 class="font-display text-xl text-stone-900">Card title</h2>
  <p class="mt-2 text-sm leading-relaxed text-stone-500">One-line supporting description.</p>
</article>
```

> Note: `shadow-hairline`, `rounded-card-lg`, and `text-hero` come from the `@theme` block
> above. If a utility name is not generated, reference the underlying CSS variable.

---

## 12. Do / Don't

**Do**

- Use eggshell/cream as the base; white only for elevated cards/controls.
- Set headlines in a light (300) humanist sans at large sizes with tight tracking.
- Use uppercase semi-condensed labels for eyebrows, tabs, and small UI text.
- Keep CTAs as pills; primary = ink, secondary = white + hairline ring.
- Use blue only for links, focus, and data.
- Keep radii 8–16px, borders ≤1px, shadows barely visible.
- Add a very faint noise texture to large warm bands.
- Give sections room: `80–160px` vertical padding on desktop.

**Don't**

- Don't use pure white as the page canvas or large saturated color blocks.
- Don't bold display headlines or add gradients/glass effects.
- Don't introduce a second accent color or colorful CTA.
- Don't use large shadows, heavy borders, or big corner radii on cards.
- Don't animate layout properties, bounce, parallax text, or hijack scroll.
- Don't copy ElevenLabs' font files, imagery, product screenshots, or brand marks.
- Don't apply this visual style to dense academic tables where legibility matters more.

---

## 13. Applying this to our project

- Keep the **warm editorial canvas** (`#FDFCFC`/`#F5F3F1`) for marketing, home, course landing,
  and blog pages. Use white cards for subject/resource tiles.
- Use **light Waldenburg-like display** for page titles and section headings, but drop to
  Inter for dense subject lists, syllabus units, and PDF metadata.
- Primary CTA = ink pill ("Browse subjects", "Download notes"); secondary = white ringed pill.
- Use blue **only** for links, focus rings, active tabs, and result/counter data — not for the
  main CTA.
- Keep the **noise + hairline** treatment subtle; academic content pages should stay calm and
  fast, not decorative.
- Prefer **Hanken Grotesk / Inter Tight + Inter + Geist Mono** via Fontsource; never bundle
  Waldenburg without a license.
- Performance note: the reference site ships large product imagery. For our Lighthouse ≥95
  target, use static, compressed WebP/AVIF screenshots and avoid runtime animation libraries;
  CSS transitions are enough.

---

### Sources

- Live site: https://elevenlabs.io (HTML + CSS captured 16 Nov 2026)
- Fonts In Use: ElevenLabs logo and website — https://fontsinuse.com/uses/62065/elevenlabs-logo-and-website
- KMR Waldenburg specimen — https://kimeracorp.eu/typefaces/waldenburg

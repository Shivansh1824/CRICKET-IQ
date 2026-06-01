---
name: et-frontend-design
description: >
  Create distinctive, production-grade frontend interfaces with high design quality and
  conversion-focused UX. Use this skill when the user asks to build, style, redesign, beautify,
  or polish any web UI: WordPress templates, landing pages, product pages, homepages, dashboards,
  React/Vue/Next.js components, HTML/CSS/JS layouts, mobile app screens, forms, navigation, cards,
  heroes, or any visual frontend work. Also triggers when the user wants to improve conversion
  rates, create a theme or color scheme, fix ugly layouts, optimize for mobile, add animations or
  micro-interactions, or when they paste a design mockup and want it coded. Even if the user just
  says "make it look better" or "this looks ugly" — use this skill. Generates creative,
  production-ready code with exceptional design craft that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

# ET Frontend Design

Create distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics.
Implement real working code with extraordinary attention to design craft and conversion psychology.
Output must be production-ready, modular, and easy for AI agents to read, edit, and debug.

Determine the mode before starting:

- **Brand mode** — the design IS the product (landing pages, portfolios, marketing sites, product
  showcases). Demands bold creative risk, strong visual identity, and memorable first impressions.
- **Product mode** — design SERVES the product (dashboards, admin panels, tools, app interfaces).
  Demands restrained precision, usability, and functional clarity.

Both modes demand excellence — they differ in where the energy goes. Brand mode pushes aesthetic
boundaries. Product mode perfects ergonomics. Never confuse the two.

---

## 1. Strategic Discovery

Unless the request is trivial (e.g., fixing an alignment issue, changing a single color, or tweaking a button label), run through the four phases of Strategic Discovery before writing any code. Skipping this for major components or pages produces generic, low-converting layouts. The user hired a design strategist, not a code printer.

### Phase 1 — Diagnose (silent)

Think like a conversion strategist, not a decorator. Silently analyze:

- **The actual problem:** What business or user problem does this solve? A landing page for a
  new product is a different problem than a redesign of an underperforming one.
- **Funnel position:** Where does this page sit in the user journey? Top-of-funnel (awareness)
  needs different design than bottom-of-funnel (decision). Someone landing from a Google ad has
  different intent than someone browsing from the homepage.
- **Awareness level:** Is the visitor unaware, problem-aware, solution-aware, or product-aware?
  This determines whether the design should lead with education, empathy, differentiation, or a
  direct offer.
- **Emotional landscape:** What fears, objections, or hesitations might stop the user from
  converting? What does "trust" look like in this industry?
- **Brand mode vs Product mode:** Determined from context (see mode definitions above).

Do not output anything during this phase. Just think.

### Phase 2 — Strategy Brief (silent)

Build an internal strategy brief using this structure (do NOT output it raw to the user):

1. **GET** [target audience] **WHO** [key insight about them] **TO** [desired action] **BY**
   [design approach]
2. **Aesthetic direction:** Pick a clear visual tone. Choose from flavors like:
   brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined,
   playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel,
   industrial/utilitarian, dark tech, warm earthy, neo-classic, cyberpunk, Scandinavian clean.
   Use these for inspiration but design one that is true to the project's context.
   Refer to `references/design-inspiration.md` for aesthetic category guides.
3. **Conversion architecture:** What is the single primary CTA? What objections need addressing?
   Where do trust signals go? What is the hero's one job? Commit to one strong composition — one
   headline, one supporting line, one CTA, one visual anchor. No cluttered heroes. No "everything
   above the fold" syndrome.
4. **Component hierarchy:** Map atoms (buttons, inputs, badges) → molecules (cards, nav items,
   form groups) → organisms (header, hero, feature grid, footer). Plan the page flow as a funnel,
   not a stack of sections.
5. **Design system seeds:** Light or dark? Font pairing direction? Color mood? Commit before
   coding — don't switch mid-implementation.

Do not output the brief as a formatted list to the user. Hold it internally — it feeds Phase 3.

### Phase 3 — Strategic Questions

Now share your thinking and ask the user **3-5 diagnostic questions**. These are not preference
polls — they are strategic probes that change the design direction.

Present a brief strategy summary first (2-3 sentences showing you understood the problem and
what direction you're leaning). Then ask your questions.

**How to structure each question:**
- **Lead with your read of the situation** — show what you concluded from Phase 1-2 and what
  decision you're trying to make
- **Offer 2-3 concrete options** with real-world references (name actual brands, aesthetics,
  techniques — not abstract categories)
- **State the conversion/UX impact** of each option in one sentence — what changes for the
  end user

**The three types of questions that top designers ask** (use the right mix, not all three every
time):

1. **Conversion-diagnostic** — probes that uncover hidden conversion factors:
   - "What's the one objection your potential customers have before buying/signing up?"
   - "Where do visitors come from — are they searching for this, or do they not yet know they
     need it?"
   - "What does your highest-converting channel look like right now — what's working that we
     should amplify?"

2. **Strategic-direction** — choices that fundamentally reshape the design:
   - Aesthetic direction with named references and tradeoffs
   - Content strategy (benefit-led vs. proof-led vs. story-led hero)
   - Trust architecture (social proof heavy vs. authority-led vs. transparency-first)

3. **Constraint-uncovering** — hidden limitations that derail designs if discovered late:
   - "Do you have professional photography/video, or should I design around illustrations or
     abstract visuals?" (This changes the entire aesthetic approach)
   - "Is there existing brand guidelines or a color palette I should work within, or is this a
     blank canvas?"
   - "What's the technical environment — WordPress, static HTML, React?" (Only if not obvious
     from context)

**Question quality rules:**
- Only ask about decisions where the wrong assumption would produce a fundamentally different
  (and wrong) design
- Never ask what you can determine from context — if they said "SaaS dashboard," don't ask
  "Is this a dashboard?"
- Never ask preference questions without first proposing a direction and explaining why
- Probe for emotional motivations and objections — "What almost stops your customers?" is more
  useful than "What colors do you like?"
- 3 sharp questions beat 6 mediocre ones

**Example of a GOOD question:**

> **Trust & Conversion Strategy:** For a peptide research company, credibility is everything —
> your visitors are likely scientists or informed consumers who are skeptical by default. I see
> three approaches:
>
> - **Option A: Authority-led** — lead with published research citations, lab certifications,
>   and team credentials prominently in the hero. Feels institutional, builds deep trust. Best
>   if your audience is researchers or medical professionals who need proof before exploring.
> - **Option B: Transparency-first** — lead with third-party test results, Certificate of
>   Analysis links, and manufacturing process visuals. Feels honest and differentiated (most
>   competitors hide this). Best if purity/quality concerns are the main purchase objection.
> - **Option C: Results-led** — lead with customer outcomes, before/after data, and
>   testimonials. Feels accessible and commercial. Best if your audience already understands
>   peptides and just needs social proof to choose you over competitors.
>
> Which is closest, or is there something specific your customers always ask about before buying?

**Example of a BAD question:**

> What colors do you want? Do you prefer minimalist or modern? What's your target audience?

*(Bad because: no strategic reasoning, no options with tradeoffs, forces the user to do the
designer's job, asks for information the designer should already be able to infer or propose)*

**Complexity-based scaling:**
- Trivial request (fix a button, center a div): Skip discovery entirely — just execute
- Single component: 1-2 questions if ambiguity exists, otherwise execute
- Full page or section: 3-4 questions
- Full site or design system: 4-5 questions

For trivial requests where the user's intent is completely clear, skip Phases 1-3 and go
straight to code.

### Phase 4 — Refine and Execute

Incorporate the user's answers into the strategy brief. State any remaining decisions you're
making and why (briefly — one sentence each). Then proceed to implementation following
Sections 2-10 below.

If the user's answers reveal a fundamentally different direction than your draft brief, rebuild
the strategy before coding. Never force early assumptions onto a changed brief.

---

## 2. Conversion-Focused Design Psychology

Design that converts is not about tricks — it's about removing friction and guiding attention.
Understanding why certain patterns work helps you apply them with judgment, not as rigid formulas.

**Visual hierarchy drives action:**
- Use the Z-pattern for action-oriented pages (landing pages, product pages): logo top-left →
  nav top-right → hero content center-left → CTA bottom-right. Place the primary CTA at the
  Z-pattern's terminal point.
- Use the F-pattern for text-heavy pages (blogs, documentation): users scan left-to-right at the
  top, then mostly down the left edge. Place key content and CTAs along this path.
- Every section needs exactly one job. If you can't state what a section does in one sentence,
  split it or cut it.

**Hero section rules:**
- Benefit-focused headline, not feature-focused. "Ship faster with zero downtime" beats
  "Cloud-native CI/CD platform with 99.99% uptime SLA."
- One primary CTA above the fold. Secondary actions can exist but must be visually subordinate.
- Social proof close to the hero — logos, customer count, or a brief testimonial — builds
  immediate credibility.

**CTA psychology:**
- High contrast against surrounding space — the button should be the most visually dominant
  element in its section. Isolation (generous whitespace around CTAs) draws the eye.
- Action-oriented copy: "Get Started Free" > "Submit", "See Pricing" > "Learn More".
  First-person language ("Start my free trial") outperforms second-person ("Start your free trial")
  by significant margins.
- One primary CTA per viewport. Multiple competing CTAs create decision paralysis.

**Trust signals near decision points:**
- Place testimonials near pricing. Place client logos near the hero. Place ratings and reviews
  near buy buttons. Trust signals work because they reduce perceived risk at the moment of
  highest uncertainty.
- Numbers over vague claims: "10,000+ customers" > "trusted by many."
  Specific numbers feel authentic; round numbers feel fabricated.
- Security badges near payment forms — max 3 badges, placed close to credit card fields.

**Reduce cognitive load:**
- Hick's law: fewer choices = faster decisions = more conversions. Max 3-5 navigation items.
  If you have more, group them.
- Progressive disclosure: show only what's needed now, reveal complexity on demand.
  Multi-step forms outperform single long forms.
- Single-column form layouts outperform multi-column — they create a clear top-to-bottom flow.

**Price presentation:**
- Anchoring: show the higher price first (crossed out or as "was"), then the current price.
- Three-tier pricing with the middle option highlighted and labeled "Most Popular" or
  "Recommended" leverages the decoy effect.
- Annual/monthly toggle with savings percentage shown on annual.

Read `references/conversion-patterns.md` for page-type-specific playbooks (landing pages, product
pages, homepages, e-commerce).

---

## 3. Design System Foundations

Consistency separates professional design from decoration. Establish these systems before writing
component code — they compound across every element.

### Spacing

Use a 4px base unit. All spacing values are multiples — no arbitrary pixel values.
Define as CSS custom properties:

```css
:root {
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-7: 32px;  --space-8: 40px;  --space-9: 48px;
  --space-10: 64px; --space-11: 80px; --space-12: 96px;
}
```

If 14px "looks right," use 12px or 16px. Arbitrary values create visual noise that accumulates
across components — the eye notices even when the brain doesn't.

### Color Tokens

Use semantic naming so colors carry meaning, not just values:

```css
:root {
  /* Atmospheric Neutrals (subtle blue-gray tinting for depth instead of flat grays) */
  --color-text-primary: hsl(220, 40%, 12%);
  --color-text-secondary: hsl(220, 16%, 36%);
  --color-text-muted: hsl(220, 12%, 56%);
  
  /* Surface system with intrinsic depth */
  --color-surface: hsl(220, 20%, 99%);
  --color-surface-elevated: hsl(220, 20%, 97%);
  --color-border: hsl(220, 12%, 90%);
  --color-accent: hsl(224, 76%, 48%);
  --color-accent-hover: hsl(224, 76%, 38%);
}
```

Follow the 60-30-10 rule: 60% neutral (backgrounds, body text), 30% secondary (borders, cards,
muted text), 10% accent (CTAs, links, highlights). Dominant colors with sharp accents outperform
timid, evenly-distributed palettes.

For dark mode when requested: map the same semantic token names to different values. Never swap
individual colors ad-hoc — remap the entire system. Use `prefers-color-scheme: dark` or a
`.dark-theme` class on the root element.

### Typography Scale

Define 6-8 named sizes using a modular scale. Each carries its own line-height and letter-spacing
as a triplet — never set font-size without its companions:

```css
:root {
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 0.95rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.1rem);
  --text-lg: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1rem + 1.2vw, 1.75rem);
  --text-2xl: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  --text-3xl: clamp(2rem, 1.2rem + 3vw, 3.5rem);
  --text-4xl: clamp(2.5rem, 1.5rem + 4vw, 5rem);
}
```

Maximum 2 font families — one display, one body. Never more.

**Font loading:** Use `font-display: swap` and `<link rel="preload">` for the primary font.
Define fallback font metrics with `size-adjust` and `ascent-override` to prevent layout shifts.

**Typography craft:**
- `-webkit-font-smoothing: antialiased` for consistent rendering
- `text-wrap: balance` for headings (equal line lengths)
- `text-wrap: pretty` for body text (avoids orphaned words)
- `font-variant-numeric: tabular-nums` for any number that changes dynamically

Read `references/design-tokens.md` for the complete token architecture template.

### Code Structure

Organize output for AI readability and maintainability:
- One component per file when possible. Clear section comments marking boundaries.
- CSS custom properties at `:root` level — never hardcode colors or spacing in component styles.
- BEM naming for vanilla CSS (`.card`, `.card__title`, `.card--featured`).
  Utility classes for Tailwind projects.
- Modular asset loading — each section can include its own `<style>` block or linked stylesheet.

---

## 4. Frontend Aesthetics

This is where the creative vision meets the design system. The system provides consistency — this
section provides character.

**Typography as expression:**
Choose fonts that are beautiful, distinctive, and unexpected. Pair a characterful display font
with a refined body font. Use negative letter-spacing on large headings (the Vercel/Geist
technique — tighter text feels more "designed"). Explore variable fonts for responsive weight and
width adjustments.

**Color as atmosphere:**
Create depth and mood rather than flat backgrounds. Apply gradient meshes, noise textures (via SVG
`feTurbulence` filters), layered transparencies, and contextual effects that match the aesthetic.
Full-bleed backgrounds with subtle texture outperform stark white surfaces.

**Spatial composition:**
Unexpected layouts create visual interest. Asymmetry. Overlap. Diagonal flow. Grid-breaking
elements that extend beyond their containers. Generous negative space OR controlled density —
choose one and commit. The tension between elements is what makes a layout feel designed.

**Visual depth and texture:**
Use layered transparent `box-shadow` (2-4 layers at different offsets and blurs) instead of single
solid shadows — this mimics how light actually works. Apply concentric border radii for nested
elements: inner radius = `calc(var(--outer-radius) - var(--gap))`. Add grain overlays, decorative
borders, and custom cursor effects where they serve the aesthetic.

### The NEVER List

These patterns are the telltale signs of generic AI output. Avoid them:

- **Never** use Inter, Roboto, Arial, or system-ui as the primary display font
- **Never** default to purple gradients on white backgrounds
- **Never** use a SaaS card grid as the hero section
- **Never** add a carousel with no narrative purpose
- **Never** stack identical cards instead of designing a real layout
- **Never** default to a single "signature" font pair across different contexts; tailor the typography to the specific brand personality of the current workspace/brief (e.g., monospace details for tech, serif for editorial, geometric sans for modern consumer brands)
- **Never** pair a beautiful stock image with weak, generic typography
- **Never** use cookie-cutter component patterns without context-specific adaptation

Every project should feel distinct. Vary light/dark themes, font choices, color palettes, and
layout approaches. Interpret creatively and make unexpected choices that feel genuinely designed
for the specific context.

---

## 5. Motion and Animation

Animation is a design tool, not decoration. Every animation must answer: **"Why does this
animate?"** Valid reasons: spatial consistency, state indication, explanation, user feedback,
preventing jarring visual changes. If you can't articulate the reason, remove the animation.

**Key principles:**
- Never animate keyboard-initiated actions (typing, tab navigation) — they repeat hundreds of
  times daily and animation makes them feel sluggish.
- Use spring physics for physical properties (position, scale, rotation). Use duration-based
  easing for non-physical properties (opacity, color, blur).
- Stagger enter animations ~100ms between sibling elements. One well-orchestrated page load
  with staggered reveals creates more delight than scattered micro-interactions everywhere.
- Hover transitions: ~200ms with CSS. Use interruptible CSS transitions for interactive states.
- Use `cubic-bezier(0.16, 1, 0.3, 1)` for expressive deceleration. Never use `linear` for UI
  motion — it feels robotic.

**Technical approach:**
- CSS for simple state transitions (hover, focus, fade, slide)
- CSS `animation-timeline: scroll()` for scroll-driven effects — zero JavaScript, zero
  main-thread blocking
- Motion library for React projects (formerly Framer Motion)
- GSAP for complex choreographed sequences

**Always honor `prefers-reduced-motion: reduce`.** Provide instant state changes as fallback —
not "no change," but immediate transitions without animation.

---

## 6. Mobile-First and Responsive Design

Design mobile first, always. Over 80% of web traffic is mobile — the mobile experience IS the
primary experience, not an afterthought.

**Fluid typography:** Use `clamp()` for all type sizes. No rigid breakpoint jumps — text should
scale smoothly between minimum and maximum sizes as the viewport changes.

**Component-level responsiveness:** Prefer container queries (`@container`) over media queries for
reusable components. A card inside a sidebar should respond to its container width, not the
browser window. Reserve media queries for page-level layout shifts only.

**Breakpoints** (when media queries are needed): `640px / 768px / 1024px / 1280px`,
mobile-first approach using `min-width`.

**Touch and interaction:**
- Touch targets: 44px minimum for all mobile interactive elements (buttons, form inputs, navigation items). 24px is only acceptable for inline text links within paragraphs on desktop viewports. This is both a usability requirement and a conversion factor — small targets lose taps and lose customers.
- Thumb-friendly zones: place primary actions in the bottom third of the screen on mobile.
  The top corners are the hardest to reach on modern phones.
- Navigation: hamburger menus on mobile. Max 5 items in the visible top navigation on desktop.

**Images:**
- In Next.js projects, always use `next/image` as it handles responsive sizing and modern formats (AVIF/WebP) automatically. For vanilla HTML or other frameworks, use the `<picture>` element with AVIF/WebP sources and `<img>` fallback.
- Always include `srcset` and `sizes` for responsive resolution selection when using standard HTML tags.
- `loading="lazy"` for below-fold images. `loading="eager"` and `fetchpriority="high"` for the
  hero/LCP image.
- Set `width`, `height`, or `aspect-ratio` on every image to prevent layout shifts.

**Performance targets:**
- LCP (Largest Contentful Paint) < 2.5 seconds — preload hero image and primary font.
- CLS (Cumulative Layout Shift) < 0.1 — no layout shifts above the fold.
- Minimize render-blocking resources. Inline critical CSS when possible.

---

## 7. Interaction States

Every interactive component needs all its states designed — not just the default. AI-generated
interfaces commonly ship only the "happy path" default state, which feels incomplete and
unprofessional in production.

**Buttons and links:** default, hover, focus-visible, active/pressed, disabled, loading.

**Form inputs:** default, placeholder, focus, filled, error (with message), disabled, readonly.

**Data views:** loading (skeleton screen), empty state (message + illustration + CTA), error
(message + retry action), populated.

**Guidelines:**
- Skeleton screens > spinners. Match the skeleton shape to the final content layout.
- Empty states are never blank — provide a helpful message and a call-to-action.
- Error states always include a recovery action (retry button, help link, alternative path).
- Loading states should appear after ~200ms delay — instant loaders for fast operations feel
  jittery.

---

## 8. Framework-Specific Guidance

Adapt your approach to the stack being used. Determine from context — when unclear, default to
vanilla HTML/CSS/JS as it covers the majority of use cases.

### HTML/CSS/JS (default — 70% of projects)

- Vanilla CSS with custom properties. BEM naming for class structure.
- Modular stylesheets: one `<link>` per major section, or scoped `<style>` blocks.
- WordPress-ready structure: wrap sections in unique class names for style scoping
  (e.g., `.hero-section-wrapper`). Structure assets to be compatible with
  `wp_enqueue_style` / `wp_enqueue_script`.
- Vanilla JavaScript with `defer` attribute. No framework overhead for simple interactions.

### React / Next.js

- CSS Modules or Tailwind for style scoping. One component per file.
- Motion library (formerly Framer Motion) for animations.
- Server components by default. Client components (`'use client'`) only when interactive
  state or browser APIs are needed.
- Use `next/image` for automatic image optimization in Next.js projects.

### Tailwind CSS

- Use `@apply` sparingly — prefer direct utility classes in markup.
- Define design tokens (colors, spacing, fonts) in `tailwind.config.js` as the single source
  of truth.
- Extract repeated utility classes into component CSS classes (using `@apply`) only if the exact same combination of 4 or more Tailwind utilities is repeated across 3 or more separate components. Otherwise, keep utilities inline in the markup to preserve readability and design flexibility.

### Mobile App Screens (Android / iOS)

- Respect platform conventions: iOS safe area insets (`env(safe-area-inset-*)`), Android
  material elevation patterns.
- Use native-feeling navigation: bottom tab bars, stack navigation with back gestures.
- Touch targets: 44pt minimum on iOS, 48dp minimum on Android.
- Design for both portrait and landscape where applicable.

---

## 9. Modern CSS

Prefer CSS-native solutions over JavaScript wherever possible. The CSS platform in 2025-2026
provides powerful features that eliminate entire JavaScript libraries:

- **CSS nesting** — reduce selector repetition, improve readability.
- **Container queries** (`@container`) — component-level responsiveness without media queries.
- **`:has()` selector** — parent selection, form validation styling, conditional layouts based
  on content presence.
- **Subgrid** — align nested grid children perfectly to parent grid tracks.
- **Scroll-driven animations** (`animation-timeline: scroll()`) — parallax, progress bars,
  reveal-on-scroll effects without any JavaScript.
- **View Transitions API** — smooth page and state transitions with minimal code.
- **`@starting-style`** — animate elements entering from `display: none` (modals, popovers).
- **Anchor positioning** — tooltips and popovers positioned relative to triggers, pure CSS.

Read `references/modern-css-patterns.md` for code examples and browser support notes.

---

## 10. Design Engineering Craft

These details separate good from exceptional. They're invisible individually but compound into
the feeling that something was "designed by a human, not generated."

- **Optical alignment over mathematical:** Center text and icons visually, not geometrically.
  Play button icons need a slight right offset. Circles need padding adjustment to appear
  visually centered in a square container.
- **Concentric border radii:** Inner element radius = outer radius minus the gap between them.
  `border-radius: calc(var(--outer-radius) - var(--gap))`. Parallel curves look intentional;
  mismatched radii look sloppy.
- **Layered shadows:** Use 2-4 transparent `box-shadow` layers at different offsets, blurs, and
  opacities instead of a single solid shadow. This mimics real-world light diffusion.
- **Number formatting:** `font-variant-numeric: tabular-nums` for prices, counters, timers,
  or any number that updates — prevents layout jitter from variable-width digits.
- **Text wrapping:** `text-wrap: balance` for headings. `text-wrap: pretty` for paragraphs.
  Balanced headings prevent awkward short last lines; pretty paragraphs avoid orphaned words.
- **Easing quality:** `cubic-bezier(0.16, 1, 0.3, 1)` for expressive deceleration. Never use
  `linear` for UI motion. Spring-based easing for physical interactions (drag, toss, snap).
- **Accessibility basics:** Semantic HTML (`<nav>`, `<main>`, `<article>`), `:focus-visible`
  focus indicators (never `outline: none` without replacement), color contrast ratio 4.5:1
  minimum for body text, `alt` text on all images, `aria-label` on icon-only buttons.

---

## Closing

Match implementation complexity to the aesthetic vision. Maximalist brand-mode designs need
elaborate code with extensive animations, textures, and layered effects. Minimalist product-mode
designs need restraint, precision, and obsessive attention to spacing and typography. Both are
hard. Both are valuable. Elegance comes from executing the vision with commitment.

Production-readiness is non-negotiable — every output must be practical, deploy-ready, and
functional across devices. Structure code so AI agents can easily find, read, and modify any
section. Use clear file organization, descriptive class names, and section comments.

The AI is capable of extraordinary creative work. Don't hold back — show what can truly be created
when thinking outside the box and committing fully to a distinctive, conversion-focused vision
that serves real users on real devices.

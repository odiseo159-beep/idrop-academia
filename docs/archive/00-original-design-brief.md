# IDROP — Design Brief

> A working spec for any AI design tool, plugin, or human designer engaging with this project. Written 2026-05-15. Living document.

---

## 1. What IDROP is

**IDROP** is an open onchain learning platform. The current scope is **BNB Chain education** with a roadmap toward Ethereum, Solana, and opBNB. The product is a public-facing dashboard that serves three things in one place:

1. **Curated crypto news feed** (RSS-aggregated from Cointelegraph, Decrypt, The Block, BeInCrypto)
2. **Structured learning modules** (6 modules, 25+ lessons, MDX-based, with quizzes and XP progression)
3. **Curated Twitter/X feed** of the accounts that move the BNB Chain conversation

The brand promise: *"Crypto literacy without the noise."* You arrive, you see what's happening today (news + tweets), you start a course, you earn XP, you level up. Free, no signup gate, no token gate.

**Audience tiers** in priority:
- *Primary*: Spanish-speaking newcomers to web3 (default locale `es`) who want serious learning, not "buy this coin" content.
- *Secondary*: English-speaking newcomers (`/en`).
- *Tertiary*: Intermediate users hunting for the news feed + Twitter aggregation as a daily landing page.

**Tone**: Editorial, sober, technically credible. Closer to *The Defiant* / *Dirt* / *Stratechery* than to "WAGMI moon" Twitter. The visual language must reinforce this — it should feel like a publication, not a casino.

---

## 2. Brand soul

| Axis | Where IDROP sits | Anti-pole (avoid) |
|---|---|---|
| Mood | Calm, focused, optimistic | Frantic, FOMO, hype |
| Voice | Plain-spoken, intellectually honest | Salesy, jargon-stuffed |
| Density | Information-rich, scannable | Cluttered, bouncing |
| Visual | Dark, futuristic, restrained accents | Neon overload, animation overload |
| Identity hook | Wireframe geometry + selective gradient blobs | Stock 3D crypto coin renders |

The current design (Enchart-inspired) leans futuristic-dark. Keep the soul, raise the craft.

---

## 3. Information architecture

```
/ (redirects to default locale)
└── /[locale]                    Landing dashboard
    ├── /learn                   Catalog of all 6 modules with filters
    │   └── /[module]            Module overview + lesson list
    │       └── /[lesson]        MDX lesson player + quiz + XP
    ├── /discover                Featured/curated quests
    ├── /news                    Full crypto news + Twitter sidebar
    └── /profile                 XP, level, in-progress modules, recent activity
```

**The landing IS the product.** When a user hits `/`, they should immediately see:
- Today's top crypto headline (visual hero)
- 3-5 secondary news cards
- A horizontal-scannable preview of the 6 modules
- A live Twitter sidebar of curated accounts
- Just enough brand identity to know they're on IDROP, not too much that it feels like a marketing splash

Marketing copy ("Why IDROP", testimonials, etc.) belongs *below the fold*, not above.

---

## 4. Current visual system (constraints to honor)

### Color tokens (`src/app/globals.css`)

```
--color-background: #07080d            (near-black with blue undertone)
--color-foreground: #f5f6fa            (off-white)

--color-surface: #0d0f17               (raised cards)
--color-surface-elevated: #11141d      (deeper raise)
--color-surface-glass: rgba(20,23,33,0.6)

--color-border: rgba(255,255,255,0.08)
--color-border-strong: rgba(255,255,255,0.14)

--color-muted: #1a1d28
--color-muted-foreground: #8a8fa3

--color-primary: #f0b90b               (BNB yellow — chain identity)
--color-primary-foreground: #07080d

--color-accent-pink: #ff3df0
--color-accent-purple: #8b5cf6
--color-accent-orange: #ff8a3d
--color-accent-cyan: #38bdf8

--color-success: #34d399
--color-warning: #fbbf24
--color-danger: #f87171
```

The palette is non-negotiable in spirit — dark base + BNB yellow primary + a four-stop accent set (pink/purple/orange/cyan). Specific hex values can be tuned for contrast/AA but the *system* stays.

### Typography
- **Geist Sans** — body
- **Geist Mono** — code/numerics
- **Space Grotesk** — display headings (`var(--font-display)`)

Display font carries letter-spacing `-0.02em`. Headings should feel architectural, not generic web-sans.

### Visual effects (in `src/components/fx/`)
- `<Starfield>` — CSS-only particle field background
- `<GradientBlob>` — animated conic-gradient blobs (multiple variants)
- `<GridFloor>` — perspective grid (Tron-floor)
- `<WireframeSphere>` — pure-SVG distorted wireframe globe
- `<PlasmaShape>` — variants: torus, wave, blob, ring (decorative)

These are the brand's shape vocabulary. A redesign should *use them more deliberately*, not throw them out.

### Tech stack (locked)
- Next.js 16 App Router + React 19
- Tailwind CSS v4 with `@theme` tokens
- shadcn/ui patterns (custom Button, Badge, Progress; can add more)
- framer-motion for choreography
- next-intl for ES/EN routing
- next-mdx-remote for MDX lessons
- Dark theme only (no light-mode requirement)

---

## 5. Component inventory

| Existing | Path | Status |
|---|---|---|
| SiteHeader | `src/components/layout/site-header.tsx` | Solid, minor polish |
| SiteFooter | `src/components/layout/site-footer.tsx` | Solid |
| LanguageSwitcher | `src/components/layout/language-switcher.tsx` | Works, can be more elegant |
| Logo | `src/components/brand/logo.tsx` | OK, custom SVG |
| Button | `src/components/ui/button.tsx` | shadcn-pattern, 6 variants |
| Badge | `src/components/ui/badge.tsx` | 6 variants |
| Progress | `src/components/ui/progress.tsx` | OK |
| ModuleCard | `src/components/learn/module-card.tsx` | **Needs love** — accent system, hover, density |
| LessonQuiz | `src/components/learn/lesson-quiz.tsx` | Functional, can be more delightful |
| NewsCard | `src/components/news/news-card.tsx` | 3 variants, basic. **Hero variant is the centerpiece.** |
| TwitterFeed | `src/components/news/twitter-feed.tsx` | Embed-iframe-based, header is custom |
| CompactHero | `src/components/landing/compact-hero.tsx` | New, slim hero strip — **needs visual identity** |
| TopHeadlines | `src/components/landing/top-headlines.tsx` | New, hero-card + 4 compact |
| CoursesSection | `src/components/landing/courses-section.tsx` | New |
| TwitterSidebar | `src/components/landing/twitter-sidebar.tsx` | Sticky right column, 3 accounts |
| PillarsSection | `src/components/landing/pillars-section.tsx` | Marketing — "Why IDROP" 3 pillars |
| CtaSection | `src/components/landing/cta-section.tsx` | Marketing — final push |

Components missing or worth introducing:
- A proper **Card primitive** (we keep re-rolling card styles)
- A **chip/pill** component (used inline in many places)
- An **avatar** with gradient fallback
- A **tooltip** (Radix-based)
- A skeleton primitive

---

## 6. What's working / what to elevate

**Working:**
- Dark palette feels unified and crypto-native
- Wireframe sphere + gradient blobs are a real differentiator (most crypto sites use stock 3D coin renders)
- Module cards have an accent-color system (each module has its own color)
- The MDX lesson player is structured and useful

**Pain points to fix:**
1. **The landing hero is generic.** It says "MASTER ONCHAIN" with two CTAs. Fine, but doesn't feel like *something*. It needs a visual identity moment that makes IDROP recognizable in a screenshot.
2. **News cards are bland.** They're rectangles with image + title. There's no visual rhythm, no editorial feel. Compare to NYT homepage, MSN, Stratechery — there's typographic hierarchy, density variation, callouts.
3. **The TwitterFeed sidebar feels disconnected.** Iframes have their own visual system that fights the dark theme. The card frame around them needs more presence.
4. **Module cards lack personality.** Each module has an accent color but the cards look interchangeable. The "Fundamentals" card and the "Memecoins & Launchpads" card should feel different in mood, not just hue.
5. **No micro-interactions.** Hover states are mostly border + shadow changes. Nothing playful, nothing that makes the cursor want to keep clicking.
6. **The lesson page is a wall of text.** It's well-organized but the prose-lesson CSS is utilitarian. Reading 12 minutes feels like 20.

**Elevate:**
- Editorial typography for news titles (variable size, leading, optional pull quotes)
- A consistent **density grid** — so cards across pages feel related, not arbitrary
- A small set of **named card moods** (Editorial, Quest, Stat, Stream) used consistently
- More confident use of the gradient palette — currently used as backgrounds; use it for *accent strokes*, *number callouts*, *meter fills*
- Real **information density** in news — show source + time + read time + maybe sentiment
- Better **course progression cues** — when a user has started a module, the card should *show that* prominently (not just a thin progress bar at the bottom)

---

## 7. Aspirational references (vibe board)

| Reference | What to learn from it |
|---|---|
| **Stratechery / Dirt / The Information** | Editorial typography, density confidence, restrained color use |
| **Linear app marketing** | Dark theme done with craft, mono-typography micro-details, glow effects done well |
| **Vercel.com** | Geometric brand identity, gradient as accent not background, calm density |
| **Layer3.xyz `/discover`** | Quest-card patterns, XP visualization, gamification done elegantly |
| **Edukora.xyz** | Solana learning peer — see how they balance brand + utility |
| **Enchart Studio** (current visual ancestor) | Wireframe shapes, gradient blobs, dark-with-color-pops |
| **Robinhood crypto** | Dense data presentation without overwhelm |
| **arc.net** | UI craft, motion that feels physical |

What to **avoid** copying from typical crypto sites: stock 3D coin renders, "WAGMI" energy, neon-everything, animated tickers as the central element, fake "live" stat counters.

---

## 8. Specific page-level redesign goals

### `/[locale]` (landing) — top priority
**The 4 things visible above the fold should be:** brand sliver + today's top headline + a course quick-pick + a glance at the X sidebar.

The current compact hero is the right *idea* (don't restore the giant "MASTER ONCHAIN" hero) but the execution is too generic. Needs more identity. Maybe:
- A signature horizontal motif (e.g. a thin gradient strip with subtle wireframe motion)
- Better integration with the news section that follows (so they read as one continuous masthead, not stacked sections)
- A live metric or "today" date marker that makes it feel current

The 2-column dashboard (news+courses left, Twitter right) is correct as a structure. But the *transitions between sections* need work — currently every section starts with `<header><Icon><Title><Subtitle></header>` which is repetitive.

### `/news` — second priority
This is the page someone bookmarks if they like the product. It should look like a real publication. Featured story should dominate, not just be an enlarged card. Sidebar should have enough density to feel valuable on its own.

### `/learn/[module]/[lesson]` — third priority
Reading experience. Typography overhaul. Treat it like Are.na / Stratechery long-form, not like documentation.

### `/profile` — fourth priority
Currently looks like a stat dashboard. Could become more like a *credential wall* — your progress as a visible identity object, not a row of counters.

---

## 9. Goals (what success looks like)

A redesign is successful if:

1. **Recognition** — A screenshot of the landing is identifiable as IDROP and not as a generic crypto site or a generic AI-looking dashboard.
2. **Density without clutter** — More content visible above the fold than currently, but with clearer hierarchy.
3. **Editorial trust** — News feels like real journalism, not aggregated SEO.
4. **Course discoverability** — A user lands, in 5 seconds knows what's available to learn, in 10 seconds has clicked into a module.
5. **Motion that serves comprehension** — Animations highlight relationships and state changes; never decorative for its own sake.
6. **Consistency** — Same card patterns across pages, same hover language, same elevation system.
7. **Respect for the dark theme** — No brightness fatigue, no neon hellscape.

Non-goals:
- Light theme support (skip)
- Full mobile redesign as a separate language (responsive within the same design)
- Animation libraries beyond framer-motion (no GSAP, no Lottie unless lightweight)
- Throwing out the existing palette / fonts (refine, don't replace)

---

## 10. Open design challenges (where I want creative input)

1. **The "today" feeling** — How do we make the landing feel like a freshly printed publication every day, not a static page?
2. **News card typography** — Hero variant deserves serif? Variable font size based on importance? Pull quotes?
3. **Twitter sidebar integration** — The iframes are necessarily standardized; what *frame* makes them feel like part of IDROP rather than embedded foreign objects?
4. **Module card personality** — How do we give "Fundamentals" and "Memecoins" visually distinct moods without abandoning the system?
5. **Quest progression UX** — Layer3 has done this well. We have the data (lesson completion, XP, module status) but we present it timidly. What would a *celebratory* progression UI look like?
6. **The "next step" affordance** — When a user is mid-module, the home page should *pull them back in*. Currently it doesn't.
7. **Editorial pull quotes inside MDX** — Could we make `<blockquote>` actually beautiful, with variable widths, alignment, attribution?

---

## 11. Hard constraints (don't break)

- All routes must continue to work in both `es` and `en`
- All existing MDX content must continue to render correctly (don't break `prose-lesson` semantics)
- localStorage-based progress must continue to work
- Keep accessibility: WCAG AA contrast minimums, keyboard navigability, focus rings, screen-reader labels
- No new external runtime dependencies beyond what's in package.json without justification
- Component additions should follow the existing `cva` + variants pattern in `src/components/ui/`
- Server components stay server components; don't move logic to client without reason
- Localized strings live in `messages/{locale}.json` — don't hardcode
- File modifications, not full rewrites — preserve the existing `src/` structure

---

## 12. How a design tool should engage with this brief

Recommended workflow:

1. **Read the existing landing components first** (`src/components/landing/*` and `src/app/[locale]/page.tsx`) to understand the current code.
2. **Read this brief in full** to internalize the soul.
3. **Pick ONE high-leverage page or component** (recommendation: start with the landing hero + news section, since they set the tone).
4. **Propose a redesign as code edits** to the existing files — not as a from-scratch demo. Preserve i18n, types, and component contracts.
5. **Verify in the running dev server** (`npm run dev` on port 3000) before declaring done.
6. **Iterate**: pass the result through `web-design-guidelines` for an audit.

The constraint that matters most: **this is a real working app, not a mockup.** Every change must keep the build green and the lessons functional.

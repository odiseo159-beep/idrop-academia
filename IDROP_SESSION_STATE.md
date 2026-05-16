# IDROP — Session Handoff State

> Pega este archivo entero al inicio del próximo chat (luego de `/clear`) para
> que la nueva sesión arranque con todo el contexto del proyecto sin que tengas
> que re-explicar nada. Última actualización: 2026-05-16.

---

## Qué es IDROP

Plataforma onchain educativa abierta sobre **BNB Chain** (roadmap multi-cadena:
opBNB, Ethereum, Solana). Audiencia primaria: hispanohablantes entrando a web3
en serio — **default `es`, switcher a `en`**. Tono editorial sobrio (Stratechery
× Bloomberg Terminal × Linear), nada de WAGMI/degen.

Tres servicios en una sola landing:
1. **Noticias crypto** agregadas vía RSS (Cointelegraph, Decrypt, The Block, BeInCrypto)
2. **Academia BNB** — 6 módulos curriculares con XP onchain + quizzes
3. **Feed Twitter curado** — últimos tweets server-fetched de cuentas crypto seleccionadas

**Repo**: https://github.com/odiseo159-beep/idrop-academia (público, branch `main`)
**Deploy**: Vercel (https://idrop-academia.vercel.app o subdominio similar)

## Stack técnico

- **Next.js 16.2.6** App Router + **React 19.2.4** (Turbopack en dev)
- **Tailwind CSS v4** con `@theme` tokens en globals.css
- **next-intl 4** para i18n (default `es`, switcher `en`, `localeDetection: false`)
- **next-mdx-remote 6** para lecciones
- **react-tweet 3** (Vercel) para render server-side de tweets
- **fast-xml-parser 5** para RSS
- **wagmi 2.19 + viem 2 + @rainbow-me/rainbowkit 2 + @tanstack/react-query 5**
  - Chains: BSC mainnet (56), BSC testnet (97), opBNB mainnet (204), opBNB testnet (5611)
  - WalletConnect projectId vía `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **@radix-ui/react-dialog** para A3/A4 modals
- Tema oscuro obligatorio, sin light-mode

## Sistema visual v2 (Claude Design)

**Tipografías** (todas vía `next/font/google`):
- **Newsreader** (`--font-news-serif`) — titulares editoriales, italic para acentos
- **IBM Plex Sans** (`--font-plex`) — body
- **JetBrains Mono** (`--font-plex-mono`) — labels, mc-text (mono caps), tabular numbers

**Paleta de tokens v2** (definidos en `src/app/globals.css`):
```
--color-ink-0: #07080d   página (negro azulado casi-negro)
--color-ink-1: #0a0c14   raised surface
--color-ink-2: #10131c   card
--color-ink-3: #161a25   card-2
--color-line-1..3        hairlines
--color-t-0..4           texto (t-0 más claro, t-4 más opaco)
--color-bnb: #F0B90B     amarillo BNB — acento de puntuación, NO decoración masiva
--color-bnb-dim / -line
--color-ember            warm accent (rojo)
--color-plum             cool accent (violeta)
```

**Helper classes**: `.v2-serif`, `.v2-mono`, `.v2-mc` (mono caps), `.v2-tnum`,
`.v2-hairline`, `.v2-tick`, `.v2-card-hover`, `.v2-arrow-shift`, `.v2-nav-link`,
`.v2-cta-primary`, `.v2-cta-ghost`, `.v2-glow-edge`, `.v2-prose` (MDX wrapper),
`.v2-loader`, `.v2-loader-screen`, `.v2-splash-fade`, `.v2-tweet-shell`.

## Mapa de archivos clave

### Rutas (Next.js App Router)
```
src/app/[locale]/
├ layout.tsx                              # html shell + fonts + providers + InitialSplash
├ page.tsx                                # Landing v2 (Masthead/Hero/Portada/Academia/Manifiesto/Ticker)
├ learn/page.tsx                          # redirect → /es#academia (SSG)
├ learn/[module]/page.tsx                 # Sumario v2 con 4 estados (SSG · 9 paths)
├ learn/[module]/[lesson]/page.tsx        # Lesson interior Cinema A1/A2 (SSG · 47 paths)
├ discover/page.tsx                       # redirect → /es#academia (SSG)
├ news/page.tsx                           # redirect → /es#portada (SSG)
└ profile/page.tsx                        # V2ProfileOverview con wallet card (SSG)
src/proxy.ts                              # next-intl middleware (Next.js 16 "proxy" convention)
```

### Componentes v2 (todos en `src/components/v2/`)
**Landing:**
- `v2-masthead.tsx` — sticky header con scroll-spy, Login + Entrar CTAs, switcher ES/EN
- `v2-hero.tsx` — "El día en crypto, sin el ruido" + Ficha de Edición
- `v2-portada.tsx` — §01 Titulares (news) + §02 En vivo en X (tweets sidebar)
- `v2-academia.tsx` — §02 La Academia BNB con 6 cards editoriales + quest diaria strip
- `v2-manifiesto.tsx` — §03 Por qué IDROP + 3 pilares
- `v2-manifiesto-cta.tsx` — botones "Empezar Fundamentos" / "Ver todos los módulos"
- `v2-ticker.tsx` — footer ticker con BLOQUE/GAS/BNB/ETH/SOL
- `v2-handle-tweets.tsx` — render server-side de tweets curados
- `v2-curated-tweets.tsx` — variante legacy (puede limpiarse)
- `v2-handle-column.tsx`, `wire-sphere.tsx`, `reveal-on-scroll.tsx` — decorativos

**Lesson interior (Cinema A1/A2):**
- `lesson-experience.tsx` — orchestrator cliente que maneja A1→A2→A3→A4
- `lesson-breadcrumb.tsx` — breadcrumb + progress bar (Academia / M.0X / L.0Y)
- `lesson-title-band.tsx` — kicker + serif H1 + meta (Video/Lectura/Quiz/XP)
- `lesson-video-player.tsx` — YouTube/Vimeo/mp4/placeholder detector + cinema chrome
- `lesson-chapter-strip.tsx` — 5-col chapter row bajo el video
- `lesson-quiz-card.tsx` — quiz con 3 estados (unanswered/wrong/correct) + +25 XP
- `lesson-prev-next.tsx` — pair de navegación (prev/next) con `celebrating` variant
- `lesson-module-rail.tsx` — sidebar con lecciones list + XP card
- `lesson-actions.tsx` — 2x2 grid (Marcar/Compartir/Transcript/Reportar)
- `lesson-notes-block.tsx` — notas timestamped (localStorage only, never onchain)
- `lesson-quest-hook.tsx` — quest diaria card en sidebar
- `lesson-xp-moment.tsx` — A3 modal +XP celebration con confetti + breakdown + streak
- `lesson-share-modal.tsx` — A4 modal compartir con preview card + composer X

**Módulo overview (Sumario):**
- `v2-module-overview.tsx` — single client component, 4 estados state-machine
  (`empty` / `in-progress` / `almost-done` / `blocked-no-wallet`)

**Perfil:**
- `v2-profile-overview.tsx` — wallet card + XP big-stat + streak + actividad reciente

**Wallet:**
- `v2-connect-button.tsx` — ConnectButton themed (huérfano hoy, listo para reuso)

**Splash + Loader:**
- `v2-loader.tsx` — 8 cubos amarillos cayendo (Uiverse adaptado a BNB palette)
- `v2-initial-splash.tsx` — first-visit-only splash con gate MAX(3s, window.load + fonts.ready)

### Hooks (en `src/hooks/`)
- `use-lesson-progress.ts` — `useLessonProgress({moduleSlug, lessonSlug, moduleTotalLessons, moduleTotalXp, lessonXp, moduleLessons?})` → progreso + wallet + markComplete + syncToChain
- `use-lesson-notes.ts` — notas timestamped per-lesson, localStorage only

### Lib (en `src/lib/`)
- `types.ts` — `LessonFrontmatter`, `ModuleManifest`, `UserProgress`, `LessonNote`, etc.
- `modules.ts` — loader de `content/modules/*` (lee MDX + module.json bilingüe)
- `module-order.ts` — `MODULE_ORDER` array + `moduleCodeFor()` + `orderBySlug()`
- `progress-store.ts` — localStorage-backed store con streak tracking
- `quest-of-day.ts` — `QUEST_MODULE_SLUG`, `QUEST_LESSON_SLUG`, `QUEST_OF_DAY_PATH`
- `wagmi-config.ts` — RainbowKit `getDefaultConfig` con throw-in-prod si falta projectId
- `news.ts` — RSS aggregator con cache 10min + decoder HTML entities
- `twitter-handles.ts` — fetcher + globalThis cache + SEED_IDS fallback de tweet IDs
- `curated-tweets.ts` — hardcoded fallback de tweets
- `video.ts` — `detectVideo()`, `formatDuration()`, `parseTimeToSec()`
- `utils.ts` — cn helper

### Providers
- `src/components/providers/web3-providers.tsx` — Wagmi + QueryClient + RainbowKit dark theme
- `src/components/providers/progress-hydrator.tsx` — hydrates progressStore en mount

### Contenido (en `content/modules/`)
6 módulos curriculares, cada uno con `module.json` (bilingüe) + 4 MDX (`.es.mdx` y `.mdx`):
1. `fundamentos-bnb` — Beginner, 4 lecc, 400 XP (frontmatter enriquecido con `tagline`+`bullets`+`videoMin`+`readingMin` en las 4 lecciones ES — las otras lecciones EN y otros módulos solo tienen lo básico, degradan gracefully)
2. `wallets-seguridad` — Beginner, 4 lecc, 450 XP
3. `defi-bnb` — Intermediate, 5 lecc, 600 XP
4. `tokens-bep20` — Intermediate, 4 lecc, 500 XP
5. `nfts-bep721` — Intermediate, 4 lecc, 450 XP
6. `memecoins-launchpads` — Advanced, 4 lecc, 550 XP

### i18n
- `messages/es.json` — strings español (default)
- `messages/en.json` — strings inglés
- Namespaces v2: `v2.masthead`, `v2.hero`, `v2.portada`, `v2.academia`, `v2.manifiesto`,
  `v2.footer`, `v2.lesson` (incluye `.quiz` `.actions` `.notes` `.quest` `.xpMoment` `.share`),
  `v2.module`, `v2.profile`

## Estado funcional — qué está shippeado

✅ **Landing v2** (`/es`)
- Masthead sticky con scroll-spy, Login button (→/profile), Entrar CTA (→ lesson del día), nav Portada/En vivo/Academia/Descubre, switcher ES/EN
- §01 Portada: 1 hero feature + 3-up cards + 6 rows compactos = 10 noticias (RSS)
- §02 En vivo en X: sidebar 2-col con 5 tweets curados (@cz_binance, @MetaMask, @BNBCHAIN, @flapdotsh, @fourdotmemezh) capeados a 380px
- §02 Academia BNB: 6 cards numeradas (M.01–M.06) con números serif italic gigantes (bnb yellow primero, ember último), eyebrows poéticos, temario expandible, ruta de dificultad, quest strip
- §03 Manifiesto + 3 pilares + 2 CTAs (ambas → `#academia` con scroll suave nativo)
- Ticker footer con BLOQUE/GAS/BNB/ETH/SOL
- ES/EN ambos funcionan

✅ **Sumario v2** (`/es/learn/{module}`) — 4 estados state-aware
- A.1 empty (nunca empezó)
- A.2 in-progress (1–74% completado)
- A.3 almost-done (≥75% completado)
- A.4 blocked-no-wallet (progreso local sin wallet conectada)
- Hero con numeral "01" serif italic + mini-meta + H1 + drop cap
- Progress card a la derecha (state-aware con CTA BNB yellow distinto por estado)
- Stats strip + "El temario" expandible + 3-col footer (outcomes/concepts/sugerido)

✅ **Lesson interior Cinema** (`/es/learn/{module}/{lesson}`)
- A1: video player + chapter strip + MDX body (v2-prose con drop cap) + quiz + prev/next + sidebar (module rail + actions + notes + quest hook + wallet hint)
- A2: estado "completada" — quiz answered + replay button + done-flags
- A3: modal +XP con confetti, breakdown (Video/Lectura/Quiz), streak con transición 03→04, módulo % bar, CTAs Compartir/Continuar
- A4: modal share con preview card 460×240 + composer prefilled + hashtag chips + visibility radio + publish-en-X (twitter.com/intent/tweet)

✅ **Perfil v2** (`/es/profile`)
- Wallet card (estado connected/not-connected con RainbowKit ConnectButton dentro)
- 4 big-stats serif italic (XP/Lecciones/Módulos/Racha con 7-day dots)
- Nivel + progress bar
- 2-col: en-curso modules + actividad-reciente feed
- Zona sensible: reset progress con confirm-twice

✅ **Splash de bienvenida**
- Solo aparece la PRIMERA visita por device (localStorage `idrop-splash-seen`)
- Pre-hydration script (vía `next/script beforeInteractive`) hides el splash para returning users sin flash
- Gate: MAX(3s mínimo, document.fonts.ready + window.load), hard ceiling 8s
- 8 cubos amarillos cayendo con `@media (prefers-reduced-motion)` fallback a rombo pulsando

✅ **wagmi + RainbowKit**
- ConnectButton dentro de /profile (no en masthead)
- Login button del masthead navega a /profile
- 4 chains: BSC 56, BSC testnet 97, opBNB 204, opBNB testnet 5611
- Tema dark + accentColor bnb
- `syncToChain` placeholder hook (Phase 1 será write a contract)

✅ **Smoothness + perf**
- `html { scroll-behavior: smooth; scroll-padding-top: 80px }` — anchor jumps nativos
- `@view-transition { navigation: auto }` — cross-page fade en Chrome/Edge
- `prefetch` eager en masthead Entrar + Descubre + academia quest CTA
- 47 lesson paths + 9 module paths pre-rendered como SSG en build
- 21 archivos legacy borrados (~3000 LOC), SiteHeader/Footer/LanguageSwitcher eliminados

## Decisiones de diseño relevantes (para no repetir)

1. **Phase 0 = wagmi+RainbowKit con localStorage adapter; Phase 1 = contract en BSC testnet**. El hook `useLessonProgress` ya tiene shape onchain-ready; swap del adapter cuando haya contract deployed.

2. **Splash localStorage en lugar de sessionStorage** — first-visit-ever, no first-per-session. Pre-hydration script evita flash en returning users.

3. **`/learn`, `/discover`, `/news` redirigen al landing** — UX de "duplicación cero". Single source of truth para academia/news. /learn/[module] y /learn/[module]/[lesson] siguen siendo páginas reales.

4. **"Lesson of the day" hardcoded en `lib/quest-of-day.ts`** — `M.01/L.01`. Centralizar para fácil rotación futura. Tres CTAs apuntan acá (masthead Entrar, Descubre, §02 Aceptar quest).

5. **react-tweet en lugar de iframe widget** — más confiable, server-side, sin API key.

6. **globalThis cache para tweet IDs** — sobrevive HMR rebuilds; Next fetch cache cachea 429s (bad).

7. **Twitter da 429 al dev server, no a curl** — fingerprinting diferente. SEED_IDS hardcoded son críticos como red de seguridad.

8. **`cap-height: 380px` en tweet cards** — tweets cortos vs largos varían 200-1200px naturalmente; cap + fade-out al final mantiene grid uniforme.

9. **Overlay `<a>` absoluto en tweet cards** — evita nested `<a>` hydration error (react-tweet renderiza anchors internos).

10. **`next/script` con `beforeInteractive`** para el FOUC-kill script — React 19 warna sobre `<script>` JSX directo.

11. **`suppressHydrationWarning` en `<html>`** — porque el FOUC script muta `className`. Patrón canónico de next-themes etc.

12. **xpEarned exacto vs approx** — el hook `useLessonProgress` acepta `moduleLessons` opcional para sumar XP real; sin él usa promedio (OK para curriculum actual con 100 XP/lección).

13. **`middleware.ts` → `proxy.ts`** — convention de Next.js 16. Misma semántica, archivo renombrado.

## Tareas pendientes (orden de prioridad)

### Phase 1: contract onchain (próximo trabajo grande)
- Diseñar contract para XP attestation en BSC (mapping vs ERC-1155 attestations vs POAP)
- Deploy a BSC testnet 97
- Swap `progress-store` localStorage backend por wagmi reads
- Wire claim flow en `syncToChain` (modal con tx pending + confirmed states)
- UX para usuarios sin wallet: progreso local + opt-in sync batch al conectar

### Phase 2: contenido + polish
- Enriquecer las 4 lecciones EN de fundamentos-bnb con `tagline`+`bullets`+`videoMin`+`readingMin`
- Hacer lo mismo para los otros 5 módulos (ES y EN) — actualmente solo M.01-ES tiene esto
- Grabar el primer video real (M.01 L.01) y reemplazar el Rick Astley placeholder de prueba en `01-que-es-bnb.es.mdx`
- Wirear video.currentTime real al statusLabel de Sumario (para que "VIENDO AHORA · X:YY / N:00" no esté hardcoded)
- Tracking real de "completada hace 2h" en el temario expandible

### Phase 3: scope expansion
- Mobile layout — queries puestas pero no probadas en device real
- Wallet connection real (signed messages, multi-chain switch UX)
- Ticker placeholder del footer con datos reales (CoinGecko API)
- `/news` archivo completo con paginación (en v2 design, no redirect)
- Tracking de progreso real onchain (POAPs o attestation NFTs)

### Quick wins detectados en code review (la mayoría ya aplicadas, queda):
- Split de V2ModuleOverview (1000 LOC client) en sub-componentes server para reducir bundle
- Consolidar `useProgress` subscriptions en V2ProfileOverview (8 → 1)
- Tests unitarios para `lib/video.ts`, `lib/module-order.ts`, `progress-store.completeLesson` (streak edge cases)

## Curaduría manual periódica

### Tweets (`src/lib/twitter-handles.ts`)
- `CURATED_HANDLES` define los 5 handles visibles
- `SEED_IDS` tiene tweet IDs reales por handle (fallback si Twitter rate-limita)
- Refrescar manualmente:
  ```bash
  curl -s "https://syndication.twitter.com/srv/timeline-profile/screen-name/<HANDLE>" \
    | grep -oE '/status/[0-9]{16,20}' | head -3
  ```
- Nota: `@BNBChainLatAm` no expone tweets via syndication; reemplazado por `@MetaMask`

### Noticias (`src/lib/news.ts`)
- Aggregador RSS, cache 10 min, sin curaduría manual
- Fuentes: Cointelegraph, Decrypt, The Block, BeInCrypto

### Lesson of the day (`src/lib/quest-of-day.ts`)
- Hardcoded a `fundamentos-bnb / que-es-bnb` (M.01 L.01)
- Cambiar = una línea editada

## Cómo levantar el proyecto

### Local dev
```bash
cd D:\IDROP
npm run dev
```
Servidor en `http://localhost:3000` → redirige a `/es`.

Requiere `.env.local` con (template en `.env.example`):
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=ad4d40a460e17ad2a41957422526a554
NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3000
```

### Production build local
```bash
npm run build
npm start
```

### Vercel deploy
Auto-deploy on push to `main`. Env vars seteadas en Vercel dashboard:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_SITE_ORIGIN` = `https://<deploy-url>`

### Trucos dev
```js
// DevTools console — resetear estado para testear A1/A2/A3/A4 + splash desde cero
localStorage.removeItem("idrop-splash-seen");
localStorage.removeItem("idrop-progress");
document.documentElement.classList.remove("idrop-splash-seen");
location.reload();

// Forzar estado in-progress (para ver A.2 del Sumario):
localStorage.setItem("idrop-progress", JSON.stringify({
  completedLessons: { "fundamentos-bnb/que-es-bnb": Date.now() },
  totalXp: 100, modulesStarted: ["fundamentos-bnb"], modulesCompleted: [],
  streakDays: 4, lastStreakDay: new Date().toISOString().slice(0,10)
}));
location.reload();
```

## Historial de commits relevantes

```
f213ed5  Smooth + efficient: kill loader on every nav, fix manifesto CTA, sweep dead code
4e8c313  Address Vercel build warnings (middleware→proxy, next-mdx-remote v6)
214ea4a  chore: add .env.example template + unignore it
394b1f9  Address self-review: correctness + a11y + production guard
029babf  Initial commit: IDROP Academia v2
```

## Archivos de docs en el repo

- `IDROP_SESSION_STATE.md` (este archivo) — handoff para next chat
- `README.md` — intro pública del repo
- `docs/archive/` — prompts de Claude Design ya ejecutados (histórico)

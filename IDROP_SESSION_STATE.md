# IDROP — Session Handoff State

> Pégale este archivo al inicio del próximo chat para que sepa dónde estamos
> sin re-explicar todo. Última actualización: 2026-05-15.

## Qué es IDROP

Plataforma onchain educativa abierta sobre BNB Chain (con roadmap multi-cadena: opBNB, Ethereum, Solana). Tres servicios en un solo landing:
1. **Noticias crypto** agregadas vía RSS de Cointelegraph, Decrypt, The Block, BeInCrypto
2. **Academia BNB** — 6 módulos / 25+ lecciones MDX con quizzes y sistema de XP
3. **Feed Twitter curado** — últimos tweets server-fetched de cuentas crypto seleccionadas

Audiencia primaria: hispanohablantes entrando a web3 en serio (no degens). Idioma default `es`, también soporta `en`. Tono editorial sobrio (Stratechery × Bloomberg Terminal × Linear), no WAGMI.

## Stack técnico

- **Next.js 16** App Router + React 19
- **Tailwind CSS v4** con `@theme` tokens
- **next-intl** para i18n (ES/EN)
- **next-mdx-remote** para lecciones
- **react-tweet** (Vercel) para render nativo de tweets server-side
- **fast-xml-parser** para RSS
- Tema oscuro obligatorio, sin light-mode
- Server components donde se puede, client solo cuando hay interactividad

## Tipografías del sistema v2 (Claude Design)

- **Newsreader** (`--font-news-serif`) — titulares editoriales
- **IBM Plex Sans** (`--font-plex`) — body
- **JetBrains Mono** (`--font-plex-mono`) — labels, mc-text, números
- (Geist y Space Grotesk siguen cargadas pero no se usan en el landing v2)

## Paleta de tokens v2

```
--color-ink-0: #07080d   (página)
--color-ink-1: #0a0c14   (raised surface)
--color-ink-2: #10131c   (card)
--color-ink-3: #161a25   (card-2)
--color-line-1..3        (hairlines de baja a alta intensidad)
--color-t-0..4           (texto: t-0 más claro, t-4 más opaco)
--color-bnb: #F0B90B     (amarillo BNB — usar como puntuación, no decoración masiva)
--color-bnb-dim/-line
--color-ember            (warm accent, usar con cuentagotas)
--color-plum             (cool accent, idem)
```

## Estructura de archivos clave

### Landing v2 (la home)
- `src/app/[locale]/page.tsx` — composición de las secciones v2
- `src/components/v2/v2-masthead.tsx` — sticky header con scroll-spy nav
- `src/components/v2/v2-hero.tsx` — "El día en crypto, sin el ruido" + Ficha de Edición
- `src/components/v2/v2-portada.tsx` — §01 Titulares (news) + §02 En vivo en X (tweets, sidebar 2-col)
- `src/components/v2/v2-academia.tsx` — **§02 La Academia BNB** ← próximo a rediseñar
- `src/components/v2/v2-manifiesto.tsx` — §03 Por qué IDROP + 3 pilares
- `src/components/v2/v2-ticker.tsx` — footer con tickers BLOQUE/GAS/BNB/ETH/SOL
- `src/components/v2/wire-sphere.tsx` — SVG wireframe sphere decorativo
- `src/components/v2/reveal-on-scroll.tsx` — IntersectionObserver para .data-rise
- `src/components/v2/v2-handle-tweets.tsx` — render server-side de tweets curados
- `src/lib/twitter-handles.ts` — fetcher + cache + SEED_IDS de Twitter

### Otras rutas (no tocadas en v2 redesign, todavía usan estilo previo)
- `/learn` — catálogo de módulos
- `/learn/[module]` — overview del módulo
- `/learn/[module]/[lesson]` — lesson player MDX + quiz
- `/discover` — quests destacadas
- `/news` — feed completo + Twitter widget completo
- `/profile` — XP, level, progreso

### Contenido educativo
- `content/modules/{slug}/module.json` — manifest bilingüe por módulo
- `content/modules/{slug}/{NN}-{lesson-slug}.mdx` — lección EN
- `content/modules/{slug}/{NN}-{lesson-slug}.es.mdx` — lección ES (donde aplique)

### i18n
- `messages/en.json` — strings inglés
- `messages/es.json` — strings español (default)
- Namespaces v2: `v2.masthead`, `v2.hero`, `v2.portada`, `v2.academia`, `v2.manifiesto`, `v2.footer`

## Estado actual del landing

✅ **Hecho y funcionando:**
- Masthead editorial sticky con scroll-spy
- Hero "El día en crypto, sin el ruido" con Ficha de Edición
- §01 Portada — 1 hero feature + 3-up cards + 6 rows compactos (2-col) = 10 noticias
- §02 En vivo en X — sidebar 2-col, 5 tweets curados (CZ / MetaMask / BNBCHAIN / flap.sh / four.meme), capeados a 380px con fade-out, click → tweet original
- §03 **La Academia BNB v2** — layout editorial completo con 6 cards numeradas, números gigantes en serif (M.01 amarillo BNB, M.06 ember), eyebrows poéticos, temario (3 lecciones visibles + "+N lección más"), stats top (06 / 25 / 2,950 XP), ruta de dificultad horizontal, quest diaria con racha
- §04 Manifiesto + 3 pilares
- Footer ticker
- News column y Twitter sidebar balanceados a 1237px
- ES/EN funcionan, switcher en masthead

🎯 **Próxima iteración: interior del módulo con video**

El usuario quiere ESPACIO PARA UN VIDEO EXPLICATIVO en la página de lección (`/learn/[module]/[lesson]/page.tsx`), manteniendo el texto + quiz que ya existen.

Plan recomendado:
1. **Frontmatter MDX** — agregar campo opcional `videoUrl: string` a cada `.mdx`. Tipo en `src/lib/types.ts` (LessonFrontmatter).
2. **Componente VideoEmbed** — server component nuevo. Acepta `url` y detecta tipo:
   - YouTube/Vimeo → iframe embed
   - .mp4/.webm directo → `<video controls>` HTML5
   - URL vacía o no frontmatter → placeholder "Video próximamente" con icono (no rompe layout)
3. **Layout** — video va ARRIBA del MDX content en la lesson page, después del header. 16:9 aspect ratio, ancho completo del article (~720px), bordeado con `v2-tweet-shell` style.
4. **Diseño v2 del lesson player** — actualmente la lección usa estilo viejo (`/learn/[module]/[lesson]/page.tsx` con `LessonSidebar` + `LessonActions`). Vale la pena pasarla al sistema v2 (Newsreader serif para títulos, mc-text para labels, dark bg ink-0, etc.) AL MISMO TIEMPO que agregamos el slot de video. Consistencia visual.
5. **Para el video real**, el usuario los grabará. Sugerir:
   - Subir a YouTube como "Unlisted" → embed con URL
   - O subir mp4 a Vercel Blob / S3 → URL directo
   - Frontmatter: `videoUrl: "https://youtube.com/embed/XXXXX"` o `videoUrl: "/videos/fundamentos-01.mp4"` (en `public/videos/`)

## Curaduría manual periódica

### Tweets — `src/lib/twitter-handles.ts`
- `CURATED_HANDLES` define los 5 handles visibles
- `SEED_IDS` tiene tweet IDs reales por handle (fallback si Twitter rate-limita)
- Cache vía `globalThis` (sobrevive HMR)
- Auto-fetch desde syndication endpoint cuando funciona; SEED como red de seguridad
- Para refrescar manualmente:
  ```bash
  curl -s "https://syndication.twitter.com/srv/timeline-profile/screen-name/<HANDLE>" \
    | grep -oE '/status/[0-9]{16,20}' | head -3
  ```
- Nota: `@BNBChainLatAm` no expone tweets via syndication (limitación de Twitter); se reemplazó por `@MetaMask`

### Noticias
- `src/lib/news.ts` — agregador RSS, cache 10 min, decoder de HTML entities
- Sin curaduría manual — todo automático
- Fuentes: Cointelegraph, Decrypt, The Block, BeInCrypto

## Cómo levantar el proyecto

```bash
cd D:\IDROP
npm run dev
```

Servidor en `http://localhost:3000` → redirige a `/es` (default locale).

## Decisiones de diseño relevantes (para no repetir conversaciones)

1. **Por qué `react-tweet` y no iframe widget**: el iframe oficial es inestable, se esconde a sí mismo (visibility:hidden) si Twitter detecta algo raro, y rompe el theme. react-tweet renderiza nativo server-side con JSON parseado de `cdn.syndication.twitter.com/tweet-result` — confiable, sin API key.

2. **Por qué cache en `globalThis` y no Next.js fetch cache**: el dev server hace HMR rebuilds que resetean module-level state. `globalThis` persiste en el mismo proceso Node. Además, Next fetch cache cachea 429s (rate-limit responses) que después no podemos diferenciar de éxitos.

3. **Por qué Twitter da 429 al dev server pero no a curl**: fingerprinting diferente. El dev server hace requests más "Node-like" que Twitter detecta. En producción (Vercel) el IP es distinto y normalmente funciona. Por eso los SEED_IDS hardcoded son críticos.

4. **Por qué `cap-height: 380px` en las tweet cards**: tweets cortos vs largos varían entre 200-1200px naturalmente. El cap + fade-out al final mantiene grid uniforme; los tweets capeados quedan legibles 80% del contenido + click va al original.

5. **Por qué overlay `<a>` absoluto en lugar de wrapper `<a>`**: react-tweet renderiza anchors internos (avatar link, "@handle" link, etc). Wrapper `<a>` causaba `<a>` anidados → hydration error. El overlay absoluto con `pointer-events:none` en el contenido interno resuelve esto.

## Tareas pendientes (post-Academia + video)

Después del interior del módulo con video, candidatos:
- Rediseño del **Manifiesto** (3 pilares) con el mismo nivel editorial
- Sección **/news** con el mismo design system v2 (actualmente usa estilo viejo)
- **/learn/[module]** (module overview) con el mismo nivel editorial v2
- Mobile layout — queries puestas pero no probadas en device real
- Tickers placeholder del footer con datos reales (CoinGecko API o similar)
- Wallet connection cuando esté listo para fase web3 (wagmi + RainbowKit)
- Tracking de progreso real onchain (POAPs o similar) en lugar de localStorage

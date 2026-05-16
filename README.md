# IDROP — Academia BNB

Plataforma onchain educativa abierta sobre **BNB Chain**, en español. Currículo
de seis módulos con XP, agregador de noticias crypto y feed de Twitter curado
en una sola landing editorial.

> Stratechery × Bloomberg Terminal × Linear — para crypto education sin el
> ruido de degen Twitter.

## Stack

- Next.js 16 App Router + React 19 + Tailwind v4
- next-intl (ES default, EN switcher)
- next-mdx-remote v6 para lecciones
- react-tweet (Vercel) para tweets server-side
- wagmi + RainbowKit (BSC mainnet/testnet + opBNB mainnet/testnet)
- Tema oscuro `#07080d` + amarillo BNB `#F0B90B` como acento

## Run locally

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

Servidor en http://localhost:3000 → redirect a `/es`.

## Estructura

```
src/
├ app/[locale]/        # rutas Next.js (App Router)
├ components/v2/       # design system editorial (Newsreader serif + IBM Plex Sans + JetBrains Mono)
├ components/providers # wagmi + react-query + progress hydrator
├ hooks/               # useLessonProgress, useLessonNotes
├ lib/                 # types, modules loader, progress-store, wagmi-config, etc.
├ i18n/                # next-intl routing + request config
└ proxy.ts             # next-intl middleware (Next.js 16 "proxy" convention)
content/modules/       # 6 módulos × ~4 lecciones (MDX bilingüe + module.json)
messages/{es,en}.json  # i18n strings
docs/archive/          # design prompts ejecutados (histórico)
```

## Curriculum

| # | Slug | Nivel | Lecciones | XP |
|---|---|---|---|---|
| M.01 | `fundamentos-bnb` | Beginner | 4 | 400 |
| M.02 | `wallets-seguridad` | Beginner | 4 | 450 |
| M.03 | `defi-bnb` | Intermediate | 5 | 600 |
| M.04 | `tokens-bep20` | Intermediate | 4 | 500 |
| M.05 | `nfts-bep721` | Intermediate | 4 | 450 |
| M.06 | `memecoins-launchpads` | Advanced | 4 | 550 |

Total: **25 lecciones · 2 950 XP**.

## Estado actual

✅ Landing v2 con masthead/portada/academia/manifiesto/ticker
✅ Sumario v2 del módulo (4 estados state-aware)
✅ Lesson interior Cinema (A1/A2/A3/A4: estados en-curso/completada/+XP/share)
✅ Perfil v2 con wallet card + XP big-stat + streak + actividad
✅ Splash de bienvenida first-visit-only
✅ wagmi + RainbowKit integrados (progreso aún en localStorage; Phase 1 → contract onchain)
✅ ES/EN i18n completo
✅ 47 lesson paths + 9 module paths pre-rendered como SSG en build

🔜 Phase 1: contract de XP attestation en BSC testnet + claim flow
🔜 Videos reales de las lecciones (hoy hay placeholder editorial)
🔜 Mobile layout polish

## Handoff para nuevas sesiones de desarrollo

Si usás Claude Code u otra herramienta de coding asistido, pegá el contenido de
[`IDROP_SESSION_STATE.md`](./IDROP_SESSION_STATE.md) al inicio del chat para
darle todo el contexto del proyecto sin tener que re-explicar.

## Filosofía editorial

- Hispanohablantes entrando a web3 en serio (no degens)
- Tono editorial sobrio — Stratechery, Bloomberg Terminal, Linear
- Cero registros, cero tracking, cero ruido WAGMI
- Open source desde el día uno

## License

MIT

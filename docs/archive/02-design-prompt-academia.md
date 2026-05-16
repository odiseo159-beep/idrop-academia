# Prompt para Claude Design — Sección Academia BNB de IDROP

> Pega esto en https://design.claude.com como mensaje inicial.
> Sube los screenshots del estado actual de `/es` (scroll a la zona §02 La Academia BNB) como referencia "de qué reimaginar".
> Si puedes, sube también `idrop/project/IDROP Landing v2.html` del handoff anterior para que conozca el resto del sistema visual.

---

## El prompt (copia desde aquí ↓)

Hola. Estoy rediseñando una sola sección de mi proyecto **IDROP** — una plataforma onchain educativa abierta, sobria, editorial, hispanohablante. La sección a rediseñar es la **Academia BNB**: un currículo de seis módulos sobre BNB Chain con sistema de XP.

**Contexto rápido del proyecto.** IDROP es como Stratechery × Bloomberg Terminal × Linear para crypto education. Tema oscuro obligatorio (fondo `#07080d` casi-negro azulado). Color de marca: amarillo BNB `#F0B90B` como **acento** (no decoración masiva). Tipografías ya fijadas:
- **Newsreader** (serif) para titulares editoriales
- **IBM Plex Sans** para body
- **JetBrains Mono** para labels, números, mc-text (mono caps)

El resto del landing (masthead, hero "El día en crypto sin el ruido", titulares de hoy, En vivo en X con tweets curados) ya está diseñado y funcionando — esta sección debe sentirse hermana de eso, no algo de otro proyecto.

**Lo que tengo ahora (a mejorar).** 6 cards en grid de 3 columnas. Cada card tiene:
- código "M.01" + categoría en mono
- chip de nivel (Beginner/Intermediate/Advanced) arriba a la derecha
- título en serif grande
- una línea de blurb
- progress bar fino (2px) — está vacío para usuarios nuevos
- footer con `{lessons} lecc · {min} min` + `+{XP} XP`
- 2 chips de tags
- CTA "Empezar →" abajo-derecha

Debajo del grid hay una "Quest diaria" como banda horizontal — un strip con CTA para tomar una micro-quest del día.

**Problema con lo actual.** Se siente *SaaS genérico*. 6 cards iguales de 280px de alto. Sin jerarquía. Los módulos diferentes tienen distinta importancia y dificultad — eso debería leerse visualmente. La mecánica de XP/quests está apenas insinuada. Comparado con el resto del landing (que tiene drama editorial, blobs, wireframe sphere, columnas asimétricas, números grandes en serif italic), esta sección parece de otra época.

**Datos disponibles para cada módulo:**
- `title` (string, ej: "Fundamentos de BNB Chain")
- `tagline` (string corto, una línea)
- `description` (string largo, 2-4 frases)
- `category` (Fundamentals / DeFi / NFTs / Smart Contracts / Trading / Security)
- `difficulty` (beginner | intermediate | advanced)
- `durationMinutes` (45-65 típico)
- `totalXp` (400-600 típico)
- `totalLessons` (4-5)
- `tags` (array de 2-4 strings cortos)
- `accent` (primary | pink | purple | orange | cyan — color por módulo)
- `status` (todos están "available" hoy)

**Curriculum específico:**
1. Fundamentos de BNB Chain (beginner, 4 lecc, 400 XP) — la introducción
2. Wallets y Seguridad (beginner, 4 lecc, 450 XP) — auto-custodia
3. DeFi en BNB Chain (intermediate, 5 lecc, 600 XP) — el más profundo
4. Tokens BEP-20 (intermediate, 4 lecc, 500 XP) — smart contracts
5. NFTs en BNB Chain (intermediate, 4 lecc, 450 XP) — coleccionables
6. Memecoins y Launchpads (advanced, 4 lecc, 550 XP) — el más arriesgado

**Lo que SÍ está abierto a reimaginar:**
- Layout: no tiene que ser 3-col uniforme. Atrévete con asimetría: ¿un módulo "Fundamentals" hero del doble de tamaño? ¿Cards de distinto formato según dificultad? ¿Una línea de tiempo / ruta visual entre módulos?
- Tipografía editorial: ¿números de módulo gigantes en serif italic? ¿XP en formato grande tipo titular?
- Progreso/XP: ¿más prominente? ¿una visualización tipo "barra de carga del cohete"? ¿algo que se sienta más juego, menos dashboard?
- Quests: ¿quest diaria integrada en una card destacada? ¿múltiples quests con timer? ¿streak counter?
- Decoración: blobs, dotted-grid, wireframe shapes, plasma rings — todo bienvenido si refuerza la marca.

**Lo único NO-negociable:**
1. Tema oscuro (`#07080d` base) + amarillo BNB como acento de puntuación
2. Tipografías Newsreader (serif) + IBM Plex Sans + JetBrains Mono
3. Debe encajar visualmente con el masthead editorial y la sección de news arriba (sobrio, no SaaS)
4. Implementable en Next.js 16 + Tailwind v4 (sin nuevas dependencias raras)
5. Los 6 módulos con sus datos reales — no inventar módulos nuevos

**Referencias / vibe:**
- Layer3.xyz `/discover` — el patrón de quest cards bien hecho
- Linear changelog — números grandes, dark, mono details
- Are.na collection grids — composición asimétrica con buen ritmo
- Stratechery — confianza tipográfica con jerarquía clara
- Old Le Monde / NYT print sections — densidad editorial sin caos

**Lo que NO quiero ver:**
- 6 cards uniformes en grid bonito (eso ya tengo)
- Iconos "achievement" gamer de Steam/PlayStation
- Renders 3D de monedas crypto
- Gradientes púrpura sobre blanco / AI slop genérico
- Progress bars masivas tipo Duolingo
- Carrusel horizontal con flechas

**Brief de éxito.** Si un nuevo visitor mira la sección 5 segundos y puede:
- Identificar inmediatamente cuál es el "primer paso" (Fundamentos)
- Ver el camino lógico hacia los módulos más avanzados (Memecoins al final)
- Sentir que XP es real, no un gimmick
- Sentir que esto es una *Academia* (algo serio), no un *catálogo de cursos*
→ ahí está.

**Tu tarea.** Diseña esta sección en el canvas. Una sola sección, viewport desktop (1600×900 por consistencia con el resto). Propón **2 direcciones distintas** (ej: una más "ruta visual / journey" y otra más "biblioteca editorial"), preguntame cuál seguir. Después iteramos.

Tienes total libertad sobre layout interno, jerarquía, motion y elementos decorativos. Lo sagrado: dark + BNB yellow accent + Newsreader/Plex Sans/Plex Mono + sentido editorial.

---

## Notas para ti (no para el prompt)

- **Screenshots útiles para subir**: una captura del scroll completo del landing actual mostrando masthead → hero → titulares → Academia → manifiesto. Así Claude Design ve el contexto visual completo y no rompe coherencia.
- **Si quieres 1 dirección en vez de 2**, dile "propón una dirección y refinemos sobre eso".
- **Cuando tengas algo que te guste**, exporta como HTML standalone y traemelo al nuevo chat — yo lo integro al Next.js (V2Academia component) sin romper i18n ni los datos reales de los módulos.
- **El nuevo chat empieza pegando el archivo IDROP_SESSION_STATE.md** que también te dejé en la raíz del proyecto — eso le da contexto al nuevo Claude Code sin tener que re-explicar todo.

# Prompt para Claude Design — Página de Módulo (`/learn/[module]`) de IDROP

> Pega esto en https://claude.com/design como mensaje inicial.
>
> Sube como referencias:
> 1. Un screenshot del estado **actual** de `/es/learn/fundamentos-bnb` (lo feo, gradient blob + cards genéricas).
> 2. El HTML standalone de "IDROP Landing v2" del handoff anterior (si lo conservas) — para que vea el lenguaje visual del resto del sitio.
> 3. El HTML standalone de "Academia BNB Redesign" — la página padre que linkea a este módulo.
> 4. El HTML standalone de "Lesson Interior" (Cinema) — la página hija a la que se llega desde aquí.
>
> Si querés ir minimal, los 2 últimos bastan: necesita ver el "antes" (academia que linkea aquí) y el "después" (lesson interior).

---

## El prompt (copia desde aquí ↓)

Hola. Estoy diseñando una página específica de mi proyecto **IDROP** — una plataforma onchain educativa abierta sobre BNB Chain, sobria, editorial, en español. La página a rediseñar es **la vista de módulo** (`/learn/[module]`), que es el paso intermedio entre la **Academia** (overview de los 6 módulos) y el **interior de una lección** (donde el usuario realmente aprende).

**Contexto del flujo.** El usuario llega así:

```
Landing /es                  →  Academia BNB (6 cards)
                                  ↓ click en M.01 Fundamentos
                              [ESTA ES LA PÁGINA A REDISEÑAR]
                                  ↓ click en L.01
                              Lesson Interior (Cinema)
```

Esta página tiene **una sola responsabilidad**: presentar **un módulo entero** con todas sus lecciones, de forma que el usuario:
1. Entienda qué va a aprender (sin tener que leer manuales)
2. Vea su progreso si ya empezó algunas lecciones
3. Sepa cuál es la próxima lección a tomar
4. Pueda saltar a cualquier lección concreta

**Stack visual ya fijado (no negociable).** Tema oscuro `#07080d`, amarillo BNB `#F0B90B` como acento de puntuación (no decoración masiva). Tipografías:
- **Newsreader** (serif) — titulares editoriales, números grandes en italic
- **IBM Plex Sans** — body
- **JetBrains Mono** — labels (mc-text), mc-caps tabular numbers

El resto del sistema visual (Academia con números M.01–M.06, lesson interior con video cinema + sidebar) ya existe y es el "antes" y "después" de esta página. **Esta página tiene que sentirse hermana de ambas**, no algo nuevo.

**Datos disponibles del módulo (vienen de `module.json` + MDX de cada lección):**
- `code` — "M.01" (derivado del orden curricular)
- `title` — "Fundamentos de BNB Chain"
- `tagline` — frase corta de una línea ("De dónde viene, cómo funciona, por qué importa en 2025")
- `description` — 2–4 frases editoriales del módulo
- `difficulty` — "beginner" / "intermediate" / "advanced"
- `category` — "Fundamentals" / "DeFi" / "NFTs" / etc.
- `chain` — "bnb" / "ethereum" / "solana" / "multi"
- `durationMinutes` — total del módulo (~45–65)
- `totalXp` — total del módulo (~400–600)
- `totalLessons` — 4–5 típicamente
- `tags` — array de 2–4 strings cortos
- `prerequisites` — array de slugs de otros módulos (puede estar vacío)
- `accent` — color por módulo (primary | pink | purple | orange | cyan)
- `status` — siempre "available" para los 6 módulos hoy

**Por lección dentro del módulo:**
- `order` — 1..N
- `title` — "¿Qué es BNB Chain, en realidad?"
- `description` — 1–2 frases de la lección
- `duration` — minutos de lectura
- `xp` — XP que otorga (100 típico)
- `videoUrl?` — opcional, si tiene video
- `videoDurationSec?` — opcional
- `videoChapters?` — opcional, array de `{time, title}`
- `quiz` — array de preguntas para verificar comprensión

**Progreso del usuario disponible** (vía `useLessonProgress(moduleSlug, lessonSlug)`):
- Qué lecciones ya completó (con timestamp)
- XP acumulado en este módulo
- Racha global de días consecutivos
- % del módulo terminado
- Cuál es la siguiente lección lógica
- Wallet conectada o no (opt-in onchain)

**Lo que NO me gusta del estado actual** (mirá el screenshot):
- Un gradient blob fuchsia-orange flotando, restos de SaaS genérico
- 3 stat cards uniformes (Lecciones / Tiempo / XP) tipo dashboard
- Una sidebar de "Prerrequisitos" tipo Notion
- Lista de lecciones con cards casi iguales — no se ve qué importa más
- Botón "Ir a la primera lección" genérico
- Total inconsistencia con la Academia v2 y el Lesson Interior (Cinema)

**Lo que SÍ está abierto a reimaginar:**
- Layout: no tiene que ser hero + sidebar. Puede ser asimétrico, two-up, lista vertical editorial, lo que sea.
- El número del módulo "M.01" puede ser HEROICO — el "01" en serif italic 200px+, color BNB, dominando la columna izquierda.
- El temario de lecciones: ¿una lista timeline vertical (cada lección un row con su número en serif italic + título + meta + estado)? ¿Una grilla 2x2 de "issues"? ¿Una rota editorial tipo NYT print?
- Progreso: el módulo ya tiene XP+racha+% calculados — ¿una columna con esos números grandes en serif italic? ¿Una barra de progreso de "cinta del módulo"?
- Side content opcional: "Lo que aprenderás" (bullet list editorial), "Prerrequisitos" si los hay, "Conceptos clave que aparecerán" (PoSA, BSC, validadores), "Tiempo estimado" (45 min de cabeza distribuidos en 4 sesiones).
- CTA principal: si el user no empezó → "Empezar L.01 → ¿Qué es BNB Chain?"; si está a la mitad → "Continuar L.03 →"; si terminó → "Volver a ver" + módulo siguiente sugerido.
- Decoración: glow edges, dotted-grid, números de página tipo "P.04", todo bienvenido si refuerza la marca.

**Lo único NO-negociable:**
1. Tema oscuro `#07080d` + amarillo BNB como acento de puntuación
2. Tipografías Newsreader serif + IBM Plex Sans + JetBrains Mono
3. Debe sentirse hermana de la **Academia v2** (de donde viene el click) y del **Lesson Interior Cinema** (hacia donde va)
4. Implementable en Next.js 16 + Tailwind v4 (sin nuevas dependencias raras)
5. Los datos del módulo y las lecciones son los reales — no inventar lecciones nuevas

**Referencias / vibe:**
- Las "long-reads de Stratechery" — confianza tipográfica, ratio aire/texto
- El "edit page" de Substack — donde se ve el outline del post + control panel
- Las tablas de contenidos de Are.na collections — densas pero con respiración
- Old NYT magazine section dividers — número de sección gigante en serif italic
- La propia **Academia v2 de IDROP** (subida como referencia) — esta página es el zoom-in de una de esas cards

**Lo que NO quiero ver:**
- Cards de lección uniformes en grid 2x2 estilo Coursera
- Iconos lucide-react genéricos (BookOpen, Clock, Sparkles) — usar mono-glyphs o nada
- Gradientes fuchsia-orange sobre dark (eso es el problema actual)
- Renders 3D de monedas o sphere graphics tipo crypto-bro
- Barras de progreso masivas tipo Duolingo
- "What you'll learn" como bullet checkmarks gamer

**Brief de éxito.** Si un visitor que llega desde la Academia mira esta página 5 segundos y puede:
1. Confirmar **qué módulo es** (M.01 grande, título serif claro)
2. Ver **cuáles son sus 4 lecciones** y en qué orden van
3. Saber **cuál es la siguiente lección que debería tomar** (si ya empezó)
4. Sentir que esto es **una sola pieza de aprendizaje** — no un dashboard con métricas dispersas
5. Identificar **a qué lección saltar** sin tener que decidir entre múltiples CTAs
→ ahí está.

**Datos específicos para la página viewport** (usa estos para que el mock se vea real):
- Module: **M.01 · Fundamentos de BNB Chain** · Beginner · 45 min · 400 XP · 4 lecciones
- Description: "Empieza aquí. Construye el mapa conceptual de BNB Chain — su historia, la relación entre BNB Smart Chain, opBNB y Greenfield, cómo los validadores aseguran la red, y cómo pensar en el gas. Al final podrás leer cualquier transacción de BscScan sin perderte."
- Lecciones:
  - L.01 · ¿Qué es BNB Chain, en realidad? · 10 min · 100 XP · ✓ completada (ya hay video)
  - L.02 · Arquitectura y validadores · 11 min · 100 XP · viendo ahora
  - L.03 · Gas y tokens · 12 min · 100 XP · pendiente
  - L.04 · Ecosistema 2025 · 12 min · 100 XP · pendiente
- Progreso ejemplo: **25% del módulo · 100/400 XP · racha 04 días**

**Tu tarea.** Diseña esta página en el canvas. Una sola página, viewport desktop 1600×900–1800px de alto. Propón **2 direcciones distintas** (ej: una más "tabla de contenidos editorial" y otra más "narrativa hero + lecciones como capítulos"), preguntame cuál seguir, después iteramos.

Tienes total libertad sobre layout interno, jerarquía, motion y elementos decorativos. Lo sagrado: dark + BNB yellow accent + Newsreader/Plex Sans/Plex Mono + sentido editorial + coherencia con Academia v2 y Lesson Interior.

---

## Notas para mi futuro yo (no para el prompt)

- **Screenshots útiles para subir**: scroll completo del landing actual + screenshot del estado actual de `/es/learn/fundamentos-bnb` (lo feo) + Academia BNB Redesign + Lesson Interior Cinema. Si lo abrumás con uploads, prioridad: Academia + Lesson Interior.
- **Si querés UNA dirección en vez de 2**, decile "propón una dirección y refinemos sobre eso".
- **Cuando tengas algo que te guste**, exportá como HTML standalone y traémelo al chat de Cursor — yo lo integro al Next.js (`/learn/[module]/page.tsx`) sin romper la rail/CTAs/i18n.
- **El siguiente chat empieza pegando el IDROP_SESSION_STATE.md** del proyecto + este prompt — así el nuevo Claude Code entiende el contexto sin re-explicar.
- **No le pidas a Claude Design que diseñe también el header/footer** — esos ya son los del v2 system (V2Masthead + V2Ticker). Solo le interesa la franja del medio.

# Prompt para Claude Design — IDROP

> Pega este texto en https://design.claude.com como mensaje inicial.
> Si tienes screenshots del estado actual o de las referencias, súbelos también.
> Tras la primera generación, refina con comentarios en el canvas.

---

## El prompt (cópialo desde aquí ↓)

Hola. Quiero que rediseñes la página de inicio de un proyecto que se llama **IDROP**. No quiero que copies lo que ya existe — te voy a dar el alma del proyecto y quiero que me sorprendas con una propuesta tuya.

**Qué es IDROP en 30 segundos.** Una plataforma onchain abierta y gratuita. Tres cosas en un solo lugar: (1) noticias de crypto agregadas de la prensa que importa — Cointelegraph, Decrypt, The Block, BeInCrypto; (2) cursos estructurados sobre BNB Chain (6 módulos, 25+ lecciones, con quizzes y XP); (3) un feed curado de Twitter/X de las cuentas que mueven la conversación crypto. La promesa: *"alfabetización crypto sin el ruido"*.

**Audiencia.** Hispanohablantes que entran a web3 en serio. No están aquí por la moonshot — están aquí porque quieren entender. Idioma por defecto español, también soporta inglés. Edad típica 22-40, leen Stratechery, no leen "WAGMI Twitter".

**El alma.** Editorial, sobria, técnicamente creíble. Más cerca de un periódico digital serio que de un casino. Más cerca de Bloomberg Terminal que de un launchpad. Pero con personalidad — no es Reuters, es algo nuevo. Web3 nativo, dark mode obligatorio, con identidad visual propia.

**Lo único que es NO-negociable:**
1. Tema oscuro (color base casi-negro azulado #07080d).
2. Color de marca: el amarillo de BNB Chain (#F0B90B) como puntuación, no como decoración masiva.
3. Las tres cosas (noticias / cursos / Twitter) tienen que ser visibles arriba del fold sin scroll.
4. Construido con Next.js + Tailwind + shadcn/ui — los componentes deben sentirse implementables.

**Lo que SÍ está abierto a reimaginar:**
- La estructura del layout. Actualmente uso un dashboard 2-columnas (contenido principal izquierda, Twitter sidebar derecha). Si tienes una mejor idea, propónla — atrévete con asimetría, grids no convencionales, masthead editorial, lo que se te ocurra.
- La tipografía. Estoy usando Geist + Space Grotesk + Fraunces (serif para titulares editoriales). Si crees que otra combinación funciona mejor para "publicación crypto seria", dímelo.
- Los efectos visuales. Tengo wireframe spheres SVG, gradient blobs animados, dotted grid floor. Úsalos, reemplázalos, o invéntate algo nuevo. Lo que importe es que la pantalla sea reconocible — alguien debería poder ver una captura y decir "eso es IDROP".
- El idioma de UI. Empieza la propuesta en español.

**Referencias / vibe board** (no copiar — destilar):
- Stratechery, The Information, Dirt — densidad editorial, tipografía con confianza
- Linear marketing site — dark mode con artesanía, micro-tipografía mono
- Vercel.com — identidad geométrica, gradiente como acento no como fondo
- Layer3.xyz /discover — patrones de quest cards bien hechos
- Robinhood crypto — datos densos sin abrumar
- arc.net — UI craft, motion que se siente físico

**Lo que NO quiero ver:**
- Renders 3D de monedas crypto (genérico, lo hace todo el mundo).
- Energía "WAGMI moon to the stars".
- Neón saturado por todas partes.
- Tickers falsos de "live data" como elemento central.
- Layouts de plantilla SaaS — hero gigante con un screenshot mockup centrado.
- AI slop: gradientes púrpura sobre blanco, fonts Inter, cards iguales sin personalidad.

**El brief de éxito.** Si en una sola pantalla un usuario nuevo puede:
- Saber en 3 segundos qué ofrecemos.
- Ver el titular crypto del día sin scroll.
- Identificar visualmente 2-3 módulos de aprendizaje.
- Tener una columna de tweets curados a la vista.
- Recordar la marca al día siguiente.

Y si en redes sociales una captura del landing genera "qué es esto" en lugar de "ah, otro dashboard crypto"… ahí está el éxito.

**Tu tarea.**
Diseña el landing en el canvas. Una sola pantalla, viewport desktop (1440×900). Empieza por proponer 2 direcciones distintas (un layout más "publicación", otro más "terminal/dashboard de datos") y pregúntame cuál seguimos refinando. Luego trabajamos en iteraciones.

Sorpréndeme. Tienes total libertad sobre layout, retícula, jerarquía tipográfica, motion y elementos decorativos. Lo único sagrado es: dark, amarillo BNB como acento, las tres cosas visibles, sentido editorial y serio.

---

## Notas adicionales para ti (no para el prompt)

- **Si tienes screenshots del estado actual** (`/es` corriendo en localhost:3000), súbelas como referencia "de qué evitar repetir".
- **Si quieres compartir el repo**, Claude Design puede leer GitHub repos públicos. El de IDROP no está en GitHub aún, pero podrías subir un ZIP del directorio `src/` para que vea la arquitectura de componentes actual.
- **Después de la primera respuesta** de Claude Design, usa los comentarios inline del canvas. Selecciona un elemento → "haz esto más X" → itera. Es donde mejor brilla.
- **Cuando tengas algo que te guste**, exporta como HTML standalone y traemelo — yo lo integro al proyecto Next.js manteniendo i18n, types y la estructura existente.

## Plan B — versión más corta

Si prefieres un prompt más conciso (Claude Design también funciona con menos texto):

> Diseña el landing de **IDROP** — plataforma crypto educativa en español que muestra 3 cosas: noticias agregadas, cursos sobre BNB Chain y un feed curado de Twitter. Audiencia: gente seria que entra a web3, no degens. Tono: editorial sobrio (Stratechery × Bloomberg Terminal × Linear). Tema oscuro obligatorio, amarillo BNB (#F0B90B) como acento, las 3 cosas visibles arriba del fold. Estoy con Next.js + Tailwind + shadcn. Sorpréndeme con layout, tipografía, jerarquía. Propón 2 direcciones distintas y elijo. NO quiero ver renders 3D de monedas, energía WAGMI ni gradientes púrpura sobre blanco genéricos. Empieza en español.

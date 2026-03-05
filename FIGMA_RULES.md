# Figma Design System Rules — Flask + Static HTML/CSS/JS

These rules define how to implement Figma designs in a Flask app that renders static HTML/CSS/JS with a **cyber-arcane fantasy** visual style.

## Design System Structure

### 1) Token Definitions

**Source of truth**
- Define and maintain design tokens in CSS custom properties under `:root`.
- Primary location: `static/styles.css`.
- For larger Flask apps, split into `static/css/tokens.css` and import into `static/css/styles.css`.

**Token groups**
- `--color-*`: base, text, surfaces, borders, accents, states.
- `--fx-*`: glows, shadows, blurs, overlays.
- `--space-*`: spacing scale.
- `--radius-*`: border radii.
- `--font-*` and `--text-*`: typography families and scale.
- `--motion-*`: transition/easing durations.

**Cyber-arcane core palette (recommended baseline)**
```css
:root {
  --color-bg-void: #090312;
  --color-surface-1: rgba(16, 10, 35, 0.84);
  --color-surface-2: rgba(22, 13, 45, 0.95);
  --color-text-primary: #f7ecff;
  --color-text-muted: #b7a4d6;
  --color-accent-gold: #ffd27c;
  --color-accent-ember: #ff7e76;
  --color-accent-violet: #b842ff;
  --color-state-danger: #ff6e83;
  --color-state-success: #8ef0b0;

  --fx-shadow-elev-1: 0 18px 50px rgba(7, 1, 20, 0.5);
  --fx-border-subtle: rgba(255, 255, 255, 0.14);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;

  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;

  --font-display: "Copperplate", "Palatino Linotype", "Book Antiqua", serif;
  --font-body: "Trebuchet MS", "Franklin Gothic Medium", "Gill Sans", sans-serif;
}
```

**Figma mapping rule**
- Every color/spacing/typography value from Figma must map to a token first.
- Do not hardcode raw hex/pixel values in component blocks unless explicitly approved as one-off art treatment.

### 2) Component Library

**Component location**
- Markup lives in HTML templates/pages (currently `static/index.html`; in Flask typically `templates/*.html`).
- Styles live in `static/styles.css` (or `static/css/components/*.css` when split).
- Behavior lives in `static/app.js` (or `static/js/*.js`).

**Architecture**
- Use semantic HTML + class-based components.
- Prefer predictable naming: `.component`, `.component__part`, `.is-state`.
- Keep visual variants additive (e.g. `.btn`, `.btn--primary`, `.btn--ghost`).

**Base primitives to standardize**
- Buttons (`.btn`, `.btn--primary`, `.btn--ghost`, `.btn--danger`)
- Panels/cards (`.panel`, `.card`, `.hero-panel`, `.result-card`)
- Status elements (`.chip`, `.hint`, `.stat-value`)
- Layout wrappers (`.screen`, `.battle-layout`, `.lane`)

### 3) Frameworks & Libraries

- Backend: Flask (Python).
- Frontend: static HTML/CSS/vanilla JS.
- No frontend framework dependency required for implementation.
- Prefer zero-build static delivery unless the project later introduces a bundler.

**Flask integration pattern**
```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")
```

```html
<link rel="stylesheet" href="{{ url_for('static', filename='styles.css') }}">
<script defer src="{{ url_for('static', filename='app.js') }}"></script>
```

### 4) Asset Management

**Storage**
- Store design assets under:
  - `static/assets/images/`
  - `static/assets/icons/`
  - `static/assets/textures/`

**Rules**
- Keep exported Figma asset filenames deterministic (`arcane-panel-border@1x.png`, `icon-mana.svg`).
- Prefer SVG for icons and ornamental vector glyphs.
- Optimize raster textures (WebP/AVIF where supported) and keep originals in source design files, not in runtime static folders.

### 5) Icon System

- Use a consistent `icon-*` naming convention (`icon-health.svg`, `icon-mana.svg`).
- Prefer inline SVG or sprite usage for theming with CSS.
- Icons should inherit theme color via `currentColor` when possible.

### 6) Styling Approach

- Use CSS custom properties and layered gradients/glows for mood.
- Keep one source for global resets/typography/theme, then component blocks.
- Responsive behavior should rely on fluid sizing (`clamp`, `minmax`) and breakpoints only where layout truly changes.

**Visual language guardrails (cyber-arcane fantasy)**
- Dark “void” base with luminous magenta/violet/ember accents.
- Soft magical bloom/glow over hard sci-fi contrast edges.
- Gradient surfaces + subtle rune-like overlays for key UI containers.
- Headings feel mystical/classic; body text stays highly readable.
- Motion is brief and intentional (`180–320ms`) with eased reveals and hover aura intensification.

### 7) Project Structure

Recommended Flask-oriented structure:

```text
arcane-duel/
  app.py
  templates/
    index.html
  static/
    styles.css
    app.js
    assets/
      images/
      icons/
      textures/
```

If complexity grows, evolve to:

```text
static/
  css/
    tokens.css
    base.css
    components/
      buttons.css
      panels.css
      cards.css
    pages/
      battle.css
  js/
    app.js
    modules/
```

## Figma MCP Implementation Workflow

1. Use `get_design_context` on the exact node/variant.
2. Use `get_screenshot` for visual parity checks.
3. If context is too large, use `get_metadata` then fetch specific nodes.
4. Map Figma variables to CSS tokens before writing component CSS.
5. Export only required assets and store under `static/assets/*`.
6. Implement HTML/CSS/JS using existing component conventions.
7. Validate final UI against screenshot at matched viewport sizes.

## Quality Checklist (PR Gate)

- All Figma values mapped to tokens.
- No unreviewed one-off colors or spacing constants in component CSS.
- Component variants built as classes, not duplicated blocks.
- Contrast remains accessible on dark magical backgrounds.
- Hover/focus/active/disabled states are present for interactives.
- Final screen visually matches Figma composition, spacing, and hierarchy.

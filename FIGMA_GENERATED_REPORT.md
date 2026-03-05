# Figma Generated Report: Arcane Duel Battle HUD

## Generated Node
- Capture tool used: `mcp__figma__generate_figma_design` (new file mode invoked; capture IDs created: `e2107d3f-1612-4a65-9787-de3eb3c3e57c`, `16bf9fb8-65dc-4242-ba4c-013d6994a008`, `0e114ceb-44c9-4c0a-94ec-6d076a6a168d`)
- Capture status note: these capture sessions remained `pending` in this execution environment (no browser runtime available for the required hash-URL capture step), so context/screenshot extraction used the available primary frame below.
- Main frame used for extracted context/screenshot:
  - File key: `mNKoQ1zciqzL4B3CgjteJu`
  - Node ID: `1:2`
  - Link: https://www.figma.com/design/mNKoQ1zciqzL4B3CgjteJu/?node-id=1-2
- Tools executed on main frame:
  - `mcp__figma__get_design_context(fileKey="mNKoQ1zciqzL4B3CgjteJu", nodeId="1:2")`
  - `mcp__figma__get_screenshot(fileKey="mNKoQ1zciqzL4B3CgjteJu", nodeId="1:2")`

## Key Style Tokens (Neon Arcane HUD Direction)
Derived from the Arcane Duel HUD capture source (`static/figma_arcane_hud_capture.html`) for static implementation:

```css
:root {
  --night-void: #060512;
  --night-veil: #121031;
  --astral-cyan: #50f7ff;
  --spell-violet: #8f6bff;
  --rune-pink: #ff4fb7;
  --ember-gold: #ffc05a;
  --mana-blue: #4fd8ff;
  --life-red: #ff5f73;
  --ink-100: #f6f4ff;
  --ink-70: #d2cdf6;
}
```

Supporting values observed in retrieved design context (`1:2`):
- Surface background: `#fafafa`
- Body copy color: `rgba(0, 0, 0, 0.8)`
- Heading color: `#000000`
- Heading font intent: `Inter Bold`

## Static HTML/CSS Implementation Notes
- Use a single root `.battle-frame` container with a 3-row grid: top HUD, arena board, bottom utility panels.
- Build neon atmosphere with layered `radial-gradient` + `linear-gradient` backgrounds on `body` and `.battle-frame`.
- Use CSS custom properties for all palette values and resource bars (health/mana) to keep theme swaps simple.
- Represent board units/cards as repeatable semantic blocks (`.unit`, `.card`) using CSS Grid for responsive lane/card counts.
- Keep glow effects in CSS (`box-shadow`, `inset` shadows) rather than images for easy tuning.
- Apply one breakpoint around `max-width: 980px` to collapse top/bottom rows into single-column stacks.
- Keep frame corners, borders, and glow alpha consistent (rounded 10-26px, border alpha 0.16-0.62) for a coherent arcane-fantasy HUD style.

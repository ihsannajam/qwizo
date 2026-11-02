# Asset generation — Qwizo visual update

Mode: built-in ImageGen. Generated artwork is encoded to project-local WebP; no runtime AI integration. Logo and orange robot remain the original PDF-derived assets.

## Shared island prompt

Use case: stylized-concept. ONE isolated floating island game sprite for Qwizo [subject]. Theme: [theme]. Premium polished colorful stylized 3D render in isometric 2.5D perspective, lush rounded grass on a floating rock island with detailed layered rocky cliffs tapering beneath, little cascading waterfall, tiny sculpted trees and shrubs. Detailed dimensional buildings, tactile materials, soft cinematic sunlight, ambient occlusion, charming Playful & Colorful fantasy educational game art. Entire island fully visible, square composition with generous transparent padding, 85% frame occupancy. Camera from above with front and right sides visible. No text, no letters, no labels, no UI, no characters, no backdrop. Actual transparent background. Single independent sprite asset, not a mockup.

| Output under `public/assets/islands/` | Theme                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `physics.webp`                        | electric blue futuristic observatory with luminous atomic rings, energy coils and telescope                |
| `chemistry.webp`                      | turquoise whimsical alchemy laboratory, giant glass flasks of bright green and yellow liquid, copper pipes |
| `biology.webp`                        | lush emerald botanical sanctuary with a huge sculpted tree, tiny greenhouse, flowers and mushrooms         |
| `history.webp`                        | warm sandstone ancient temple, archaeological ruins, columns and small clock tower                         |
| `geography.webp`                      | blue snowcapped mountain range, winding turquoise river, tiny mapmaker tower                               |
| `economics.webp`                      | golden miniature trading city, marketplace stalls, domed treasury and gold coins                           |
| `sociology.webp`                      | coral and peach village, welcoming houses around communal plaza and bridge                                 |
| `indonesia.webp`                      | pink and terracotta literary library palace with an open book sculpture, tropical trees                    |
| `english.webp`                        | royal blue fantasy academy with a British inspired clocktower and small red telephone box                  |

## Mathematics sprite — `public/assets/islands/math.webp`

Use case: stylized-concept. Create ONE isolated game sprite asset for Qwizo mathematics island. High-end colorful polished stylized 3D rendered floating fantasy island, isometric 2.5D camera, lush grass on lavender floating faceted rocky cliffs tapering beneath, intricate purple crystal castle with three spires, golden lit windows, winding ivory steps, giant translucent violet crystals, small round sculpted trees, little cascading waterfalls. Playful premium educational adventure game artwork, soft cinematic sunlight, ambient occlusion, detailed dimensional materials, saturated purple #7255E8, mint grass, sky blue water and touches of warm gold. Entire floating island fully visible with generous transparent padding, occupies 85% of square frame. No text, no letters, no math symbols, no labels, no UI, no characters, no background. Actual transparent background. This will be placed as independent interactive island sprite, not a screenshot.

## World scenery — `public/assets/world-backdrop.webp`

Wide panoramic fantasy sky ocean environment background for colorful isometric floating island game Qwizo. No islands or buildings in central 85 percent: vast gorgeous sparkling turquoise ocean seen from high above, distant horizon upper 20 percent, large soft fluffy white and lavender clouds at edges, distant tiny rocky spires along far horizon, bright azure sky with warm sunlight. Premium polished stylized 3D cinematic render, cheerful lush world atmosphere, no text, no UI, no characters. Wide landscape 1536x1024 framing. This is ONLY a scenery layer; all interactive islands will be rendered separately.

## Mathematics terrain — `public/assets/math-backdrop.webp`

Wide landscape 3D stylized isometric fantasy mathematics world terrain, playable level map background ONLY, no UI or labels. A large continuous floating lavender rocky island terrain with rich emerald grass, winding ivory cobblestone pathways going from lower left across middle through center to upper right, violet crystal gardens, several small arched bridges across turquoise streams, tiny purple roof gazebos, luminous purple crystals, waterfalls spilling off layered rocky edges, distant purple crystal castle at UPPER RIGHT beyond path. Several clear grassy open plateaus along path for interactive level markers overlay. Camera high above front at 45 degrees, intricate polished charming 3D game render, dimensional rounded materials, sunlight, ambient occlusion, whimsical premium educational game world. Main land fills frame from lower left to upper right with sky clouds and aqua ocean around edges. Purple #7255E8, lavender, mint, turquoise, warm golden light. No text, no letters, no numbered level markers, no buttons, no characters, no HUD. Landscape 1536x1024.

## Transparent character and logo cutouts — built-in ImageGen

Output: `public/assets/mascot-transparent.webp`. Input: existing `public/assets/mascot.png`.

Prompt: Use case: background-extraction. Edit target: attached existing Qwizo orange robot mascot. Remove ONLY the white/light-gray rectangular background and ground shadow. Deliver the exact same robot as a clean transparent cutout with full head, antenna, raised right hand, body and both feet visible. Preserve the exact original character identity, orange shell, white face, dark eyes, smiling red mouth, antenna, pose, proportions, shading, colors and all details. Do not redesign, add accessories, change facial expression, or add any text. Clean anti-aliased silhouette with genuinely transparent alpha everywhere outside the robot including between limbs. No white matte, no card, no ground plane, no drop shadow baked into backdrop. Single isolated mascot on actual transparent background.

Output: `public/assets/logo-transparent.webp`. Input: existing `public/assets/logo.png`.

Prompt: Use case: background-extraction. Remove only the white rectangular background OUTSIDE this exact existing qwizo! logo. Preserve the original logo identically: white letter interiors, thick purple outlines, yellow star above the i, exclamation mark, and exact small tagline Your Learning Adventure. Do not redesign, retype, change spelling, change shapes, or change colors. Exact original logo design on genuine transparent alpha background, including transparency around exterior shape and below tagline. White portions INSIDE outlined logo letters must remain opaque white. No new elements, no shadow, no card. Tightly framed horizontal logo cutout.

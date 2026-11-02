# Fullscreen boss arena

The battle uses an edge-to-edge environment behind a transparent header and combat HUD. A single-column viewport grid gives the battle scene the remaining space above the question panel. The question panel keeps its prompt, four choices, feedback and action in view; checking an answer changes the available arena height instead of extending the page. Desktop uses two columns inside the bottom panel; portrait phones stack these controls. Motion preferences remain supported.

Browser checks used a separate local QA profile, leaving the owner's browser progress untouched. Tested 1920×1080, 1366×574, 390×778, 320×480 and 844×390. Before and after answer checking, prompt/options/feedback/action bounds stayed inside the viewport with no stage scrolling or clipped control text. All six English boss questions were checked, including the longer final question; Indonesian feedback was also checked. Build and existing progression, rendering, AI and OAuth tests passed. Result review remains independently scrollable when expanded.

## Background asset

### Game result overlay

Boss results now appear in a centered game overlay above the full-size, dimmed arena. Victory uses a gold trophy, stars, burst particles and actual earned rewards. Defeat uses a cooler Qwi panel with a prominent retry action and omits zero-value loot. Replay victories explain that the first-win reward has already been claimed. Stats use the submitted outcome and remaining Qwi HP.

Review replaces the content inside the same panel; its answer list scrolls internally while the back action remains visible. Escape returns from review and restores focus. The arena/help and header are inert during results, and the session focus loop excludes inert controls.

Browser QA verified defeat after two misses, retry, then first victory after five hits with +300 XP and +100 coins. Both result panels fit without overflow at 1920×1080, 1366×574, 390×778, 320×480 and 844×390. At 320×480 the review list scrolls while the back action remains inside the screen; the stage does not scroll. No browser console errors were observed. Build and existing 15 MVP checks passed.

### Finishing-hit animations

At 0 HP the guardian flashes, contracts and disperses into 12 crystal fragments. Qwi's defeat instead staggers, falls sideways and dims. These animate the inner sprite after the impact/recoil, leaving the anchor and overhead HP stable. Both retain their defeated appearance until retry. A final turn locks the results action for 2.8 seconds; ordinary attacks still use 1.2 seconds. Reduced-motion mode skips the delay and immediately displays the final defeated state.

Browser QA completed five correct answers to trigger guardian defeat and two incorrect answers after retry to trigger Qwi defeat. Both animation names and initial results-button lock were verified. After completion the guardian had opacity 0; Qwi retained its collapsed transform and dimmed filter. The results action then unlocked. Retrying each outcome removed all defeat effects and restored the sprites. Build and 15 MVP checks passed.

### Character alignment and overhead HP

The battle image and both fighters now use one shared scene plane. Platform centers measured from the artwork are Qwi (27.5%, 71.5%) and the guardian (79.5%, 49.5%). Sprite feet, overhead HP labels, shadows and attack effects use that same plane. Compact HP labels are children of each fighter anchor, centered above its head; attack movement animates the sprite separately. The floating header overlays this world rather than rendering a second strip of sky.

Browser verification at 1920×1080, 1366×574, 390×778, 320×480 and 844×390 found zero-pixel rounded error between character anchors and platform centers. Both HP labels stayed centered, above their fighters and inside the viewport. Answer feedback was additionally checked at 1366×574, 390×778 and 320×480: controls remained visible without stage scrolling. The build and 15 MVP progression/rendering checks passed.

`public/assets/boss-arena-landscape.png` was generated with the built-in ImageGen tool. It is an environment only; Qwi, the guardian, HP, projectiles and controls remain separate animated elements.

Generation prompt:

> Create a finished high-quality 3D stylized fantasy videogame environment background asset, widescreen 16:9, for a friendly educational RPG crystal guardian battle. NO text, NO interface, NO characters, NO monsters, NO logos. Rich believable rendered environment with material texture and cinematic spatial depth, like polished modern cozy adventure game concept art. Enchanted ancient stone courtyard in a lush mountainous floating-island world at blue hour, soft turquoise luminous crystals growing along mossy rock edges, giant distant crystal temple gateway slightly right of center, waterfalls and misty mountain silhouettes, warm golden tiny fireflies, atmospheric cool teal and deep blue with warm highlights. Wide level stone battle clearing occupying middle and foreground, two subtly raised natural circular stone platforms: player platform in lower left quadrant at 28% x 68% y and enemy platform at 73% x 50% y. Keep center open for animated characters composited later. Lower 35% will be covered by an interface so prioritize architectural detail and atmosphere upper 65%. Edge-to-edge environment, no borders, no blank backdrop. Detailed 3D illustration with soft volumetric light, pleasing perspective, rounded sculpted rocks, lush grass, high production value, visually compatible with a cute orange robot mascot.

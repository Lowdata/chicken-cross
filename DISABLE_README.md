# Pre-Launch Gating & Revert Reference

This document provides a comprehensive reference for the temporary pre-launch gating applied to the **"BUILD YOUR BOUNCE"** trait lab, detailing what has been disabled, in which files, and step-by-step instructions to revert everything back to full functionality at launch. It also documents the mechanics of the in-game **Eagle Fury** predator system.

---

## 1. Summary of Gated Features

| Feature | Gated Behavior | Production / Launch Behavior |
| :--- | :--- | :--- |
| **Randomize Button** | Toggles strictly between **2 curated arts** (`ART_PRESET_1` and `ART_PRESET_2`). | Randomizes across 350+ individual traits from all available layers. |
| **Slot Selection (Slot 1)** | Disabled (`is-disabled`, `cursor: not-allowed`); displays a floating **"Coming Soon"** tooltip on hover / click. | Allows clicking any slot row to view traits for that layer. |
| **Trait Selection (Slot 2)** | Disabled (`is-disabled`, `cursor: not-allowed`); displays a floating **"Coming Soon"** tooltip on hover / click. | Equips / unequips selected trait and updates the live canvas preview. |
| **Clear All / Remove ("✕")** | Disabled with tooltip to protect preview state. | Clears all equipped layers or removes individual layer traits. |
| **Save Build** | Triggers the **"Coming Soon"** tooltip. | Triggers build download or mint/save workflow. |

---

## 2. Modified Files & Changes

### A. [`src/components/landing/TraitLab.tsx`](src/components/landing/TraitLab.tsx)

1. **Curated Art Presets**:
   - Added `ART_PRESET_1` (Netherland Dwarf opening preset) and `ART_PRESET_2` (Cyber Construct 24K Gold Astronaut preset).
   - `OPENING` is bound to `ART_PRESET_1`.
2. **2-Art Randomize Logic**:
   - Added state `activePresetIndex` and cycling logic inside `randomise()`:
     ```ts
     const nextIndex = (activePresetIndex + 1) % ART_PRESETS.length;
     setActivePresetIndex(nextIndex);
     const targetPreset = ART_PRESETS[nextIndex];
     ```
3. **Slot & Trait Interception**:
   - `handleDisabledAction(e, text = 'Coming Soon')` calculates exact screen position using `getBoundingClientRect()` and displays the floating portal tooltip.
   - Added `is-disabled` class and intercepted `onClick`, `onMouseEnter`, and `onMouseLeave` on `.slotrow`, `.tile`, `.pick__clear`, and `.slotrow__x`.
4. **Portal Tooltip**:
   - Rendered using React's `createPortal(..., document.body)` so that parent CSS transforms (`rotate`, `matrix`) and scroll containers do not distort or clip the tooltip.
   - Automatically hides on window scroll or unmount.

### B. [`src/styles/landing/repairs.css`](src/styles/landing/repairs.css)

- Appended gated styling marked with `/* [TEMPORARY DISABLE - LAUNCH GATE] */`:
  - `#lab .slotrow.is-disabled, #lab .tile.is-disabled, #lab .pick__clear.is-disabled, #lab .slotrow__x.is-disabled`: Sets `cursor: not-allowed !important;`.
  - `.lab-tooltip-portal` & `.lab-tooltip-box`: Glassmorphic styling with neon border glow, backdrop filter, and smooth pop animation.

---

## 3. Step-by-Step Revert Instructions (For Launch)

When ready to launch the full trait builder, follow these simple steps:

### Step 1: Restore Randomize Trait Rolling in `TraitLab.tsx`
Replace the `randomise()` function with the original full-pool generator:
```ts
const ROLL = ['Backgrounds', 'Breed - Kind', 'Eyes', 'Mouths', 'Clothing', 'Held Items', 'Headwears'];
const randomise = () => {
  setEq(prev => {
    const next = { ...prev };
    for (const c of ROLL) {
      const a = cats[c];
      if (a?.length) next[c] = a[Math.floor(Math.random() * a.length)];
    }
    return next;
  });
  requestAnimationFrame(hop);
};
```

### Step 2: Re-enable Slot Selection in Panel 1
In `TraitLab.tsx`:
1. On `.pick__clear`:
   ```tsx
   <button className="pick__clear" type="button" onClick={() => setEq({})}>clear all</button>
   ```
2. On `.slotrow`:
   ```tsx
   <button
     key={c}
     type="button"
     className={`slotrow${cat === c ? ' is-on' : ''}${worn ? ' has' : ''}`}
     onClick={() => setCat(c)}
   >
   ```
3. On `.slotrow__x`:
   ```tsx
   <span
     className="slotrow__x"
     aria-label={`clear ${pretty(c)}`}
     onClick={e => { e.stopPropagation(); setEq(p => ({ ...p, [c]: undefined })); }}
   >✕</span>
   ```

### Step 3: Re-enable Trait Tiles in Panel 2
In `TraitLab.tsx`:
```tsx
<button
  key={it.url}
  type="button"
  className={`tile${eq[cat]?.url === it.url ? ' is-on' : ''}`}
  onClick={() => setEq(p => ({ ...p, [cat]: p[cat]?.url === it.url ? undefined : it }))}
>
```

### Step 4: Remove Tooltip Portal & Gated CSS (Optional)
1. Remove `createPortal(...)` and `tooltip` state from `TraitLab.tsx`.
2. Remove the `[TEMPORARY DISABLE - LAUNCH GATE]` block from the bottom of `src/styles/landing/repairs.css`.

---

## 4. Eagle Fury Predator System Reference

> [!NOTE]
> This analysis is for technical and design reference. No game logic code was modified.

### Mechanism Breakdown
The Eagle Predator is defined in [`src/lib/game/threeGameEngine.ts`](src/lib/game/threeGameEngine.ts):

1. **Unlock Condition (`REQUIRED_CARROTS_FOR_EAGLE = 5`)**:
   - The eagle predator unlocks once the player gathers **5 carrots**.
   - Initial attack timer: `3.5s + Math.random() * 2.0s`.
2. **Escalation at 7 Carrots**:
   - `eagleSpawnTimer = Math.min(eagleSpawnTimer, 2.8s)`.
   - Flight duration: `1.30s`, Warning duration: `1.05s`.
   - Post-evasion retry interval drops from standard `14s - 22s` down to **`4.0s - 6.5s`**.
3. **Apex Strike at 8 Carrots**:
   - **Standard 8-Carrot Game (`maxCarrots === 8`)**:
     - Immediate strike scheduled in **`1.0s`**.
     - Lightning warning corridor: **`0.85s`**, swoop flight: **`1.15s`**.
     - Continuous swept line collision: catches player within `0.85` tile distance.
     - Post-evasion retry interval: **`2.2s - 3.8s`** (relentless strikes until death).
   - **Rare 9th Carrot Run (`maxCarrots === 9`, 1% chance roll)**:
     - 9th golden carrot spawns with on-screen directional radar.
     - Eagle strike scheduled in `3.8s` and retries every `3.8s - 5.5s`.

### Why a Player May Sit Idle After the 8th Carrot:
1. **No Inactivity AFK Timer**: Unlike classic Crossy Road where standing still triggers a swooping hawk, this game's eagle operates strictly on a carrot progression loop, not idle detection.
2. **Pre-commit Cooldown (Historical)**: Prior to commit `c854a39`, the evasion cooldown was `14.0s - 22.0s`. If the player evaded the eagle around carrot 8, they could sit stationary for up to 22 seconds before another attack.
3. **Apex Reaction Window**: When the 8th carrot is harvested, there is a total window of `~2.43s` (`1.0s` spawn timer + `0.85s` warning + `~0.58s` midpoint descent) before the talons touch the bunny's ground tile.
4. **9-Carrot Game Roll**: If the session rolled 9 carrots, collecting carrot 8 does not trigger immediate death; it spawns the golden carrot and gives the player a `3.8s` lead time.

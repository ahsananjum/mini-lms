# Design System Specification: High-End Editorial LMS

## 1. Overview & Creative North Star
### Creative North Star: "The Academic Curator"
This design system rejects the cluttered, "dashboard-heavy" aesthetic of traditional educational software. Instead, it adopts the persona of a high-end digital gallery or a premium editorial publication. The goal is to facilitate deep focus through **Soft Minimalism**—a philosophy where the interface recedes to let the curriculum shine.

To break the "template" look, we utilize **Intentional Asymmetry**. Instead of perfectly centered grids, we use generous, sweeping white space and off-balance typography scales. We prioritize "Breathing Room" over "Information Density," ensuring that even the most complex course materials feel approachable and prestigious.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Light-First" architecture, moving away from harsh pure whites toward organic slates and sophisticated indigos.

### The Palette (Material Design Mapping)
- **Primary (Indigo):** `#3525CD` / `primary_container`: `#4F46E5` — Used for high-intent actions and brand signatures.
- **Surface (Background):** `#F7F9FB` — The foundation of the entire system.
- **Success (Emerald):** `tertiary_fixed_dim`: `#4EDEA3` — For progression and completion.
- **Error (Rose):** `error`: `#BA1A1A` — For destructive actions or critical alerts.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for defining sections. Structure must be achieved through **Tonal Transitions**. 
- Use `surface_container_low` (#F2F4F6) to define a sidebar against a `surface` (#F7F9FB) main content area.
- Use `surface_container_highest` (#E0E3E5) to subtly call out a "Quick Links" section. 
- *The eye should perceive a change in depth, not a boundary line.*

### Glass & Texture
For the sticky top navigation and floating modals, use **Glassmorphism**.
- **Value:** `surface_container_lowest` (#FFFFFF) at 80% opacity with a `24px` backdrop-blur.
- **Signature Texture:** Primary CTAs should utilize a subtle linear gradient from `primary` (#3525CD) to `primary_container` (#4F46E5) at a 135-degree angle to provide a "lit from within" professional polish.

---

## 3. Typography: The Editorial Hierarchy
We use **Inter** as our sole typeface, relying on extreme weight contrast and generous tracking to create an "Academic Journal" feel.

- **Display (LG/MD):** 3.5rem / 2.75rem. Medium weight. Used for course titles. Letter spacing: `-0.02em`.
- **Headline (LG):** 2rem. Bold. This is your "Editorial Hook." It should feel authoritative.
- **Title (SM/MD):** 1rem / 1.125rem. Medium weight. Used for module headers.
- **Body (LG/MD):** 1rem / 0.875rem. Regular weight. Line height: `1.6` for optimal readability in long-form academic content.
- **Labels:** 0.75rem. Medium weight, all-caps with `0.05em` tracking for a "utility" feel that doesn't distract from the primary text.

---

## 4. Elevation & Depth
In this system, depth is a physical property. We move away from the "flat" web.

### The Layering Principle
Hierarchy is achieved by "stacking" surface tiers. 
- **Level 0 (Base):** `surface` (#F7F9FB).
- **Level 1 (Sections):** `surface_container_low` (#F2F4F6) used for inset content.
- **Level 2 (Cards):** `surface_container_lowest` (#FFFFFF) used for individual interactive elements.

### Ambient Shadows & "Ghost Borders"
- **Shadows:** For floating elements, use a "Global Ambient" shadow: `0px 20px 40px rgba(70, 69, 85, 0.06)`. Note the tint—the shadow uses the `on_surface_variant` color, not black.
- **The Ghost Border:** If a boundary is required for accessibility, use `outline_variant` (#C7C4D8) at **15% opacity**. It should be felt, not seen.

---

## 5. Components
### Buttons
- **Primary:** Gradient-filled (Indigo), `12px-16px` (md/lg) corner radius. No border.
- **Secondary:** `surface_container_high` (#E6E8EA) background, `on_surface` text. Feels "embedded" into the page.
- **Tertiary:** No background. Text-only with an underline appearing only on hover.

### Cards (The "Container" Primitive)
- **Rules:** Card corners must be `lg` (2rem) or `md` (1.5rem). 
- **No Dividers:** Never use a horizontal line to separate card headers from content. Use a `spacing-4` (1.4rem) vertical gap or a subtle `surface_container_low` background shift for the header area.

### Input Fields
- **Style:** `surface_container_lowest` (#FFFFFF) with a `ghost border`.
- **State:** On focus, the border transitions to `primary` at 40% opacity with a subtle `4px` outer glow.

### Academic Components
- **The "Insight" Block:** A large-radius card (2rem) using `secondary_container` (#D0E1FB) background to highlight key professor takeaways.
- **Progress Ring:** Minimalist 2px stroke using `tertiary_fixed_dim` (#4EDEA3) for completed modules.

---

## 6. Do’s and Don’ts

### Do:
- **Use Intentional Asymmetry:** Align a "Title-LG" header to the left while keeping the "Body-LG" text in a narrower, centered column to create editorial tension.
- **Embrace the Blur:** Use the sticky top-nav blur to allow course content colors to bleed through as the user scrolls.
- **Respect the Radius:** Ensure all interactive elements follow the `md` (1.5rem) to `lg` (2rem) rounding scale.

### Don’t:
- **Don't use 100% Opaque Borders:** This shatters the "soft" feel and makes the UI look like a legacy enterprise tool.
- **Don't use Pure Black (#000000):** Use `on_surface` (#191C1E) for text to maintain a high-end, soft-contrast feel.
- **Don't Crowd the Container:** If a screen feels "busy," increase the spacing scale from `4` (1.4rem) to `8` (2.75rem) before removing content.
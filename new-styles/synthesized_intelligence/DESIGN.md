---
name: Synthesized Intelligence
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bec8d2'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#88929b'
  outline-variant: '#3e4850'
  surface-tint: '#89ceff'
  primary: '#89ceff'
  on-primary: '#00344d'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#006591'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#b9c7e0'
  on-tertiary: '#233144'
  tertiary-container: '#8e9cb4'
  on-tertiary-container: '#263447'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#d5e3fd'
  tertiary-fixed-dim: '#b9c7e0'
  on-tertiary-fixed: '#0d1c2f'
  on-tertiary-fixed-variant: '#3a485c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  deep-navy: '#020617'
  vibrant-cyan: '#22D3EE'
  slate-border: '#1E293B'
  data-green: '#10B981'
  data-purple: '#8B5CF6'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  section-gap: 120px
---

## Brand & Style

This design system is engineered for a Senior Data Scientist & ML Engineer, prioritizing clarity, technical precision, and modern sophistication. The brand personality is "Calculated Authority"—it is intellectual and rigorous, yet accessible. 

The design style follows a **Corporate / Modern** aesthetic with a **High-Tech** edge. It utilizes a deep, monochromatic foundation punctuated by vibrant, data-driven accents to guide the eye toward key insights and actions. The interface emphasizes a sense of depth through layered surfaces and refined borders, suggesting a complex but highly organized architecture. Every pixel serves a purpose, reflecting the user's data-driven methodology.

## Colors

The palette is rooted in a deep-sea "Dark Mode" to reduce eye strain and provide a premium, high-tech backdrop. 

- **Primary (Cyan):** Used for primary calls to action, active states, and highlighting key data points. 
- **Secondary & Tertiary (Slate Blues):** These define the hierarchy of surfaces, with lighter slates used for elevated cards and darker slates for the base background.
- **Neutral:** A rich, near-black navy serves as the canvas for the entire experience.
- **Named Colors:** Specifically curated for data visualization; these hues maintain a consistent luminosity to ensure high legibility against dark backgrounds.

## Typography

The typography strategy leverages three distinct typefaces to separate editorial content, functional information, and technical data.

- **Hanken Grotesk** is used for headlines. Its sharp, contemporary geometry feels engineered and modern.
- **Inter** provides maximum readability for body copy, ensuring long-form case studies are easily digestible.
- **JetBrains Mono** is reserved for technical labels, code snippets, and metadata, reinforcing the "engineer" persona.

Use tighter tracking for large display headings to maintain a compact, "designed" feel. For body copy, ensure the line height is generous to prevent the dark background from feeling claustrophobic.

## Layout & Spacing

This design system uses a **Fluid Grid** model centered within a 1280px max-width container for desktop. The layout is built on a 4px baseline grid to ensure mathematical consistency.

- **Desktop (1024px+):** 12-column grid with 24px gutters. Use wide 120px vertical gaps between sections to allow the content to "breathe."
- **Tablet (768px - 1023px):** 8-column grid with 20px gutters. Vertical spacing scales down to 80px.
- **Mobile (<768px):** 4-column grid with 16px margins. Content flows vertically; complex data tables should horizontal-scroll or collapse into cards.

Horizontal alignment should be strict. Use generous padding inside containers (at least 32px) to maintain the "Premium" feel requested.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surface 0 (Background):** Deep Navy (`#020617`).
- **Surface 1 (Cards/Sections):** Slate Blue (`#0F172A`).
- **Surface 2 (Floating/Hover):** Lighter Slate (`#1E293B`).

Elevated elements should utilize a thin, 1px border using `slate-border` at 50% opacity. For primary focus areas (like a featured project card), apply a very subtle, large-radius ambient shadow (40px blur, 10% opacity) tinted with the primary Cyan color to create a "glow" effect rather than a traditional drop shadow.

## Shapes

The shape language is **Soft** but disciplined. Use 0.25rem (4px) as the standard border radius for most functional elements like buttons and input fields. This slight rounding maintains a technical, "instrument-panel" feel without appearing overly friendly or "bubbly."

For larger containers like cards or image wrappers, use `rounded-lg` (8px). This creates a clear nested relationship between small components and their parent containers.

## Components

- **Buttons:** Primary buttons use a solid Cyan fill with dark navy text. Secondary buttons use a transparent background with a 1px Cyan border. Use a transition on hover that slightly increases the border-radius or adds the cyan ambient glow.
- **Chips / Tags:** Use the `label-mono` typography. Backgrounds should be low-opacity versions of the accent colors (e.g., Cyan at 10% opacity) with a solid 1px border.
- **Input Fields:** Use a dark background (`#020617`) with a subtle 1px border. On focus, the border should transition to solid Cyan with a 2px outer glow.
- **Cards:** Cards are the primary container for projects and data. They should have a 1px border, 32px internal padding, and a subtle transition on hover where the border color brightens.
- **Data Visualizations:** Charts should use the `named_colors` palette. Use thin lines (1pt to 1.5pt) and avoid heavy fills to maintain the "clean and data-driven" aesthetic.
- **Code Blocks:** Use a dedicated Surface 1 background with `jetbrainsMono` text. Syntax highlighting should be customized to match the brand palette (Cyans, Purples, and Slates).
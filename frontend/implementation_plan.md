# Redesign MiningNiti Frontend (Revert to SIH 2023 Theme)

## Goal Description
The objective is to overhaul the current landing page design (which features a green 3D globe, bento-grid layouts, and a generic "Mining Intelligence" theme) and recreate the user's preferred design. The preferred design is a professional, clean dashboard aesthetic focusing on the "SIH 2023 Winner" theme with royal blue and orange gradients, specific compliance-focused text, and detailed sections including a technology stack breakdown, interactive simulator mockup, and FAQs.

## User Review Required

> [!IMPORTANT]
> The source code for your preferred design is not in this repository's git history. Therefore, I will **rebuild** the components and layout from scratch to match the exact specifications, colors, text, and structure of the Vercel URL you provided. Please review the proposed changes below to ensure they align with your expectations.

## Proposed Changes

---

### Layout Components

#### [MODIFY] `frontend/src/components/layout/Header.tsx`
- **Logo:** Update the pickaxe icon to a pinkish/purple color with white text.
- **Navigation:** Change links to: `About`, `Services`, `Pricing`, `Resources`, `Docs`, `Contact`.
- **Actions:** Add a Search button, Theme Toggle, and a solid vibrant blue gradient `Get Started` button linking to `/chatting`.

#### [MODIFY] `frontend/src/components/landing/Footer.tsx`
- **Logo:** Match Header logo.
- **Description:** "AI-Powered Mining Compliance Platform. SIH 2023 Winner for CMPDI."
- **Columns:** Update columns to Product (Features, Chatbot, Documentation, API), Company (About, Team, Careers, Contact), and Contact details (contact@miningniti.com, CMPDI, Ranchi, India).

---

### Landing Page Components

#### [MODIFY] `frontend/src/app/page.tsx` (Main Landing Page)
- **Background:** Remove `HeroMiningScene` (3D green globe) and `ParticleBackground`. Implement a dark gradient mesh blur using soft blue (`#3b82f6`) and warm orange/gold.
- **Hero Section:**
  - Badge: `SIH 2023 Winner • CMPDI Project` (orange border/text with trophy/spark icons).
  - Title: "The Future of **Regulatory Intelligence** is Here" (Regulatory in blue/teal, Intelligence in orange/yellow).
  - Subtitle: "AI-powered chatbot available 24/7 for mining stakeholders..."
  - Buttons: `Start Chatting` (Solid blue gradient -> `/chatting`) and `Watch Demo` (Outline).
  - Metrics Grid: 4 transparent cards with soft blue inner glows (999+ Queries, 99.9% Uptime, 2s Response, 97% Satisfaction).
  - Scroll Indicator mouse icon.

#### [MODIFY] `frontend/src/components/landing/FeaturesBentoGrid.tsx` -> Rename/Refactor to `FeaturesGrid.tsx`
- **Layout:** Replace the asymmetrical green bento grid with a clean 6-card symmetrical grid.
- **Content:** Update headings and descriptions to focus on AI-Powered Chatbot, Mining Rule Database, Compliance Tracking, Real-time Updates, Document Analysis, and Multi-source Search.

#### [NEW] `frontend/src/components/landing/TechnologySection.tsx`
- **Content:** Horizontal tech log row (Next.js, FAISS, RAG, LangChain, DPO).
- **Details:** Three-column breakdown explaining Vector Database, RAG Pipeline, and DPO Training.

#### [NEW] `frontend/src/components/landing/SimulatorSection.tsx`
- **Layout:** Left column features a mock interactive browser simulator for `/chat`. Right column features the product overview checklist with green checkmarks.

#### [NEW] `frontend/src/components/landing/FAQSection.tsx`
- **Content:** Expandable accordion with 5 specific compliance/service questions.

#### [MODIFY] `frontend/src/components/landing/CTASection.tsx`
- **Layout:** Split layout. Left side: "Ready to Transform Your Mining Compliance?" with buttons and SIH winner bullets. Right side: "Stay Updated" newsletter subscription input.

---

## Verification Plan

### Automated Tests
- `npm run build` and `npm run lint` will be executed to ensure the new components compile without type errors and adhere to strict React 19 / Next.js 16 standards.

### Manual Verification
- Visual inspection of the newly built landing page using local development tools.
- Verification of navigation links routing to correct paths (e.g., `/chatting`).

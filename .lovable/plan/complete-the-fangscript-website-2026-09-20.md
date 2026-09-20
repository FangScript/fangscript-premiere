# Complete the FangScript website

## Scope
- Keep the existing home page and its animation-rich visual direction.
- Add dedicated Services, Work, About, FAQ, and Contact pages.
- Replace dead section links with real page navigation while preserving useful home-page shortcuts.

## Pages
- **Services:** Detailed offerings, outcomes, engagement options, and a project enquiry call to action.
- **Work:** Filterable project portfolio with richer case-study summaries and results.
- **About:** FangScript approach, principles, capabilities, process, and studio positioning.
- **FAQ:** Accessible expandable answers covering services, timelines, pricing, ownership, support, and AI/automation.
- **Contact:** A polished project enquiry form with useful fields, validation, direct email fallback, and success feedback.

## Shared experience
- Extract and reuse a consistent header, mobile menu, footer, page introduction, and call-to-action treatment.
- Add active navigation states, keyboard-friendly controls, mobile layouts, and reduced-motion behavior.
- Keep native scrolling and the current premium dark mountain aesthetic.
- Add unique search and social metadata for every page.

## Technical details
- Use TanStack Router route files and typed `Link` navigation.
- Keep the contact flow frontend-only, opening a prepared email so no storage or account setup is required.
- Reuse current artwork and CSS tokens, adding only focused page styles and components.
- Validate links, form behavior, desktop/mobile rendering, runtime errors, and the final preview build.

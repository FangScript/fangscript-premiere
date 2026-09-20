# FangScript Home Page

## Goal
Build the supplied FangScript home-page direction as a real, responsive, premium agency site rather than embedding the reference image. The active project carousel will be the central interaction.

## Build
- Establish a dark cinematic design system using deep navy/black surfaces, cream typography, orange-gold accents, thin glass borders, subtle grain, and restrained glow.
- Create original supporting artwork for the mountain atmosphere, device presentation, project previews, and testimonial portraits so every visual is a real page asset.
- Build the complete single-page structure: sticky navigation, full-screen hero, services, featured work, why FangScript, technology, process, testimonials, final contact call-to-action, and footer.
- Add a responsive mobile menu and smooth section navigation.

## Featured Work
- Implement six projects with working category filters and animated filtering.
- Build an infinite looping carousel with a dominant active project and partially visible neighbors on larger screens, one card on mobile.
- Support previous/next controls, pagination dots, count, pointer drag, touch swipe, keyboard arrows, hover/focus/drag pause, and gentle autoplay with delayed resume.
- Animate each active card’s media, text, glow, depth, and directional movement without interrupting vertical scrolling.

## Motion and Responsiveness
- Use Motion for menus, cards, filters, carousels, and testimonial transitions.
- Use GSAP ScrollTrigger for restrained parallax, entering sections, count-up stats, and progressive process-line drawing.
- Preserve native browser scrolling and disable or simplify movement for reduced-motion preferences.
- Tune desktop, tablet, and mobile compositions, including stacked hero media, single-column service cards, and a vertical mobile process timeline.

## Technical Details
- Keep the existing TanStack Start/React/TypeScript foundation and Tailwind v4 token system.
- Add Motion and GSAP dependencies; use Lucide icons already available.
- Split the page into focused components and shared content data while keeping all requested content on `/`.
- Add unique home-page metadata and replace all template metadata.
- Verify compilation, runtime behavior, desktop rendering, mobile rendering, keyboard controls, filters, swipe/drag behavior, and reduced-motion handling.

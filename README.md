# FangScript Premiere

Build the FangScript agency HOME PAGE based on the provided visual references.

IMPORTANT:

The first reference is the HOME PAGE design direction.

The second reference provides the premium visual style, typography, colors, device mockups, and presentation quality.

Do NOT use the reference image as a background or screenshot.

Rebuild the entire website as a real responsive React/TypeScript website.

==================================================

TECH STACK

==================================================

- React + TypeScript

- Vite

- Tailwind CSS or modular CSS

- Framer Motion

- GSAP + ScrollTrigger

- Lucide icons or another lightweight icon library

- Fully responsive

- Smooth 60fps animations

- Native browser scrolling

- Accessible and production-ready

==================================================

FANGSCRIPT BRAND

==================================================

Brand:

FangScript

Tagline:

AI • WEBSITES • AUTOMATION

Visual identity:

- Deep black / navy background

- Dark blue and purple atmospheric gradients

- Orange/gold accent

- White and cream typography

- Cinematic mountain imagery

- Orange atmospheric lighting

- Premium glassmorphism

- Thin borders

- Subtle grain

- Modern technology aesthetic

- Luxury-agency presentation

The overall feeling should be:

PREMIUM

CINEMATIC

TECHNICAL

MODERN

INTELLIGENT

INTERACTIVE

==================================================

PAGE STRUCTURE

==================================================

HOME PAGE:

1. Navbar

2. Hero

3. Services

4. Featured Projects Carousel

5. Why FangScript

6. Technology

7. Process

8. Client Testimonials

9. Final CTA

10. Footer

==================================================

1. NAVBAR

==================================================

Create a sticky navigation.

LEFT:

FangScript logo.

CENTER:

Home

Services

Work

FAQ

RIGHT:

Let's Build Together →

Initial state:

Transparent/dark.

After scrolling:

- dark glass background

- backdrop blur

- subtle border

- slightly smaller height

Active navigation:

Orange underline.

Navigation scrolling:

Use smooth scrolling.

Mobile:

Hamburger menu with animated fullscreen/dropdown navigation.

==================================================

2. HERO

==================================================

Full-screen cinematic hero.

EYEBROW:

OUR WORK

MAIN HEADING:

Ideas into

Intelligent Products.

"Intelligent Products." uses FangScript orange/gold.

DESCRIPTION:

We build websites, web apps, AI agents and automation that solve real business problems. Here are some of our recent projects and case studies.

BUTTON:

Explore Our Work →

SECONDARY visual CTA can be:

View Projects →

HERO VISUAL:

Use a cinematic dark mountain environment with orange lighting.

Overlay premium device mockups showing FangScript-built websites and applications.

Include:

- laptop

- tablet

- smartphone

- website UI

- AI interface

- subtle orange glow

INITIAL ANIMATION:

Logo:

fade + slide

Hero eyebrow:

fade upward

Heading:

line-by-line reveal

Orange text:

slight highlight animation

Description:

fade upward

CTA:

fade + scale

Devices:

fade in + move upward

Background:

slow zoom

==================================================

3. SERVICES

==================================================

Heading:

What We Build

Description:

From sleek websites to powerful AI systems, we create digital solutions that help businesses grow and operate smarter.

Create 6 cards:

WEBSITES

Modern, fast and responsive business websites.

WEB APPS

Custom web applications for your unique needs.

AI AGENTS

Intelligent agents that work for you.

CHATBOTS

Smart chat experiences for better customer support.

AUTOMATION

Eliminate repetitive work and boost productivity.

APIs & AI SYSTEMS

Connect, extend and power your products.

CARD ANIMATION:

When entering viewport:

opacity 0 → 1

y 50 → 0

Stagger cards.

Hover:

- card moves upward slightly

- orange border glow

- icon scales

- arrow moves right

- subtle background illumination

==================================================

4. FEATURED PROJECTS — IMPORTANT

==================================================

THIS SECTION MUST BE A REAL INTERACTIVE CAROUSEL.

Do NOT show three permanently static project cards.

SECTION:

FEATURED WORK

Heading:

Selected Projects

Description:

A few examples of what we've built so far. Each project solves a real business need with modern technology.

--------------------------------------------------

CAROUSEL STRUCTURE

--------------------------------------------------

Create a large premium horizontal project carousel.

Desktop:

        ←     [ PREVIOUS ]

               [ ACTIVE PROJECT ]

               [ NEXT PROJECT ]     →

The ACTIVE project should be visually dominant.

The neighboring projects can be partially visible on the left and right.

Example:

┌──────────────┐

│ previous     │

│ project      │

└──────────────┘

       ┌───────────────────────────────┐

       │                               │

       │       ACTIVE PROJECT          │

       │                               │

       └───────────────────────────────┘

                         ┌──────────────┐

                         │ next         │

                         │ project      │

                         └──────────────┘

--------------------------------------------------

PROJECT DATA

--------------------------------------------------

Create at least 6 projects.

PROJECT 1:

Beauty & Beyond

Category:

Website

Tags:

Branding

Business Automation

Description:

A premium beauty brand experience with modern e-commerce and automation.

PROJECT 2:

Business Automation Dashboard

Category:

Web App

Tags:

Analytics

Workflow Automation

Description:

A centralized dashboard for managing business workflows and analytics.

PROJECT 3:

FangScript AI Assistant

Category:

AI

Tags:

AI Agent

Chat

Booking

Description:

An intelligent AI assistant designed for customer conversations and bookings.

PROJECT 4:

Al Noor Jewellers

Category:

Website

Tags:

Luxury

E-commerce

Brand Experience

Description:

A premium jewellery website designed around craftsmanship and luxury.

PROJECT 5:

AI Customer Support Agent

Category:

AI

Tags:

AI Agent

Customer Support

Automation

PROJECT 6:

Business Workflow Automation

Category:

Automation

Tags:

n8n

APIs

Workflow Automation

--------------------------------------------------

PROJECT FILTERS

--------------------------------------------------

Above the carousel create:

All

Websites

Web Apps

AI

Automation

The filters MUST actually work.

When selecting a category:

1. Current carousel items animate out.

2. Filtered projects animate in.

3. Carousel resets to the first relevant project.

4. Preserve smooth layout transitions.

5. No page reload.

Use Framer Motion AnimatePresence and layout animations.

--------------------------------------------------

CAROUSEL CONTROLS

--------------------------------------------------

Desktop:

Left arrow:

←

Right arrow:

→

Also include:

01 / 06

or dynamically:

01 / 04

depending on the filtered results.

Add small pagination indicators.

Example:

● ○ ○ ○ ○ ○

Active indicator:

orange.

Inactive:

dark gray.

--------------------------------------------------

CAROUSEL BEHAVIOR

--------------------------------------------------

The carousel must support:

1. Previous button

2. Next button

3. Drag/swipe

4. Mouse/touch interaction

5. Keyboard arrow navigation

6. Pagination dots

7. Automatic progression

8. Pause on hover

9. Pause while dragging

10. Infinite looping

AUTO PLAY:

Every 5–6 seconds move to the next project.

When the user:

- hovers

- clicks

- drags

- focuses the carousel

pause autoplay.

Resume after approximately 4 seconds of inactivity.

Do NOT make autoplay aggressive.

--------------------------------------------------

CAROUSEL ANIMATION

--------------------------------------------------

Use Framer Motion.

When moving NEXT:

Previous card:

scale 0.90

opacity 0.45

x -100

Active card:

scale 1

opacity 1

x 0

Next card:

scale 0.90

opacity 0.45

x 100

Transition:

duration:

0.6–0.8 seconds

easing:

cubic-bezier(0.16, 1, 0.3, 1)

Use subtle depth.

The active project should always feel like the main focus.

--------------------------------------------------

PROJECT CARD

--------------------------------------------------

Each project card contains:

Large project image/mockup

Project name

Category

Tags

Short description

Arrow button

Example:

Beauty & Beyond

Website • Branding • Business Automation

[PROJECT IMAGE]

→

The image should have:

- rounded corners

- dark border

- subtle shadow

- subtle orange glow

Hover:

- image slightly zooms

- card moves upward

- border becomes brighter

- orange glow increases

- arrow moves right

--------------------------------------------------

CAROUSEL IMAGE ANIMATION

--------------------------------------------------

When a project becomes active:

Image:

scale 1.05 → 1

Overlay:

opacity 0 → subtle dark gradient

Text:

y 20 → 0

Arrow:

scale 0.8 → 1

Use staggered timing.

--------------------------------------------------

MOBILE CAROUSEL

--------------------------------------------------

On mobile:

Show ONE project at a time.

Enable:

swipe left → next

swipe right → previous

Keep arrow controls.

Place pagination underneath.

Project card should occupy approximately:

90–94vw

Do not show tiny neighboring cards on mobile.

--------------------------------------------------

CAROUSEL SCROLL INTEGRATION

--------------------------------------------------

The carousel itself should NOT hijack normal page scrolling.

Vertical page scrolling remains native.

When the Featured Work section enters viewport:

- section heading fades upward

- filters appear

- carousel cards reveal

- active project becomes visible

- decorative background begins subtle parallax

Do NOT pin the carousel for an excessive amount of scroll.

A small optional GSAP ScrollTrigger effect may be used while the section is entering/exiting.

==================================================

5. WHY FANGSCRIPT

==================================================

Heading:

We're not just developers.

We're problem solvers.

Description:

FangScript helps businesses turn real workflows into software, AI systems and automation. No fluff. Just practical solutions that work.

Stats:

6+

Successful Projects

100%

Client Focused

∞

Possibilities

Right side:

floating UI/code panels.

Animations:

- stats count upward

- panels float

- mountain background moves slowly

- orange light moves across the background

==================================================

6. TECHNOLOGY

==================================================

Heading:

Modern Stack.

Real Results.

Show:

React

Next.js

Node.js

Python

MongoDB

Supabase

Firebase

AWS

Vercel

Technology cards reveal sequentially.

Subtle hover:

scale 1.05

orange glow

icon illumination

==================================================

7. PROCESS

==================================================

Heading:

From Idea to Impact

Steps:

01 Discover

Understand your goals, needs and challenges.

02 Plan

Design the right solution with a clear roadmap.

03 Build

Develop, test and iterate with you.

04 Launch

Deliver and support for long-term growth.

DESKTOP:

Horizontal timeline.

MOBILE:

Vertical timeline.

GSAP ScrollTrigger:

As user scrolls:

- timeline line draws progressively

- circles activate

- text reveals

- orange accent travels through the timeline

==================================================

8. TESTIMONIALS

==================================================

Heading:

What Our Clients Say

Create testimonial carousel.

Include:

quote

client image

name

company

Controls:

←

→

Do not autoplay aggressively.

Use a smooth fade/slide transition.

==================================================

9. FINAL CTA

==================================================

Heading:

Have a Project in Mind?

Description:

Tell us what you're trying to build. We'll help you turn your idea into a powerful digital solution — with the right technology.

Button:

Get in Touch →

Background:

cinematic mountain landscape.

Add:

- orange sunset

- atmospheric glow

- subtle particles

- dark gradient

Slow parallax while scrolling.

==================================================

10. FOOTER

==================================================

FangScript logo

Crafted with passion • Built for your brand.

Links:

Home

Services

Work

FAQ

Social:

GitHub

LinkedIn

X

YouTube

Copyright:

© 2025 FangScript. All rights reserved.

==================================================

SCROLL ANIMATION SYSTEM

==================================================

Use two animation systems appropriately.

FRAMER MOTION:

- carousel

- navigation

- menus

- cards

- hover interactions

- testimonials

- filter transitions

GSAP + SCROLLTRIGGER:

- parallax

- timeline progress

- hero scroll effects

- background movement

- scroll-linked decorative elements

Use native browser scrolling.

Never hijack the scroll wheel.

--------------------------------------------------

PARALLAX DEPTH

--------------------------------------------------

Background mountains:

0.10–0.20x

Atmospheric glow:

0.20–0.30x

Hero imagery:

0.30–0.45x

Main content:

0.60–0.80x

Foreground decorations:

0.80–1.00x

Keep parallax subtle.

==================================================

PERFORMANCE

==================================================

Target 60fps.

Prefer:

transform

opacity

Avoid continuously animating:

width

height

top

left

Lazy-load below-the-fold images.

Respect:

prefers-reduced-motion

If enabled:

- disable parallax

- disable excessive movement

- reduce carousel transitions

- retain simple fades

==================================================

RESPONSIVE

==================================================

Desktop:

1440px+

Tablet:

768px–1439px

Mobile:

320px–767px

Mobile requirements:

- stacked hero

- responsive device mockups

- one project visible in carousel

- swipe support

- hamburger menu

- single-column services

- vertical process timeline

- responsive typography

- reduced parallax

- reduced decorative effects

==================================================

FINAL DESIGN REQUIREMENT

==================================================

The website should feel like a premium custom-built digital agency website.

It must NOT feel like:

- a generic SaaS template

- a basic Tailwind template

- a static image

- an AI-generated landing page

- a collection of unrelated animations

The most important interactive feature on the Home page is the

FEATURED PROJECT CAROUSEL.

Make that carousel feel extremely polished and premium.

The user should be able to:

CLICK → next/previous

DRAG → change project

SWIPE → change project

KEYBOARD → navigate

FILTER → change projects

AUTO PLAY → automatically progress

HOVER → pause

FOCUS → pause

LOOP → continuously cycle

The carousel must remain smooth and responsive on desktop, tablet and mobile.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/55a27ba3-27fa-4541-bae3-186c05864d5d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

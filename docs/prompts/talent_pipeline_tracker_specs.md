# Talent Pipeline Tracker Task

## Context
Read context from `docs/contexts/talent_pipeline_tracker_context.md`.

## Specifications
- Candidate list:
    - View: 
        - Show all candidates in a list — name, position, current status, and current stage at a glance.
        - Allow filtering by status and by stage, and searching by name or email without reloading the page.
    - API: fetch all candidates from GET /records.

## Constraints
- Use API URL defined in `.env.local`.
- Code structure:
    - Organize the project with a clear folder structure: /components, /hooks (if applicable), /types, /lib or /services.
    - Define TypeScript types for all data structures received from the API.
- IMPORTANT:
    - Use only Next.js (App Router), React, and TypeScript. 
    - Do not use external state management libraries (Redux, Zustand, Jotai, etc.). 
    - Component-level state with hooks is sufficient.
    - The terminology, labels, and framing visible in your UI must reflect company's context as described in CONTEXT.md

# Project: Reshavalnik Vue 3 (Replica of Angular behavior)

## Goal
Replicate the current behavior and UI of the Angular app as closely as possible using Vue 3 + Vite + TypeScript.

This includes:
- Same routes and navigation flow: /auth, /auth/callback, /panel
- Same authentication behavior (login, register, social login, callback)
- Same access control behavior for /panel (guard)
- Same API interactions (endpoints, payloads, error handling)
- Same styling and HTML/CSS class structure as much as possible

## Non-goals (for now)
- No refactors for “clean architecture” unless necessary for correctness
- No redesigns, no UI library swaps
- No feature changes or new features

## Hard rules
1) Preserve markup + class names:
  - When converting components, keep the HTML structure and CSS class names stable.
  - Prefer global styles initially; avoid <style scoped> unless absolutely necessary.

2) Keep API behavior identical:
  - Do not rename endpoints or change request/response shapes.
  - Base URL must come from `import.meta.env.VITE_API_BASE_URL`.
  - HTTP must use `withCredentials: true`.

3) Auth rules:
  - Attach `Authorization: Bearer <token>` whenever a token exists.
  - On HTTP 401: clear auth storage and route to `/auth`.
  - `/panel` must be protected; unauthenticated users must end up at `/auth`.

4) Build must always pass:
  - After changes, run `npm run build`.
  - If the build fails, fix it before doing anything else.

## Implementation constraints / preferences
- Vue 3 + Composition API, TypeScript
- vue-router v4
- axios for HTTP
- Keep code straightforward; prefer small files and minimal abstractions.
- If state is needed: use a minimal approach (simple composables). Pinia only if clearly beneficial.

## Directory conventions
- `src/router/*` for routing and guards
- `src/services/*` for API calls, HTTP client, storage
- `src/views/*` for route views (AuthView, AuthCallbackView, PanelView)
- `src/components/*` for shared components (TopNav)
- `src/styles/*` for global styles (import in main.scss)

## Definition of done for each task
- Behavior matches the Angular app for the feature being migrated
- No unnecessary diffs outside the requested scope
- `npm run build` passes

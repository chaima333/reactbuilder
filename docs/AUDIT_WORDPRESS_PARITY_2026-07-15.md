# ReactBuilder WordPress-Parity Audit - 2026-07-15

## Executive Verdict

Final verdict: **Prototype**, not a Functional MVP, not a Strong PFE MVP, and far from Beta/Production SaaS.

This is not because the codebase is empty. It is not. ReactBuilder has a large amount of implemented surface area: page editing, public rendering, CMS collections, forms, media, site members, AI generation, static export, plugins, and multi-site concepts are all present. The reason the verdict stays at Prototype is harsher and simpler: a clean database cannot be reliably migrated from the included migrations, the test suite currently fails, security defaults are loose, the editor/runtime/schema contracts drift, and several features exist as islands rather than as one stable WordPress-like publishing system.

The project can be demoed from a prepared database. It cannot yet be trusted as a reproducible SaaS product.

## Verification Run

Commands attempted:

| Area | Result | Evidence |
| --- | --- | --- |
| Root npm build | Failed | `npm` is not available on PATH in this environment. |
| Frontend build | Passed | Ran bundled Node against Vite. Build completed, with chunk-size warning; largest app chunk was about 1.18 MB raw / 346 kB gzip. |
| Backend TypeScript build | Passed | Ran bundled Node with `backend/node_modules/typescript/bin/tsc`; exit code 0. |
| Backend tests | Failed | `vitest run` produced 4 passing suites / 22 passing tests, but 2 failed suites under `backend/dist/modules/ia/__tests__/*` because compiled CommonJS tests import Vitest incorrectly. |
| ML Python compile | Passed | `py_compile app.py predict.py train.py` exited 0. |

The test failure is not a product bug by itself; it is a build hygiene bug. The test runner is picking up compiled `dist` tests. A mature repo should exclude `dist` from Vitest or avoid committing/building tests into the runtime output.

## P0 Blockers

### 1. Clean database setup is broken

This is the most important finding. The models and migrations do not describe the same product.

Evidence:

- `backend/src/models/page.ts:23-28` defines the `pages` table and a unique `(site_id, slug)` index.
- `backend/src/models/pageVersion.ts:4-28` defines `page_versions`.
- `backend/src/models/Seo.ts:14-140` defines `seo`.
- `backend/src/models/SiteMember.ts:6-33` defines `site_members` with uppercase roles.
- `backend/src/models/Plugin.ts:12-79` defines `plugins`.
- `backend/src/models/SitePlugin.ts:15-80` defines `site_plugins`.
- `backend/migrations/20260414174320-create-users.js:28-30` creates user roles as `Admin`, `Editor`, `Viewer`, while `backend/src/models/User.ts:44-49` expects `ADMIN`, `EDITOR`, `VIEWER`.
- `backend/migrations/20260414175955-create-site-users.js:5-45` creates `site_users`, while the current membership model expects `site_members`.
- `backend/migrations/20260618130000-add-status-to-page-versions.js:5-8` alters `page_versions`, but there is no matching migration creating `page_versions`.
- `backend/migrations/20260711183658-create-forms-and-form-submissions.js:24-33` and `123-132` reference `pages`, but no migration creating `pages` was found.
- `backend/migrations/20260710181256-add-template-page-to-cms-collections.js` references `pages` via `template_page_id`, but again depends on a missing `pages` migration.

Impact: a new developer, CI environment, or production deploy cannot reliably create the database from source. WordPress parity starts with repeatable install/update semantics; this project currently fails that baseline.

### 2. The repo is not clean/reproducible

Evidence:

- `frontend/.env` is tracked by Git.
- `.env.local` exists untracked.
- `node_modules/` exists untracked at the root.
- `ml-service/__pycache__/*.pyc` exists untracked.
- `frontend/dist`, `backend/dist`, local caches, and generated files exist in the workspace.

Impact: the current app state is partly local artifact, partly source. That makes audits, CI, onboarding, and production deployment unreliable.

### 3. Test pipeline currently fails

Evidence:

- Backend `vitest run` fails because `backend/dist/modules/ia/__tests__/aiAnalytics.test.js` and `backend/dist/modules/ia/__tests__/aiSchemas.test.js` are executed from compiled output.
- Backend source tests did pass where reached: 4 suites / 22 tests passed before the dist-test failures.

Impact: the project has some tests, but the official backend test command cannot be used as a green gate.

### 4. Public/editor block contracts drift

Evidence:

- `frontend/src/modules/pageBuilder/core/blockRegistry.ts:174-209` registers layout/primitives, semantic placeholders, `collectionList`, and `form`.
- `frontend/src/modules/pageBuilder/core/schema/canonicalSchema.ts:24-44` lists primitives and semantic blocks, including `valuesGrid`, `officeTable`, and `featurePillars`.
- `frontend/src/modules/pageBuilder/core/schema/canonicalSchema.ts:36-44` does not include `faq`, while the registry has a `faq` semantic placeholder.
- `frontend/src/modules/pageBuilder/runtime/renderer/RuntimeRenderer.tsx:37-44` returns `null` for any block type missing from the registry.
- `frontend/src/modules/pageBuilder/components/sidebar/BlockLibrary.tsx:224-282` exposes common blocks and `collectionList`, but not `form`, even though `form` exists in registry/schema/runtime.

Impact: a WordPress-like builder needs stable contracts between schema, editor palette, saved JSON, and public renderer. Here, a block can be legal in one layer and invisible in another.

## WordPress-Parity Assessment

### Pages and Publishing - Partial

Implemented:

- Page model has title, slug, content, blocks, status, homepage flag, site/user IDs, SEO relation, published date, metadata, and views: `backend/src/models/page.ts:37-115`.
- Page routes include CRUD, SEO, publish, version history, restore, and public route variants: `backend/src/modules/pages/routes/page.routes.ts:46-113`.
- Publishing creates a version snapshot and sets status/published date: `backend/src/modules/pages/services/page.service.ts:138-184`.
- Restore preserves current state before restoring title/content/blocks: `backend/src/modules/pages/services/page.service.ts:205-248`.

Broken/weak:

- Migrations for `pages`, `page_versions`, `seo`, `page_slugs`/`slug_maps` are incomplete or inconsistent.
- There are duplicate/parallel page workflows: `PageWorkflowService`, `PageService`, command handlers, slug services, and redirect graph logic overlap.
- Public routes are fragmented. Backend HTML canonical uses `/pages/${siteId}/${page.slug}` in `backend/src/modules/pages/controllers/public.controller.ts:61`, while frontend public routes use `/site/:siteId/:slug` and `/p/:siteId/:slug` in `frontend/src/App.tsx:277-307`.

Parity verdict: page concepts exist, but the publishing model is not yet a coherent WordPress-equivalent lifecycle.

### Public Rendering - Partial

Implemented:

- JSON public page endpoint exists: `backend/src/modules/pages/controllers/public.controller.ts:115-153`.
- HTML public rendering exists via server-side block renderer: `backend/src/modules/pages/controllers/public.controller.ts:8-107`.
- Frontend public runtime composes site/page theme, global layout, navbar/footer, blocks, and chatbot slot: `frontend/src/modules/pageBuilder/runtime/public/PublicPageRuntime.tsx:28-198`.
- Public site route fetches site data and picks page client-side: `frontend/src/modules/pageBuilder/runtime/public/PublicSitePage.tsx:48-220`.

Weak:

- `PublicSitePage` fetches full public site data and selects a page client-side instead of fetching only the page slug: `frontend/src/modules/pageBuilder/runtime/public/PublicSitePage.tsx:48-164`.
- Public JSON slug endpoint returns page JSON and site but not the same SEO shape as public-by-id: `backend/src/modules/pages/controllers/public.controller.ts:115-153` versus `backend/src/modules/pages/controllers/page.controller.ts:328-372`.
- Console logs remain in public runtime code: `frontend/src/modules/pageBuilder/runtime/public/PublicSitePage.tsx:89-98`.

Parity verdict: public rendering is implemented but split between backend HTML rendering and frontend runtime rendering with inconsistent route/SEO contracts.

### Page Builder - Partial

Implemented:

- Registry contains core layout, primitive, data, and semantic placeholder blocks: `frontend/src/modules/pageBuilder/core/blockRegistry.ts:17-209`.
- Runtime renderer resolves block definitions dynamically: `frontend/src/modules/pageBuilder/runtime/renderer/RuntimeRenderer.tsx:37-80`.
- Public render tree traverses block arrays recursively: `frontend/src/modules/pageBuilder/runtime/renderer/RenderTree.tsx:35-59`.
- Block library exposes layout/text/image/button/collection list and presets: `frontend/src/modules/pageBuilder/components/sidebar/BlockLibrary.tsx:224-308`.

Broken/weak:

- Registry, canonical schema, and block library are not aligned.
- Semantic block schemas are empty: `frontend/src/modules/pageBuilder/core/schema/canonicalSchema.ts:354-365`.
- Missing registry entries render as `null`, which can silently hide content.
- The builder has many block concepts, but the contract is not strict enough to guarantee saved JSON will render later.

Parity verdict: usable prototype builder, not a robust Gutenberg/Elementor-class editor.

### CMS Collections - Partial

Implemented:

- CMS migrations create collections, fields, and entries with site scoping and indexes: `backend/migrations/20260710140304-align-cms-schema.js:7-193`.
- Collection service validates field types and options: `backend/src/modules/cms/cms.service.ts:38-168`.
- Collections are site-scoped: `backend/src/modules/cms/cms.service.ts:179-214`.
- Template page validation exists for CMS collections: `backend/src/modules/cms/cms.service.ts:233-248` and `283-301`.
- Published entry lookup returns entry data and template blocks: `backend/src/modules/cms/cms.service.ts:346-405`.
- Frontend CMS entry page resolves template blocks and renders through public runtime: `frontend/src/modules/cms/pages/CmsEntryPage.tsx:45-390`.
- Collection list block links to `/site/${siteId}/${collectionSlug}/${entry.slug}`: `frontend/src/modules/pageBuilder/components/blocks/data/collectionList/CollectionListBlock.tsx:211-216`.

Weak:

- Binding resolver only supports whole-string bindings like `{{field}}`; mixed interpolation such as `Discover {{title}}` is not resolved: `backend/src/modules/cms/utils/binding.resolver.ts:4-40`.
- CMS SEO is client-side in `CmsEntryPage`, not server-rendered/SSR: `frontend/src/modules/cms/pages/CmsEntryPage.tsx:201-390`.
- CMS depends on `pages` migrations that are missing.

Parity verdict: custom post type concept exists, but it is below WordPress custom post/meta/template maturity.

### Forms - One of the Stronger Areas, Still Partial

Implemented:

- Form field types include text, email, textarea, number, tel, select, checkbox, radio, date: `frontend/src/redux/services/forms.api.ts:5-14`.
- Authenticated form routes are site-guarded and permission-guarded: `backend/src/modules/forms/forms.routes.ts:30-111`.
- Form service scopes queries by site and enforces unique site slug: `backend/src/modules/forms/forms.service.ts:50-128`.
- Submission validation checks active form, required fields, required checkbox truth, and email format: `backend/src/modules/forms/forms.service.ts:356-439`.
- Submission page ID is sanitized against the same site: `backend/src/modules/forms/forms.service.ts:442-463`.
- Public submit endpoint exists: `backend/src/modules/forms/forms.public.routes.ts:19-22`.
- Form block loads public form data and respects editor/public mode: `frontend/src/modules/pageBuilder/components/blocks/data/forms/FormBlock.tsx:32-36` and `162-173`.

Weak:

- Public submission has no visible route-specific rate limit, CAPTCHA, honeypot, spam scoring, or upload safety.
- Form block is not exposed in the block library despite runtime support.

Parity verdict: solid MVP feature, but not production-grade forms.

### Media Library - Partial, Security Weak

Implemented:

- Media upload, list, delete, and alt text update routes are permission-protected: `backend/src/modules/media/media.routes.ts:22-45`.
- Media service stores Cloudinary metadata and site ID: `backend/src/modules/media/media.service.ts:24-41`.
- Media removal is site-scoped: `backend/src/modules/media/media.service.ts:125-147`.

Broken/weak:

- Multer uses memory storage and accepts every file in `fileFilter`: `backend/src/modules/media/media.routes.ts:11-19`.
- No clear per-file size limit is enforced in the route.
- Upload error responses expose stack traces: `backend/src/modules/media/media.controller.ts:36-40`.
- URL upload fetches remote content and checks content type starts with `image/`, but lacks a strong size cap and SSRF-style network policy: `backend/src/modules/media/media.service.ts:72-80`.

Parity verdict: basic media library exists; production hardening is missing.

### SEO - Partial

Implemented:

- SEO model supports meta title/description/keywords/robots/canonical, Open Graph, and Twitter fields: `backend/src/models/Seo.ts:49-140`.
- SEO builder maps page SEO into public metadata: `backend/src/modules/pages/engine/seoBuilder.ts:3-90`.
- Backend full-page renderer emits SEO into HTML: `backend/src/modules/pages/engine/blockRenderer.ts:2541-2739`.
- Page route exposes page SEO: `backend/src/modules/pages/routes/page.routes.ts:58`.

Weak:

- SEO public route shapes differ between page-by-id and slug JSON.
- Canonical path generation is inconsistent with frontend route structure.
- No evidence of sitemap/robots management equivalent to WordPress SEO plugins beyond static export generation.

Parity verdict: SEO fields exist; SEO system is not yet coherent across public runtime, HTML export, and site routing.

### Static Export - Partial

Implemented:

- Site export route is site-guarded and permission-guarded: `backend/src/modules/sites/site.routes.ts:81-85`.
- Static export collects published pages only: `backend/src/modules/sites/export/export.controller.ts:967-987`.
- Empty published site returns 422: `backend/src/modules/sites/export/export.controller.ts:989-998`.
- Static media bundling and URL rewriting exist in the export controller.
- Export manifest explicitly warns CMS backend/database is not included: `backend/src/modules/sites/export/export.controller.ts:1224-1226`.

Weak:

- Export is static-page oriented, not a full portable WordPress-like export/import with database, CMS content, forms, users, redirects, and plugins.
- Controller is very large and mixes rendering, media localization, archive creation, and response concerns.

Parity verdict: useful demo/static hosting feature; not WordPress export parity.

### Plugins - Early Prototype

Implemented:

- Plugin and site-plugin models exist: `backend/src/models/Plugin.ts:12-79`, `backend/src/models/SitePlugin.ts:15-80`.
- Marketplace service can list, install, enable, disable, and uninstall plugins per site: `backend/src/modules/plugin/plugin.marketplace.service.ts:7-180`.
- Marketplace routes require plugin permissions: `backend/src/modules/plugin/plugin.marketplace.routes.ts:16-43`.
- Runtime registry emits events to registered plugins and checks declared event permissions: `backend/src/core/plugins/plugin.registry.ts:47-88`.
- Worker infrastructure exists for plugin jobs: `backend/src/core/queues/plugin.worker.ts:43-307`.

Broken/weak:

- Missing migrations for `plugins` and `site_plugins`.
- Plugins are trusted in-process code, not isolated extensions.
- Registry logs show encoding corruption in source output at `backend/src/core/plugins/plugin.registry.ts:40`, `78`, and `87`.
- There is no evidence of third-party plugin package installation, sandboxing, version compatibility checks, or review workflow.

Parity verdict: internal hook system, not WordPress plugin parity.

### AI/ML - Demo-Useful, Not Product-Reliable

Implemented:

- LLM provider switch supports Gemini, OpenAI, and Claude: `backend/src/modules/ia/llm/llm.client.ts:44-73`.
- LLM calls are gated by `LLM_ENABLED`: `backend/src/modules/ia/llm/llm.client.ts:41-42` and `75-80`.
- Provider calls require provider API keys and have a 30 second timeout: `backend/src/modules/ia/llm/llm.client.ts:19-39`, `87-174`.
- ML category prediction calls a separate ML service and falls back on errors/timeouts: `backend/src/modules/ia/ai.service.ts:196-260`.
- Low ML confidence or fallback source switches to rules: `backend/src/modules/ia/ai.service.ts:439-457`.

Weak:

- Reliability depends on environment configuration and local/remote ML service availability.
- The fallback-heavy architecture is useful for demos but can mask AI failures.
- Backend tests for AI analytics/schemas are currently broken through `dist` pickup.

Parity verdict: AI feature layer exists; not a stable product differentiator yet.

### Multi-Tenant SaaS Model - Partial

Implemented:

- Server uses JWT authentication, tenant resolver, site access guard, and role permissions for tenant routes: `backend/src/server.ts:126-138`.
- `requireSiteAccess` checks `req.siteContext.siteId` and `SiteMember`: `backend/src/core/middleware/siteGuard.ts:5-24`.
- `requirePermission` checks normalized role against permission constants: `backend/src/core/middleware/role.middleware.ts:29-57`.
- Site routes protect site-specific read/update/delete/member/export operations: `backend/src/modules/sites/site.routes.ts:35-85`.

Weak:

- Membership migration/model mismatch means fresh tenant access setup is broken.
- `requireSiteAccess` allows global `ADMIN` users through even without membership: `backend/src/core/middleware/siteGuard.ts:20-22`. This may be intentional, but it is a SaaS isolation decision that must be explicit and audited.
- `createSite` and `getSites` sit behind `authStack` at server level but are not tenant-scoped inside `site.routes.ts:29-33`.

Parity verdict: multi-tenant intent is real, but data/schema hygiene prevents trusting it.

### Security Baseline - Not Production-Ready

Evidence:

- CORS is open: `backend/src/server.ts:71`.
- JSON and URL-encoded body limits are 50 MB globally: `backend/src/server.ts:89-90`.
- Upload file filter accepts all files: `backend/src/modules/media/media.routes.ts:11-19`.
- Upload error response leaks stack traces: `backend/src/modules/media/media.controller.ts:36-40`.
- Public form submit lacks visible rate limiting/spam controls: `backend/src/modules/forms/forms.public.routes.ts:19-22`.
- `frontend/.env` is tracked.
- Public frontend contains debug logs: `frontend/src/modules/pageBuilder/runtime/public/PublicSitePage.tsx:89-98`.

Security verdict: acceptable for local prototype/demo; not acceptable for production SaaS.

## PFE Readiness

The project can become a defensible PFE if the demo is framed honestly as a prototype of a visual website builder/CMS SaaS. It is not defensible if presented as production-ready or WordPress-equivalent.

Strong demo assets:

- Multi-site architecture exists.
- Page builder and public runtime exist.
- CMS collection templates exist.
- Forms are better than placeholder quality.
- AI generation and fallback telemetry exist.
- Static export exists.
- Permissions and site membership concepts exist.

Must-fix before a serious jury/demo:

1. Fix migrations so a clean database installs.
2. Make backend tests green by excluding `dist`.
3. Remove tracked/local env secrets from the repo workflow.
4. Align block registry, canonical schema, editor palette, and renderer.
5. Remove public debug logs.
6. Add basic upload validation and public form abuse controls.
7. Document the exact supported public URL scheme.

## Scores

| Area | Score | Reason |
| --- | ---: | --- |
| Page builder | 45/100 | Large implementation, unstable contracts. |
| Public rendering | 50/100 | Works conceptually, inconsistent route/SEO/data shapes. |
| CMS | 45/100 | Good start, limited binding/template maturity, depends on broken migrations. |
| Forms | 60/100 | Strongest product area, missing anti-abuse and library exposure. |
| Media | 35/100 | Basic Cloudinary integration, weak validation/security. |
| SEO | 40/100 | Fields exist, end-to-end semantics inconsistent. |
| Static export | 45/100 | Useful static archive, not full platform export. |
| Plugins | 25/100 | Internal event hooks, not real plugin ecosystem. |
| AI/ML | 45/100 | Demo-capable, fallback-heavy, tests broken. |
| Multi-tenant SaaS | 40/100 | Middleware exists, schema/migration mismatch undermines trust. |
| Security | 25/100 | Open CORS, large body limits, weak upload/form hardening. |
| Production readiness | 20/100 | Cannot pass clean DB/test/security gates. |

## Minimal Roadmap to Escape Prototype

1. **Database truth first**: create/repair migrations for `pages`, `page_versions`, `seo`, `page_slugs`/`slug_maps`, `site_members`, `plugins`, `site_plugins`, and align role enum casing.
2. **Green CI gate**: exclude `dist` from Vitest, run backend tests, frontend build, backend build, and at least one migration smoke test.
3. **Builder contract lock**: generate registry/schema/palette compatibility checks so saved blocks cannot silently render `null`.
4. **Public route contract**: choose one public URL scheme and make canonical, frontend routes, backend HTML, backend JSON, sitemap/export all agree.
5. **Security floor**: restrict CORS, reduce global body limits, validate upload MIME/size, remove stack traces from responses, add public form rate limiting/honeypot/CAPTCHA option.
6. **Repo hygiene**: untrack `frontend/.env`, keep generated build/cache/dependency artifacts out of source, and document install/run commands.

## Bottom Line

ReactBuilder is a broad and ambitious prototype with enough feature surface for an impressive controlled demo. The uncomfortable truth is that breadth is currently outrunning system integrity. The fastest path forward is not adding more WordPress-like features. It is making the existing features reproducible, testable, and contract-safe.

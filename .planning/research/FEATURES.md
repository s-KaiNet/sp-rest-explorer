# Feature Research

**Domain:** API Documentation Explorer / Metadata Schema Browser (read-only, static SPA)
**Researched:** 2026-02-11
**Confidence:** HIGH (based on analysis of 15+ API documentation products: Stripe Docs, Redocly, Swagger UI, GraphQL Playground/GraphiQL, Postman Docs, ReadMe, Bump.sh, Scalar, Stoplight Elements, Mintlify, DevDocs, MDN, GraphQL Voyager, Google APIs Explorer, plus the existing SP REST API Explorer)

## Context: What Kind of Tool Is This?

This is NOT a generic API docs generator (like Swagger UI or Redocly). Those tools render OpenAPI specs into interactive docs with "Try It" consoles.

This is a **metadata schema browser** — closer to:
- GraphiQL's schema explorer sidebar (browse types, fields, relationships)
- TypeDoc / JSDoc reference browsers (navigate type hierarchies)
- MDN's Web API reference (cross-linked types, inheritance chains)
- DevDocs (unified search across large API surface areas)

The key distinction: **read-only metadata exploration, not API execution**. There is no "Try It" console because this tool doesn't call SharePoint APIs — it visualizes the `$metadata` schema (2,449 entities, 3,528 functions, 11,967 properties).

This distinction is critical for feature evaluation. Many "table stakes" features for API docs tools (Try It consoles, code samples, authentication flows) are anti-features here.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| # | Feature | Why Expected | Complexity | Status in Current Design | Notes |
|---|---------|--------------|------------|--------------------------|-------|
| T1 | **Full-text search across all items** | Every reference tool has search. Stripe, MDN, DevDocs — all have instant search. Users searching "GetById" expect to find ALL instances, not just root-level ones | HIGH | **Designed** (Cmd+K + MiniSearch) | Core differentiator from old app. Already spec'd in detail |
| T2 | **Type cross-linking** | Clicking a type name (e.g., `SP.List`) navigates to that type's detail page. Standard in GraphiQL schema explorer, MDN, TypeDoc. Without it, users manually search for every type reference | LOW | **Designed** (green links in properties/params/returns) | Already spec'd — entity types are linked throughout |
| T3 | **Breadcrumb navigation** | Shows current location in hierarchy. Present in Stripe docs, Redocly, every file explorer. Essential when tree depth reaches 9 levels | LOW | **Designed** (full-width breadcrumb bar with clickable segments) | Already spec'd with copy-path button |
| T4 | **Deep linking / Permalinks** | Every item should have a shareable URL. Developers paste API reference links in PRs, Slack, Stack Overflow. Apiary, Stripe, MDN — all have deep linking. Without it, users can't share specific findings | LOW | **Designed** (hash routes: `/#/_api/web/Lists`, `/#/entity/SP.List`) | Route structure already defined. Critical for developer workflow |
| T5 | **Copy-to-clipboard for API paths** | Developers need to copy `_api/web/Lists/GetByTitle(...)` paths into their code. Every modern docs site has copy buttons (Stripe, Postman). Without it, users manually type or select+copy | LOW | **Designed** (copy button on breadcrumb) | Already spec'd. Low effort, high value |
| T6 | **Keyboard navigation** | Power users navigate with keyboard. Cmd+K for search is now standard (VS Code, Figma, Linear, Stripe, Algolia DocSearch). Arrow keys for list navigation. Esc to close | LOW | **Designed** (Cmd+K shortcut, arrow keys in palette) | cmdk library handles most of this |
| T7 | **Dark mode** | Expected in 2026 for any developer tool. Stripe, MDN, GraphQL Playground, VS Code — all have dark mode. Developer audience strongly prefers it | LOW | **Designed** (Tailwind dark: variants + localStorage toggle) | Trivial with shadcn/ui + Tailwind CSS 4 |
| T8 | **Fast initial load** | GraphiQL loads schemas in <1s. DevDocs is near-instant. If the 4MB metadata takes >3s to become searchable, users will leave. Perception of speed matters | MED | **Designed** (MiniSearch index in ~19ms, metadata cached) | Main bottleneck is the 4MB fetch from Azure, which is inherent |
| T9 | **Responsive layout with resizable panels** | Two-panel layouts (sidebar + content) are standard in API docs (Stripe, Redocly, GraphiQL). Users expect to resize the sidebar. Fixed-width panels feel rigid | LOW | **Designed** (resizable sidebar, 280-300px default) | react-resizable-panels or CSS resize |
| T10 | **Collapsible sections with counts** | "Properties (91)" / "Methods (102)" — showing counts helps users gauge complexity before expanding. MDN, TypeDoc, Redocly all use collapsible sections | LOW | **Designed** (collapsible sections with chevrons and badges) | shadcn/ui Collapsible component |
| T11 | **Filter/search within long lists** | When an entity has 91 properties or 102 methods, users need to filter within that section. Swagger UI has per-section filtering. Without it, users Ctrl+F the page | LOW | **Designed** (inline filter inputs in Properties and Methods section headers) | Simple `string.includes()` filter on displayed items |
| T12 | **Loading states / skeleton screens** | Empty screens during data load feel broken. Stripe uses skeleton screens. Modern SPA standard is to show structure before data arrives | LOW | **Partially designed** (mentioned but no specific mockup) | Use shadcn/ui Skeleton components |

### Differentiators (Competitive Advantage)

Features that set this product apart. Not required, but create significant value for the target audience.

| # | Feature | Value Proposition | Complexity | Status in Current Design | Notes |
|---|---------|-------------------|------------|--------------------------|-------|
| D1 | **"Used by" reverse cross-references** | Shows which entities reference a given type via navigation properties. E.g., SP.List is "used by" SP.Web via `.Lists` nav prop. No other SharePoint API tool provides this. GraphiQL's schema explorer shows "referenced by" — this is the equivalent | MED | **Designed** (purple "Used by" bar in type detail) | Requires precomputing reverse-reference map from nav properties. ~515 nav props → manageable |
| D2 | **Base type inheritance chain** | Shows `SP.List → SP.SecurableObject → SP.ClientObject` lineage. Like TypeDoc's inheritance tree or MDN's interface hierarchy. Helps developers understand which properties are inherited vs native | LOW | **Designed** (gray bar with clickable base type links) | Data is in metadata (`baseTypeName`). Just chain lookups |
| D3 | **Monthly API changelog with visual diffs** | Color-coded added/updated/removed changes per month. Bump.sh pioneered automatic API changelogs. No other SharePoint reference tool tracks API changes over time. Developers can see "what's new this month" | MED | **Designed** (full changelog view with filter chips, collapsible entity cards, summary stats) | Data exists (monthly diff JSON files). Already well-designed |
| D4 | **Grouped search results with path disambiguation** | When searching "GetById", shows all 15+ instances with their tree path breadcrumbs. Similar to VS Code's Cmd+P showing file paths. Without disambiguation, same-named results are useless | MED | **Designed** (grouped by Functions/Entities/Properties with truncated path breadcrumbs) | MiniSearch + custom rendering. Critical for usability given many same-named functions |
| D5 | **Curated popular endpoints on home screen** | Instead of dumping 793 root items, show categorized "Core", "Search", "People", etc. Like Stripe's docs landing page with product-area cards. Helps newcomers orient quickly | LOW | **Designed** (6 category cards with endpoint chips) | Static curation. Easy to build, hard to maintain if API changes — but root endpoints are stable |
| D6 | **Recently visited history** | Track last 5-10 visited items in localStorage. Like browser history or GraphQL Playground's query history. Power users return to the same APIs repeatedly | LOW | **Designed** (recent cards on home screen) | localStorage + simple array. Low effort, high convenience |
| D7 | **Function signature display** | Show `GetById(id: Int32) → SP.ListItem` inline rather than raw parameter tables. Like TypeDoc method signatures. Immediately communicates what a function does | LOW | **Designed** (method table with params + return type columns) | Already spec'd in methods table format |
| D8 | **Contextual sidebar showing children only** | Instead of a full tree (793+ items), show only immediate children of current node (5-30 items). Like VS Code's explorer showing folder contents, not the entire file system | LOW | **Designed** (sidebar shows children of selected node) | Architectural decision already made. Simpler than tree virtualization |
| D9 | **Section jump links** | Quick-jump pills at top of type detail: `Properties (91) | Nav Properties (18) | Methods (102)`. Like MDN's "On this page" sidebar or GitHub's table of contents. Saves scrolling on entities with 100+ items | LOW | **Designed** (row of anchor-link pills) | Simple anchor links. Trivial to implement |
| D10 | **Copy API path as code snippet** | Beyond just copying the URL path, generate a ready-to-use code snippet (e.g., PnPjs or fetch call). Stripe shows code in multiple languages. For SharePoint devs, a PnPjs snippet would be immediately useful | MED | **Not designed** | Would require mapping API paths to PnPjs equivalent syntax. Moderate complexity, high developer value. Consider for v1.x |
| D11 | **Export / share current view** | Share a specific entity or function via URL. Already handled by deep linking (T4), but could add "Copy link to this item" button. Apiary, ReadMe, and Bump.sh all have share buttons per section | LOW | **Not designed** (deep linking exists, but no explicit share button) | The hash routes already enable this. A small "share" icon would make it discoverable |
| D12 | **Enum/complex type expansion** | When a property type is an enum or complex type (not a simple `Edm.String`), show its values inline or as a tooltip. Similar to Swagger UI expanding schema models inline | MED | **Not designed** | Depends on whether enum definitions are in the metadata JSON. Needs data investigation. Would help for understanding integer-typed "kind" fields |
| D13 | **Statistics dashboard / data overview** | Show aggregate stats: total entities, functions, properties, most-connected entities, entities with most methods. Like GitHub's repository insights. Helps users understand the API surface area | LOW | **Partially designed** (stats on home screen and How It Works page) | Basic stats are shown. A more interactive version (e.g., "top 10 entities by method count") could be a later enhancement |

### Anti-Features (Deliberately NOT Built)

Features that seem good but create problems for this specific product. Commonly requested in API docs tools, but wrong for a read-only metadata browser.

| # | Anti-Feature | Why Commonly Requested | Why Problematic for This Product | What to Do Instead |
|---|--------------|------------------------|----------------------------------|-------------------|
| A1 | **"Try It" / API Playground** | Table stakes for Swagger UI, Postman, Redocly, ReadMe. Users expect to test API calls from docs | This tool runs on GitHub Pages with NO backend. Cannot authenticate to SharePoint. Cannot proxy requests. The metadata doesn't include HTTP methods (GET/POST) or examples. Adding a playground would require a proxy server, SharePoint auth, CORS handling — fundamentally changes the product | Show the API path and suggest using PnPjs, Postman, or the browser developer console. Copy-path button (T5) is the right approach |
| A2 | **Code sample generation** | Stripe shows code in 7 languages. Mintlify auto-generates code samples. Standard in interactive API docs | The $metadata doesn't contain usage examples, HTTP methods, or request/response bodies. Code generation would require manually authoring examples for 3,528 functions — an impossible maintenance burden for a solo project. Generated samples would be misleading (no HTTP method info) | Link to official Microsoft docs when available (already designed). D10 (copy as PnPjs snippet) is a lighter version of this for the most common use case |
| A3 | **AI-powered search / chat** | Mintlify, Theneo, GitBook all have AI-powered Q&A. "Ask the docs" is trending in 2025-2026 | Requires an AI backend (API costs, latency, accuracy concerns). The metadata is structured data, not prose — AI adds little value over MiniSearch for finding "GetById on SP.List". Risk of hallucinated answers about SharePoint API behavior | MiniSearch with fuzzy matching and field boosting handles structured metadata search better than LLM-based search. Cmd+K palette is the right UX |
| A4 | **User accounts / personalization** | ReadMe has personalized dashboards. Stripe injects your API keys. Some tools track "your" API usage | This is a static SPA on GitHub Pages. No backend, no auth. Personalization would require a backend service. The user base is small (SharePoint developers) — adding login friction would reduce adoption, not increase it | localStorage for preferences (filters, dark mode, recently visited). No accounts needed |
| A5 | **Versioning / multiple API versions** | SwaggerHub, Bump.sh, Redocly all support multiple API versions side-by-side | SharePoint Online has ONE $metadata at any time. There's no "v1 vs v2" — the API evolves monthly. The changelog view (D3) already tracks changes over time. Multiple full snapshots would multiply the 4MB data size and add complexity for no user benefit | The changelog view IS the versioning story. It shows what changed each month. A single "latest" snapshot is the right approach for SharePoint's API model |
| A6 | **Collaboration / comments / feedback** | ReadMe has inline feedback. Theneo has discussion threads. Docs platforms value "community" features | Solo developer project hosted on GitHub Pages. No backend for storing comments. GitHub Issues is the right channel for feedback. Adding comments to a static SPA requires a third-party service (Disqus, etc.) which adds weight and privacy concerns | "Report an issue" and "View on GitHub" links (already designed in How It Works page). Let GitHub be the collaboration layer |
| A7 | **Mobile-optimized UX** | Redoc is mobile-responsive. Stripe docs work on phones. Every modern web tool should be mobile-friendly | SharePoint developers browse API metadata at their desks, not on phones. The data density (91 properties, 102 methods per entity) makes mobile viewing impractical. Mobile optimization adds complexity and testing burden for minimal usage | Desktop-first. Basic responsiveness to avoid horizontal scroll breakage, but no dedicated mobile layout. Explicitly out of scope per PROJECT.md |
| A8 | **Full-tree visualization / graph view** | GraphQL Voyager shows entity relationships as a visual graph. Looks impressive in demos | 2,449 entities with thousands of relationships would create an unreadable hairball graph. Even GraphQL Voyager struggles with schemas >100 types. The contextual sidebar + breadcrumb + type cross-linking already provides navigable relationships without the visual noise | The "Used by" cross-references (D1) + type linking (T2) + base type chains (D2) provide the same information in a scannable, text-based format. Graph visualization is a demo feature, not a productivity feature |
| A9 | **Inline editing of metadata** | Some API tools let you edit specs. Swagger Editor, Redocly CLI, etc. | The metadata is read-only from Azure Blob Storage. There's nothing to edit. The data is produced by Azure Functions that fetch `$metadata` from SharePoint Online | N/A — this is a viewer, not an editor |
| A10 | **Analytics / usage tracking** | ReadMe tracks which endpoints are most viewed. Mintlify has analytics dashboards | Adds tracking scripts, privacy concerns, GDPR considerations. Deferred per PROJECT.md — add GA/App Insights after core functionality works. Not a feature, it's an operational concern | Defer to post-launch. GitHub Pages traffic analytics may suffice initially |

---

## Gap Analysis: What's Missing From the Current Design?

Comparing the current design spec against the competitive landscape, here are genuine gaps worth considering:

### Gap 1: No Inline Property Description / Documentation
**What competitors have:** Swagger UI shows property descriptions from OpenAPI schemas. MDN has prose descriptions for every property. TypeDoc shows JSDoc comments.
**What we lack:** The $metadata doesn't contain descriptions for properties or methods. This is a data limitation, not a design limitation.
**Verdict:** NOT addressable. The source data simply doesn't include descriptions. The "Official documentation available" banner (linking to docs.microsoft.com) is the right mitigation.

### Gap 2: No HTTP Method Indication (GET/POST/PATCH/DELETE)
**What competitors have:** Every API docs tool shows HTTP methods with color-coded badges.
**What we lack:** The $metadata doesn't specify which HTTP methods are valid for each function. This is a fundamental limitation of the OData $metadata format.
**Verdict:** NOT addressable from metadata alone. Could potentially be augmented with manually curated data for the most common endpoints, but this is a massive maintenance burden. Not recommended for v1.

### Gap 3: No Request/Response Examples
**What competitors have:** Stripe shows example request bodies and response JSON for every endpoint.
**What we lack:** The $metadata only describes the schema (types, parameters, return types), not example payloads.
**Verdict:** NOT addressable. The metadata is a schema description, not a usage guide. This is why the product is a "metadata explorer" not an "API docs site."

### Gap 4: No "Required vs Optional" Indication for Method Parameters
**What competitors have:** Swagger UI clearly marks required vs optional parameters.
**What we have:** The `nullable` property on entity properties, but no required/optional indication on function parameters.
**Verdict:** PARTIALLY addressable. Entity properties already show nullable status. Function parameters could potentially use heuristics (e.g., all params are required in OData function imports), but needs data verification.

### Gap 5: No Composable Function Explanation
**What we have:** A "COMPOSABLE" badge on composable methods.
**What's missing:** No explanation of what "composable" means for developers who don't know OData terminology.
**Verdict:** LOW effort fix. Add a tooltip or info icon that says "Composable functions can be used as part of a larger URL path (chained with other operations)" when hovering the COMPOSABLE badge.

### Gap 6: No Offline Support / PWA
**What competitors have:** DevDocs works fully offline as a PWA. For a tool browsing a static 4MB JSON, offline access is technically trivial.
**Verdict:** NICE TO HAVE for v2. Service Worker + cache the metadata blob. Low complexity, moderate value for developers on trains or in restricted network environments. Not a launch priority.

---

## Feature Dependencies

```
[T1: Full-text search] 
    requires [MiniSearch index] 
        requires [Metadata loaded]

[T2: Type cross-linking]
    requires [Entity lookup Map]
        requires [Metadata loaded]

[D1: "Used by" reverse refs]
    requires [Entity lookup Map + Nav property reverse index]
        requires [Metadata loaded]

[D2: Base type chain]
    requires [Entity lookup Map]

[D3: Changelog view]
    requires [Diff data loaded from Azure]
    independent of [Metadata loaded]

[T4: Deep linking]
    requires [Hash router setup]

[T7: Dark mode]
    independent (CSS-only, no data dependencies)

[D5: Popular endpoints]
    independent (static curated data)

[D6: Recent history]
    requires [localStorage]
    enhanced-by [T4: Deep linking] (stores route paths)

[T5: Copy path]
    requires [T3: Breadcrumb navigation]

[D10: PnPjs snippet generation]
    requires [T5: Copy path]
    requires [API path → PnPjs mapping logic]

[D11: Share button]
    requires [T4: Deep linking]
```

### Dependency Notes

- **Most features depend on "Metadata loaded"** — the initial 4MB fetch from Azure is the critical path. Everything builds on top of this data.
- **Changelog is independent** — diff data is separate from metadata. Can be loaded in parallel.
- **Dark mode is fully independent** — CSS-only, can be implemented at any point.
- **D10 (PnPjs snippet) enhances T5 (copy path)** — they share the same UI surface but D10 adds translation logic.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — feature parity with the old app PLUS the key improvements.

- [x] T1: Full-text search (Cmd+K) — **THE core improvement** over the old app
- [x] T2: Type cross-linking — essential for navigating between entities
- [x] T3: Breadcrumb navigation — shows where you are in the hierarchy
- [x] T4: Deep linking / permalinks — developers share links
- [x] T5: Copy API path — developers paste paths into code
- [x] T6: Keyboard navigation — Cmd+K, arrow keys
- [x] T7: Dark mode — trivial effort, high perceived polish
- [x] T8: Fast initial load — non-negotiable
- [x] T9: Resizable panels — standard UX
- [x] T10: Collapsible sections with counts — standard UX
- [x] T11: In-section filtering — needed for entities with 100+ items
- [x] T12: Loading states — skeleton screens during data fetch
- [x] D1: "Used by" reverse cross-references — **key differentiator**, moderate effort
- [x] D2: Base type chain — low effort, high value for understanding type hierarchy
- [x] D3: Changelog view — existing feature, needs to be rebuilt
- [x] D4: Grouped search results with path disambiguation — required for search to be usable
- [x] D5: Popular endpoints home screen — good first impression for newcomers
- [x] D6: Recently visited — low effort, high convenience
- [x] D7: Function signatures — already in design spec
- [x] D8: Contextual sidebar — architectural decision, part of core navigation
- [x] D9: Section jump links — trivial effort

### Add After Validation (v1.x)

Features to add once core is working and deployed.

- [ ] D10: Copy as PnPjs snippet — when "what do devs copy most?" is understood from usage
- [ ] D11: Explicit share button — when users request it (deep linking already works, just not discoverable)
- [ ] Gap 5: Composable tooltip — trivial, just needs the text
- [ ] D12: Enum/complex type expansion — if the metadata contains enum definitions (needs data investigation)
- [ ] D13: Enhanced statistics — if users show interest in API surface area analysis

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Gap 6: Offline PWA support — when user feedback confirms need
- [ ] A7 (partial): Basic mobile responsiveness — if mobile traffic exceeds 5%
- [ ] Multi-language documentation links — if Microsoft adds more REST API docs pages
- [ ] Custom metadata upload — let users explore their own on-premises SharePoint metadata

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| T1: Full-text search (Cmd+K) | HIGH | HIGH | **P1** |
| T2: Type cross-linking | HIGH | LOW | **P1** |
| T3: Breadcrumb navigation | HIGH | LOW | **P1** |
| T4: Deep linking | HIGH | LOW | **P1** |
| T5: Copy API path | HIGH | LOW | **P1** |
| T6: Keyboard navigation | MED | LOW | **P1** |
| T7: Dark mode | MED | LOW | **P1** |
| T8: Fast initial load | HIGH | MED | **P1** |
| T9: Resizable panels | MED | LOW | **P1** |
| T10: Collapsible sections | MED | LOW | **P1** |
| T11: In-section filtering | MED | LOW | **P1** |
| T12: Loading states | MED | LOW | **P1** |
| D1: "Used by" reverse refs | HIGH | MED | **P1** |
| D2: Base type chain | HIGH | LOW | **P1** |
| D3: Changelog | HIGH | MED | **P1** |
| D4: Grouped search results | HIGH | MED | **P1** |
| D5: Popular endpoints | MED | LOW | **P1** |
| D6: Recently visited | MED | LOW | **P1** |
| D7: Function signatures | MED | LOW | **P1** |
| D8: Contextual sidebar | HIGH | MED | **P1** |
| D9: Section jump links | LOW | LOW | **P1** |
| D10: PnPjs snippet | HIGH | MED | **P2** |
| D11: Share button | LOW | LOW | **P2** |
| D12: Enum expansion | MED | MED | **P2** |
| D13: Enhanced stats | LOW | LOW | **P3** |
| Gap 6: Offline PWA | MED | MED | **P3** |

**Priority key:**
- **P1:** Must have for launch (all are currently in the design spec)
- **P2:** Should have, add after initial deployment
- **P3:** Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Swagger UI | Redocly/Redoc | GraphiQL Schema Explorer | Stripe Docs | DevDocs | **Our Approach** |
|---------|-----------|--------------|-------------------------|-------------|---------|-----------------|
| **Search** | Per-section only | Full-text | Type/field autocomplete | Full-text + AI | Instant full-text | Cmd+K with MiniSearch, grouped results, path disambiguation |
| **Type linking** | Schema refs clickable | Deep links to schemas | Click-through types | Internal links | Cross-reference links | Green entity links throughout all tables |
| **Breadcrumbs** | No | No | No (flat schema view) | Section-based | No | Full clickable path breadcrumb with copy button |
| **Try It** | Yes (core feature) | Yes (Pro only) | Yes (query execution) | Shell + code | No | **Deliberately excluded** (read-only tool) |
| **Code samples** | From spec | From spec | Generated queries | 7 languages | N/A | **Not included** (metadata has no examples) |
| **Dark mode** | No | Theme customization | Yes | Yes | Yes | Yes (Tailwind dark: variants) |
| **Changelog** | No | No | No | Per-product changelogs | No | **Monthly visual diffs** (unique differentiator) |
| **Cross-references** | No | No | No | No | No | **"Used by" reverse refs** (unique differentiator) |
| **Inheritance** | Schema allOf/oneOf | Schema composition | Interface implements | N/A | N/A | **Base type chain** with clickable links |
| **Keyboard nav** | No | Limited | Yes | Cmd+K | Cmd+K | Cmd+K palette + keyboard shortcuts |
| **Deep links** | Partial (anchors) | Yes | No | Yes | Yes | Hash routes for every item |
| **Offline** | Depends on deployment | No | No | No | Yes (PWA) | No (v2 consideration) |
| **Mobile** | Poor | Good (responsive) | No | Excellent | Good | Desktop only (v1) |

### Key Competitive Insight

The strongest features of Swagger UI, Redocly, and Stripe Docs — interactive Try It consoles, multi-language code samples, and personalized API keys — are **impossible** for this product because it's a static metadata browser, not an API gateway.

The product's competitive advantage comes from features those tools **don't** have:
1. **Monthly changelog** — No general API docs tool tracks changes over time
2. **"Used by" reverse cross-references** — GraphiQL doesn't show reverse references
3. **Same-name disambiguation** via path breadcrumbs — Unique to deeply nested hierarchies
4. **Deep search across 9 levels** — Most schema browsers only search top-level

---

## Sources

- **API docs tool comparisons (MEDIUM confidence):** apisyouwonthate.com/blog/top-5-best-api-docs-tools/ (2025-07), ferndesk.com/blog/best-api-documentation-tools (2025-12), treblle.com/blog/best-openapi-documentation-tools (2026-01), mintlify.com/blog/best-api-documentation-tools-of-2025 (2025-06)
- **Stripe DX analysis (HIGH confidence):** moesif.com/blog/the-stripe-developer-experience-and-docs-teardown, kenneth.io/post/insights-from-building-stripes-developer-platform (2024-04), apidog.com/blog/stripe-docs (2025-06)
- **GraphQL Playground features (HIGH confidence):** github.com/graphql/graphql-playground, graphql.org/blog/2020-04-03-graphiql-graphql-playground (2020-04), ariadnegraphql.org/docs/explorers
- **SP REST API Explorer context (HIGH confidence):** spblog.net/post/2018/06/22/SharePoint-Rest-API-Metadata-Explorer-the-present-and-the-future (2018-06, original author's blog post outlining planned features — most have been implemented in the existing app)
- **DevDocs pattern (MEDIUM confidence):** github.com/furudo-erika/awesome-api-documentation-tools
- **MDN API reference patterns (HIGH confidence):** developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Howto/Write_an_api_reference
- **Existing design spec (HIGH confidence):** .planning/phases/1-rebuild-ui/1-RESEARCH.md (1,825 lines of detailed UI/UX spec with mockups)

---
*Feature research for: SP REST API Explorer — API metadata schema browser*
*Researched: 2026-02-11*

# Phase 19: Data Pipeline - Research

**Researched:** 2026-02-23
**Domain:** HTTP fetch with retry/timeout, XML-to-JSON parsing, lz-string compression
**Confidence:** HIGH

## Summary

Phase 19 implements the core data pipeline: fetch SharePoint `_api/$metadata` XML with resilient retry/timeout, parse it to the exact JSON structure the frontend consumes, and compress it with lz-string. This phase is pure pipeline logic - no triggers, no blob upload (Phase 20).

The legacy codebase (`az-funcs/src/metadataParser.ts`, 302 lines) provides the exact parsing logic to replicate. The parser uses xml2js to parse OData XML, extracts associations, entity types, complex types, and function imports, then cross-links them. The legacy pipeline (`az-funcs/GenerateMetadata/index.ts`) shows the orchestration: fetch XML -> parse -> compress. Key decisions are locked: xml2js for XML parsing, axios for HTTP, native Promises (no Bluebird), lz-string `compressToUTF16` for compression, and byte-identical JSON output verified against golden reference files in Azure Blob Storage.

The main technical challenge is ensuring perfect fidelity with the legacy parser output. The parser has subtle behaviors: alias mapping for 6 function names, filtering functions containing "Internal", underscore-to-dot name replacement, incremental integer function IDs starting at 1, synthetic `Collection()` entity types created on-demand, and selective deletion of `isRoot` when false. All of these must be replicated exactly. The frontend types at `app/src/lib/metadata/types.ts` define the consumer contract and must match.

**Primary recommendation:** Port the legacy MetadataParser class method-by-method with tightened TypeScript types, replace Bluebird promisify with xml2js's built-in `parseStringPromise`, hand-roll fetch retry logic (simpler than adding a library for a single GET request), and validate with byte-identical comparison against golden reference JSON.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Reproduce ALL legacy MetadataParser behaviors identically - zero deviation from current output
- This includes: alias map, Internal function filtering, underscore-to-dot name replacement, incremental integer function IDs, synthetic Collection() entity types
- Drop legacy dead code (commented-out TODO for sorting, commented-out underscore `continue`) - clean rewrite, no carried-over comments
- Use xml2js for XML parsing - same library as legacy, proven with SharePoint's exact XML format
- Exact same data shape: `entities: {[fullName]: EntityType}`, `functions: {[id]: FunctionImport}` - frontend depends on this
- Port TypeScript interfaces from legacy but tighten types (replace `any` with specific types, add `readonly` where appropriate) - same shape, stricter contracts
- All JSON output uses compact format (no indentation) per PROC-03 - applies to all blobs, not just compressed
- Keep Maps for intermediate processing, convert to plain objects at the end (same pattern as legacy)
- Native Promises throughout - no Bluebird dependency
- Use axios for HTTP calls - already installed from Phase 18, proven with SharePoint
- Exponential backoff: base 2 seconds, doubling each retry (2s, 4s, 8s). Total wait ~14s before final failure
- 429 (throttled) responses count toward the 3-retry limit - if SharePoint throttles hard, fail after 3 total attempts
- When 429 has Retry-After header, respect that wait time before retrying
- 60-second hard timeout per attempt via AbortController - cancels the request, counts as failed attempt, triggers retry
- Retry triggers: network errors, 5xx server errors, 429 throttling, timeouts
- Test against real metadata: download XML from `https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.xml`
- Golden reference JSON: download from `https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.json`
- Acceptance criteria: byte-identical JSON - `JSON.stringify(newOutput) === JSON.stringify(legacyOutput)` with zero tolerance
- No runtime sanity checks in production - tests catch regressions, parser either works or throws
- lz-string compression must pass round-trip test: compress -> decompress -> compare to original JSON
- Phase 19 does NOT include any triggers (HTTP or timer) - only pipeline logic
- Phase 20 handles all triggers and blob upload

### Claude's Discretion
- File layout within backend/src/ (separate modules vs pipeline module)
- Interface file organization (single file vs directory)
- Pipeline entry point design (single function vs step-by-step API)
- Parser constructor design (raw XML input vs pre-parsed object)
- Internal data structure choices beyond Maps
- Test framework and test file organization
- Error types and error message formats

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FTCH-01 | Function fetches SharePoint `_api/$metadata` XML endpoint with Bearer token | Axios GET with Authorization header; `getToken()` from Phase 18 auth module provides Bearer token; legacy `metadataReader.ts` shows exact endpoint pattern `${spUrl}/_api/$metadata` |
| FTCH-02 | Fetch retries up to 3 times with exponential backoff on network failures and 5xx errors | Hand-rolled retry loop with 2s/4s/8s delays; retry on `!response` (network error), `response.status >= 500`, timeout errors |
| FTCH-03 | Fetch respects 429 Retry-After headers from SharePoint throttling | Check `response.headers['retry-after']` on 429; parse as seconds; use as wait time instead of exponential delay; still counts toward 3-retry limit |
| FTCH-04 | Fetch has a 60-second timeout per attempt | AbortController with 60s setTimeout per attempt; pass signal to axios config; clear timeout on response |
| PROC-01 | XML-to-JSON parsing produces identical output structure to legacy MetadataParser | Port all 8 methods from `metadataParser.ts`; xml2js `parseStringPromise` replaces Bluebird promisify; same extraction order: associations -> types -> functions -> collection objects -> entity methods |
| PROC-02 | TypeScript interfaces ported from legacy (EntityType, FunctionImport, Metadata, Property, NavigationProperty, Parameter, Association) | 7 interface files in `az-funcs/src/interfaces/`; port with tighter types (replace `any` with specific types, add `readonly` where appropriate); frontend types at `app/src/lib/metadata/types.ts` define consumer contract |
| PROC-03 | JSON output uses compact format (no indentation) | `JSON.stringify(metadata)` with no space/indent arguments; legacy used `JSON.stringify(parsed, null, 4)` for blob upload but compact for zip.json - CONTEXT.md says ALL output compact |
| PROC-04 | Parsed JSON is compressed via lz-string `compressToUTF16` for .zip.json blobs | `import { compressToUTF16 } from 'lz-string'`; apply to `JSON.stringify(metadata)`; round-trip test with `decompressFromUTF16` |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| xml2js | ^0.6.2 | XML-to-JS object parsing | Same library as legacy; proven with SharePoint OData XML; 95M weekly downloads; has built-in `parseStringPromise` |
| lz-string | ^1.5.0 | LZ-based string compression | Same library as legacy; `compressToUTF16` for .zip.json blobs; 28M weekly downloads; stable v1.5.0 is latest on npm |
| axios | ^1.7.0 | HTTP client | Already installed from Phase 18; proven with SharePoint; supports AbortController signal |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/xml2js | ^0.4.14 | TypeScript type definitions for xml2js | Dev dependency; needed since xml2js doesn't ship its own types |
| @types/lz-string | ^1.3.34 | TypeScript type definitions for lz-string | Dev dependency; needed since lz-string v1.5.0 doesn't ship its own types |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| xml2js | fast-xml-parser | Faster but different output shape would require rewriting all extraction logic; xml2js is locked decision |
| Hand-rolled retry | axios-retry / retry-axios | Libraries add complexity for a single GET endpoint; custom retry gives exact control over 429 Retry-After + AbortController timeout behavior; user decided on specific backoff formula |
| lz-string v1.5.0 | lz-string v2.0.0-rc.0 | v2.0 is still pre-release (rc.0); v1.5.0 is the stable `latest` on npm; stick with stable |

**Installation:**
```bash
npm install xml2js lz-string
npm install --save-dev @types/xml2js @types/lz-string
```

## Architecture Patterns

### Recommended Project Structure
```
backend/src/
  auth.ts                    # Phase 18 - getToken()
  pipeline/
    interfaces.ts            # All metadata interfaces (ported from legacy, tightened)
    fetch-metadata.ts        # Fetch XML with retry/timeout/backoff
    parse-metadata.ts        # MetadataParser - XML to Metadata JSON
    compress.ts              # lz-string compression wrapper
    index.ts                 # Pipeline orchestrator: fetch -> parse -> compress
  functions/
    validateAuth.ts          # Phase 18
```

**Rationale for `pipeline/` directory:**
- Groups all Phase 19 modules under a clear boundary
- Each file is independently testable
- `index.ts` exports the pipeline entry point for Phase 20 to consume
- Keeps `src/` flat at top level (auth.ts, pipeline/, functions/)

### Pattern 1: Pipeline Entry Point (Step-by-Step API)
**What:** Export individual pipeline stages AND a single orchestrator function
**When to use:** Phase 20 needs the orchestrator; tests need individual stages

```typescript
// pipeline/index.ts
export { fetchMetadataXml } from './fetch-metadata.js';
export { parseMetadata } from './parse-metadata.js';
export { compressJson } from './compress.js';
export type { Metadata, EntityType, FunctionImport } from './interfaces.js';

export interface PipelineResult {
  readonly xml: string;
  readonly json: string;          // compact JSON.stringify
  readonly compressedJson: string; // lz-string compressToUTF16
}

export async function runPipeline(token: string, spUrl: string): Promise<PipelineResult> {
  const xml = await fetchMetadataXml(token, spUrl);
  const metadata = await parseMetadata(xml);
  const json = JSON.stringify(metadata);
  const compressedJson = compressJson(json);
  return { xml, json, compressedJson };
}
```

### Pattern 2: Fetch with Retry and AbortController Timeout
**What:** Hand-rolled retry loop with per-attempt timeout via AbortController
**When to use:** FTCH-01 through FTCH-04

```typescript
// pipeline/fetch-metadata.ts
import axios, { AxiosError } from 'axios';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;
const TIMEOUT_MS = 60_000;

export async function fetchMetadataXml(token: string, spUrl: string): Promise<string> {
  const url = `${spUrl}/_api/$metadata`;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        // axios returns string for XML content-type responses
        responseType: 'text',
        transformResponse: [(data) => data], // prevent JSON parse attempt
      });
      return response.data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (attempt === MAX_RETRIES) {
        throw error; // Exhausted retries
      }
      
      if (!isRetryable(error)) {
        throw error; // Non-retryable (4xx except 429)
      }
      
      const delay = getRetryDelay(error, attempt);
      await sleep(delay);
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw new Error('Unreachable'); // TypeScript exhaustiveness
}
```

### Pattern 3: xml2js parseStringPromise (Replacing Bluebird)
**What:** Use xml2js's native Promise API instead of Bluebird promisify
**When to use:** PROC-01

```typescript
// Legacy (Bluebird):
import { Parser } from 'xml2js';
import { promisify } from 'bluebird';
let parser = new Parser();
let parseStringAsync = promisify<any, string>(parser.parseString);
let obj = await parseStringAsync(this.content);

// New (native):
import { parseStringPromise } from 'xml2js';
const obj = await parseStringPromise(xml);
// Or with Parser instance:
const parser = new Parser();
const obj = await parser.parseStringPromise(xml);
```

Source: xml2js npm README - "Promise usage" section

### Pattern 4: Selective Property Deletion for JSON Size Optimization
**What:** Delete falsy boolean properties before serialization to reduce JSON size
**When to use:** Matching legacy behavior for `isRoot`, `isBindable`, `isComposable`

```typescript
// Legacy does this to optimize JSON size:
if (!funcImport.isRoot) {
  delete funcImport.isRoot;
}
// The new parser MUST replicate this exactly - the frontend checks
// for presence/absence of isRoot, not just truthiness
```

### Anti-Patterns to Avoid
- **Using axios-retry or retry-axios library:** The specific retry requirements (2s/4s/8s exact delays, 429 Retry-After respect, AbortController timeout integration) are simpler to implement directly than to configure through a library. These libraries use different backoff formulas.
- **Pretty-printing JSON anywhere:** CONTEXT.md explicitly says ALL JSON output uses compact format. The legacy code used `JSON.stringify(parsed, null, 4)` for some blobs - the new code must NOT do this.
- **Using `new Parser()` with Bluebird promisify:** xml2js 0.6.x has built-in `parseStringPromise`. No need for Bluebird.
- **Storing `parser` as instance state:** The legacy class stores `content` and uses `this.content` - the new code should pass XML as a parameter to avoid stateful coupling.
- **Testing compressed output against golden reference:** The golden reference is uncompressed JSON. Test JSON output for byte-equality, then separately test that compression round-trips correctly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XML parsing | Custom XML parser or regex extraction | xml2js `parseStringPromise` | SharePoint OData XML has namespaces, attributes, nested elements - xml2js handles all of this correctly |
| LZ compression | Custom compression algorithm | lz-string `compressToUTF16` / `decompressFromUTF16` | Must be compatible with frontend decompression; lz-string is the standard |
| HTTP client | Raw `https` module or `fetch` | axios (already installed) | Consistent with Phase 18; handles response parsing, error objects, AbortController signal |

**Key insight:** The fetch retry logic IS appropriate to hand-roll because the requirements are very specific (exact backoff timing, 429 Retry-After header parsing, AbortController integration) and it's a single GET request. A library would require more configuration than direct implementation.

## Common Pitfalls

### Pitfall 1: Function ID Ordering Sensitivity
**What goes wrong:** Function IDs are incremental integers starting at 1, assigned in XML document order. If the extraction loop processes functions in a different order, every function gets a different ID, and `functionIds` arrays in entities will be wrong.
**Why it happens:** The legacy parser uses a simple `let i = 1` counter in `extractFunctions()`, incrementing for each non-filtered function. The counter is set BEFORE the Internal filter check, but the `continue` statement skips the increment for filtered functions because `i++` is in the object literal.
**How to avoid:** Actually, looking at the legacy code carefully: `id: i++` is inside the FunctionImport object literal, which is created BEFORE the Internal filter check. But then if the function IS Internal, it `continue`s, and the object is discarded. So the ID is consumed even for Internal functions. Wait - re-reading the code: `id: i++` increments `i` when the object is created on line 155-163, then the Internal check is on line 166. So Internal functions DO consume an ID number. This must be replicated exactly.
**Warning signs:** JSON diff shows different function IDs; `functionIds` arrays in entities don't match golden reference.

### Pitfall 2: Alias Deduplication Logic
**What goes wrong:** The alias map replaces function names (e.g., `Microsoft_Office_Server_Search_REST_SearchService` -> `search`). But there's a dedup check: if the alias name was ALREADY used by a previous function, skip this function entirely.
**Why it happens:** Lines 175-179 of legacy parser: first check if alias exists AND no function with that alias name exists yet -> rename. Second check if alias exists AND a function with that alias name ALREADY exists -> skip entirely (`continue`).
**How to avoid:** Replicate the exact two-branch alias logic. The order functions appear in the XML matters because the first function to claim an alias wins.
**Warning signs:** Different number of functions in output; some aliased functions missing or duplicated.

### Pitfall 3: Property Deletion Changes JSON Key Order
**What goes wrong:** `delete funcImport.isRoot` when it's falsy changes the JSON serialization. If you conditionally add `isRoot` only when true (instead of always adding then deleting), the key order in the serialized JSON may differ.
**Why it happens:** JavaScript objects preserve insertion order. The legacy code creates the object with `isRoot: true`, then deletes it if false. If you use conditional spreading `...(isRoot && { isRoot: true })`, the key position in the object differs.
**How to avoid:** Match the legacy pattern exactly: always create the object with `isRoot: true` set, then `delete` it afterward if it's false. Same for `isBindable` and `isComposable` which use `undefined` (they just don't set it when the attribute doesn't exist).
**Warning signs:** Byte-level JSON comparison fails even though the data looks identical in a diff tool (key ordering difference).

### Pitfall 4: xml2js Returns Arrays for Everything
**What goes wrong:** xml2js wraps all elements in arrays by default. `schema.EntityType` is an array, `type.Property` is an array, `association['End'][0]` uses array indexing. If you forget to index into arrays, you get `[object Object]` in your output.
**Why it happens:** xml2js default options use `explicitArray: true`. The legacy code is written to handle this (all loops iterate arrays, all attribute access uses `[0]`).
**How to avoid:** Keep the default xml2js options (don't set `explicitArray: false`). Follow the legacy code's array access patterns exactly.
**Warning signs:** Properties showing as `[object Object]` or `undefined` in parsed output.

### Pitfall 5: axios `responseType` for XML
**What goes wrong:** axios tries to JSON-parse response bodies by default. SharePoint's `$metadata` endpoint returns XML with `application/xml` content-type, but axios's default `transformResponse` may interfere.
**Why it happens:** axios applies `transformResponse` which attempts `JSON.parse()` on string responses. For XML content, this will fail silently and return the string, but behavior can vary.
**How to avoid:** Set `responseType: 'text'` and optionally `transformResponse: [(data) => data]` to guarantee the raw XML string is returned untouched.
**Warning signs:** Response data is parsed/modified unexpectedly; XML string has unexpected format.

### Pitfall 6: AbortController Timeout Cleanup
**What goes wrong:** If the request succeeds, the `setTimeout` for the AbortController must be cleared. Otherwise, it fires after the request completes and aborts a potentially reused controller, or causes unhandled errors.
**Why it happens:** Forgetting to `clearTimeout` in the success path, only clearing in the error handler.
**How to avoid:** Use `finally` block to ensure `clearTimeout` is always called, or clear immediately after `await axios.get()` returns.
**Warning signs:** Sporadic `AbortError` exceptions in logs; tests that pass individually but fail when run together.

### Pitfall 7: Compact JSON vs Pretty JSON
**What goes wrong:** Legacy code used `JSON.stringify(parsed, null, 4)` for `.json` blobs but `JSON.stringify(parsed)` (compact) for `.zip.json` blobs. The golden reference at `metadata.latest.json` was uploaded with pretty-printing. The CONTEXT.md decision says ALL output is now compact.
**Why it happens:** The golden reference JSON file may have been uploaded with the legacy pretty-print format. If you compare compact output against a pretty-printed golden reference, byte-identical comparison will fail.
**How to avoid:** When downloading the golden reference for comparison, parse it and re-stringify compact before comparing: `JSON.stringify(JSON.parse(goldenJson)) === JSON.stringify(newOutput)`. Alternatively, compare parsed objects.
**Warning signs:** Tests fail with whitespace-only differences; golden reference has newlines/indentation.

## Code Examples

Verified patterns from legacy source and official docs:

### Fetching SharePoint Metadata with Bearer Token
```typescript
// Source: az-funcs/src/metadataReader.ts (adapted for new auth)
import axios from 'axios';

const response = await axios.get(`${spUrl}/_api/$metadata`, {
  headers: { Authorization: `Bearer ${token}` },
  responseType: 'text',
  transformResponse: [(data: string) => data],
});
const xml: string = response.data;
```

### xml2js parseStringPromise (No Bluebird)
```typescript
// Source: xml2js npm README — "Promise usage" section
import { parseStringPromise } from 'xml2js';

const parsed = await parseStringPromise(xml);
const schemas = parsed['edmx:Edmx']['edmx:DataServices'][0]['Schema'];
```

### Legacy Alias Map (Must Replicate Exactly)
```typescript
// Source: az-funcs/src/metadataParser.ts:14-21
const ALIASES: Readonly<Record<string, string>> = {
  'Microsoft_Office_Server_Search_REST_SearchService': 'search',
  'Microsoft_AppServices_AppCollection': 'Apps',
  'SP_Publishing_SitePageService': 'sitepages',
  'SP_Social_SocialRestFollowingManager': 'social.following',
  'SP_Social_SocialRestFeedManager': 'social.feed',
  'SP_MicroService_MicroServiceManager': 'microservicemanager',
};
```

### Retry Delay Calculation with 429 Retry-After
```typescript
function getRetryDelay(error: unknown, attempt: number): number {
  // Check for 429 with Retry-After header
  if (axios.isAxiosError(error) && error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'];
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        return seconds * 1000;
      }
    }
  }
  // Exponential backoff: 2s, 4s, 8s (base 2s, doubling)
  return BASE_DELAY_MS * Math.pow(2, attempt - 1);
}
```

### Retryable Error Detection
```typescript
function isRetryable(error: unknown): boolean {
  // Network errors (no response)
  if (axios.isAxiosError(error) && !error.response) {
    return true;
  }
  // AbortController timeout
  if (error instanceof Error && error.name === 'CanceledError') {
    return true;
  }
  // 5xx server errors
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    return status === 429 || status >= 500;
  }
  return false;
}
```

### lz-string Compression
```typescript
// Source: az-funcs/GenerateMetadata/index.ts:46
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

const json = JSON.stringify(metadata); // compact, no indentation
const compressed = compressToUTF16(json);

// Round-trip verification (test only):
const decompressed = decompressFromUTF16(compressed);
assert(decompressed === json);
```

### Association Extraction (Legacy Pattern)
```typescript
// Source: az-funcs/src/metadataParser.ts:275-301
// Associations map multiplicity to Collection() wrappers
// End[0].Multiplicity === '*' => Collection(End[0].Type)
// End[1].Multiplicity === '*' => Collection(End[1].Type)
// Used to resolve NavigationProperty types
```

### Synthetic Collection Entity Types
```typescript
// Source: az-funcs/src/metadataParser.ts:96-106
// If any property, navProperty, or function returnType references
// Collection(SomeType) and no entity exists with that name,
// create a minimal entity: { fullName, name, properties: [], functionIds: [], navigationProperties: [] }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Bluebird `promisify(parser.parseString)` | xml2js built-in `parseStringPromise` | xml2js 0.4.22+ (2019) | Drop Bluebird dependency entirely |
| `azure-storage` SDK for blob upload | `@azure/storage-blob` SDK | 2020 (Phase 20 concern) | Phase 20 handles this |
| lz-string v1.3.x | lz-string v1.5.0 | June 2023 | Latest stable; v2.0 is still rc.0 pre-release |
| xml2js v0.4.x | xml2js v0.6.2 | July 2023 | Latest stable; no breaking changes to parseString API |

**Deprecated/outdated:**
- **Bluebird promisify:** Not needed; xml2js has native Promise support since 0.4.22. Legacy code used `import { promisify } from 'bluebird'` — replace with `parseStringPromise`.
- **azure-storage SDK:** Replaced by `@azure/storage-blob`. Not a Phase 19 concern but noted for completeness.
- **ROPC auth (Username/Password):** Legacy `metadataReader.ts` used `acquireTokenByUsernamePassword`. Phase 18 already replaced this with certificate-based client credentials.

## Legacy Parser Analysis

### Critical Behaviors to Replicate

**1. Function ID Assignment (Tricky)**
The legacy `extractFunctions` method uses `let i = 1` and `id: i++` inside the object literal. The increment happens BEFORE the Internal filter check. This means Internal functions consume ID numbers but are not included in the output. This gap in IDs is part of the golden reference.

**2. Function Processing Order**
Functions are processed in XML document order. The `i++` counter, alias dedup check, and `this.functions.push()` all depend on this order.

**3. Alias Dedup Two-Branch Logic**
```
if (aliases[name] && no existing function with alias name) -> rename
else if (aliases[name] && existing function with alias name) -> skip entirely
```

**4. underscore-to-dot replacement**
`funcImport.name = funcImport.name.replace(/_/gi, '.')` applies AFTER alias resolution. This means aliased functions like `social.following` are NOT further processed (they don't have underscores after aliasing).

**5. `isRoot` deletion pattern**
Always create with `isRoot: true`, set to `false` if `this` parameter exists, then delete if still true... wait, re-reading: `isRoot: true` is the default. If a `this` parameter is found, `isRoot = false`. Then `if (!funcImport.isRoot) { delete funcImport.isRoot }` — this means root functions KEEP `isRoot: true` in the JSON, and non-root functions have NO `isRoot` key. Frontend checks for `isRoot` property presence.

Actually re-reading more carefully: line 197-199: `if (!funcImport.isRoot) { delete funcImport.isRoot }`. So when `isRoot` is `false`, it gets deleted. When `isRoot` is `true`, it stays. This is an optimization to reduce JSON size.

**6. `isBindable` and `isComposable` conditionals**
These are set from XML attributes: `func.$.IsBindable ? func.$.IsBindable === 'true' : undefined`. So they're either `true` or `undefined`. When `undefined`, they don't appear in JSON serialization at all.

**7. `nullable` on Parameter**
Uses the FUNCTION's `$.Nullable`, not the parameter's: `nullable: func.$.Nullable ? func.$.Nullable === 'true' : undefined`. This looks like it might be a bug in the legacy code (applying function-level nullable to all parameters), but we must replicate it exactly.

**8. Association role resolution**
Navigation properties are resolved through associations. The relationship name is extracted by substring after last `.`, then looked up in the associations map. The `toRole` key is used to get the target type, which may be wrapped in `Collection()`.

### Frontend Contract (from app/src/lib/metadata/types.ts)

The frontend defines these types that MUST match the parser output:

```typescript
interface Property { name: string; typeName: string; nullable?: boolean }
interface NavigationProperty { typeName: string; name: string }
interface Parameter { name: string; typeName: string; nullable: boolean }
interface EntityType {
  name: string; fullName: string; alias?: string; baseTypeName?: string;
  properties: Property[]; functionIds: number[]; navigationProperties: NavigationProperty[];
}
interface FunctionImport {
  name: string; isRoot: boolean; isComposable: boolean; isBindable: boolean;
  returnType: string; parameters: Parameter[]; id: number;
}
interface Metadata {
  entities: Record<string, EntityType>;
  functions: Record<number, FunctionImport>;
}
```

Note: The frontend types have `isRoot: boolean` etc. as required, but the actual JSON has them as optional (deleted when false/undefined). TypeScript's structural typing means the parsed JSON is still compatible because missing properties are `undefined` at runtime.

## Open Questions

1. **Golden reference JSON format — pretty or compact?**
   - What we know: Legacy code uploaded `metadata.latest.json` with `JSON.stringify(parsed, null, 4)` (pretty-printed). The golden reference file likely has indentation.
   - What's unclear: Whether the current file at the blob URL has been re-uploaded since the legacy code ran, and in what format.
   - Recommendation: Download golden reference, parse it, re-stringify compact, then compare against new parser output. This normalizes whitespace differences. Alternatively, compare parsed objects with deep equality.

2. **Function ID gap behavior verification**
   - What we know: The legacy code creates the FunctionImport object (consuming an ID via `i++`) before checking Internal filter. Filtered functions consume IDs.
   - What's unclear: The exact ID gaps in the golden reference.
   - Recommendation: Download golden reference and inspect function IDs to confirm gap behavior. Test against golden reference will catch any deviation.

## Sources

### Primary (HIGH confidence)
- Legacy source code: `az-funcs/src/metadataParser.ts` (302 lines) — definitive parsing logic
- Legacy source code: `az-funcs/src/interfaces/` (7 interface files) — exact type shapes
- Legacy source code: `az-funcs/GenerateMetadata/index.ts` (50 lines) — pipeline orchestration
- Legacy source code: `az-funcs/src/metadataReader.ts` (40 lines) — fetch pattern
- Frontend types: `app/src/lib/metadata/types.ts` (92 lines) — consumer contract
- Phase 18 foundation: `backend/src/auth.ts`, `backend/package.json`, `backend/tsconfig.json`

### Secondary (MEDIUM confidence)
- xml2js npm README (https://www.npmjs.com/package/xml2js) — `parseStringPromise` API, version 0.6.2
- lz-string npm (https://www.npmjs.com/package/lz-string) — v1.5.0 latest stable, v2.0.0-rc.0 pre-release
- lz-string GitHub (https://github.com/pieroxy/lz-string) — `compressToUTF16` / `decompressFromUTF16` API
- @types/xml2js (https://www.npmjs.com/package/@types/xml2js) — v0.4.14
- axios documentation — AbortController signal support, responseType config

### Tertiary (LOW confidence)
- retry-axios / axios-retry documentation — reviewed for comparison but NOT using these libraries (hand-rolling retry per locked decisions)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are locked decisions matching legacy; versions verified on npm
- Architecture: HIGH - Legacy code provides exact implementation reference; patterns are straightforward port
- Pitfalls: HIGH - Derived from detailed line-by-line analysis of legacy parser code and real behaviors

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (stable domain, no rapidly changing dependencies)

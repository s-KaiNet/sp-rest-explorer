# Phase 18: Project Scaffolding & Auth Validation - Research

**Researched:** 2026-02-23
**Domain:** Azure Functions v4 Node.js + MSAL certificate-based auth for SharePoint
**Confidence:** HIGH

## Summary

This phase creates a new Azure Functions v4 (Node.js programming model) project in a `backend/` directory at the repository root. The function authenticates to SharePoint Online using MSAL Node's `ConfidentialClientApplication` with certificate-based client credentials (the only auth method SharePoint Online supports for app-only access). The function proves auth works by making a GET to `_api/web` and returning the response.

The stack is well-established: `@azure/functions` v4.x for the function framework, `@azure/msal-node` for token acquisition, and `axios` for HTTP requests. The v4 programming model uses code-centric function registration (`app.http()`) instead of `function.json` files. Certificate PEM values are stored in environment variables and loaded via `dotenv` for local development.

**Primary recommendation:** Use `@azure/functions` ^4.11.0, `@azure/msal-node` ^2.16.0 (LTS — v5 is too new with unclear migration docs), TypeScript 5.x strict mode, ESLint v9 flat config with `typescript-eslint`, and compute the SHA-256 thumbprint at startup using Node.js `crypto.X509Certificate`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- New `backend/` directory at repository root (sibling to `src/`)
- Fully independent from frontend — own package.json, tsconfig.json, node_modules
- No shared config, no monorepo workspaces
- Package manager: npm (same as frontend)
- Node.js target: Node 20 LTS
- PEM format stored in environment variables (not PFX, not file paths)
- Two separate env vars: one for the certificate PEM, one for the private key PEM
- Thumbprint computed from the cert PEM at startup using Node crypto — no separate thumbprint env var
- Auth logic in a separate module (`src/auth.ts` exporting a `getToken()` function) — reused by Phase 19+
- HTTP trigger returns the raw SharePoint `_api/web` JSON response — proves auth and shows real data
- Function key required from the start (not anonymous)
- dotenv loaded at application startup (import dotenv/config at entry point)
- No local.settings.json dependency — .env is the single source for local config
- ESLint flat config (`eslint.config.mjs`) — ESLint v9 modern style
- No automated tests this phase — the HTTP trigger calling `_api/web` is the validation
- NPM scripts: standard names (`build`, `start`, `lint`, `clean`)

### Claude's Discretion
- Whether to include a timer trigger stub alongside the HTTP trigger, or HTTP-only
- TypeScript compilation output directory structure
- Exact ESLint rules/presets to use
- Error handling shape (what the function returns on auth failure)
- host.json configuration details

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROJ-01 | New `functions/` directory with Azure Functions v4 project structure (package.json, tsconfig.json, host.json, .funcignore) | Standard Stack section — full project structure documented. Note: user decision overrides to `backend/` instead of `functions/` |
| PROJ-02 | TypeScript in strict mode with ESLint replacing deprecated TSLint | Standard Stack + ESLint v9 flat config pattern documented |
| PROJ-03 | All runtime dependencies installed and version-pinned | Standard Stack table with exact versions |
| AUTH-01 | Function authenticates to SharePoint using MSAL client credentials flow with certificate (not client secret, not ROPC) | Architecture Patterns — full MSAL cert auth pattern with code examples |
| AUTH-02 | Authentication credentials (tenant ID, client ID, certificate path/thumbprint, SP URL) configurable via environment variables | Architecture Patterns — env var pattern with dotenv, thumbprint auto-computed |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@azure/functions` | ^4.11.0 | Azure Functions v4 programming model | GA since Sep 2023, code-centric triggers, Node 20 support |
| `@azure/msal-node` | ^2.16.0 | MSAL token acquisition (client credentials + cert) | Official Microsoft auth library for Node.js daemons. Using v2.x LTS — v5.x is too new (Feb 2026), migration docs not yet published, GitHub issue #8326 confirms this |
| `axios` | ^1.7.0 | HTTP client for SharePoint REST API calls | Already used in legacy project, reliable, good error handling |
| `dotenv` | ^16.4.0 | Load .env file for local development | Standard for Node.js env var management, handles multiline PEM values |
| `typescript` | ^5.7.0 | TypeScript compiler | Latest stable 5.x, strict mode support |

### Dev Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@types/node` | ^20.0.0 | Node.js type definitions | Always — TypeScript compilation |
| `eslint` | ^9.0.0 | Linter | Replaces TSLint (deprecated), flat config system |
| `typescript-eslint` | ^8.0.0 | TypeScript ESLint integration | Single package replaces old `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` combo |
| `@eslint/js` | ^9.0.0 | ESLint recommended rules | Base rule set for flat config |
| `globals` | ^15.0.0 | Global variable definitions for ESLint | Node.js globals for flat config |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@azure/msal-node` v2.x | `@azure/msal-node` v5.x | v5 published Feb 2026, no migration guide yet (GitHub #8326), v2.x is LTS. Upgrade to v5 in future when docs stabilize |
| `axios` | Native `fetch` (Node 20) | Native fetch is available but axios has better error objects, interceptors, and legacy project familiarity |
| `dotenv` | `local.settings.json` | Azure Functions CLI uses local.settings.json by default, but user decision is .env as single source |

**Installation:**
```bash
# Runtime dependencies
npm install @azure/functions@^4.11.0 @azure/msal-node@^2.16.0 axios@^1.7.0 dotenv@^16.4.0

# Dev dependencies
npm install -D typescript@^5.7.0 @types/node@^20.0.0 eslint@^9.0.0 typescript-eslint@^8.0.0 @eslint/js@^9.0.0 globals@^15.0.0
```

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── src/
│   ├── functions/
│   │   └── validateAuth.ts      # HTTP trigger — calls auth + SP API
│   └── auth.ts                  # getToken() — MSAL cert auth module
├── dist/                        # Compiled JS output (gitignored)
├── .env                         # Local dev secrets (gitignored)
├── .env.example                 # Template showing required vars
├── .funcignore                  # Files excluded from deployment
├── .gitignore
├── eslint.config.mjs            # ESLint v9 flat config
├── host.json                    # Azure Functions host config
├── package.json                 # Dependencies + scripts + "main" entry
└── tsconfig.json                # TypeScript strict config
```

### Pattern 1: Azure Functions v4 HTTP Trigger (Code-Centric)
**What:** Register functions using `app.http()` instead of function.json files
**When to use:** All Azure Functions v4 projects
**Example:**
```typescript
// Source: https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function validateAuth(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Validate auth function triggered');

  try {
    const token = await getToken();
    // ... use token to call SharePoint
    return { status: 200, jsonBody: result };
  } catch (error) {
    context.log.error('Auth validation failed:', error);
    return { status: 500, jsonBody: { error: 'Authentication failed' } };
  }
}

app.http('validateAuth', {
  methods: ['GET'],
  authLevel: 'function',  // Requires function key
  handler: validateAuth,
});
```

### Pattern 2: MSAL Certificate-Based Client Credentials
**What:** Acquire token using certificate instead of client secret
**When to use:** All SharePoint app-only access scenarios (certificate is mandatory)
**Example:**
```typescript
// Source: https://learn.microsoft.com/en-us/entra/msal/javascript/node/certificate-credentials
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { X509Certificate } from 'node:crypto';

function computeThumbprint(certPem: string): string {
  const cert = new X509Certificate(certPem);
  // .fingerprint256 returns "AB:CD:EF:..." format
  // MSAL expects lowercase hex without colons
  return cert.fingerprint256.replace(/:/g, '').toLowerCase();
}

export async function getToken(): Promise<string> {
  const certPem = process.env.SP_CERT_PEM!;
  const keyPem = process.env.SP_KEY_PEM!;
  const thumbprint = computeThumbprint(certPem);

  const config: Configuration = {
    auth: {
      clientId: process.env.ENTRA_CLIENT_ID!,
      authority: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID!}`,
      clientCertificate: {
        thumbprintSha256: thumbprint,
        privateKey: keyPem,
      },
    },
  };

  const cca = new ConfidentialClientApplication(config);

  const result = await cca.acquireTokenByClientCredential({
    scopes: [`${process.env.SP_URL!}/.default`],
  });

  if (!result?.accessToken) {
    throw new Error('Failed to acquire access token');
  }

  return result.accessToken;
}
```

### Pattern 3: Environment Variables with dotenv
**What:** Load secrets from .env file at startup
**When to use:** Local development (Azure provides env vars natively in production)
**Example:**
```typescript
// At the top of the entry point file (loaded via package.json "main")
import 'dotenv/config';

// .env file format (multiline PEM values work naturally):
// ENTRA_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
// ENTRA_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
// SP_URL=https://yourtenant.sharepoint.com
// SP_CERT_PEM="-----BEGIN CERTIFICATE-----
// MIIDDzCCAfeg...
// -----END CERTIFICATE-----"
// SP_KEY_PEM="-----BEGIN PRIVATE KEY-----
// MIIEvgIBADANBg...
// -----END PRIVATE KEY-----"
```

### Pattern 4: SharePoint App-Only Scope
**What:** The correct OAuth scope for SharePoint app-only access
**When to use:** All SharePoint REST API calls with client credentials flow
**Critical detail:** The scope MUST be `https://{tenant}.sharepoint.com/.default` — not a specific permission like `Sites.Read.All`. The `.default` scope is required for client credentials flow (v2.0 endpoint). The actual permissions are controlled by the API permissions configured in the Entra ID app registration (e.g., `Sites.Read.All` application permission with admin consent).

### Anti-Patterns to Avoid
- **Using client secret for SharePoint:** SharePoint Online blocks client secrets for app-only access. Always returns `401 Unsupported app only token`. Certificates are the only option.
- **Using ROPC (username/password):** Legacy pattern from old codebase. Deprecated in MSAL, insecure, and unnecessary now that certificate auth is configured.
- **Hardcoding thumbprint in env vars:** User decision is to compute thumbprint from cert PEM at startup. Don't add a separate thumbprint env var.
- **Using `local.settings.json` as primary config:** User decision is `.env` only. The `local.settings.json` can exist but should be minimal (just runtime metadata, not secrets).
- **Module-scope ConfidentialClientApplication singleton:** For Phase 18 (single function), creating the CCA per invocation is fine. MSAL internally caches tokens. Phase 20 can optimize if needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT assertion for cert auth | Manual JWT creation with `jsonwebtoken` | `@azure/msal-node` ConfidentialClientApplication | MSAL handles JWT assertion creation, signing, token caching, retry internally |
| Certificate thumbprint | Manual DER parsing + SHA hash | `crypto.X509Certificate.fingerprint256` | Built into Node.js 15.6+, handles PEM parsing, returns SHA-256 |
| Token caching | In-memory cache map | MSAL's built-in token cache | MSAL caches tokens automatically, handles expiry and refresh |
| Environment variable loading | Custom file parser | `dotenv` package | Handles multiline values, comments, quoting edge cases |

**Key insight:** MSAL does the heavy lifting for certificate auth. The main complexity is properly formatting the PEM strings from environment variables and computing the thumbprint. Everything else (JWT assertion creation, token request, caching) is handled internally.

## Common Pitfalls

### Pitfall 1: PEM String Corruption from Environment Variables
**What goes wrong:** Certificate/key PEM values loaded from env vars have `\n` literal strings instead of actual newlines, or have carriage returns (`\r`) that MSAL rejects.
**Why it happens:** Shell environments and `.env` file parsers handle multiline values differently. Some tools convert newlines to literal `\n` strings.
**How to avoid:** Use `dotenv` which handles multiline quoted values correctly. If PEM comes with literal `\n`, replace them: `pem.replace(/\\n/g, '\n')`. If PEM has `\r\n`, strip carriage returns: `pem.replace(/\r/g, '')`.
**Warning signs:** MSAL error `AADSTS700027: Client assertion contains an invalid signature`.

### Pitfall 2: Wrong Scope Format for SharePoint
**What goes wrong:** Token request succeeds but SharePoint returns `401 Unsupported app only token` or `403 Access Denied`.
**Why it happens:** Using wrong scope format. Common mistakes: `https://microsoft.sharepoint.com/.default` (wrong domain), `Sites.Read.All` (not valid for client credentials), or `https://{tenant}.sharepoint.com/Sites.Read.All` (only .default works for client credentials).
**How to avoid:** Always use `https://{tenant}.sharepoint.com/.default` where `{tenant}` matches your actual SharePoint domain.
**Warning signs:** Token acquired successfully but API call fails with 401.

### Pitfall 3: Missing `"main"` Field in package.json
**What goes wrong:** `func start` shows no functions loaded.
**Why it happens:** Azure Functions v4 discovers functions via the `"main"` field in package.json, which must point to compiled JS output. Without it, the runtime doesn't know where to find function registrations.
**How to avoid:** Set `"main": "dist/src/functions/*.js"` in package.json (or a glob matching your compiled output).
**Warning signs:** `func start` starts without errors but lists 0 functions.

### Pitfall 4: `@azure/functions` in devDependencies Instead of Dependencies
**What goes wrong:** Functions work locally but fail in production.
**Why it happens:** In v3, `@azure/functions` was dev-only (just types). In v4, it contains runtime code and MUST be in `dependencies`.
**How to avoid:** Always install as production dependency: `npm install @azure/functions` (not `npm install -D`).
**Warning signs:** Works locally (dev dependencies installed), fails after deployment.

### Pitfall 5: SHA-1 vs SHA-256 Thumbprint Confusion
**What goes wrong:** MSAL error about invalid certificate or thumbprint.
**Why it happens:** MSAL supports both `thumbprint` (SHA-1, deprecated) and `thumbprintSha256` (recommended). Node.js `X509Certificate` has both `.fingerprint` (SHA-1, colon-separated) and `.fingerprint256` (SHA-256, colon-separated). Using the wrong one or wrong format.
**How to avoid:** Use `thumbprintSha256` property in MSAL config + `X509Certificate.fingerprint256`. Strip colons and lowercase the hex: `.fingerprint256.replace(/:/g, '').toLowerCase()`.
**Warning signs:** `AADSTS700027` error from Entra ID.

### Pitfall 6: Extension Bundle Version Mismatch
**What goes wrong:** `func start` fails with errors about missing extensions.
**Why it happens:** The `extensionBundle` in `host.json` must be compatible with the v4 programming model. Old bundle versions don't support v4.
**How to avoid:** Use `"version": "[4.*, 5.0.0)"` for the `Microsoft.Azure.Functions.ExtensionBundle` in host.json.
**Warning signs:** Runtime errors about missing binding extensions on `func start`.

## Code Examples

Verified patterns from official sources:

### Complete auth.ts Module
```typescript
// Source: Synthesized from official MSAL docs + Node.js crypto docs
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { X509Certificate } from 'node:crypto';

function computeThumbprint(certPem: string): string {
  const cert = new X509Certificate(certPem);
  return cert.fingerprint256.replace(/:/g, '').toLowerCase();
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function getToken(): Promise<string> {
  const certPem = getRequiredEnv('SP_CERT_PEM');
  const keyPem = getRequiredEnv('SP_KEY_PEM');
  const clientId = getRequiredEnv('ENTRA_CLIENT_ID');
  const tenantId = getRequiredEnv('ENTRA_TENANT_ID');
  const spUrl = getRequiredEnv('SP_URL');

  const thumbprint = computeThumbprint(certPem);

  const config: Configuration = {
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientCertificate: {
        thumbprintSha256: thumbprint,
        privateKey: keyPem,
      },
    },
  };

  const cca = new ConfidentialClientApplication(config);

  const result = await cca.acquireTokenByClientCredential({
    scopes: [`${spUrl}/.default`],
  });

  if (!result?.accessToken) {
    throw new Error('Failed to acquire access token from Entra ID');
  }

  return result.accessToken;
}
```

### Complete HTTP Trigger Function
```typescript
// Source: Azure Functions v4 docs + MSAL cert auth pattern
import 'dotenv/config';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import axios from 'axios';
import { getToken } from '../auth';

async function validateAuth(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Auth validation triggered');

  try {
    const token = await getToken();
    const spUrl = process.env.SP_URL!;

    const response = await axios.get(`${spUrl}/_api/web`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json;odata=verbose',
      },
    });

    return {
      status: 200,
      jsonBody: response.data,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    context.log.error('Auth validation failed:', message);
    return {
      status: 500,
      jsonBody: { error: message },
    };
  }
}

app.http('validateAuth', {
  methods: ['GET'],
  authLevel: 'function',
  handler: validateAuth,
});
```

### host.json Configuration
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

### package.json Key Fields
```json
{
  "name": "sp-rest-explorer-backend",
  "version": "2.0.0",
  "main": "dist/src/functions/*.js",
  "scripts": {
    "build": "tsc",
    "start": "npm run build && func start",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### tsconfig.json for Strict Mode
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ESLint v9 Flat Config
```javascript
// eslint.config.mjs
// Source: https://typescript-eslint.io/getting-started/
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default defineConfig(
  {
    ignores: ['dist/', 'node_modules/'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  }
);
```

### .funcignore
```
*.ts
*.js.map
.env
.env.*
local.settings.json
tsconfig.json
eslint.config.mjs
node_modules/
src/
.git/
.vscode/
```

### .env.example
```bash
# Entra ID (Azure AD) App Registration
ENTRA_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ENTRA_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# SharePoint Online
SP_URL=https://yourtenant.sharepoint.com

# Certificate (PEM format — include the BEGIN/END markers)
SP_CERT_PEM="-----BEGIN CERTIFICATE-----
...base64 encoded cert...
-----END CERTIFICATE-----"

# Private Key (PEM format — include the BEGIN/END markers)
SP_KEY_PEM="-----BEGIN PRIVATE KEY-----
...base64 encoded key...
-----END PRIVATE KEY-----"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| function.json trigger config | `app.http()` / `app.timer()` code registration | Azure Functions v4 (Sep 2023 GA) | No more function.json files, all config in code |
| `@azure/functions` in devDependencies | `@azure/functions` in dependencies | v4 programming model | Runtime code moved to npm package |
| ROPC (username/password) auth | Certificate client credentials | SharePoint security changes | ROPC deprecated, client secrets blocked for SP app-only |
| SHA-1 thumbprint (`thumbprint` prop) | SHA-256 thumbprint (`thumbprintSha256` prop) | MSAL Node recent versions | SHA-1 deprecated, SHA-256 recommended |
| `.eslintrc` + TSLint | `eslint.config.mjs` flat config | ESLint v9 (Apr 2024) | Flat config is default, old format deprecated |
| `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` | `typescript-eslint` single package | typescript-eslint v8 | Simplified setup, single import |
| `tseslint.config()` helper | `defineConfig()` from `eslint/config` | ESLint v9.22.0 (Mar 2025) | `tseslint.config()` deprecated in favor of core helper |

**Deprecated/outdated:**
- `function.json` files: Ignored when any v4 function is registered
- `TSLint`: Abandoned years ago, replaced by ESLint with typescript-eslint
- `azure-storage` package: Legacy project uses this. Phase 20 will use `@azure/storage-blob` instead
- `AzureWebJobsFeatureFlags: EnableWorkerIndexing`: Was required during v4 preview, no longer needed for GA
- MSAL `thumbprint` property: Deprecated in favor of `thumbprintSha256`

## Open Questions

1. **MSAL Node v2 vs v5 for new projects**
   - What we know: v5.0.4 is latest on npm (Feb 2026), v2.16.0 is LTS. GitHub issue #8326 confirms v4→v5 migration docs don't exist yet. The v5 breaking changes appear primarily in msal-browser, not msal-node.
   - What's unclear: Whether v5 msal-node has any relevant breaking changes for client credentials flow specifically.
   - Recommendation: Use v2.x LTS for safety. The `acquireTokenByClientCredential` API and `clientCertificate` config shape appear identical in both versions. Can upgrade later when docs clarize.

2. **Timer trigger stub**
   - What we know: User left this to Claude's discretion. Phase 20 will need a timer trigger.
   - Recommendation: Skip the timer stub — keep Phase 18 minimal with HTTP-only. Phase 20 will add the timer trigger when implementing the actual pipeline. Adding a stub now just creates a non-functional placeholder.

## Sources

### Primary (HIGH confidence)
- [Microsoft Learn: Azure Functions Node.js developer guide (v4)](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node) — Project structure, entry point, auth levels
- [Microsoft Learn: MSAL Node certificate credentials](https://learn.microsoft.com/en-us/entra/msal/javascript/node/certificate-credentials) — Certificate config, thumbprint, privateKey format
- [Microsoft Learn: Granting access via Entra ID App-Only](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/security-apponly-azuread) — SharePoint requires certificate for app-only, scope format `https://{tenant}.sharepoint.com/.default`
- [npm: @azure/functions v4.11.2](https://www.npmjs.com/package/@azure/functions) — Version confirmed, programming model version info
- [npm: @azure/msal-node v5.0.4 (latest) / v2.16.0 (LTS)](https://www.npmjs.com/package/@azure/msal-node) — Version info, LTS tag
- [typescript-eslint.io: Getting Started](https://typescript-eslint.io/getting-started/) — ESLint v9 flat config with defineConfig
- [Node.js crypto docs: X509Certificate](https://nodejs.org/api/crypto.html) — fingerprint256 property for SHA-256 thumbprint
- [GitHub: MSAL Node Configuration.ts](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/src/config/Configuration.ts) — `thumbprint` (deprecated) vs `thumbprintSha256` (recommended)
- [Microsoft Learn: Migrate to v4 Node.js programming model](https://learn.microsoft.com/en-us/azure/azure-functions/functions-node-upgrade-v4) — Migration requirements, entry point setup

### Secondary (MEDIUM confidence)
- [GitHub issue #8326: Migration v4 to v5](https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/8326) — Confirms migration docs not yet available (Feb 2026)
- [VSCode build pipeline](https://github.com/microsoft/vscode/blob/main/build/azure-pipelines/common/publish.ts) — Real-world usage of `thumbprintSha256` with MSAL Node
- [Medium: SharePoint App-Only Auth with certificates](https://medium.com/@rawandhawez/sharepoint-app-only-auth-when-client-secrets-fail-and-certificates-prevail-ca230b91a601) — Confirms client secrets don't work for SP app-only
- [StackOverflow: ADAL to MSAL for SharePoint Online](https://stackoverflow.com/questions/64128710/adal-to-msal-for-sharepoint-online) — Confirms `.default` scope requirement for client credentials

### Tertiary (LOW confidence)
- None — all findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — well-established packages, versions verified on npm, patterns from official docs
- Architecture: HIGH — v4 programming model is GA with clear docs, MSAL cert auth is well-documented
- Pitfalls: HIGH — documented from official MSAL troubleshooting, confirmed across multiple sources
- Thumbprint computation: HIGH — verified Node.js crypto API docs + MSAL source code + VSCode real-world usage

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (stable domain — 30 days)

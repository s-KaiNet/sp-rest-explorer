# Phase 18: User Setup Required

**Generated:** 2026-02-23
**Phase:** 18-project-scaffolding-auth-validation
**Status:** Incomplete

Complete these items for certificate-based SharePoint authentication to function. Claude automated all code and configuration; these items require human access to Azure Portal and SharePoint admin.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `ENTRA_TENANT_ID` | Azure Portal -> Entra ID -> App registrations -> your app -> Overview -> Directory (tenant) ID | `backend/.env` |
| [ ] | `ENTRA_CLIENT_ID` | Azure Portal -> Entra ID -> App registrations -> your app -> Overview -> Application (client) ID | `backend/.env` |
| [ ] | `SP_URL` | Your SharePoint Online root site URL, e.g. `https://yourtenant.sharepoint.com` | `backend/.env` |
| [ ] | `SP_CERT_PEM` | The PEM-encoded X.509 certificate uploaded to the app registration (include BEGIN/END markers) | `backend/.env` |
| [ ] | `SP_KEY_PEM` | The PEM-encoded private key corresponding to the uploaded certificate (include BEGIN/END markers) | `backend/.env` |

## Dashboard Configuration

- [ ] **Create or select an Entra ID app registration**
  - Location: Azure Portal -> Entra ID -> App registrations
  - Grant `Sites.Read.All` (Application) permission
  - Admin consent must be granted

- [ ] **Upload a self-signed certificate to the app registration**
  - Location: Azure Portal -> Entra ID -> App registrations -> your app -> Certificates & secrets -> Certificates -> Upload certificate
  - The certificate's public key (.cer/.pem) is uploaded here
  - Keep the private key (.key/.pem) for `SP_KEY_PEM`

## Verification

After completing setup:

```bash
# Copy the example env and fill in values
cp backend/.env.example backend/.env
# Edit backend/.env with your real credentials

# Start the function
cd backend && npm start

# Test the auth endpoint (local dev may not enforce function keys)
curl http://localhost:7071/api/validateAuth
```

Expected: HTTP 200 with SharePoint site JSON containing `d.Title`, `d.Url`, etc.

---

**Once all items complete:** Mark status as "Complete" at top of file.

import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { X509Certificate } from 'node:crypto';

/**
 * Read a required environment variable, throwing a descriptive error if missing.
 */
function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Compute the SHA-256 thumbprint of a PEM-encoded X.509 certificate.
 *
 * Node's X509Certificate.fingerprint256 returns colon-separated hex
 * (e.g. "AB:CD:EF:..."). MSAL expects lowercase hex without colons.
 */
function computeThumbprint(certPem: string): string {
  const cert = new X509Certificate(certPem);
  return cert.fingerprint256.replace(/:/g, '').toLowerCase();
}

/**
 * Normalise a PEM string that may have been corrupted by environment variable
 * handling — replace literal `\n` sequences with real newlines and strip
 * carriage returns.
 */
function normalisePem(pem: string): string {
  return pem.replace(/\\n/g, '\n').replace(/\r/g, '');
}

/**
 * Acquire a SharePoint access token using MSAL certificate-based client
 * credentials flow.
 *
 * Required environment variables:
 *   SP_CERT_PEM   — PEM-encoded X.509 certificate (including BEGIN/END markers)
 *   SP_KEY_PEM    — PEM-encoded private key (including BEGIN/END markers)
 *   ENTRA_CLIENT_ID  — Entra ID app registration client ID
 *   ENTRA_TENANT_ID  — Entra ID directory (tenant) ID
 *   SP_URL           — SharePoint Online root site URL
 */
export async function getToken(): Promise<string> {
  const certPem = normalisePem(getRequiredEnv('SP_CERT_PEM'));
  const keyPem = normalisePem(getRequiredEnv('SP_KEY_PEM'));
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

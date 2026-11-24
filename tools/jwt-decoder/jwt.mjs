/* jwt.mjs: decode a JSON Web Token, explain its claims and verify its signature, entirely in the browser (and in Node
   for tests). WebCrypto only: HS256/384/512 (secret), RS256/384/512, PS256/384/512, ES256/384/512 and EdDSA (Ed25519)
   with a PEM public key, a JWK or a JWKS. Nothing here talks to the network. */

const td = new TextDecoder('utf-8', { fatal: true });
const te = new TextEncoder();

export function b64urlToBytes(s) {
  const clean = String(s).replace(/=+$/, '').replace(/-/g, '+').replace(/_/g, '/');
  const bad = clean.search(/[^A-Za-z0-9+/]/);
  if (bad >= 0) throw new SyntaxError(`invalid character “${clean[bad]}” at position ${bad + 1}`);
  if (clean.length % 4 === 1) throw new SyntaxError('invalid length');
  const bin = atob(clean + '='.repeat((4 - (clean.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
export function bytesToB64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function part(seg, what) {
  let bytes;
  try { bytes = b64urlToBytes(seg); } catch (e) { throw new Error(`The ${what} is not valid base64url: ${e.message}.`); }
  let text;
  try { text = td.decode(bytes); } catch { throw new Error(`The ${what} is not UTF-8 text.`); }
  try { return { json: JSON.parse(text), text }; } catch { throw new Error(`The ${what} is not JSON.`); }
}

/** Decode without verifying. Never throws: problems come back in `errors` (plain English, the page translates keys). */
export function decode(input) {
  const token = String(input || '').trim().replace(/^bearer\s+/i, '').replace(/\s+/g, '');
  const out = { token, parts: token ? token.split('.') : [], header: null, payload: null, headerText: '', payloadText: '', errors: [] };
  if (!token) { out.errors.push('The token is empty.'); return out; }
  if (out.parts.length === 5) { out.errors.push('This is an encrypted token (JWE, 5 parts). Its payload can only be read with the private key.'); return out; }
  if (out.parts.length !== 3) { out.errors.push(`A JWT has 3 parts separated by dots; this has ${out.parts.length}.`); return out; }
  try { const h = part(out.parts[0], 'header'); out.header = h.json; out.headerText = h.text; } catch (e) { out.errors.push(e.message); }
  try { const p = part(out.parts[1], 'payload'); out.payload = p.json; out.payloadText = p.text; } catch (e) { out.errors.push(e.message); }
  return out;
}

/* Registered (RFC 7519) and common claims: what they mean, and which are times. */
export const KNOWN = {
  iss: 'issuer', sub: 'subject', aud: 'audience', exp: 'expires', nbf: 'not before', iat: 'issued at', jti: 'token ID',
  azp: 'authorized party', scope: 'scopes', scp: 'scopes', roles: 'roles', groups: 'groups', email: 'email', email_verified: 'email verified',
  name: 'name', given_name: 'given name', family_name: 'family name', preferred_username: 'username', sid: 'session ID', tid: 'tenant ID',
  oid: 'object ID', nonce: 'nonce', auth_time: 'authenticated at', acr: 'authentication context', amr: 'authentication methods', client_id: 'client ID'
};
const TIMES = new Set(['exp', 'nbf', 'iat', 'auth_time', 'updated_at']);

/** Claim rows and an overall status ('valid' | 'expired' | 'not-yet-valid' | 'no-expiry') at `now` (seconds). */
export function claims(header, payload, now = Math.floor(Date.now() / 1000)) {
  const rows = [];
  const warnings = [];
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    for (const [key, value] of Object.entries(payload)) {
      const time = TIMES.has(key) && typeof value === 'number' && Number.isFinite(value);
      rows.push({ key, value, known: key in KNOWN, meaning: KNOWN[key] || '', kind: time ? 'time' : 'value', date: time ? new Date(value * 1000) : null, delta: time ? value - now : null });
    }
  }
  const p = payload || {};
  let status = 'no-expiry';
  if (typeof p.exp === 'number') status = p.exp <= now ? 'expired' : 'valid';
  else warnings.push('no-exp');
  if (typeof p.nbf === 'number' && p.nbf > now) { warnings.push('not-yet-valid'); if (status === 'valid' || status === 'no-expiry') status = 'not-yet-valid'; }
  if (typeof p.iat === 'number' && p.iat > now + 60) warnings.push('iat-future');
  if (header && String(header.alg).toLowerCase() === 'none') warnings.push('alg-none');
  if (typeof p.exp === 'number' && typeof p.iat === 'number' && p.exp - p.iat > 365 * 86400) warnings.push('long-lived');
  return { rows, status, warnings };
}

const ALGS = {
  HS256: { kind: 'hmac', hash: 'SHA-256' }, HS384: { kind: 'hmac', hash: 'SHA-384' }, HS512: { kind: 'hmac', hash: 'SHA-512' },
  RS256: { kind: 'rsa', import: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, verify: { name: 'RSASSA-PKCS1-v1_5' } },
  RS384: { kind: 'rsa', import: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' }, verify: { name: 'RSASSA-PKCS1-v1_5' } },
  RS512: { kind: 'rsa', import: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' }, verify: { name: 'RSASSA-PKCS1-v1_5' } },
  PS256: { kind: 'rsa', import: { name: 'RSA-PSS', hash: 'SHA-256' }, verify: { name: 'RSA-PSS', saltLength: 32 } },
  PS384: { kind: 'rsa', import: { name: 'RSA-PSS', hash: 'SHA-384' }, verify: { name: 'RSA-PSS', saltLength: 48 } },
  PS512: { kind: 'rsa', import: { name: 'RSA-PSS', hash: 'SHA-512' }, verify: { name: 'RSA-PSS', saltLength: 64 } },
  ES256: { kind: 'ec', import: { name: 'ECDSA', namedCurve: 'P-256' }, verify: { name: 'ECDSA', hash: 'SHA-256' } },
  ES384: { kind: 'ec', import: { name: 'ECDSA', namedCurve: 'P-384' }, verify: { name: 'ECDSA', hash: 'SHA-384' } },
  ES512: { kind: 'ec', import: { name: 'ECDSA', namedCurve: 'P-521' }, verify: { name: 'ECDSA', hash: 'SHA-512' } },
  EdDSA: { kind: 'ed', import: { name: 'Ed25519' }, verify: { name: 'Ed25519' } },
  Ed25519: { kind: 'ed', import: { name: 'Ed25519' }, verify: { name: 'Ed25519' } }
};
export const SUPPORTED = Object.keys(ALGS);
export const isHmac = (alg) => ALGS[alg]?.kind === 'hmac';

function pemToDer(pem) {
  if (/BEGIN CERTIFICATE/.test(pem)) throw new Error('This is a certificate. Paste its public key (BEGIN PUBLIC KEY) or a JWK instead.');
  if (/BEGIN (RSA |EC )?PRIVATE KEY/.test(pem)) throw new Error('This is a private key. Never paste one into a web page; use the public key.');
  if (/BEGIN RSA PUBLIC KEY/.test(pem)) throw new Error('This is a PKCS#1 RSA key. Convert it to a “BEGIN PUBLIC KEY” (SPKI) key or paste a JWK.');
  const b = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, '').replace(/\s+/g, '');
  const bin = atob(b);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function publicKey(input, alg, kid) {
  const a = ALGS[alg];
  const text = String(input || '').trim();
  if (text.startsWith('-----BEGIN')) return crypto.subtle.importKey('spki', pemToDer(text), a.import, false, ['verify']);
  let jwk;
  try { jwk = JSON.parse(text); } catch { throw new Error('Paste the public key as PEM (BEGIN PUBLIC KEY), a JWK or a JWKS.'); }
  if (Array.isArray(jwk.keys)) {
    const keys = jwk.keys.filter((k) => !k.use || k.use === 'sig');
    jwk = keys.find((k) => kid && k.kid === kid) || keys.find((k) => !k.alg || k.alg === alg) || keys[0];
    if (!jwk) throw new Error('The JWKS has no signing key.');
  }
  if (jwk.d) throw new Error('This JWK contains a private key. Never paste one into a web page; use the public part.');
  const { alg: _a, key_ops: _k, use: _u, ext: _e, ...clean } = jwk;
  return crypto.subtle.importKey('jwk', clean, a.import, false, ['verify']);
}

/**
 * Verify a token's signature. `key` is the HMAC secret (text, or base64 with secretBase64) or a public key
 * (PEM, JWK, JWKS). Returns { ok, alg, reason }.
 */
export async function verify(token, key, { secretBase64 = false } = {}) {
  const d = decode(token);
  if (d.errors.length || !d.header) return { ok: false, reason: d.errors[0] || 'The token cannot be decoded.' };
  const alg = d.header.alg;
  if (String(alg).toLowerCase() === 'none') return { ok: false, alg, reason: 'alg is “none”: the token has no signature, so nobody should accept it.' };
  const a = ALGS[alg];
  if (!a) return { ok: false, alg, reason: `Algorithm ${alg} is not supported here.` };
  if (!String(key || '').trim()) return { ok: false, alg, reason: a.kind === 'hmac' ? 'Enter the secret.' : 'Paste the public key.' };
  let sig;
  try { sig = b64urlToBytes(d.parts[2]); } catch (e) { return { ok: false, alg, reason: 'The signature is not valid base64url: ' + e.message + '.' }; }
  const data = te.encode(d.parts[0] + '.' + d.parts[1]);
  try {
    if (a.kind === 'hmac') {
      const raw = secretBase64 ? b64urlToBytes(String(key).trim()) : te.encode(String(key));
      const k = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: a.hash }, false, ['verify']);
      return { ok: await crypto.subtle.verify('HMAC', k, sig, data), alg, reason: '' };
    }
    const k = await publicKey(key, alg, d.header.kid);
    return { ok: await crypto.subtle.verify(a.verify, k, sig, data), alg, reason: '' };
  } catch (e) {
    return { ok: false, alg, reason: e.message || String(e) };
  }
}

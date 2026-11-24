/* JWT decoder: decoding, claim analysis and signature verification. Tokens are signed here with WebCrypto. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decode, claims, verify, b64urlToBytes, bytesToB64url } from '../tools/jwt-decoder/jwt.mjs';

const te = new TextEncoder();
const enc = (o) => bytesToB64url(te.encode(JSON.stringify(o)));
const HASH = { 256: 'SHA-256', 384: 'SHA-384', 512: 'SHA-512' };

async function hs(payload, secret, bits = 256) {
  const head = enc({ alg: 'HS' + bits, typ: 'JWT' }), body = enc(payload);
  const key = await crypto.subtle.importKey('raw', te.encode(secret), { name: 'HMAC', hash: HASH[bits] }, false, ['sign']);
  return `${head}.${body}.${bytesToB64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, te.encode(head + '.' + body))))}`;
}
async function signed(alg, gen, signAlg, payload = { sub: '42' }) {
  const kp = await crypto.subtle.generateKey(gen, true, ['sign', 'verify']);
  const head = enc({ alg, typ: 'JWT', kid: 'k1' }), body = enc(payload);
  const sig = new Uint8Array(await crypto.subtle.sign(signAlg, kp.privateKey, te.encode(head + '.' + body)));
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', kp.publicKey));
  const pem = '-----BEGIN PUBLIC KEY-----\n' + Buffer.from(spki).toString('base64').match(/.{1,64}/g).join('\n') + '\n-----END PUBLIC KEY-----';
  const jwk = await crypto.subtle.exportKey('jwk', kp.publicKey);
  return { token: `${head}.${body}.${bytesToB64url(sig)}`, pem, jwk: { ...jwk, kid: 'k1' } };
}

test('base64url round trip, with and without padding', () => {
  const b = new Uint8Array([0, 251, 255, 62, 63, 1]);
  assert.deepEqual([...b64urlToBytes(bytesToB64url(b))], [...b]);
  assert.deepEqual([...b64urlToBytes('-_8=')], [...b64urlToBytes('-_8')]);
  assert.throws(() => b64urlToBytes('ab$c'), /character/);
});

test('decodes header and payload, strips Bearer, keeps Unicode', async () => {
  const t = await hs({ name: 'Zażółć gęślą 🦊', sub: '1' }, 's');
  const d = decode('  Bearer ' + t + '\n');
  assert.equal(d.header.alg, 'HS256');
  assert.equal(d.payload.name, 'Zażółć gęślą 🦊');
  assert.equal(d.parts.length, 3);
  assert.deepEqual(d.errors, []);
});

test('explains broken tokens instead of throwing', () => {
  assert.match(decode('').errors[0], /empty/i);
  assert.match(decode('abc').errors[0], /3 parts/);
  assert.match(decode('a.b.c.d.e').errors[0], /JWE/);
  assert.match(decode('e30.%%%.x').errors[0], /payload/i);
  assert.match(decode('eyJ.e30.').errors[0], /header/i);
});

test('claims: expiry, not-before, issued-at, alg none and missing exp', () => {
  const now = 1_800_000_000;
  const c = claims({ alg: 'none' }, { exp: now - 3600, iat: now - 7200, nbf: now + 60, sub: 'u', custom: 1 }, now);
  assert.equal(c.status, 'expired');
  assert.ok(c.warnings.includes('alg-none'));
  assert.ok(c.warnings.includes('not-yet-valid'));
  const known = c.rows.find((r) => r.key === 'exp');
  assert.equal(known.kind, 'time');
  assert.equal(known.date.toISOString(), new Date((now - 3600) * 1000).toISOString());
  assert.equal(c.rows.find((r) => r.key === 'custom').known, false);
  assert.equal(claims({ alg: 'HS256' }, { exp: now + 10 }, now).status, 'valid');
  assert.ok(claims({ alg: 'HS256' }, { sub: 'x' }, now).warnings.includes('no-exp'));
});

test('verifies HS256, HS384, HS512 and rejects a wrong secret or a changed payload', async () => {
  for (const bits of [256, 384, 512]) {
    const t = await hs({ sub: '1' }, 'top secret', bits);
    assert.equal((await verify(t, 'top secret')).ok, true, 'HS' + bits);
    assert.equal((await verify(t, 'other')).ok, false);
  }
  const t = await hs({ sub: '1' }, 'k');
  const [h, , s] = t.split('.');
  assert.equal((await verify(`${h}.${enc({ sub: '2' })}.${s}`, 'k')).ok, false);
  const b64 = Buffer.from('k').toString('base64');
  assert.equal((await verify(t, b64, { secretBase64: true })).ok, true);
});

test('verifies RS256, PS256, ES256, ES384 and EdDSA with a PEM, a JWK or a JWKS', async () => {
  const rsa = { modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' };
  const cases = [
    ['RS256', { name: 'RSASSA-PKCS1-v1_5', ...rsa }, { name: 'RSASSA-PKCS1-v1_5' }],
    ['PS256', { name: 'RSA-PSS', ...rsa }, { name: 'RSA-PSS', saltLength: 32 }],
    ['ES256', { name: 'ECDSA', namedCurve: 'P-256' }, { name: 'ECDSA', hash: 'SHA-256' }],
    ['ES384', { name: 'ECDSA', namedCurve: 'P-384' }, { name: 'ECDSA', hash: 'SHA-384' }],
    ['EdDSA', { name: 'Ed25519' }, { name: 'Ed25519' }]
  ];
  for (const [alg, gen, signAlg] of cases) {
    const { token, pem, jwk } = await signed(alg, gen, signAlg);
    assert.equal((await verify(token, pem)).ok, true, alg + ' PEM');
    assert.equal((await verify(token, JSON.stringify(jwk))).ok, true, alg + ' JWK');
    assert.equal((await verify(token, JSON.stringify({ keys: [{ ...jwk, kid: 'other' }, jwk] }))).ok, true, alg + ' JWKS');
    const other = await signed(alg, gen, signAlg);
    assert.equal((await verify(token, other.pem)).ok, false, alg + ' wrong key');
  }
});

test('refuses alg none and explains unusable keys', async () => {
  const none = `${enc({ alg: 'none' })}.${enc({ sub: 1 })}.`;
  assert.match((await verify(none, 'x')).reason, /none/);
  const t = await hs({ sub: 1 }, 'k');
  const rs = (await signed('RS256', { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, { name: 'RSASSA-PKCS1-v1_5' })).token;
  assert.match((await verify(rs, 'not a key')).reason, /PEM|JWK/);
  assert.match((await verify(rs, '-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----')).reason, /certificate/i);
  assert.equal((await verify(t, '')).ok, false);
});

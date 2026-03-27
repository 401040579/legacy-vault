/**
 * Lightweight JWT implementation using Node.js built-in crypto.
 * No external JWT library needed — keeps the Lambda package small.
 *
 * Algorithm: HS256 (HMAC-SHA256)
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

function base64url(input) {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return Buffer.from(str).toString('base64url');
}

function base64urlDecode(str) {
  return JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
}

function sign(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY,
  };
  const segments = `${base64url(header)}.${base64url(fullPayload)}`;
  const signature = createHmac('sha256', SECRET).update(segments).digest('base64url');
  return `${segments}.${signature}`;
}

function verify(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // Verify signature
  const expected = createHmac('sha256', SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  const sigBuffer = Buffer.from(signatureB64, 'base64url');
  const expBuffer = Buffer.from(expected, 'base64url');

  if (sigBuffer.length !== expBuffer.length || !timingSafeEqual(sigBuffer, expBuffer)) {
    return null;
  }

  // Decode payload
  const payload = base64urlDecode(payloadB64);

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    return null;
  }

  return payload;
}

/**
 * Extract userId from Authorization header.
 * Returns { userId } on success, or { error, statusCode } on failure.
 */
function authenticate(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token) {
    return { error: '缺少认证令牌', statusCode: 401 };
  }

  const payload = verify(token);
  if (!payload) {
    return { error: '无效或过期的令牌', statusCode: 401 };
  }

  return { userId: payload.sub, email: payload.email };
}

export { sign, verify, authenticate };

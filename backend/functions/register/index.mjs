/**
 * POST /api/auth/register
 *
 * Registers a new user. The client sends:
 *   - email: user's email
 *   - authHash: client-derived verification hash (master password NEVER transmitted)
 *   - encryptedSettings: optional encrypted user settings blob
 *
 * The server stores only the hash and ciphertext — zero knowledge of the actual password.
 */

import { randomUUID, createHash } from 'node:crypto';
import { sign } from './jwt.mjs';
import { putItem, queryIndex } from './db.mjs';
import { success, error, parseBody } from './response.mjs';

const USERS_TABLE = process.env.USERS_TABLE;

export async function handler(event) {
  const body = parseBody(event);
  const { email, authHash, userName, encryptedSettings } = body;

  // Validate required fields
  if (!email || !authHash) {
    return error('缺少必填字段: email, authHash', 400);
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already registered
  const existing = await queryIndex(USERS_TABLE, 'EmailIndex', 'email', normalizedEmail);
  if (existing.length > 0) {
    return error('该邮箱已注册', 409);
  }

  // Create user record
  const userId = randomUUID();
  const now = Date.now();

  // Hash the authHash again server-side for storage (double-hash pattern)
  const storedHash = createHash('sha256').update(authHash).digest('hex');

  const user = {
    userId,
    email: normalizedEmail,
    userName: userName || '',
    authHash: storedHash,
    encryptedSettings: encryptedSettings || null,
    lastHeartbeat: now,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(USERS_TABLE, user);

  // Generate JWT
  const token = sign({ sub: userId, email: normalizedEmail });

  return success({
    userId,
    email: normalizedEmail,
    token,
    message: '注册成功',
  }, 201);
}

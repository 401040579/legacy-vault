/**
 * POST /api/auth/login
 *
 * Authenticates a user. The client sends:
 *   - email: user's email
 *   - authHash: client-derived verification hash
 *
 * Server compares the double-hashed value against the stored hash.
 * Returns a JWT token on success.
 */

import { createHash, timingSafeEqual } from 'node:crypto';
import { sign } from './jwt.mjs';
import { queryIndex, updateItem } from './db.mjs';
import { success, error, parseBody } from './response.mjs';

const USERS_TABLE = process.env.USERS_TABLE;

export async function handler(event) {
  const body = parseBody(event);
  const { email, authHash } = body;

  if (!email || !authHash) {
    return error('缺少必填字段: email, authHash', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Look up user by email
  const users = await queryIndex(USERS_TABLE, 'EmailIndex', 'email', normalizedEmail);
  if (users.length === 0) {
    return error('邮箱或密码错误', 401);
  }

  const user = users[0];

  // Compare hashes using timing-safe comparison
  const incomingHash = createHash('sha256').update(authHash).digest('hex');
  const storedBuffer = Buffer.from(user.authHash, 'hex');
  const incomingBuffer = Buffer.from(incomingHash, 'hex');

  if (storedBuffer.length !== incomingBuffer.length ||
      !timingSafeEqual(storedBuffer, incomingBuffer)) {
    return error('邮箱或密码错误', 401);
  }

  // Update last login time
  await updateItem(USERS_TABLE, { userId: user.userId }, {
    lastLoginAt: Date.now(),
  });

  // Generate JWT
  const token = sign({ sub: user.userId, email: normalizedEmail });

  return success({
    userId: user.userId,
    email: normalizedEmail,
    userName: user.userName || '',
    token,
    message: '登录成功',
  });
}

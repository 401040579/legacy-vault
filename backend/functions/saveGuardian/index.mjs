/**
 * POST /api/guardians
 *
 * Adds or updates a guardian entry.
 *
 * Body:
 *   - guardianId: optional (omit for new, include for update)
 *   - encryptedData: encrypted guardian information
 */

import { randomUUID } from 'node:crypto';
import { authenticate } from './jwt.mjs';
import { putItem } from './db.mjs';
import { success, error, parseBody } from './response.mjs';

const GUARDIANS_TABLE = process.env.GUARDIANS_TABLE;

export async function handler(event) {
  const auth = authenticate(event);
  if (auth.error) return error(auth.error, auth.statusCode);

  const body = parseBody(event);
  const { guardianId, encryptedData } = body;

  if (!encryptedData) {
    return error('缺少加密数据', 400);
  }

  const now = Date.now();
  const id = guardianId || randomUUID();

  const item = {
    userId: auth.userId,
    guardianId: id,
    encryptedData,
    updatedAt: now,
  };

  if (!guardianId) {
    item.createdAt = now;
  }

  await putItem(GUARDIANS_TABLE, item);

  return success({
    guardianId: id,
    message: guardianId ? '守护人已更新' : '守护人已添加',
  }, guardianId ? 200 : 201);
}

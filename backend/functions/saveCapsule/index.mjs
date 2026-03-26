/**
 * POST /api/capsules
 *
 * Creates or updates a time capsule.
 *
 * Body:
 *   - capsuleId: optional (omit for new, include for update)
 *   - encryptedData: encrypted capsule content
 */

import { randomUUID } from 'node:crypto';
import { authenticate } from '/opt/nodejs/jwt.mjs';
import { putItem } from '/opt/nodejs/db.mjs';
import { success, error, parseBody } from '/opt/nodejs/response.mjs';

const CAPSULES_TABLE = process.env.CAPSULES_TABLE;

export async function handler(event) {
  const auth = authenticate(event);
  if (auth.error) return error(auth.error, auth.statusCode);

  const body = parseBody(event);
  const { capsuleId, encryptedData } = body;

  if (!encryptedData) {
    return error('缺少加密数据', 400);
  }

  const now = Date.now();
  const id = capsuleId || randomUUID();

  const item = {
    userId: auth.userId,
    capsuleId: id,
    encryptedData,
    updatedAt: now,
  };

  if (!capsuleId) {
    item.createdAt = now;
  }

  await putItem(CAPSULES_TABLE, item);

  return success({
    capsuleId: id,
    message: capsuleId ? '时间胶囊已更新' : '时间胶囊已创建',
  }, capsuleId ? 200 : 201);
}

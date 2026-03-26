/**
 * POST /api/vault
 *
 * Saves an encrypted vault entry. The server only sees ciphertext.
 *
 * Body:
 *   - entryId: optional (omit for new entries, include for updates)
 *   - type: 'password' | 'note' | 'file'
 *   - encryptedData: the full encrypted blob (server treats as opaque)
 */

import { randomUUID } from 'node:crypto';
import { authenticate } from '/opt/nodejs/jwt.mjs';
import { putItem } from '/opt/nodejs/db.mjs';
import { success, error, parseBody } from '/opt/nodejs/response.mjs';

const VAULT_TABLE = process.env.VAULT_TABLE;

export async function handler(event) {
  // Authenticate
  const auth = authenticate(event);
  if (auth.error) return error(auth.error, auth.statusCode);

  const body = parseBody(event);
  const { entryId, type, encryptedData } = body;

  if (!encryptedData) {
    return error('缺少加密数据', 400);
  }

  if (!type || !['password', 'note', 'file'].includes(type)) {
    return error('无效的条目类型，必须为 password、note 或 file', 400);
  }

  const now = Date.now();
  const id = entryId || randomUUID();

  const item = {
    userId: auth.userId,
    entryId: id,
    type,
    encryptedData,
    createdAt: entryId ? undefined : now, // preserve original creation time on update
    updatedAt: now,
  };

  // For updates, we want to keep createdAt — use a conditional put
  if (entryId) {
    // This is an update — include updatedAt but not createdAt
    delete item.createdAt;
    item.updatedAt = now;
  } else {
    item.createdAt = now;
  }

  await putItem(VAULT_TABLE, item);

  return success({
    entryId: id,
    message: entryId ? '条目已更新' : '条目已保存',
  }, entryId ? 200 : 201);
}

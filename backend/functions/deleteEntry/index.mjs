/**
 * DELETE /api/vault/{entryId}
 *
 * Deletes a specific vault entry for the authenticated user.
 */

import { authenticate } from './jwt.mjs';
import { deleteItem, getItem } from './db.mjs';
import { success, error } from './response.mjs';

const VAULT_TABLE = process.env.VAULT_TABLE;

export async function handler(event) {
  const auth = authenticate(event);
  if (auth.error) return error(auth.error, auth.statusCode);

  const entryId = event.pathParameters?.entryId;
  if (!entryId) {
    return error('缺少 entryId', 400);
  }

  // Verify the entry belongs to this user before deleting
  const existing = await getItem(VAULT_TABLE, {
    userId: auth.userId,
    entryId,
  });

  if (!existing) {
    return error('条目不存在', 404);
  }

  await deleteItem(VAULT_TABLE, {
    userId: auth.userId,
    entryId,
  });

  return success({ message: '条目已删除' });
}

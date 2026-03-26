/**
 * GET /api/vault
 *
 * Returns all encrypted vault entries for the authenticated user.
 * Data is still ciphertext — the client decrypts locally.
 */

import { authenticate } from '/opt/nodejs/jwt.mjs';
import { queryItems } from '/opt/nodejs/db.mjs';
import { success, error } from '/opt/nodejs/response.mjs';

const VAULT_TABLE = process.env.VAULT_TABLE;

export async function handler(event) {
  const auth = authenticate(event);
  if (auth.error) return error(auth.error, auth.statusCode);

  const entries = await queryItems(VAULT_TABLE, 'userId', auth.userId);

  // Sort by updatedAt descending
  entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return success({
    entries,
    count: entries.length,
  });
}

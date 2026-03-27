/**
 * GET /api/guardians
 *
 * Returns all guardian entries for the authenticated user.
 */

import { authenticate } from './jwt.mjs';
import { queryItems } from './db.mjs';
import { success, error } from './response.mjs';

const GUARDIANS_TABLE = process.env.GUARDIANS_TABLE;

export async function handler(event) {
  const auth = authenticate(event);
  if (auth.error) return error(auth.error, auth.statusCode);

  const guardians = await queryItems(GUARDIANS_TABLE, 'userId', auth.userId);

  guardians.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  return success({
    guardians,
    count: guardians.length,
  });
}

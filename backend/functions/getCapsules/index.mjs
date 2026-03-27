/**
 * GET /api/capsules
 *
 * Returns all time capsule entries for the authenticated user.
 */

import { authenticate } from './jwt.mjs';
import { queryItems } from './db.mjs';
import { success, error } from './response.mjs';

const CAPSULES_TABLE = process.env.CAPSULES_TABLE;

export async function handler(event) {
  const auth = authenticate(event);
  if (auth.error) return error(auth.error, auth.statusCode);

  const capsules = await queryItems(CAPSULES_TABLE, 'userId', auth.userId);

  capsules.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return success({
    capsules,
    count: capsules.length,
  });
}

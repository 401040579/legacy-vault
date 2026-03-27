/**
 * POST /api/heartbeat
 *
 * Survival verification heartbeat.
 * The user's client calls this periodically to confirm "I'm still here."
 * Updates the lastHeartbeat timestamp on the user record.
 *
 * This is the backend component of the living verification protocol.
 */

import { authenticate } from './jwt.mjs';
import { updateItem } from './db.mjs';
import { success, error } from './response.mjs';

const USERS_TABLE = process.env.USERS_TABLE;

export async function handler(event) {
  const auth = authenticate(event);
  if (auth.error) return error(auth.error, auth.statusCode);

  const now = Date.now();

  await updateItem(USERS_TABLE, { userId: auth.userId }, {
    lastHeartbeat: now,
    updatedAt: now,
  });

  return success({
    lastHeartbeat: now,
    message: '心跳已记录',
  });
}

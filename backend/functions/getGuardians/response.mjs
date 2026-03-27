/**
 * Standardized HTTP response helpers for Lambda functions.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

function success(body, statusCode = 200) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function error(message, statusCode = 400) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return {};
  }
}

export { success, error, parseBody };

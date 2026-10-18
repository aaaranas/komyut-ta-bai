import { createHash, timingSafeEqual } from "node:crypto";

/** Header carrying the random per-device identifier generated on the client. */
export const DEVICE_HEADER = "x-komyut-device";
export const LAB_KEY_HEADER = "x-komyut-lab-key";

const DEVICE_ID = /^[A-Za-z0-9-]{16,64}$/;

/**
 * Pseudonymous contributor identifier: a salted hash of the device id. No
 * account exists yet (authentication is deferred), so this keeps reports
 * linkable for reputation and withdrawal without storing the device id.
 * Set KOMYUT_PSEUDONYM_SALT in any shared deployment.
 */
export function pseudonymize(deviceId: string): string {
  const salt = process.env.KOMYUT_PSEUDONYM_SALT ?? "komyut-dev-salt";
  return `p-${createHash("sha256").update(`${salt}:${deviceId}`).digest("hex").slice(0, 20)}`;
}

export function contributorOf(request: Request): string | null {
  const device = request.headers.get(DEVICE_HEADER);
  return device && DEVICE_ID.test(device) ? pseudonymize(device) : null;
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

/** Runs a handler, mapping HttpError to a JSON error response. */
export async function handle(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error(error);
    return json({ error: "Something went wrong on our side." }, 500);
  }
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body;
  } catch {
    // fall through
  }
  throw new HttpError(400, "Expected a JSON object body.");
}

export function requireContributor(request: Request): string {
  const contributor = contributorOf(request);
  if (!contributor) throw new HttpError(400, "Missing or malformed device identifier.");
  return contributor;
}

/**
 * Research console gate. Authentication is out of scope for now; when
 * KOMYUT_LAB_KEY is set, lab endpoints require it as a shared key.
 */
export function requireLabAccess(request: Request): void {
  const expected = process.env.KOMYUT_LAB_KEY;
  if (!expected) return;
  const given = request.headers.get(LAB_KEY_HEADER) ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new HttpError(401, "Lab key required.");
  }
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

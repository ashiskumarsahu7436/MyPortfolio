import { neon } from "@neondatabase/serverless";

/**
 * Returns a Neon SQL tagged-template client.
 * Called fresh on every request — never cached (serverless best practice).
 */
export function getDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. " +
        "Add it from your Neon dashboard → Connection string (pooled)."
    );
  }
  return neon(url);
}

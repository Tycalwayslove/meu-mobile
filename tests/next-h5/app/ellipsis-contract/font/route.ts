import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  const font = await readFile(
    join(
      process.cwd(),
      "node_modules",
      "next",
      "dist",
      "next-devtools",
      "server",
      "font",
      "geist-mono-latin.woff2"
    )
  );

  return new Response(new Uint8Array(font), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "font/woff2"
    }
  });
}

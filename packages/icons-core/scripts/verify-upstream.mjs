/* global AbortSignal, console, fetch */

import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const packageDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const lock = JSON.parse(await readFile(join(packageDirectory, "icons.lock.json"), "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function digest(algorithm, value, encoding = "hex") {
  return createHash(algorithm).update(value).digest(encoding);
}

function readTarEntries(archive) {
  const entries = new Map();
  for (let offset = 0; offset + 512 <= archive.length;) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");
    const prefix = header.subarray(345, 500).toString("utf8").replace(/\0.*$/, "");
    const path = prefix ? `${prefix}/${name}` : name;
    const sizeText = header.subarray(124, 136).toString("ascii").replace(/\0.*$/, "").trim();
    const size = Number.parseInt(sizeText || "0", 8);
    assert(Number.isSafeInteger(size), `${path}: invalid tar entry size`);
    const contentStart = offset + 512;
    entries.set(path, archive.subarray(contentStart, contentStart + size));
    offset = contentStart + Math.ceil(size / 512) * 512;
  }
  return entries;
}

const response = await fetch(lock.upstream.archiveUrl, {
  redirect: "follow",
  signal: AbortSignal.timeout(30_000)
});
assert(response.ok, `Could not download upstream archive: HTTP ${response.status}`);
const compressedArchive = Buffer.from(await response.arrayBuffer());
const actualIntegrity = `sha512-${digest("sha512", compressedArchive, "base64")}`;
assert(actualIntegrity === lock.upstream.archiveIntegrity, "Upstream archive integrity mismatch");

const entries = readTarEntries(gunzipSync(compressedArchive));
for (const icon of lock.icons) {
  const archiveSource = entries.get(`package/icons/${icon.upstream}.svg`);
  assert(archiveSource, `${icon.id}: source is absent from the upstream archive`);
  const vendoredSource = await readFile(join(packageDirectory, icon.source));
  assert(archiveSource.equals(vendoredSource), `${icon.id}: vendored SVG differs from the archive`);
  assert(digest("sha256", archiveSource) === icon.sourceSha256, `${icon.id}: source hash mismatch`);
}

const archiveLicense = entries.get("package/LICENSE");
assert(archiveLicense, "The upstream archive does not contain LICENSE");
const vendoredLicense = await readFile(join(packageDirectory, lock.upstream.licenseFile));
assert(archiveLicense.equals(vendoredLicense), "Bundled Lucide license differs from the archive");

console.log(
  `Verified ${lock.icons.length} icon sources and LICENSE from ${lock.upstream.package}@${lock.upstream.version}.`
);

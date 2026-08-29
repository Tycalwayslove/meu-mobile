# @meu/icons-core

This private package exposes a small, platform-neutral registry of SVG nodes. The `meuIcon*` names
are stable Meu API names; they do not claim that Meu created the geometry. Every current node comes
unchanged from `lucide-static@1.34.0`, and Lucide identifies all five selected icons as derived from
Feather Icons.

## Provenance files

- `icons.lock.json` fixes the npm archive integrity, Lucide Git commit, source-file hashes, Meu IDs,
  upstream names, React exports, modification state, and license files.
- `upstream/lucide-static-1.34.0/icons/` contains only the five selected upstream SVG snapshots.
- `src/icons.ts` and `src/icons.manifest.json` are generated from the lock and snapshots.
- `THIRD_PARTY_NOTICES.md` and `licenses/` ship the upstream notices and full license texts.

## Local commands

```sh
pnpm --filter @meu/icons-core icons:generate
pnpm --filter @meu/icons-core icons:check
pnpm --filter @meu/icons-core icons:upstream:verify
```

`icons:generate` and `icons:check` are offline. The check fails if a snapshot, license, generated
file, or checksum drifts. `icons:upstream:verify` is the only networked command: it downloads the
fixed npm archive into memory, verifies its SHA-512 integrity, and compares the selected files with
the checked-in snapshots. A network or checksum failure stops the command without writing files.

## Updating an icon source

Treat a source update as a reviewed dependency change. Pin a new immutable version and commit,
record the new archive and file hashes, refresh the license snapshot, then run all three commands.
Do not copy geometry into `src/icons.ts` or infer upstream ownership from a Meu export name.

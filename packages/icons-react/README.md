# @meu/icons-react

This private package renders the curated registry from `@meu/icons-core` as React SVG components.
Names such as `MeuIconSearch` are stable Meu API names, not authorship claims. The geometry's exact
Lucide and Feather provenance, immutable source lock, notices, and licenses live in
`@meu/icons-core`.

See `src/MeuIcon.docs.mdx` for runtime and accessibility behavior. Run the core icon pipeline before
accepting any geometry change:

```sh
pnpm --filter @meu/icons-core icons:check
```

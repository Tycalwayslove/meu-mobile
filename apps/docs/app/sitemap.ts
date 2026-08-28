import type { MetadataRoute } from "next";

import { componentDocs } from "./_data/components";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://meu-mobile.vercel.app").replace(
    /\/$/,
    ""
  );
  const routes = ["", "/components", "/getting-started", "/foundations", "/lab"];
  return [
    ...routes.map((route) => ({ url: `${base}${route}`, changeFrequency: "weekly" as const })),
    ...componentDocs.map((component) => ({
      url: `${base}/components/${component.slug}`,
      changeFrequency: "weekly" as const
    }))
  ];
}

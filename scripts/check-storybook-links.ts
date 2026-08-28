import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { componentDocs } from "../apps/docs/app/_data/components";
import { componentStoryIds } from "../apps/docs/app/_data/storybook-links";

type StorybookIndexEntry = {
  id: string;
  name: string;
  title: string;
  type: "docs" | "story";
};

type StorybookIndex = {
  entries?: Record<string, StorybookIndexEntry>;
};

const indexPath = resolve(process.argv[2] || "apps/storybook/storybook-static/index.json");
const index = JSON.parse(await readFile(indexPath, "utf8")) as StorybookIndex;

if (!index.entries) {
  throw new Error(`Storybook index has no entries: ${indexPath}`);
}

const errors: string[] = [];
const entries = Object.values(index.entries);
const storyEntries = new Map(
  entries.filter((entry) => entry.type === "story").map((entry) => [entry.id, entry])
);
const docsTitles = new Set(
  entries.filter((entry) => entry.type === "docs").map((entry) => entry.title)
);
const componentSlugs = new Set(componentDocs.map((component) => component.slug));
const mappedSlugs = new Set(Object.keys(componentStoryIds));

for (const slug of componentSlugs) {
  if (!mappedSlugs.has(slug))
    errors.push(`Missing explicit Storybook mapping for component slug: ${slug}`);
}

for (const slug of mappedSlugs) {
  if (!componentSlugs.has(slug))
    errors.push(`Storybook mapping has no matching component page: ${slug}`);
}

const componentsWithoutStories: string[] = [];
for (const component of componentDocs) {
  const mappedId = componentStoryIds[component.slug as keyof typeof componentStoryIds];

  if (!mappedId) {
    componentsWithoutStories.push(`${component.name} (${component.slug})`);
    if (component.storyId)
      errors.push(`${component.slug} exposes ${component.storyId}, but its mapping is null`);
    continue;
  }

  if (component.storyId !== mappedId) {
    errors.push(
      `${component.slug} resolves to ${component.storyId || "no story"}; expected ${mappedId}`
    );
  }

  const story = storyEntries.get(mappedId);
  if (!story) {
    errors.push(`${component.slug} points to a missing Storybook story: ${mappedId}`);
    continue;
  }

  if (!component.storyTitle) {
    errors.push(`${component.slug} has a story ID but no expected Storybook title`);
  } else if (story.title !== component.storyTitle) {
    errors.push(
      `${component.slug} points to Storybook title ${story.title}; expected ${component.storyTitle}`
    );
  }

  if (!docsTitles.has(story.title)) {
    errors.push(`${component.slug} has no Autodocs entry for Storybook title: ${story.title}`);
  }
}

if (errors.length > 0) {
  console.error(`Storybook link validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${componentDocs.length - componentsWithoutStories.length} component links against ${storyEntries.size} stories.`
  );
  console.log(`Autodocs entries cover every linked Storybook title.`);
}

if (componentsWithoutStories.length > 0) {
  console.log(`Components without stories (${componentsWithoutStories.length}):`);
  for (const component of componentsWithoutStories) console.log(`- ${component}`);
}

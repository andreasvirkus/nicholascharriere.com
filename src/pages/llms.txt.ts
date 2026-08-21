import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const SITE = "https://nicholascharriere.com";

export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog", ({ data }) => data.published)).sort(
    (a, b) => (a.data.published < b.data.published ? 1 : -1),
  );

  const postLines = posts
    .map((p) => {
      const date = p.data.published.toISOString().slice(0, 10);
      const tags = p.data.tags?.length ? ` — tags: ${p.data.tags.join(", ")}` : "";
      return `- [${p.data.title}](${SITE}/blog/${p.slug}.md) (${date})${tags}`;
    })
    .join("\n");

  const body = `# Nicholas Charriere

> Personal website of Nicholas Charriere (Nick) — engineer and founder in San Francisco.
> Writing about AI agents, coding agents, agent infrastructure, harnesses, startups, and building software.
> French & British, based in the SF Bay Area. Socials: @nichochar everywhere.

Every blog post is available as clean Markdown by appending \`.md\` to its URL
(e.g. ${SITE}/blog/the-great-convergence.md).

## Blog
${postLines}

## Pages
- [Home](${SITE}/): intro and links
- [Blog](${SITE}/blog): all writing
- [Projects](${SITE}/projects): projects and side work
- [Reading](${SITE}/reading): books and reading list
- [Quotes](${SITE}/quotes): collected quotes
- [TIL](${SITE}/til): today-I-learned notes
- [Watching](${SITE}/watching): things worth watching

## Meta
- Sitemap: ${SITE}/sitemap-index.xml
- RSS feed: ${SITE}/rss.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

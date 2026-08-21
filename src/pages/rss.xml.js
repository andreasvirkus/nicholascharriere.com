import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const SITE = "https://nicholascharriere.com";
const parser = new MarkdownIt({ html: true, linkify: true });

// Turn a raw MDX body into clean HTML for full-text feed readers.
// Mirrors the cleaning in blog/[slug].md.ts: strip JS import/export lines and
// drop <Image /> components (they reference build-optimized local assets that
// have no stable public URL to embed in a feed).
function bodyToHtml(body) {
  const markdown = body
    .split("\n")
    .filter((line) => !/^\s*import\s.+from\s.+;?\s*$/.test(line))
    .filter((line) => !/^\s*export\s/.test(line))
    .join("\n")
    .replace(/<Image[\s\S]*?\/>/g, "")
    .trim();

  return sanitizeHtml(parser.render(markdown), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "sup",
      "sub",
      "small",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        // Resolve root-relative links to absolute so they work in readers.
        if (attribs.href && attribs.href.startsWith("/")) {
          attribs.href = SITE + attribs.href;
        }
        return { tagName, attribs };
      },
    },
  });
}

export async function GET(context) {
  const posts = (await getCollection("blog", ({ data }) => data.published)).sort(
    (a, b) => (a.data.published < b.data.published ? 1 : -1),
  );

  return rss({
    title: "Nicholas Charriere",
    description:
      "Writing about AI agents, coding agents, agent infrastructure, harnesses, startups, and building software.",
    site: context.site ?? SITE,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.published,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
      content: bodyToHtml(post.body),
    })),
    customData: `<language>en-us</language>`,
  });
}

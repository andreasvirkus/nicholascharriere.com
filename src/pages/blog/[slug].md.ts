import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => data.published);
  return posts.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: Awaited<ReturnType<typeof getCollection>>[number] };
  const { title, published, tags } = entry.data;

  // entry.body is the raw MDX source. Strip JS import/export lines and
  // convert Astro <Image .../> components to plain markdown-ish references
  // so the output reads as clean Markdown for LLMs.
  const cleaned = entry.body
    .split("\n")
    .filter((line) => !/^\s*import\s.+from\s.+;?\s*$/.test(line))
    .filter((line) => !/^\s*export\s/.test(line))
    .join("\n")
    .replace(/<Image[^>]*alt=["']([^"']*)["'][^>]*\/>/g, "![$1]()")
    .replace(/<Image[^>]*\/>/g, "")
    .trim();

  // Avoid a duplicate H1 when the post body already opens with its own title.
  const bodyStartsWithH1 = /^#\s+\S/.test(cleaned);
  const date = published.toISOString().slice(0, 10);
  const front = [
    ...(bodyStartsWithH1 ? [] : [`# ${title}`, ""]),
    `> Published ${date}${tags?.length ? ` · ${tags.join(", ")}` : ""}`,
    `> Source: https://nicholascharriere.com/blog/${entry.slug}`,
    "",
  ].join("\n");

  return new Response(`${front}${cleaned}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};

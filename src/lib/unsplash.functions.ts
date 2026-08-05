import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ query: z.string().min(1).max(120) });

export const searchUnsplashPhoto = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) return { url: null as string | null };

    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", `${data.query} car`);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "portrait");
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${key}`,
        "Accept-Version": "v1",
      },
    });
    if (!res.ok) return { url: null as string | null };

    const json = (await res.json()) as {
      results?: Array<{ urls?: { regular?: string; full?: string } }>;
    };
    const photo = json.results?.[0]?.urls;
    return { url: (photo?.regular ?? photo?.full ?? null) as string | null };
  });

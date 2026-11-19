import { error } from "@sveltejs/kit";
import { bySlug } from "$lib/typologies.ts";

export function load({ params }) {
  const t = bySlug(params.slug);
  if (!t) error(404, "Not found");
  return { t };
}

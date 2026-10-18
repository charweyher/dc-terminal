import type { MetadataRoute } from "next";
import { loadFacilities } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const STATIC_ROUTES = [
  "",
  "/learn",
  "/map",
  "/facilities",
  "/behind-the-meter",
  "/water",
  "/methodology",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const facilities = loadFacilities();
  const states = [...new Set(facilities.map((f) => f.location.state.toLowerCase()))];

  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...states.map((code) => ({ url: `${SITE_URL}/states/${code}` })),
    ...facilities.map((f) => ({ url: `${SITE_URL}/facilities/${f.id}` })),
  ];
}

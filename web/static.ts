import { api } from "encore.dev/api";

// Serves the single-page app in ./public for every path that isn't an API.
// "/!path" is Encore's fallback route, so it never shadows /api/* endpoints.
export const assets = api.static({
  expose: true,
  path: "/!path",
  dir: "./public",
  notFound: "./public/index.html",
  notFoundStatus: 200,
});

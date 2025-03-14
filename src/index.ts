import { promises as fs } from "fs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import path from "node:path";
import {
  getImageByDate,
  getImageByIndex,
  getImageRandom,
} from "./images/image.utils";
import { ImageType } from "./types/image-type";
import data from "../json/data.json"; // Bundle JSON directly
import { querystringSchema } from "./schemas/querystring-schema";
import { zValidator } from "@hono/zod-validator";
import {
  queryMapping,
  transformQueryParams,
} from "./constants/query-mapping.const";

const BASE_URL = "https://www.bing.com";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Apply CORS middleware
app.use("*", cors({ origin: "*", allowMethods: ["GET"] }));

// Favicon route
app.get("/favicon.ico", (c) => c.body(null, 204));

// Main route
app.get("/", zValidator("query", querystringSchema.nonstrict()), async (c) => {
  const query = c.req.valid("query");
  const { date, index, format, resolution, ...params } = query;

  let image: ImageType & { url?: string };

  if (index === "random") {
    image = getImageRandom(data);
  } else if (date) {
    image = getImageByDate(data, date);
  } else {
    image = getImageByIndex(data, index || 0);
  }

  const imgPath = `${image.urlbase}_${resolution}.jpg`;

  // Convert remaining parameters to URLSearchParams
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      const mappedKey = transformQueryParams(key);
      searchParams.set(mappedKey, String(value));
    }
  }
  const search = searchParams.toString();

  const url = `${BASE_URL}${imgPath}` + (search ? `&${search}` : "");

  if (format === "json") {
    return c.json({ ...image, url });
  }

  return c.redirect(url, 307);
});

// Global error handler
app.onError((err, c) => {
  console.error("Error:", err.message);
  return c.json({ error: err.message }, 400);
});

export default app;

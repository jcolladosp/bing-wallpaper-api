import { z } from "zod";
import { resolutions } from "../constants/resolutions.const";

export const querystringSchema = z
  .object({
    resolution: z
      .enum(resolutions as unknown as [string, ...string[]])
      .nullable()
      .optional()
      .default("1920x1080"),
    width: z.coerce.number().int().min(0).nullable().optional(),
    height: z.coerce.number().int().min(0).nullable().optional(),
    quality: z.coerce.number().int().min(0).max(100).nullable().optional(),
    index: z
      .union([z.coerce.number().int(), z.literal("random")])
      .nullable()
      .optional()
      .default(0),
    date: z.string().regex(/\d{8}/).nullable().optional(),
    format: z.enum(["json"]).nullable().optional(),
  })
  .strict(); // equivalent to additionalProperties: false

// Type inference from Zod
export type QuerystringType = z.infer<typeof querystringSchema>;

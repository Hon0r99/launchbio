import { z } from "zod";
import { backgroundOptions } from "./themes";

export const pageSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  eventDate: z.string().min(4),
  eventTime: z.string().min(2),
  bgType: z.enum(backgroundOptions),
  buttons: z
    .array(z.object({ label: z.string().min(1), url: z.string().min(1) }))
    .min(1),
  ownerEmail: z.string().email().optional().or(z.literal("")),
  afterLaunchText: z.string().optional(),
  analyticsId: z.string().optional(),
  showBranding: z.boolean().optional(),
});

export type PageButton = { label: string; url: string };


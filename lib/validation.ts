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

// Password validation requirements
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REQUIREMENTS = {
  minLength: MIN_PASSWORD_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
};

/**
 * Validates password strength
 * This is a pure function that can be used on both client and server
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    };
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one number",
    };
  }

  return { valid: true };
}


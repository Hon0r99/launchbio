/**
 * Safely parse JSON string with error handling
 */
export function safeJsonParse<T = unknown>(
  json: string | null | undefined,
  fallback: T
): T {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return fallback;
  }
}

/**
 * Safely stringify object to JSON
 */
export function safeJsonStringify<T>(value: T, fallback = "{}"): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("Failed to stringify JSON:", error);
    return fallback;
  }
}


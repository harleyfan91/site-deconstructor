export function normalizeUrl(input: string): string {
  if (!/^https?:\/\//i.test(input)) return `https://${input}`;
  return input;
}

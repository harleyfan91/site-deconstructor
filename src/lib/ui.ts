export function dashIfEmpty(value: any): string {
  return value ? String(value) : '\u2014';
}

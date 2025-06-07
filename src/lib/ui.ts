export function dashIfEmpty(value: any): string {
  return value ? String(value) : '\u2014';
}

export interface ColorWithCount {
  name: string;
  hex: string;
  usage: string;
  count: number;
}

export interface FrequencyGroup {
  name: string;
  colors: ColorWithCount[];
}

export function groupByFrequency(colors: ColorWithCount[]): FrequencyGroup[] {
  const sorted = [...colors].sort((a, b) => b.count - a.count);

  let mostCount = 3;
  if (sorted.length < 3) mostCount = sorted.length;
  else if (sorted.length > 5) mostCount = 5;
  else mostCount = sorted.length;

  const mostUsed = sorted.slice(0, mostCount);
  const remaining = sorted.slice(mostCount);
  const supportingCount = Math.ceil(remaining.length / 2);
  const supporting = remaining.slice(0, supportingCount);
  const accent = remaining.slice(supportingCount);

  const groups: FrequencyGroup[] = [];
  if (mostUsed.length) groups.push({ name: 'Most Used', colors: mostUsed });
  if (supporting.length) groups.push({ name: 'Supporting Colors', colors: supporting });
  if (accent.length) groups.push({ name: 'Accent Colors', colors: accent });

  return groups;
}

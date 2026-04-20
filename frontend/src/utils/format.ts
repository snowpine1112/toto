// 秋春制リーグの国（シーズンをまたぐ表示: "2025-26"）
const AUTUMN_SPRING_COUNTRIES = new Set([
  'England', 'Spain', 'Germany', 'France', 'Italy',
  'Netherlands', 'Portugal', 'Belgium', 'Scotland',
  'Europe', 'World', 'Asia', 'South America',
]);

export function formatSeason(season: number, country: string): string {
  if (AUTUMN_SPRING_COUNTRIES.has(country)) {
    return `${season}-${String(season + 1).slice(-2)}`;
  }
  return String(season);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

export function slugify(title: string): string {
  // Seeded defects: keeps accents as separators and does not trim.
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/** "TWENTY-TWO" → "Twenty-Two"; the hurricanes table mixes upper and title case. */
export function titleCase(name: string): string {
  return name.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_, sep, ch) =>
    sep + ch.toUpperCase(),
  );
}

/** Name initials by position; every list runs A–Z without Q and U. */
const LETTERS = "ABCDEFGHIJKLMNOPRSTVWXYZ";

/** Initial of the name at a 1-based position, or "#n" past Z. */
export const letter = (position: number) =>
  LETTERS[position - 1] ?? `#${position}`;

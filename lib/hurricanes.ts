import { cacheLife } from "next/cache";
import { sql } from "./db";
import { BASINS, FIRST_YEAR, type Basin, type NameLists } from "./names";

/**
 * Storms per basin with a tropical-storm date between 1 Jan and monthDay
 * ("MM-DD"), summed over FIRST_YEAR..lastYear (capped at the latest season in
 * the table). Years with no storms in the window still count toward `to`.
 */
export async function getStormCounts(monthDay: string, lastYear: number) {
  "use cache";
  cacheLife("hours");

  const rows = await sql<
    {
      first_year: number;
      last_year: number;
      basin: Basin | null;
      storms: number;
    }[]
  >`
    with bounds as (
      select ${FIRST_YEAR}::int as first_year,
             least(max(year), ${lastYear})::int as last_year
      from catfisha_typhoons.hurricanes
    )
    select b.first_year, b.last_year, h.basin, count(h.id)::int as storms
    from bounds b
    left join catfisha_typhoons.hurricanes h
      on h.year between b.first_year and b.last_year
     and to_char(h.ts_date, 'MM-DD') <= ${monthDay}
    group by b.first_year, b.last_year, h.basin
  `;

  const counts = { E: 0, L: 0 } as Record<Basin, number>;
  for (const row of rows) if (row.basin) counts[row.basin] = row.storms;

  return { from: rows[0].first_year, to: rows[0].last_year, counts };
}

export async function getNameLists(): Promise<NameLists> {
  "use cache";
  cacheLife("hours");

  const rows = await sql<{ set: number; basin: Basin; name: string }[]>`
    select set, basin, name
    from catfisha_typhoons.hurricane_names
    order by basin, set, seq
  `;

  const lists = Object.fromEntries(
    BASINS.map((basin) => [
      basin,
      Array.from({ length: 7 }, () => [] as string[]),
    ]),
  ) as NameLists;
  for (const row of rows) lists[row.basin][row.set].push(row.name);
  return lists;
}

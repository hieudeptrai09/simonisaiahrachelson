import { cacheLife } from "next/cache";
import { sql } from "./db";
import {
  BASINS,
  FIRST_YEAR,
  titleCase,
  type ActiveStorm,
  type Basin,
  type NameLists,
} from "./names";

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

/**
 * Storms per basin at tropical-storm strength on `date` (YYYY-MM-DD), i.e.
 * ts_date <= date <= end_date, in order of formation.
 */
export async function getActiveStorms(
  date: string,
): Promise<Record<Basin, ActiveStorm[]>> {
  "use cache";
  cacheLife("hours");

  const rows = await sql<(ActiveStorm & { basin: Basin })[]>`
    select basin, year, name,
           to_char(ts_date, 'YYYY-MM-DD') as start,
           to_char(end_date, 'YYYY-MM-DD') as "end"
    from catfisha_typhoons.hurricanes
    where ts_date <= ${date}::date and end_date >= ${date}::date
    order by ts_date, id
  `;

  const active = { E: [], L: [] } as Record<Basin, ActiveStorm[]>;
  for (const { basin, ...storm } of rows)
    active[basin].push({ ...storm, name: titleCase(storm.name) });
  return active;
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

/**
 * Storms per season, basin and tropical-storm day ("MM-DD") from FIRST_YEAR
 * on, plus the latest season in the table.
 */
export async function getDailyStormCounts() {
  "use cache";
  cacheLife("hours");

  const rows = await sql<
    { year: number; basin: Basin; month_day: string; storms: number }[]
  >`
    select year, basin, to_char(ts_date, 'MM-DD') as month_day,
           count(*)::int as storms
    from catfisha_typhoons.hurricanes
    where year >= ${FIRST_YEAR}
    group by year, basin, month_day
  `;

  const maxYear = rows.reduce(
    (max, row) => Math.max(max, row.year),
    FIRST_YEAR,
  );
  return { maxYear, rows: [...rows] };
}

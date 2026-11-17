// Data shapes shared by the database layer, the API routes and the UI.

import type { Basin } from "./basins";

/** names[basin][set] is the ordered list for that set (index 0 = seq 1). */
export type NameLists = Record<Basin, string[][]>;

export type NameHit = {
  position: number;
  /** Set the name was actually taken from (the year's set, or 6 on overflow). */
  set: number;
  seq: number;
  name: string;
};

/** A storm that was at tropical-storm strength on a given date. */
export type ActiveStorm = {
  year: number;
  name: string;
  /** YYYY-MM-DD */
  start: string;
  /** YYYY-MM-DD */
  end: string;
};

export type NamesResponse = {
  date: string;
  set: number;
  years: { from: number; to: number; count: number };
  average: Record<Basin, number>;
  names: Record<Basin, { position: number; hit: NameHit | null }[]>;
  /** Storms active on `date`, or null when the date is after today. */
  active: Record<Basin, ActiveStorm[]> | null;
  /**
   * Latest storm formed in `date`'s season up to `date`, per basin (null if
   * none yet), or null when the date is after today.
   */
  lastFormed: Record<Basin, ActiveStorm | null> | null;
};

export type SeasonResponse = {
  years: { from: number; to: number };
  /** Average named storms formed by each day, in SEASON_DAYS order. */
  average: SeasonAverage;
  bounds: SeasonBounds;
};

/** A basin's average season, as SEASON_DAYS indexes. */
export type SeasonBound = { start: number; end: number };

/**
 * Average season start and end per basin: the end over finished seasons, the
 * start also over today's once its first storm has formed.
 */
export type SeasonBounds = {
  /** First season averaged, and the last one counted toward each edge. */
  years: { from: number; start: number; end: number };
  /** Null if the basin has no finished season to average. */
  basins: Record<Basin, SeasonBound | null>;
};

/** One end of a basin's average season, as marked on a day. */
export type SeasonEdge = { basin: Basin; edge: "start" | "end" };

/** Average named storms formed by each day per basin, in SEASON_DAYS order. */
export type SeasonAverage = Record<Basin, number[]>;

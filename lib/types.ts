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

/** A named storm and the day it reached tropical-storm strength. */
export type StormStart = {
  year: number;
  name: string;
  /** YYYY-MM-DD */
  start: string;
};

/** The name a slot held in one season, and when that storm formed. */
export type SlotSeason = {
  year: number;
  /** The storm's name, or the name on the list if the season never got to it. */
  name: string;
  /** YYYY-MM-DD, or null if the season never got to this letter. */
  start: string | null;
};

/**
 * One letter of one list: the names that held it each season it came round,
 * from NAME_HISTORY_FROM on.
 */
export type NameSlot = {
  /** "L-0-6": basin, set, position. */
  id: string;
  basin: Basin;
  /** 1-based position in the list (A = 1). */
  position: number;
  /**
   * Seasons between turns: 6, or 2 for the Eastern Pacific's X, Y and Z; 0
   * for a Greek name, used only in the seasons that ran past the list.
   */
  cycle: number;
  /** A Greek overflow name; `position` is its place in the alphabet. */
  greek?: boolean;
  /** year mod cycle. */
  set: number;
  /** Name on today's list. */
  current: string;
  /** Every season the slot came round, oldest first. */
  seasons: SlotSeason[];
};

export type HistoryResponse = {
  years: { from: number; to: number };
  slots: NameSlot[];
  /**
   * Named storms that took no name from the year's list or the Greek
   * alphabet, per basin.
   */
  others: Record<Basin, StormStart[]>;
};

/** Average named storms formed by each day per basin, in SEASON_DAYS order. */
export type SeasonAverage = Record<Basin, number[]>;

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type HistoryParams = {
  /** "L-0-6": the picked name's slot. */
  slot: string | null;
  name: string | null;
  /** Whether the slot's other names fill in the seasons the name missed. */
  fill: boolean;
  /** The picked season; when set, the page shows that year instead of a name. */
  year: number | null;
};

/**
 * The history page's ?slot=&name=&fill= or ?year=, and a setter that replaces
 * them in the URL, so either view can be shared.
 */
export function useHistoryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const year = Number(searchParams.get("year"));
  const params: HistoryParams = {
    slot: searchParams.get("slot"),
    name: searchParams.get("name"),
    fill: searchParams.get("fill") === "1",
    year: Number.isInteger(year) && year > 0 ? year : null,
  };

  function setParams(next: Partial<Record<keyof HistoryParams, string | null>>) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next))
      if (value !== null && value !== undefined) query.set(key, value);
    const search = query.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    });
  }

  return [params, setParams] as const;
}

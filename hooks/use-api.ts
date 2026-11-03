import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ISO } from "@/lib/dates";

/** null while loading, then the response body or an error message. */
export type ApiState<T> = { data: T } | { error: string } | null;

/**
 * GETs an API route, adding the viewer's local date as ?today= so the
 * server's cutoffs move at their midnight. Refetches whenever `path` changes;
 * a null `path` makes no request.
 */
export function useApi<T>(path: string | null): ApiState<T> {
  const [result, setResult] = useState<
    ({ path: string } & NonNullable<ApiState<T>>) | null
  >(null);

  useEffect(() => {
    if (path === null) return;
    const controller = new AbortController();
    const today = dayjs().format(ISO);
    const separator = path.includes("?") ? "&" : "?";
    fetch(`${path}${separator}today=${today}`, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json();
        setResult(
          res.ok
            ? { path, data: body }
            : { path, error: body.error ?? res.statusText },
        );
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setResult({ path, error: err.message });
      });
    return () => controller.abort();
  }, [path]);

  // A result for an earlier path means the current one is still loading.
  return result?.path === path ? result : null;
}

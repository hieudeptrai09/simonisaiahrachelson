import type { Basin } from "@/lib/basins";
import { SERIES_COLOR } from "@/lib/chart-theme";

/** A short stroke in a basin's series colour. */
export default function LineKey({ basin }: { basin: Basin }) {
  return (
    <span
      aria-hidden
      style={{
        width: 14,
        height: 2,
        borderRadius: 1,
        background: SERIES_COLOR[basin],
      }}
    />
  );
}

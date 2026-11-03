import { BASINS } from "@/lib/basins";
import type { NamesResponse } from "@/lib/types";
import ExpectedNameCard from "./expected-name-card";

/** The expected name in each basin, side by side. */
export default function ExpectedNames({ data }: { data: NamesResponse }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {BASINS.map((basin) => (
        <ExpectedNameCard
          key={basin}
          basin={basin}
          entries={data.names[basin]}
          set={data.set}
        />
      ))}
    </div>
  );
}

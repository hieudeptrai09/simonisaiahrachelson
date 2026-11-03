import { Flex } from "antd";
import type { NamesResponse } from "@/lib/types";
import ActiveStorms from "./active-storms";
import ExpectedNames from "./expected-names";
import ForecastSummary from "./forecast-summary";

/** Everything shown for one date, in order. */
export default function ForecastResults({ data }: { data: NamesResponse }) {
  return (
    <Flex vertical gap={16}>
      <ForecastSummary data={data} />
      <ExpectedNames data={data} />
      {data.active && (
        <ActiveStorms
          date={data.date}
          active={data.active}
          lastFormed={data.lastFormed}
        />
      )}
    </Flex>
  );
}

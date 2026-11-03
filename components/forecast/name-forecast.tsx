"use client";

import { Flex } from "antd";
import { useApi } from "@/hooks/use-api";
import { useDateParam } from "@/hooks/use-date-param";
import type { NamesResponse } from "@/lib/types";
import LoadState from "@/components/ui/load-state";
import CopyLinkButton from "./copy-link-button";
import DateNavigator from "./date-navigator";
import ForecastResults from "./forecast-results";

/** The date controls, and below them the forecast for the chosen date. */
export default function NameForecast() {
  const [date, setDate] = useDateParam();
  const result = useApi<NamesResponse>(`/api/names?date=${date}`);

  return (
    <Flex vertical gap={24}>
      <Flex gap={12} wrap align="center">
        <DateNavigator date={date} onChange={setDate} />
        <CopyLinkButton date={date} />
      </Flex>

      <LoadState state={result} rows={6} errorTitle="Could not load names">
        {(data) => <ForecastResults data={data} />}
      </LoadState>
    </Flex>
  );
}

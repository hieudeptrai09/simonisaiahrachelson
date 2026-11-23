"use client";

import { useState } from "react";
import { Button, Flex, Segmented, Select, Typography } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useHistoryParams } from "@/hooks/use-history-params";
import { slotNames } from "@/lib/name-history";
import type { HistoryResponse } from "@/lib/types";
import LoadState from "@/components/ui/load-state";
import NameListOptions, { DEFAULT_ORDER } from "./name-list-options";
import { nameOptions, type NameOrder } from "./name-options";
import NameView from "./name-view";
import YearView from "./year-view";

const { Text } = Typography;

type Mode = "By name" | "By year";

/**
 * Formation days of named storms since 1979: every season a picked name held
 * its letter, or every letter of a picked year.
 */
export default function StartHistory() {
  const result = useApi<HistoryResponse>("/api/history");
  return (
    <LoadState state={result} rows={8} errorTitle="Could not load the names">
      {(data) => <HistoryBody data={data} />}
    </LoadState>
  );
}

function HistoryBody({ data }: { data: HistoryResponse }) {
  const [params, setParams] = useHistoryParams();
  const { from, to } = data.years;
  const mode: Mode = params.year === null ? "By name" : "By year";
  const year =
    params.year === null ? null : Math.min(to, Math.max(from, params.year));
  const slot = data.slots.find((s) => s.id === params.slot);
  const name = slot && params.name && slotNames(slot).includes(params.name)
    ? params.name
    : null;

  const [order, setOrder] = useState<NameOrder>(DEFAULT_ORDER);
  const [mixed, setMixed] = useState(false);
  const options = nameOptions(data.slots, to, order, mixed);

  const setYear = (value: number) => setParams({ year: String(value) });

  return (
    <Flex vertical gap={24}>
      <Flex gap={12} wrap align="center">
        <Segmented<Mode>
          size="large"
          options={["By name", "By year"]}
          value={mode}
          onChange={(value) =>
            value === "By year"
              ? setYear(to)
              : setParams({ slot: params.slot, name: params.name })
          }
        />
        {mode === "By name" ? (
          <Flex gap={4} align="center" style={{ minWidth: 260, flex: 1 }}>
            <Select
              size="large"
              style={{ flex: 1, minWidth: 0 }}
              placeholder="Pick a name"
              showSearch={{ optionFilterProp: "search" }}
              options={options}
              value={slot && name ? `${slot.id}|${name}` : undefined}
              onChange={(value: string) => {
                const [id, picked] = value.split("|");
                setParams({ slot: id, name: picked });
              }}
            />
            <NameListOptions
              order={order}
              onOrderChange={setOrder}
              mixed={mixed}
              onMixedChange={setMixed}
            />
          </Flex>
        ) : (
          <Flex gap={4} align="center">
            <Button
              size="large"
              aria-label="Previous year"
              icon={<ChevronLeft size={18} />}
              disabled={year! <= from}
              onClick={() => setYear(year! - 1)}
            />
            <Select
              size="large"
              style={{ width: 110 }}
              value={year!}
              onChange={setYear}
              options={Array.from({ length: to - from + 1 }, (_, i) => ({
                value: to - i,
                label: to - i,
              }))}
            />
            <Button
              size="large"
              aria-label="Next year"
              icon={<ChevronRight size={18} />}
              disabled={year! >= to}
              onClick={() => setYear(year! + 1)}
            />
          </Flex>
        )}
      </Flex>

      {mode === "By year" ? (
        <YearView data={data} year={year!} />
      ) : slot && name ? (
        <NameView
          slot={slot}
          name={name}
          fill={params.fill}
          onFillChange={(fill) =>
            setParams({ slot: slot.id, name, fill: fill ? "1" : null })
          }
          currentYear={to}
        />
      ) : (
        <Text type="secondary">
          Pick a name to see the day it formed each season it was on the
          list, from {from} to {to}.
        </Text>
      )}
    </Flex>
  );
}

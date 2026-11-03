import dayjs from "dayjs";
import { Flex, Typography } from "antd";
import { BASINS } from "@/lib/basins";
import { ISO } from "@/lib/dates";
import type { NamesResponse } from "@/lib/types";
import ActiveStormCard from "./active-storm-card";

const { Title } = Typography;

/** The storms active on `date` in each basin, side by side. */
export default function ActiveStorms({
  date,
  active,
  lastFormed,
}: {
  date: string;
  active: NonNullable<NamesResponse["active"]>;
  lastFormed: NamesResponse["lastFormed"];
}) {
  return (
    <Flex vertical gap={16}>
      <Title level={4} style={{ margin: "16px 0 0" }}>
        Active on {dayjs(date, ISO).format("D MMM YYYY")}
      </Title>
      <div className="grid gap-4 sm:grid-cols-2">
        {BASINS.map((basin) => (
          <ActiveStormCard
            key={basin}
            basin={basin}
            storms={active[basin]}
            lastFormed={lastFormed?.[basin] ?? null}
          />
        ))}
      </div>
    </Flex>
  );
}

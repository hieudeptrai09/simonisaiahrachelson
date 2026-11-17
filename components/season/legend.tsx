import { Flex, Typography } from "antd";
import { BASINS, BASIN_LABELS } from "@/lib/basins";
import { SEASON_DAYS, dayRange } from "@/lib/dates";
import type { SeasonBounds } from "@/lib/types";
import LineKey from "./line-key";

const { Text } = Typography;

/** Which line is which basin, with each basin's average season beside it. */
export default function Legend({ bounds }: { bounds: SeasonBounds }) {
  return (
    <Flex gap={16} wrap>
      {BASINS.map((basin) => {
        const bound = bounds.basins[basin];
        return (
          <Flex key={basin} gap={6} align="center">
            <LineKey basin={basin} />
            <Text type="secondary">{BASIN_LABELS[basin]}</Text>
            {bound && (
              <Text strong>
                {dayRange(SEASON_DAYS[bound.start], SEASON_DAYS[bound.end])}
              </Text>
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}

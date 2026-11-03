import { Flex, Typography } from "antd";
import { BASINS, BASIN_LABELS } from "@/lib/basins";
import LineKey from "./line-key";

const { Text } = Typography;

/** Which line is which basin. */
export default function Legend() {
  return (
    <Flex gap={16} wrap>
      {BASINS.map((basin) => (
        <Flex key={basin} gap={6} align="center">
          <LineKey basin={basin} />
          <Text type="secondary">{BASIN_LABELS[basin]}</Text>
        </Flex>
      ))}
    </Flex>
  );
}

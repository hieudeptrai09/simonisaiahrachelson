import { Card, Flex, Typography } from "antd";
import { basinTitle, type Basin } from "@/lib/basins";
import type { ActiveStorm } from "@/lib/types";
import StormRow from "./storm-row";

const { Text } = Typography;

/** One basin's active storms, or the last one to form if none are active. */
export default function ActiveStormCard({
  basin,
  storms,
  lastFormed,
}: {
  basin: Basin;
  storms: ActiveStorm[];
  lastFormed: ActiveStorm | null;
}) {
  return (
    <Card title={basinTitle(basin)}>
      {storms.length === 0 ? (
        <Flex vertical gap={12}>
          <Text type="secondary">No named storms active</Text>
          {lastFormed && (
            <Flex vertical gap={4}>
              <Text type="secondary">Last formed</Text>
              <StormRow storm={lastFormed} />
            </Flex>
          )}
        </Flex>
      ) : (
        <Flex vertical gap={12}>
          {storms.map((storm) => (
            <StormRow key={storm.name} storm={storm} />
          ))}
        </Flex>
      )}
    </Card>
  );
}

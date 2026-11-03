import { Flex, Typography } from "antd";
import { isoRange } from "@/lib/dates";
import type { ActiveStorm } from "@/lib/types";

const { Text } = Typography;

/** A storm's name beside the dates it was at tropical-storm strength. */
export default function StormRow({ storm }: { storm: ActiveStorm }) {
  return (
    <Flex justify="space-between" align="center" gap={12}>
      <Text strong style={{ fontSize: 18 }}>
        {storm.name}
      </Text>
      <Text type="secondary">{isoRange(storm.start, storm.end)}</Text>
    </Flex>
  );
}

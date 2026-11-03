import { Card, Flex, Tag, Typography } from "antd";
import { basinTitle, type Basin } from "@/lib/basins";
import { SUPPLEMENTAL_SET } from "@/lib/name-lists";
import type { NamesResponse } from "@/lib/types";

const { Text, Title } = Typography;

/** One basin's expected name(s), tagged when taken from the supplemental set. */
export default function ExpectedNameCard({
  basin,
  entries,
  set,
}: {
  basin: Basin;
  entries: NamesResponse["names"][Basin];
  /** The year's set. */
  set: number;
}) {
  return (
    <Card title={basinTitle(basin)}>
      <Flex vertical gap={16}>
        {entries.map(({ position, hit }) => (
          <Flex key={position} justify="space-between" align="center" gap={12}>
            <Title
              level={3}
              style={{ margin: 0 }}
              type={hit ? undefined : "secondary"}
            >
              {hit?.name ?? "Beyond the lists"}
            </Title>
            <Flex vertical align="end" gap={4}>
              <Text type="secondary">#{position}</Text>
              {hit?.set === SUPPLEMENTAL_SET && hit.set !== set && (
                <Tag color="orange">Set 6 · #{hit.seq}</Tag>
              )}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}

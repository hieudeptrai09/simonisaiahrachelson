import { Badge, Button, Divider, Flex, Popover, Radio, Switch, Typography } from "antd";
import { SlidersHorizontal } from "lucide-react";
import { NAME_ORDERS, type NameOrder } from "./name-options";

const { Text } = Typography;

/** The default order; anything else dots the button. */
export const DEFAULT_ORDER: NameOrder = "A–Z";

/**
 * A small button beside the name picker that pops up how its list is sorted
 * and whether the two basins are mixed. A dot marks a non-default setting.
 */
export default function NameListOptions({
  order,
  onOrderChange,
  mixed,
  onMixedChange,
}: {
  order: NameOrder;
  onOrderChange: (order: NameOrder) => void;
  mixed: boolean;
  onMixedChange: (mixed: boolean) => void;
}) {
  const changed = order !== DEFAULT_ORDER || mixed;

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      arrow={false}
      content={
        <Flex vertical style={{ minWidth: 200 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 6 }}>
            Sort by
          </Text>
          <Radio.Group
            vertical
            value={order}
            onChange={(event) => onOrderChange(event.target.value)}
            options={NAME_ORDERS.map((value) => ({ value, label: value }))}
          />
          <Divider style={{ margin: "12px 0" }} />
          <Flex justify="space-between" align="center" gap={12}>
            <Text>Mix both basins</Text>
            <Switch size="small" checked={mixed} onChange={onMixedChange} />
          </Flex>
        </Flex>
      }
    >
      <Badge dot={changed} offset={[-4, 4]}>
        <Button
          size="large"
          aria-label="Name list options"
          title="Sort and group names"
          icon={<SlidersHorizontal size={18} />}
        />
      </Badge>
    </Popover>
  );
}

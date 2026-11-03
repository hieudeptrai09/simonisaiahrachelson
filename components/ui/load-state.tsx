import type { ReactNode } from "react";
import { Alert, Skeleton } from "antd";
import type { ApiState } from "@/hooks/use-api";

/** A skeleton while `state` loads, an alert if it failed, else `children(data)`. */
export default function LoadState<T>({
  state,
  rows,
  errorTitle,
  children,
}: {
  state: ApiState<T>;
  /** Skeleton paragraph rows. */
  rows: number;
  errorTitle: string;
  children: (data: T) => ReactNode;
}) {
  if (!state) return <Skeleton active paragraph={{ rows }} />;
  if ("error" in state)
    return (
      <Alert
        type="error"
        showIcon
        message={errorTitle}
        description={state.error}
      />
    );
  return <>{children(state.data)}</>;
}

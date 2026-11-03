import { useState } from "react";
import { Modal, Typography } from "antd";
import { useApi } from "@/hooks/use-api";
import type { SeasonResponse } from "@/lib/types";
import LoadState from "@/components/ui/load-state";
import SeasonView from "./season-view";

const { Link } = Typography;

/** A link that opens the season curve, marking `date` (YYYY-MM-DD) on it. */
export default function SeasonCurveLink({ date }: { date: string }) {
  const [open, setOpen] = useState(false);
  // Stays set once the modal first opens, so the season is fetched only once.
  const [path, setPath] = useState<string | null>(null);
  const season = useApi<SeasonResponse>(path);

  function show() {
    setOpen(true);
    setPath("/api/season");
  }

  return (
    <>
      <Link onClick={show}>See how the season builds</Link>
      <Modal
        title="Average named storms through the year"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
      >
        <LoadState
          state={season}
          rows={8}
          errorTitle="Could not load the season"
        >
          {(data) => <SeasonView data={data} date={date} />}
        </LoadState>
      </Modal>
    </>
  );
}

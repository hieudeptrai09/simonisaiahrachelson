import { usePathname } from "next/navigation";
import { Button, message } from "antd";

/** Copies a shareable link to `date`'s forecast, or shows it if copying fails. */
export default function CopyLinkButton({ date }: { date: string }) {
  const pathname = usePathname();
  const [messageApi, contextHolder] = message.useMessage();

  async function copyLink() {
    const url = `${window.location.origin}${pathname}?date=${date}`;
    try {
      await navigator.clipboard.writeText(url);
      messageApi.success("Link copied");
    } catch {
      messageApi.info(url);
    }
  }

  return (
    <>
      {contextHolder}
      <Button size="large" onClick={copyLink}>
        Copy link
      </Button>
    </>
  );
}

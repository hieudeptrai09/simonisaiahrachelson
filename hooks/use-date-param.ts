import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import { ISO, parseIsoDate } from "@/lib/dates";

/**
 * The page's ?date= (YYYY-MM-DD), and a setter that replaces it in the URL.
 * ?date= drives everything so the URL is shareable; it falls back to today.
 */
export function useDateParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const param = searchParams.get("date");
  const date = parseIsoDate(param) ? param! : dayjs().format(ISO);

  function setDate(value: Dayjs | null) {
    if (value)
      router.replace(`${pathname}?date=${value.format(ISO)}`, {
        scroll: false,
      });
  }

  return [date, setDate] as const;
}

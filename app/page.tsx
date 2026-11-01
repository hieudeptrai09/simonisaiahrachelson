import { Suspense } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import NameForecast from "./name-forecast";

// antd sets its own font stack, so point it at Open Sans from the layout.
const theme = {
  token: { fontFamily: "var(--font-open-sans), Arial, Helvetica, sans-serif" },
};

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight">
        Storm name by date
      </h1>
      <p className="mt-2 mb-8 text-zinc-600">
        Pick a date to see which names the season would typically have reached
        by then.
      </p>
      {/* antd creates its style cache with Math.random(), so it must sit inside Suspense. */}
      <Suspense>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <NameForecast />
          </ConfigProvider>
        </AntdRegistry>
      </Suspense>
    </main>
  );
}

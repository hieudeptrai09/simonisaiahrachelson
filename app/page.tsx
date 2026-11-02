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
        Hello, I&apos;m <b>Simon Isaiah Rachelson</b>, but Simon&apos;s fine.
        Pick a date and I&apos;ll show you which names the season has usually
        reached by then.
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

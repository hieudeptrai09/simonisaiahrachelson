import { Suspense, type ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";

// antd sets its own font stack, so point it at Open Sans from the layout.
const theme = {
  token: { fontFamily: "var(--font-open-sans), Arial, Helvetica, sans-serif" },
};

/** antd's style registry and theme around `children`. */
export default function Providers({ children }: { children: ReactNode }) {
  // antd creates its style cache with Math.random(), so it must sit inside Suspense.
  return (
    <Suspense>
      <AntdRegistry>
        <ConfigProvider theme={theme}>{children}</ConfigProvider>
      </AntdRegistry>
    </Suspense>
  );
}

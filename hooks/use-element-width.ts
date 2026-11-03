import { useEffect, useRef, useState } from "react";

/** A ref to attach to an element, and that element's current content width. */
export function useElementWidth<T extends Element>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

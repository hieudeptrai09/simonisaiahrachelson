import { useEffect } from "react";

/**
 * While `active`, calls `onOutside` on any pointerdown anywhere in the
 * document whose target `isInside` rejects. Lets a tapped popup stay open
 * until the next tap elsewhere.
 */
export function useOutsidePointer(
  active: boolean,
  isInside: (target: Element) => boolean,
  onOutside: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const handle = (event: PointerEvent) => {
      if (!isInside(event.target as Element)) onOutside();
    };
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [active, isInside, onOutside]);
}

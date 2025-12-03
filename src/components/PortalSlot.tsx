import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function PortalSlot({
  slotId,
  children,
}: {
  slotId: string;
  children: ReactNode;
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById(slotId);
    setContainer(el);
  }, []);

  if (!container) return null;

  return createPortal(children, container);
}

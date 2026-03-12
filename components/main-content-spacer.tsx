"use client";

import { usePathname } from "next/navigation";

/** Adds top spacing between navbar and body on all pages except landing (/) so content doesn't sit flush under the nav. */
export function MainContentSpacer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className={isLanding ? "" : "pt-6 sm:pt-8"}>
      {children}
    </div>
  );
}

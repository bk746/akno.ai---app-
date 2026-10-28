"use client";

import { useEffect } from "react";
import type { DevisPdfPayload } from "@/lib/devis/devisPdfTypes";

declare global {
  interface Window {
    __aknoDownloadDevisPdf?: (payload: DevisPdfPayload) => Promise<void>;
  }
}

export default function AknoDevisPdfBridge() {
  useEffect(() => {
    window.__aknoDownloadDevisPdf = async (payload) => {
      const { downloadDevisPdf } = await import("@/lib/devis/downloadDevisPdf");
      await downloadDevisPdf(payload);
    };
    return () => {
      delete window.__aknoDownloadDevisPdf;
    };
  }, []);
  return null;
}

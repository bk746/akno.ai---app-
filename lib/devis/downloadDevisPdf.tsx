"use client";

import { pdf } from "@react-pdf/renderer";
import { DevisPDF } from "./DevisPDF";
import type { DevisPdfPayload } from "./devisPdfTypes";

export async function downloadDevisPdf(payload: DevisPdfPayload) {
  const blob = await pdf(<DevisPDF data={payload} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Devis-${payload.numero}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

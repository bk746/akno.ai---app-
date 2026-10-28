export type DevisPdfLigne = {
  designation?: string;
  quantite?: number;
  prix_unitaire_ht?: number;
};

export type DevisPdfEntreprise = {
  entreprise_nom?: string;
  entreprise_forme?: string;
  entreprise_adresse?: string;
  entreprise_cp_ville?: string;
  entreprise_telephone?: string;
  entreprise_email?: string;
  entreprise_siret?: string;
  entreprise_tva?: string;
  entreprise_rcs_rm?: string;
  assurance_nom?: string;
  assurance_numero?: string;
  assurance_zone?: string;
  logo_url?: string | null;
  devis_validite_jours?: number;
  devis_conditions?: string;
  devis_mentions?: string;
};

export type DevisPdfPayload = {
  numero: string;
  objet: string;
  client_nom: string;
  client_email?: string | null;
  client_telephone?: string | null;
  client_adresse?: string | null;
  lignes: DevisPdfLigne[];
  tva_taux: number;
  date_emission: string;
  date_validite: string;
  ent: DevisPdfEntreprise;
};

export function fmtPdfEur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n || 0);
}

export function fmtPdfDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function devisPdfTotals(lignes: DevisPdfLigne[], tvaTaux: number) {
  const ht = lignes.reduce(
    (s, l) =>
      s + (Number(l.quantite) || 0) * (Number(l.prix_unitaire_ht) || 0),
    0,
  );
  const tva = ht * (Number(tvaTaux) / 100);
  const ttc = Math.round((ht + tva) * 100) / 100;
  return { ht, tva, ttc };
}

export function addDaysIso(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Normalise la réponse RPC devis_public (aplatie ou { devis, ...ent }) */
export function normalizeDevisPublicRpc(raw: Record<string, unknown>) {
  const nested =
    raw.devis && typeof raw.devis === "object"
      ? (raw.devis as Record<string, unknown>)
      : null;
  const base = nested ?? raw;
  const ent: DevisPdfEntreprise = {};
  const entKeys: (keyof DevisPdfEntreprise)[] = [
    "entreprise_nom",
    "entreprise_forme",
    "entreprise_adresse",
    "entreprise_cp_ville",
    "entreprise_telephone",
    "entreprise_email",
    "entreprise_siret",
    "entreprise_tva",
    "entreprise_rcs_rm",
    "assurance_nom",
    "assurance_numero",
    "assurance_zone",
    "logo_url",
    "devis_validite_jours",
    "devis_conditions",
    "devis_mentions",
  ];
  for (const k of entKeys) {
    const v = raw[k] ?? base[k];
    if (v !== undefined && v !== null) (ent as Record<string, unknown>)[k] = v;
  }
  if (!ent.entreprise_nom && typeof raw.entreprise === "string") {
    ent.entreprise_nom = raw.entreprise;
  }
  return { base, ent };
}

export function publicRpcToPdfPayload(
  base: Record<string, unknown>,
  ent: DevisPdfEntreprise,
): DevisPdfPayload {
  const lignes = (base.lignes as DevisPdfLigne[]) ?? [];
  const tva_taux = Number(base.tva_taux) || 0;
  const emission =
    (base.envoye_le as string) ||
    (base.created_at as string) ||
    new Date().toISOString();
  const jours = Number(ent.devis_validite_jours) || 30;
  return {
    numero: String(base.numero ?? ""),
    objet: String(base.objet ?? ""),
    client_nom: String(base.client_nom ?? ""),
    client_email: (base.client_email as string) ?? null,
    client_telephone: (base.client_telephone as string) ?? null,
    client_adresse: (base.client_adresse as string) ?? null,
    lignes,
    tva_taux,
    date_emission: emission,
    date_validite: addDaysIso(emission, jours),
    ent,
  };
}
